import { chromium, Browser, Page } from 'playwright';
import { HotelData, PricingData, ScrapedHotel, ScrapingResult } from './types.js';

export class HotelScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private graphqlResponses: any[] = []; // Stockage des réponses GraphQL comme en Python

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Playwright browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Enable request interception
    await this.page.route('**/*', (route) => {
      if (route.request().resourceType() === 'image') {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log('✅ Browser initialized successfully');
  }

  async scrapeHotel(url: string): Promise<ScrapingResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    console.log(`🏨 Starting to scrape: ${url}`);

    // Reset GraphQL responses for each hotel
    this.graphqlResponses = [];

    try {
      // Set up GraphQL response listener BEFORE navigating
      this.setupGraphQLListener();

      // Navigate to the hotel page
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('📄 Page loaded successfully');

      // Extract hotel details
      const hotelData = await this.extractHotelDetails();
      console.log(`🏨 Hotel: ${hotelData.name}`);

      // Click on date picker to trigger GraphQL requests
      await this.clickDatePicker();
      console.log('📅 Date picker clicked');

      // Wait for and extract pricing data
      const pricingData = await this.extractPricingData();
      console.log(`💰 Found ${pricingData.length} pricing entries`);

      const scrapedHotel: ScrapedHotel = {
        hotel: hotelData,
        pricing: pricingData,
        scrapedAt: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      console.log(`✅ Scraping completed in ${duration}ms`);

      return {
        success: true,
        data: scrapedHotel,
        url
      };

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url
      };
    }
  }

  private setupGraphQLListener(): void {
    if (!this.page) throw new Error('Page not available');

    // Listen for GraphQL responses (exactement comme en Python)
    this.page.on('response', async (response) => {
      if (response.url().includes('/dml/graphql')) {
        try {
          const body = await response.text();
          try {
            const data = JSON.parse(body);
            this.graphqlResponses.push(data);
            console.log(`📡 GraphQL request captured: ${response.url()}`);
            if (JSON.stringify(data).includes('availabilityCalendar')) {
              console.log('✅ AvailabilityCalendar found in response!');
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
      url: this.page.url()
    };

    try {
      // Extract hotel name (priorité à l'extraction JSON comme en Python)
      hotelData.name = await this.extractHotelName();
      console.log(`🏨 Extracted hotel name: ${hotelData.name}`);

      // Extract address
      const addressElement = await this.page.$('[data-testid="property-location"], .hp__hotel-address, .address');
      if (addressElement) {
        hotelData.address = await addressElement.textContent() || '';
      }

      // Extract rating
      const ratingElement = await this.page.$('[data-testid="review-score"], .review-score, .rating');
      if (ratingElement) {
        const ratingText = await ratingElement.textContent();
        const ratingMatch = ratingText?.match(/(\d+(?:\.\d+)?)/);
        if (ratingMatch) {
          hotelData.rating = parseFloat(ratingMatch[1]);
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
      console.warn('⚠️ Some hotel details could not be extracted:', error);
    }

    return hotelData;
  }

  private async extractHotelName(): Promise<string> {
    if (!this.page) throw new Error('Page not available');

    try {
      // 1. First try to extract from JSON data (like Python version)
      const jsonName = await this.extractHotelNameFromJSON();
      if (jsonName) {
        console.log(`✅ Found hotel name in JSON: ${jsonName}`);
        return this.cleanHotelName(jsonName);
      }

      // 2. Try multiple selectors for hotel name (like Python version)
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
              console.log(`✅ Found hotel name with selector '${selector}': ${cleanName}`);
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
              console.log(`✅ Found hotel name in ${tag}: ${cleanName}`);
              return cleanName;
            }
          }
        } catch (error) {
          // Continue to next tag
        }
      }

      console.warn('⚠️ No hotel name found');
      return '';

    } catch (error) {
      console.warn('⚠️ Error extracting hotel name:', error);
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

      // Look for hotel name in JSON data (patterns from Python version)
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
      console.warn('⚠️ Error extracting hotel name from JSON:', error);
      return null;
    }
  }

  private cleanHotelName(name: string): string {
    // Clean up hotel name by removing extra text (like Python version)
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
      // 1. Essayer le sélecteur principal comme en Python
      try {
        const mainSelector = '#hp_availability_style_changes [data-testid="searchbox-dates-container"]';
        const el = await this.page.$(mainSelector);
        if (el) {
          await el.click();
          console.log(`✅ Clicked date picker with selector: ${mainSelector}`);
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
            console.log('✅ Clicked on second [data-testid="searchbox-dates-container"] (fallback)');
            clicked = true;
          } else if (containers.length === 1) {
            await containers[0].click();
            console.log('✅ Clicked on first [data-testid="searchbox-dates-container"] (only one found)');
            clicked = true;
          } else {
            console.warn('⚠️ No [data-testid="searchbox-dates-container"] found');
          }
        } catch (e) {
          console.warn('⚠️ Fallback click failed:', e);
        }
      }

      if (!clicked) {
        console.warn('⚠️ Could not find date picker, proceeding without clicking');
      }

      // Attendre 8 secondes comme dans la version Python
      await this.page.waitForTimeout(8000);

    } catch (error) {
      console.warn('⚠️ Error clicking date picker:', error);
    }
  }

  private async extractPricingData(): Promise<PricingData[]> {
    if (!this.page) throw new Error('Page not available');

    const pricingData: PricingData[] = [];

    // Attendre après le click (déjà fait dans clickDatePicker)
    // Ici, on attend juste un peu pour s'assurer que tout est capturé
    await this.page.waitForTimeout(1000);

    // Process collected GraphQL responses
    for (const response of this.graphqlResponses) {
      const pricing = this.parseGraphQLResponse(response);
      pricingData.push(...pricing);
    }

    // If no GraphQL data found, try to extract from page content
    if (pricingData.length === 0) {
      console.log('🔍 No GraphQL data found, trying to extract from page content...');
      const pagePricing = await this.extractPricingFromPage();
      pricingData.push(...pagePricing);
    }

    return pricingData;
  }

  private parseGraphQLResponse(response: any): PricingData[] {
    const pricing: PricingData[] = [];

    try {
      // Handle availabilityCalendar structure (like Python version)
      if (response.data?.availabilityCalendar) {
        const calendarData = response.data.availabilityCalendar;
        console.log('📊 Processing availabilityCalendar data...');

        // Extract hotel ID if available
        if (calendarData.hotelId) {
          console.log(`🏨 Hotel ID: ${calendarData.hotelId}`);
        }

        // Process days data
        if (calendarData.days && Array.isArray(calendarData.days)) {
          console.log(`📅 Found ${calendarData.days.length} days in calendar`);
          
          for (const day of calendarData.days) {
            if (day.available !== false) { // Available by default unless explicitly false
              // Convert price from formatted string to float (like Python)
              const priceStr = day.avgPriceFormatted || '€0';
              const price = this.extractPriceFromFormattedString(priceStr);
              
              if (price && day.checkin) {
                pricing.push({
                  date: day.checkin,
                  price: price,
                  currency: 'EUR',
                  availability: true,
                  roomType: 'Standard'
                });
                console.log(`💰 ${day.checkin}: ${priceStr} (€${price})`);
              }
            }
          }
        }

        console.log(`✅ Extracted ${pricing.length} pricing entries from availabilityCalendar`);
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
              roomType: day.roomType || 'Standard'
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
              roomType: day.roomType || 'Standard'
            });
          }
        }
      }

    } catch (error) {
      console.warn('⚠️ Error parsing GraphQL response:', error);
    }

    return pricing;
  }

  private extractPriceFromFormattedString(priceStr: string): number | null {
    try {
      // Remove currency symbols and spaces (like Python version)
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
      console.warn(`⚠️ Could not extract price from '${priceStr}':`, error);
      return null;
    }
  }

  private async extractPricingFromPage(): Promise<PricingData[]> {
    if (!this.page) throw new Error('Page not available');

    const pricing: PricingData[] = [];

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
                roomType: 'Standard'
              });
            }
          }
        } catch (error) {
          // Continue with next element
        }
      }

    } catch (error) {
      console.warn('⚠️ Error extracting pricing from page:', error);
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
    console.log('🔒 Browser closed');
  }
} 