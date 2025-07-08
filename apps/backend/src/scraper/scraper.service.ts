import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import { HotelData, DailyPriceData, ScrapedHotel, ScrapingResult, BatchScrapingResult } from './types';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private browser: Browser | null = null;
  private page: Page | null = null;
  private graphqlResponses: any[] = [];

  async initialize(): Promise<void> {
    this.logger.log('🚀 Initializing Playwright browser for Render.com...');
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off',
        '--max_old_space_size=256'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Block only images to avoid breaking JS/CSS (comme hotel-scraper.ts)
    await this.page.route('**/*', (route) => {
      if (route.request().resourceType() === 'image') {
        route.abort();
      } else {
        route.continue();
      }
    });

    this.logger.log('✅ Browser initialized for Render.com');
  }

  async scrapeHotel(url: string): Promise<ScrapingResult> {
    if (!this.page) {
      await this.initialize();
    }

    const startTime = Date.now();
    this.logger.log(`🏨 Starting to scrape: ${url}`);

    // Reset GraphQL responses for each hotel
    this.graphqlResponses = [];

    try {
      // Set up GraphQL response listener BEFORE navigating
      this.setupGraphQLListener();

      // Navigate to the hotel page (use networkidle for more reliability)
      await this.page.goto(url, { 
        waitUntil: 'networkidle', // More reliable for dynamic content
        timeout: 30000 // Restore to 30s for slow pages
      });
      this.logger.log('📄 Page loaded successfully');

      // Extract hotel details
      const hotelData = await this.extractHotelDetails();
      this.logger.log(`🏨 Hotel: ${hotelData.name}`);

      // Click on date picker to trigger GraphQL requests
      await this.clickDatePicker();
      this.logger.log('📅 Date picker clicked');

      // Wait for and extract pricing data
      const dailyPrices = await this.extractPricingData();
      this.logger.log(`💰 Found ${dailyPrices.length} daily prices`);

      const scrapedHotel: ScrapedHotel = {
        hotel: hotelData,
        dailyPrices: dailyPrices,
        scrapedAt: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      this.logger.log(`✅ Scraping completed in ${duration}ms`);

      return {
        success: true,
        data: scrapedHotel,
        url
      };
    } catch (error) {
      this.logger.error(`❌ Error scraping ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url
      };
    }
  }

  async scrapeMultipleHotels(urls: string[]): Promise<BatchScrapingResult> {
    this.logger.log(`🏨 Scraping ${urls.length} hotels...`);

    const startTime = Date.now();
    const results: ScrapingResult[] = [];
    let successfulScrapes = 0;
    let failedScrapes = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      this.logger.log(`\n[${i + 1}/${urls.length}] Scraping: ${url}`);

      const result = await this.scrapeHotel(url);
      results.push(result);

      if (result.success) {
        successfulScrapes++;
      } else {
        failedScrapes++;
      }
      
      // Add delay between requests to be respectful (reduced for Render.com)
      if (i < urls.length - 1) {
        this.logger.log('⏳ Waiting 1 second before next request...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2000
      }
    }

    const duration = Date.now() - startTime;

    const batchResult: BatchScrapingResult = {
      results,
      totalHotels: urls.length,
      successfulScrapes,
      failedScrapes,
      duration
    };

    this.logger.log(`\n📊 Batch scraping completed:`);
    this.logger.log(`   ✅ Successful: ${successfulScrapes}`);
    this.logger.log(`   ❌ Failed: ${failedScrapes}`);
    this.logger.log(`   ⏱️  Duration: ${duration}ms`);

    return batchResult;
  }

  private setupGraphQLListener(): void {
    if (!this.page) throw new Error('Page not available');

    // Listen for GraphQL responses
    this.page.on('response', async (response) => {
      if (response.url().includes('/dml/graphql')) {
        try {
          const body = await response.text();
          try {
            const data = JSON.parse(body);
            this.graphqlResponses.push(data);
            this.logger.log(`📡 GraphQL request captured: ${response.url()}`);
            if (JSON.stringify(data).includes('availabilityCalendar')) {
              this.logger.log('✅ AvailabilityCalendar found in response!');
            }
          } catch (e) {
            // Not JSON, skip
          }
        } catch (error) {
          // Ignore errors
        }
      }
    });
  }

  private async extractHotelDetails(): Promise<HotelData> {
    if (!this.page) throw new Error('Page not available');

    const hotelData: HotelData = {
      name: '',
      url: this.page.url(),
      city: 'Unknown' // Default value, will be extracted
    };

    try {
      // Extract hotel name (priority to JSON extraction)
      hotelData.name = await this.extractHotelName();
      this.logger.log(`🏨 Extracted hotel name: ${hotelData.name}`);

      // Extract city from URL or page content
      hotelData.city = await this.extractCity();

      // Extract address
      const addressElement = await this.page.$('[data-testid="property-location"], .hp__hotel-address, .address');
      if (addressElement) {
        hotelData.address = await addressElement.textContent() || '';
      }

      // Extract star rating
      const ratingElement = await this.page.$('[data-testid="review-score"], .review-score, .rating');
      if (ratingElement) {
        const ratingText = await ratingElement.textContent();
        const ratingMatch = ratingText?.match(/(\d+(?:\.\d+)?)/);
        if (ratingMatch) {
          hotelData.userRating = parseFloat(ratingMatch[1]);
        }
      }

      // Extract review count
      const reviewElement = await this.page.$('[data-testid="review-count"], .review-count, .reviews');
      if (reviewElement) {
        const reviewText = await reviewElement.textContent();
        const reviewMatch = reviewText?.match(/(\d+)/);
        if (reviewMatch) {
          hotelData.reviewCount = parseInt(reviewMatch[1]);
        }
      }

      // Extract description
      const descElement = await this.page.$('.hp__hotel-description, .description, [data-testid="property-description"]');
      if (descElement) {
        hotelData.description = await descElement.textContent() || '';
      }

      // Extract amenities
      const amenityElements = await this.page.$$('.amenity, .facility, [data-testid="amenity"]');
      hotelData.amenities = [];
      for (const element of amenityElements) {
        const text = await element.textContent();
        if (text) {
          hotelData.amenities.push(text.trim());
        }
      }

      // Extract images
      const imageElements = await this.page.$$('img[src*="booking.com"], .hotel-image img');
      hotelData.images = [];
      for (const element of imageElements) {
        const src = await element.getAttribute('src');
        if (src) {
          hotelData.images.push(src);
        }
      }
    } catch (error) {
      this.logger.warn('⚠️ Some hotel details could not be extracted:', error);
    }

    return hotelData;
  }

  private async extractCity(): Promise<string> {
    if (!this.page) return 'Unknown';

    try {
      // Try to extract city from URL first
      const url = this.page.url();
      const urlMatch = url.match(/hotel\/([^\/]+)\/([^\/]+)/);
      if (urlMatch) {
        return urlMatch[2].replace('.fr.html', '').replace('.com.html', '');
      }

      // Try to extract from page content
      const cityElement = await this.page.$('[data-testid="property-location"], .hp__hotel-address');
      if (cityElement) {
        const text = await cityElement.textContent();
        if (text) {
          // Extract city from address (usually the last part)
          const parts = text.split(',').map(p => p.trim());
          if (parts.length > 0) {
            return parts[parts.length - 1];
          }
        }
      }

      return 'Unknown';
    } catch (error) {
      this.logger.warn('⚠️ Could not extract city:', error);
      return 'Unknown';
    }
  }

  private async extractHotelName(): Promise<string> {
    if (!this.page) throw new Error('Page not available');

    try {
      // 1. First try to extract from JSON data
      const jsonName = await this.extractHotelNameFromJSON();
      if (jsonName) {
        this.logger.log(`✅ Found hotel name in JSON: ${jsonName}`);
        return this.cleanHotelName(jsonName);
      }

      // 2. Try multiple selectors for hotel name (like original)
      const selectors = [
        'h1[data-testid="property-header"]',
        'h1.pp-header__title',
        'h1[class*="title"]',
        'h1',
        '[data-testid="property-header"] h1',
        '.hp__hotel-title',
        '.hp__hotel-name'
      ];

      for (const selector of selectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const name = await element.textContent();
            if (name && name.length > 3) {
              const cleanName = this.cleanHotelName(name);
              this.logger.log(`✅ Found hotel name with selector '${selector}': ${cleanName}`);
              return cleanName;
            }
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      // 3. Try to find any h1 or h2 with hotel-like text
      const tags = ['h1', 'h2'];
      for (const tag of tags) {
        try {
          const elements = await this.page.$$(tag);
          for (const element of elements) {
            const text = await element.textContent();
            if (text && (text.toLowerCase().includes('hotel') || 
                        text.toLowerCase().includes('hostel') || 
                        text.toLowerCase().includes('inn'))) {
              const cleanName = this.cleanHotelName(text);
              this.logger.log(`✅ Found hotel name in ${tag}: ${cleanName}`);
              return cleanName;
            }
          }
        } catch (error) {
          // Continue to next tag
        }
      }

      this.logger.warn('⚠️ No hotel name found');
      return '';

    } catch (error) {
      this.logger.warn('⚠️ Error extracting hotel name:', error);
      return '';
    }
  }

  private async extractHotelNameFromJSON(): Promise<string | null> {
    if (!this.page) throw new Error('Page not available');

    try {
      // Get all script tags content
      const scripts = await this.page.$$eval('script', (elements) => {
        return elements.map(el => el.textContent || '').join('\n');
      });

      // Look for hotel name in JSON data (patterns from original)
      const patterns = [
        /"b_hotel_name":\s*["']([^"']+)["']/,
        /"hotel_name":\s*["']([^"']+)["']/,
        /"propertyName":\s*["']([^"']+)["']/,
        /"name":\s*["']([^"']+)["'][^}]*"@type":\s*"Hotel"/,
        /b_hotel_name_en_with_translation:\s*["']([^"']+)["']/
      ];

      for (const pattern of patterns) {
        const match = scripts.match(pattern);
        if (match && match[1]) {
          const name = match[1].trim();
          if (name && name.length > 3) {
            return name;
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.warn('⚠️ Error extracting hotel name from JSON:', error);
      return null;
    }
  }

  private cleanHotelName(name: string): string {
    // Clean up hotel name by removing extra text (like original)
    let cleanName = name;

    // Remove common suffixes and extra information
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
      /\s*\([^)]*\)\s*$/gi
    ];

    for (const pattern of patternsToRemove) {
      cleanName = cleanName.replace(pattern, '');
    }

    // Clean up extra whitespace
    cleanName = cleanName.replace(/\s+/g, ' ').trim();

    return cleanName;
  }

  private async clickDatePicker(): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    try {
      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('networkidle');

      let clicked = false;
      // 1. Essayer le sélecteur principal comme dans l'original
      try {
        const mainSelector = '#hp_availability_style_changes [data-testid="searchbox-dates-container"]';
        const el = await this.page.$(mainSelector);
        if (el) {
          await el.click();
          this.logger.log(`✅ Clicked date picker with selector: ${mainSelector}`);
          clicked = true;
        }
      } catch (e) {
        // ignore
      }

      // 2. Fallback : cliquer sur le deuxième searchbox-dates-container si présent
      if (!clicked) {
        try {
          const containers = await this.page.$$('[data-testid="searchbox-dates-container"]');
          if (containers.length >= 2) {
            await containers[1].click();
            this.logger.log('✅ Clicked on second [data-testid="searchbox-dates-container"] (fallback)');
            clicked = true;
          } else if (containers.length === 1) {
            await containers[0].click();
            this.logger.log('✅ Clicked on first [data-testid="searchbox-dates-container"] (only one found)');
            clicked = true;
          } else {
            this.logger.warn('⚠️ No [data-testid="searchbox-dates-container"] found');
          }
        } catch (e) {
          this.logger.warn('⚠️ Fallback click failed:', e);
        }
      }

      if (!clicked) {
        this.logger.warn('⚠️ Could not find date picker, proceeding without clicking');
      }

      // Attendre 8 secondes comme dans l'original
      await this.page.waitForTimeout(8000);

    } catch (error) {
      this.logger.warn('⚠️ Error clicking date picker:', error);
    }
  }

  private async extractPricingData(): Promise<DailyPriceData[]> {
    if (!this.page) throw new Error('Page not available');

    const pricingData: DailyPriceData[] = [];

    // Attendre après le click (déjà fait dans clickDatePicker)
    // Ici, on attend un peu plus pour s'assurer que tout est capturé
    await this.page.waitForTimeout(2000); // Augmenté pour laisser le temps aux requêtes GraphQL

    // Process collected GraphQL responses
    let graphqlCount = 0;
    for (const response of this.graphqlResponses) {
      const pricing = this.parseGraphQLResponse(response);
      if (pricing.length > 0) graphqlCount += pricing.length;
      pricingData.push(...pricing);
    }

    // Log les réponses GraphQL si aucune donnée n'est trouvée
    if (pricingData.length === 0) {
      this.logger.warn('❗️Aucune donnée de prix trouvée dans les réponses GraphQL. Dump des réponses capturées :');
      for (const response of this.graphqlResponses) {
        this.logger.warn(JSON.stringify(response).slice(0, 1000)); // Limite à 1000 caractères
      }
      this.logger.log('🔍 No GraphQL data found, trying to extract from page content...');
      const pagePricing = await this.extractPricingFromPage();
      pricingData.push(...pagePricing);
    }

    return pricingData;
  }

  private parseGraphQLResponse(response: any): DailyPriceData[] {
    const pricing: DailyPriceData[] = [];

    try {
      // Handle availabilityCalendar structure (like original)
      if (response.data?.availabilityCalendar) {
        const calendarData = response.data.availabilityCalendar;
        this.logger.log('📊 Processing availabilityCalendar data...');

        // Extract hotel ID if available
        if (calendarData.hotelId) {
          this.logger.log(`🏨 Hotel ID: ${calendarData.hotelId}`);
        }

        // Process days data
        if (calendarData.days && Array.isArray(calendarData.days)) {
          this.logger.log(`📅 Found ${calendarData.days.length} days in calendar`);
          
          for (const day of calendarData.days) {
            if (day.available !== false) { // Available by default unless explicitly false
              // Convert price from formatted string to float (like original)
              const priceStr = day.avgPriceFormatted || '€0';
              const price = this.extractPriceFromFormattedString(priceStr);
              
              if (price && day.checkin) {
                pricing.push({
                  date: day.checkin,
                  price: price,
                  currency: 'EUR',
                  availability: true,
                  roomCategory: 'Standard'
                });
                this.logger.log(`💰 ${day.checkin}: ${priceStr} (€${price})`);
              }
            }
          }
        }

        this.logger.log(`✅ Extracted ${pricing.length} pricing entries from availabilityCalendar`);
        return pricing;
      }

      // Handle alternative response structures
      const availabilityData = response.data?.availability || 
                              response.availability ||
                              response.data;

      if (availabilityData && availabilityData.availability) {
        for (const day of availabilityData.availability) {
          if (day.price && day.date) {
            pricing.push({
              date: day.date,
              price: parseFloat(day.price.amount || day.price),
              currency: day.price.currency || 'EUR',
              availability: day.available !== false,
              roomCategory: day.roomType || 'Standard'
            });
          }
        }
      }

      // Handle alternative response structure
      if (response.data?.calendar && Array.isArray(response.data.calendar)) {
        for (const day of response.data.calendar) {
          if (day.price && day.date) {
            pricing.push({
              date: day.date,
              price: parseFloat(day.price.amount || day.price),
              currency: day.price.currency || 'EUR',
              availability: day.available !== false,
              roomCategory: day.roomType || 'Standard'
            });
          }
        }
      }

    } catch (error) {
      this.logger.warn('⚠️ Error parsing GraphQL response:', error);
    }

    return pricing;
  }

  private extractPriceFromFormattedString(priceStr: string): number | null {
    try {
      // Remove currency symbols and spaces (like original)
      let cleanPrice = priceStr.replace(/[€$£¥\s]/g, '');
      
      // Handle K (thousands) and M (millions)
      if (cleanPrice.includes('K')) {
        cleanPrice = cleanPrice.replace('K', '');
        return parseFloat(cleanPrice) * 1000;
      } else if (cleanPrice.includes('M')) {
        cleanPrice = cleanPrice.replace('M', '');
        return parseFloat(cleanPrice) * 1000000;
      } else {
        return parseFloat(cleanPrice);
      }
    } catch (error) {
      this.logger.warn(`⚠️ Could not extract price from '${priceStr}':`, error);
      return null;
    }
  }

  private async extractPricingFromPage(): Promise<DailyPriceData[]> {
    if (!this.page) throw new Error('Page not available');

    const pricing: DailyPriceData[] = [];

    try {
      // Look for pricing elements on the page
      const priceElements = await this.page.$$('[data-testid*="price"], .price, .rate, .cost');
      
      for (const element of priceElements) {
        try {
          const text = await element.textContent();
          if (text) {
            const priceMatch = text.match(/(\d+(?:,\d+)?(?:\.\d+)?)/);
            if (priceMatch) {
              pricing.push({
                date: new Date().toISOString().split('T')[0], // Today's date as fallback
                price: parseFloat(priceMatch[1].replace(',', '')),
                currency: 'EUR',
                availability: true,
                roomCategory: 'Standard'
              });
            }
          }
        } catch (error) {
          // Continue with next element
        }
      }

    } catch (error) {
      this.logger.warn('⚠️ Error extracting pricing from page:', error);
    }

    return pricing;
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.logger.log('🔒 Browser closed');
  }
} 