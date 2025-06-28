import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import {
  HotelData,
  PricingData,
  ScrapedHotel,
  ScrapingResult,
  BatchScrapingResult,
} from './types';

@Injectable()
export class ScraperPlaywrightService {
  private readonly logger = new Logger(ScraperPlaywrightService.name);
  private browser: Browser | null = null;

  /**
   * Initialize Playwright browser with Render-compatible settings
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.logger.log('🚀 Initializing Playwright browser...');
      
      // Configuration optimisée pour Render
      const browserOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
        ],
      };

      // Utiliser l'exécutable Chrome fourni par Render si disponible
      if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
        browserOptions['executablePath'] = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
        this.logger.log(`🔧 Using custom Chrome executable: ${process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}`);
      }

      // Utiliser le cache Playwright si configuré
      if (process.env.PLAYWRIGHT_CACHE_DIR) {
        browserOptions['cacheDir'] = process.env.PLAYWRIGHT_CACHE_DIR;
        this.logger.log(`📁 Using Playwright cache: ${process.env.PLAYWRIGHT_CACHE_DIR}`);
      }

      this.browser = await chromium.launch(browserOptions);
      this.logger.log('✅ Playwright browser initialized');
    }
    return this.browser;
  }

  /**
   * Extract pricing data using Playwright to simulate browser interaction
   */
  private async extractPricingWithPlaywright(url: string): Promise<PricingData[]> {
    this.logger.log(`🔍 Extracting pricing data using Playwright...`);
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set viewport and user agent
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });

      // Navigate to the hotel page
      this.logger.log(`📄 Navigating to hotel page...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for the page to load completely
      await page.waitForTimeout(2000);

      // Try to find and click on date selector to trigger GraphQL request
      this.logger.log(`📅 Looking for date selector...`);
      
      // Look for common date selector patterns
      const dateSelectors = [
        '[data-testid="date-display-field-start"]',
        '.date-display-field-start',
        '.checkin-date',
        '[data-testid="checkin"]',
        '.checkin',
        'input[placeholder*="Check-in"]',
        'input[placeholder*="Arrival"]'
      ];

      let dateSelectorFound = false;
      for (const selector of dateSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            this.logger.log(`✅ Found date selector: ${selector}`);
            await element.click();
            await page.waitForTimeout(1000);
            dateSelectorFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!dateSelectorFound) {
        this.logger.log(`⚠️ No date selector found, proceeding with page analysis...`);
      }

      // Listen for GraphQL requests
      const graphqlRequests: any[] = [];
      page.on('response', async (response) => {
        const responseUrl = response.url();
        if (responseUrl.includes('/dml/graphql')) {
          try {
            const responseData = await response.json();
            graphqlRequests.push({
              url: responseUrl,
              data: responseData,
              status: response.status()
            });
            this.logger.log(`📡 Intercepted GraphQL request: ${responseUrl}`);
          } catch (e) {
            // Response might not be JSON
          }
        }
      });

      // Wait a bit more for any GraphQL requests to complete
      await page.waitForTimeout(3000);

      // Extract pricing data from GraphQL responses
      const pricing: PricingData[] = [];
      
      for (const request of graphqlRequests) {
        if (request.data?.data?.availabilityCalendar?.days) {
          const days = request.data.data.availabilityCalendar.days;
          this.logger.log(`📊 Found ${days.length} days in GraphQL response`);
          
          for (const day of days) {
            if (day.available === true && day.avgPriceFormatted && day.avgPriceFormatted !== '€ 0') {
              const price = this.extractPriceFromFormattedString(day.avgPriceFormatted);
              if (price !== null && price > 0) {
                pricing.push({
                  date: day.checkin,
                  price,
                  currency: 'EUR',
                  availability: true,
                  roomType: 'Standard',
                  minLengthOfStay: day.minLengthOfStay || 1,
                });
              }
            }
          }
        }
      }

      // If no GraphQL data, try to extract from page content
      if (pricing.length === 0) {
        this.logger.log(`🔄 No GraphQL data found, extracting from page content...`);
        
        // Extract pricing from page elements
        const pagePricing = await page.evaluate(() => {
          const pricing: any[] = [];
          
          // Look for price elements
          const priceSelectors = [
            '[data-testid="price-and-discounted-price"]',
            '.price',
            '.rate',
            '.price-value',
            '.price__value',
            '.bui-price-display__value',
            '.prco-valign-helper',
            '.price-display',
            '.room-price',
            '.hotel-price',
            '[class*="price"]',
            '[class*="rate"]'
          ];

          for (const selector of priceSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
              const priceText = element.textContent?.trim();
              if (priceText && priceText.includes('€')) {
                const priceMatch = priceText.match(/€\s*(\d+(?:,\d+)?)/);
                if (priceMatch) {
                  const price = parseFloat(priceMatch[1].replace(',', ''));
                  if (price > 0) {
                    pricing.push({
                      price,
                      currency: 'EUR',
                      availability: true,
                      roomType: 'Standard',
                    });
                  }
                }
              }
            });
          }

          return pricing;
        });

        // Add today's date to extracted prices
        const today = new Date().toISOString().slice(0, 10);
        pagePricing.forEach(p => {
          pricing.push({
            date: today,
            ...p
          });
        });
      }

      // Remove duplicates and sort by date
      const uniquePricing = pricing.filter((item, index, self) => 
        index === self.findIndex(p => p.price === item.price && p.date === item.date)
      );

      uniquePricing.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      this.logger.log(`✅ Playwright extracted ${uniquePricing.length} pricing entries`);
      if (uniquePricing.length > 0) {
        const avgPrice = uniquePricing.reduce((sum, p) => sum + p.price, 0) / uniquePricing.length;
        this.logger.log(`💰 Price range: ${Math.min(...uniquePricing.map(p => p.price))}€ - ${Math.max(...uniquePricing.map(p => p.price))}€`);
        this.logger.log(`💵 Average price: ${avgPrice.toFixed(2)}€`);
      }

      return uniquePricing;

    } catch (error) {
      this.logger.error(`❌ Error extracting pricing with Playwright: ${error.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Extract hotel details using Playwright
   */
  private async extractHotelDetailsWithPlaywright(url: string): Promise<HotelData> {
    this.logger.log(`🏨 Extracting hotel details with Playwright...`);
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const hotelData = await page.evaluate(() => {
        // Extract hotel name
        const nameSelectors = [
          'h1[data-testid="property-header"]',
          'h1.pp-header__title',
          'h1[class*="title"]',
          'h1',
          '[data-testid="property-header"] h1',
          '.hp__hotel-title',
          '.hp__hotel-name'
        ];

        let hotelName = '';
        for (const selector of nameSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            hotelName = element.textContent?.trim() || '';
            if (hotelName) break;
          }
        }

        // Extract address
        const addressSelectors = [
          '[data-testid="property-location"]',
          '.hp__hotel-address',
          '.address'
        ];

        let address = '';
        for (const selector of addressSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            address = element.textContent?.trim() || '';
            if (address) break;
          }
        }

        // Extract rating
        const ratingSelectors = [
          '[data-testid="review-score"]',
          '.review-score',
          '.rating'
        ];

        let rating = 0;
        for (const selector of ratingSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const ratingText = element.textContent?.trim() || '';
            const match = ratingText.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              rating = parseFloat(match[1]);
              break;
            }
          }
        }

        // Extract review count
        const reviewSelectors = [
          '[data-testid="review-count"]',
          '.review-count',
          '.reviews'
        ];

        let reviewCount = 0;
        for (const selector of reviewSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const reviewText = element.textContent?.trim() || '';
            const match = reviewText.match(/(\d+)/);
            if (match) {
              reviewCount = parseInt(match[1]);
              break;
            }
          }
        }

        return {
          name: hotelName || 'Unknown Hotel',
          address: address || undefined,
          rating: rating || undefined,
          reviewCount: reviewCount || undefined,
        };
      });

      // Clean hotel name
      hotelData.name = this.cleanHotelName(hotelData.name);

      this.logger.log(`🏨 Hotel: ${hotelData.name}`);
      if (hotelData.address) this.logger.log(`📍 Address: ${hotelData.address}`);
      if (hotelData.rating) this.logger.log(`⭐ Rating: ${hotelData.rating}/10`);
      if (hotelData.reviewCount) this.logger.log(`📝 Reviews: ${hotelData.reviewCount}`);

      return {
        ...hotelData,
        url,
      };

    } catch (error) {
      this.logger.error(`❌ Error extracting hotel details with Playwright: ${error.message}`);
      return {
        name: 'Unknown Hotel',
        url,
      };
    } finally {
      await page.close();
    }
  }

  private extractPriceFromFormattedString(priceStr: string): number | null {
    try {
      let clean = priceStr.replace(/[€\s]/g, '');
      if (clean.includes('K')) {
        clean = clean.replace('K', '');
        return parseFloat(clean) * 1000;
      }
      return parseFloat(clean);
    } catch {
      return null;
    }
  }

  private cleanHotelName(name: string): string {
    let cleanName = name;

    const patternsToRemove = [
      /\s*\([^)]*updated prices[^)]*\)/gi,
      /\s*\([^)]*2025[^)]*\)/gi,
      /\s*\([^)]*2024[^)]*\)/gi,
      /\s*\([^)]*Hotel[^)]*\)/gi,
      /\s*\([^)]*France[^)]*\)/gi,
      /\s*,\s*Paris[^,]*$/gi,
      /\s*,\s*France[^,]*$/gi,
      /\s*-\s*[^-]*$/gi,
      /\s*★+\s*/gi,
      /\s*\([^)]*\)\s*$/gi,
      /\s*-\s*Booking\.com.*$/gi,
    ];

    for (const pattern of patternsToRemove) {
      cleanName = cleanName.replace(pattern, '');
    }

    cleanName = cleanName.replace(/\s+/g, ' ').trim();

    return cleanName;
  }

  async scrapeHotel(url: string): Promise<ScrapingResult> {
    const start = Date.now();
    this.logger.log(`🚀 Starting hotel scraping with Playwright...`);

    try {
      const hotelData = await this.extractHotelDetailsWithPlaywright(url);
      const pricing = await this.extractPricingWithPlaywright(url);

      const scraped: ScrapedHotel = {
        hotel: hotelData,
        pricing,
        scrapedAt: new Date().toISOString(),
      };
      
      // Log summary of scraped data
      this.logger.log(`✅ Scraping completed in ${Date.now() - start}ms`);
      this.logger.log(`📊 Summary:`);
      this.logger.log(`   🏨 Hotel: ${hotelData.name}`);
      this.logger.log(`   💰 Pricing entries: ${pricing.length}`);
      if (pricing.length > 0) {
        const avgPrice = pricing.reduce((sum, p) => sum + p.price, 0) / pricing.length;
        this.logger.log(`   💵 Average price: ${avgPrice.toFixed(2)}€`);
        this.logger.log(`   📈 Price range: ${Math.min(...pricing.map(p => p.price))}€ - ${Math.max(...pricing.map(p => p.price))}€`);
      }
      if (hotelData.rating) {
        this.logger.log(`   ⭐ Rating: ${hotelData.rating}/10`);
      }
      if (hotelData.reviewCount) {
        this.logger.log(`   📝 Reviews: ${hotelData.reviewCount}`);
      }
      
      return { success: true, data: scraped, url };
    } catch (err: any) {
      this.logger.error(`❌ Scraping failed: ${err.message}`);
      return { success: false, error: err.message, url };
    }
  }

  async scrapeMultipleHotels(urls: string[]): Promise<BatchScrapingResult> {
    this.logger.log(`🚀 Starting batch scraping of ${urls.length} hotels with Playwright...`);
    
    const results: ScrapingResult[] = [];
    let ok = 0, fail = 0;
    const t0 = Date.now();

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      this.logger.log(`📋 Processing hotel ${i + 1}/${urls.length}...`);
      
      const r = await this.scrapeHotel(url);
      results.push(r);
      
      if (r.success) {
        ok++;
        this.logger.log(`✅ Hotel ${i + 1} scraped successfully`);
      } else {
        fail++;
        this.logger.log(`❌ Hotel ${i + 1} failed: ${r.error}`);
      }
      
      // Add delay between requests
      if (i < urls.length - 1) {
        this.logger.log(`⏳ Waiting 2 seconds before next request...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    const duration = Date.now() - t0;
    const avgTime = duration / urls.length;
    
    this.logger.log(`🎯 Batch scraping completed!`);
    this.logger.log(`📊 Results:`);
    this.logger.log(`   ✅ Successful: ${ok}/${urls.length}`);
    this.logger.log(`   ❌ Failed: ${fail}/${urls.length}`);
    this.logger.log(`   ⏱️ Total time: ${duration}ms`);
    this.logger.log(`   🚀 Average time per hotel: ${avgTime.toFixed(0)}ms`);

    return {
      results,
      totalHotels: urls.length,
      successfulScrapes: ok,
      failedScrapes: fail,
      duration,
    };
  }

  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('🔄 Closing Playwright browser...');
      await this.browser.close();
      this.browser = null;
    }
  }
} 