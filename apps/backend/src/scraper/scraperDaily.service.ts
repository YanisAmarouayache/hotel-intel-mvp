import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  HotelData,
  PricingData,
  ScrapedHotel,
  ScrapingResult,
  BatchScrapingResult,
} from './types';
import { load } from 'cheerio';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  /**
   * Extract pricing data directly from the hotel page HTML
   * This approach is more reliable than the GraphQL API which keeps changing
   */
  private async extractPricingFromHtml(url: string): Promise<PricingData[]> {
    this.logger.log(`🏨 Extracting pricing data from hotel page...`);
    
    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000,
      });

      const $ = load(html);
      const pricing: PricingData[] = [];

      // Strategy 1: Look for JSON-LD structured data with pricing
      const jsonLdScripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < jsonLdScripts.length; i++) {
        const scriptText = $(jsonLdScripts[i]).html();
        if (scriptText) {
          try {
            const data = JSON.parse(scriptText);
            if (data['@type'] === 'Hotel' && data.offers) {
              this.logger.log(`📊 Found structured hotel data with offers`);
              
              if (Array.isArray(data.offers)) {
                for (const offer of data.offers) {
                  if (offer.price && offer.priceCurrency) {
                    const price = this.extractPriceFromFormattedString(offer.price.toString());
                    if (price !== null) {
                      pricing.push({
                        date: new Date().toISOString().slice(0, 10), // Today's date as fallback
                        price,
                        currency: offer.priceCurrency,
                        availability: true,
                        roomType: offer.name || 'Standard',
                      });
                    }
                  }
                }
              } else if (data.offers.price && data.offers.priceCurrency) {
                const price = this.extractPriceFromFormattedString(data.offers.price.toString());
                if (price !== null) {
                  pricing.push({
                    date: new Date().toISOString().slice(0, 10),
                    price,
                    currency: data.offers.priceCurrency,
                    availability: true,
                    roomType: data.offers.name || 'Standard',
                  });
                }
              }
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }

      // Strategy 2: Look for pricing in script tags with window.__INITIAL_STATE__
      const scripts = $('script');
      for (let i = 0; i < scripts.length; i++) {
        const scriptText = $(scripts[i]).html();
        if (scriptText && scriptText.includes('window.__INITIAL_STATE__')) {
          try {
            const match = scriptText.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
            if (match) {
              const initialState = JSON.parse(match[1]);
              this.logger.log(`📊 Found initial state data`);
              
              // Look for pricing data in the initial state
              const pricingData = this.extractPricingFromObject(initialState);
              if (pricingData.length > 0) {
                pricing.push(...pricingData);
              }
            }
          } catch (e) {
            this.logger.warn(`⚠️ Failed to parse initial state: ${e}`);
          }
        }
      }

      // Strategy 3: Look for pricing elements in the DOM
      const priceSelectors = [
        '[data-testid="price-and-discounted-price"]',
        '.price',
        '.rate',
        '.price-value',
        '.price__value',
        '.bui-price-display__value',
        '.prco-valign-helper',
        '.bui-price-display__value',
        '.price-display',
        '.room-price',
        '.hotel-price',
        '[class*="price"]',
        '[class*="rate"]'
      ];

      for (const selector of priceSelectors) {
        const priceElements = $(selector);
        if (priceElements.length > 0) {
          this.logger.log(`💰 Found ${priceElements.length} price elements using selector: ${selector}`);
          
          priceElements.each((_, element) => {
            const priceText = $(element).text().trim();
            if (priceText) {
              const price = this.extractPriceFromFormattedString(priceText);
              if (price !== null && price > 0) {
                pricing.push({
                  date: new Date().toISOString().slice(0, 10),
                  price,
                  currency: 'EUR', // Default to EUR for Booking.com
                  availability: true,
                  roomType: 'Standard',
                });
              }
            }
          });
          
          if (pricing.length > 0) break; // Found some pricing, stop looking
        }
      }

      // Strategy 4: Look for availability calendar data in scripts
      const calendarScripts = $('script').filter((_, el) => {
        const text = $(el).html();
        return text && (text.includes('availability') || text.includes('calendar') || text.includes('pricing'));
      });

      for (let i = 0; i < calendarScripts.length; i++) {
        const scriptText = $(calendarScripts[i]).html();
        if (scriptText) {
          try {
            // Look for JSON objects that might contain pricing data
            const jsonMatches = scriptText.match(/\{[^{}]*"price"[^{}]*\}/g);
            if (jsonMatches) {
              for (const match of jsonMatches) {
                try {
                  const data = JSON.parse(match);
                  if (data.price) {
                    const price = this.extractPriceFromFormattedString(data.price.toString());
                    if (price !== null) {
                      pricing.push({
                        date: data.date || new Date().toISOString().slice(0, 10),
                        price,
                        currency: data.currency || 'EUR',
                        availability: data.available !== false,
                        roomType: data.roomType || 'Standard',
                      });
                    }
                  }
                } catch (e) {
                  // Invalid JSON, continue
                }
              }
            }
          } catch (e) {
            // Continue to next script
          }
        }
      }

      // Remove duplicates and sort by price
      const uniquePricing = pricing.filter((item, index, self) => 
        index === self.findIndex(p => p.price === item.price && p.date === item.date)
      );

      this.logger.log(`✅ Extracted ${uniquePricing.length} unique pricing entries`);
      if (uniquePricing.length > 0) {
        this.logger.log(`💰 Price range: ${Math.min(...uniquePricing.map(p => p.price))}€ - ${Math.max(...uniquePricing.map(p => p.price))}€`);
        this.logger.log(`📅 Sample prices: ${uniquePricing.slice(0, 3).map(p => `${p.price}€`).join(', ')}`);
      }
      
      return uniquePricing;

    } catch (error) {
      this.logger.error(`❌ Error extracting pricing data: ${error}`);
      return [];
    }
  }

  /**
   * Recursively search for pricing data in an object
   */
  private extractPricingFromObject(obj: any, path: string = ''): PricingData[] {
    const pricing: PricingData[] = [];

    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key === 'price' && typeof value === 'number' && value > 0) {
          pricing.push({
            date: new Date().toISOString().slice(0, 10),
            price: value,
            currency: 'EUR',
            availability: true,
            roomType: 'Standard',
          });
        } else if (key === 'price' && typeof value === 'string') {
          const price = this.extractPriceFromFormattedString(value);
          if (price !== null) {
            pricing.push({
              date: new Date().toISOString().slice(0, 10),
              price,
              currency: 'EUR',
              availability: true,
              roomType: 'Standard',
            });
          }
        } else if (Array.isArray(value)) {
          for (const item of value) {
            pricing.push(...this.extractPricingFromObject(item, currentPath));
          }
        } else if (typeof value === 'object') {
          pricing.push(...this.extractPricingFromObject(value, currentPath));
        }
      }
    }

    return pricing;
  }

  private async extractHotelIdFromHtml(url: string): Promise<string> {
    // 1. Extraire via URL (si `b_hid`)
    const bHidMatch = url.match(/b_hid=([a-z0-9]+)/i);
    if (bHidMatch) {
      const base36Id = bHidMatch[1];
      const numericId = parseInt(base36Id, 36);
      if (!isNaN(numericId)) return numericId.toString();
    }
  
    // 2. Fallback HTML classique
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const $ = load(html);
    const scripts = $('script');
  
    for (let i = 0; i < scripts.length; i++) {
      const scriptText = $(scripts[i]).html();
      if (!scriptText) continue;
  
      const match = scriptText.match(/hotel_id["']?\s*[:=]\s*["']?(\d{5,})["']?/);
      if (match) return match[1];
  
      const jsonMatch = scriptText.match(/"hotel_id"\s*:\s*"(\d{5,})"/);
      if (jsonMatch) return jsonMatch[1];
    }
  
    const div = $('[data-hotelid]');
    if (div.length) {
      const hotelId = div.attr('data-hotelid');
      if (hotelId) return hotelId;
    }
    
    throw new Error('hotelId not found in HTML or URL');
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

  private async extractHotelDetails(url: string): Promise<HotelData> {
    this.logger.log(`🏨 Extracting hotel details...`);
    
    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });
      const $ = load(html);

      let hotelName = '';
      
      // 1. Try JSON-LD structured data
      const jsonLdScripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < jsonLdScripts.length; i++) {
        const scriptText = $(jsonLdScripts[i]).html();
        if (scriptText) {
          try {
            const data = JSON.parse(scriptText);
            if (data.name) {
              hotelName = data.name;
              this.logger.log(`📊 Found hotel name from structured data: ${hotelName}`);
              break;
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }

      // 2. Try multiple selectors for hotel name
      if (!hotelName) {
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
          const element = $(selector);
          if (element.length) {
            const name = element.text().trim();
            if (name && name.length > 3) {
              hotelName = this.cleanHotelName(name);
              this.logger.log(`📊 Found hotel name from DOM: ${hotelName}`);
              break;
            }
          }
        }
      }

      // 3. Fallback to page title
      if (!hotelName) {
        hotelName = $('title').text().trim();
        hotelName = this.cleanHotelName(hotelName);
        this.logger.log(`📊 Found hotel name from page title: ${hotelName}`);
      }

      // Extract other details
      const address = $('[data-testid="property-location"], .hp__hotel-address, .address').text().trim();
      const ratingText = $('[data-testid="review-score"], .review-score, .rating').text();
      const rating = ratingText ? parseFloat(ratingText.match(/(\d+(?:\.\d+)?)/)?.[1] || '0') : undefined;
      const reviewCountText = $('[data-testid="review-count"], .review-count, .reviews').text();
      const reviewCount = reviewCountText ? parseInt(reviewCountText.match(/(\d+)/)?.[1] || '0') : undefined;
      const description = $('.hp__hotel-description, .description, [data-testid="property-description"]').text().trim();

      // Extract amenities
      const amenities: string[] = [];
      $('.amenity, .facility, [data-testid="amenity"]').each((_, element) => {
        const text = $(element).text().trim();
        if (text) amenities.push(text);
      });

      // Extract images
      const images: string[] = [];
      $('img[src*="booking.com"], .hotel-image img').each((_, element) => {
        const src = $(element).attr('src');
        if (src) images.push(src);
      });

      const hotelData = {
        name: hotelName || 'Unknown Hotel',
        url,
        address: address || undefined,
        rating,
        reviewCount,
        description: description || undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
        images: images.length > 0 ? images : undefined,
      };

      // Log extracted hotel information
      this.logger.log(`🏨 Hotel: ${hotelData.name}`);
      if (hotelData.address) this.logger.log(`📍 Address: ${hotelData.address}`);
      if (hotelData.rating) this.logger.log(`⭐ Rating: ${hotelData.rating}/10`);
      if (hotelData.reviewCount) this.logger.log(`📝 Reviews: ${hotelData.reviewCount}`);
      if (hotelData.amenities && hotelData.amenities.length > 0) {
        this.logger.log(`🏊 Amenities: ${hotelData.amenities.slice(0, 5).join(', ')}${hotelData.amenities.length > 5 ? '...' : ''}`);
      }
      if (hotelData.images && hotelData.images.length > 0) {
        this.logger.log(`🖼️ Images: ${hotelData.images.length} found`);
      }

      return hotelData;
    } catch (error) {
      this.logger.warn('Error extracting hotel details:', error);
      return {
        name: 'Unknown Hotel',
        url,
      };
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
    this.logger.log(`🚀 Starting hotel scraping...`);

    try {
      const hotelData = await this.extractHotelDetails(url);
      const pricing = await this.extractPricingFromHtml(url);

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

  async scrapeMultipleHotels(
    urls: string[],
  ): Promise<BatchScrapingResult> {
    this.logger.log(`🚀 Starting batch scraping of ${urls.length} hotels...`);
    
    const results: ScrapingResult[] = [];
    let ok = 0,
      fail = 0;
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
}
