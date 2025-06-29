import { HotelScraper } from './hotel-scraper.js';
import { ApiClient } from './api-client.js';
import { BatchScrapingResult, ScrapingResult } from './types.js';

export class HotelMonitoringScraper {
  private scraper: HotelScraper;
  private apiClient: ApiClient;

  constructor(apiBaseUrl: string = 'http://localhost:8000') {
    this.scraper = new HotelScraper();
    this.apiClient = new ApiClient(apiBaseUrl);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Hotel Monitoring Scraper...');
    await this.scraper.initialize();
    
    // Test API connection
    const apiConnected = await this.apiClient.testConnection();
    if (!apiConnected) {
      console.warn('⚠️ API connection failed. Data will not be saved to backend.');
    }
  }

  async scrapeSingleHotel(url: string): Promise<ScrapingResult> {
    console.log(`\n🏨 Scraping single hotel: ${url}`);
    
    const result = await this.scraper.scrapeHotel(url);
    
    if (result.success && result.data) {
      // Try to save to backend
      const saved = await this.apiClient.saveHotelData(result.data);
      if (saved) {
        console.log('💾 Data saved to backend successfully');
      }
    }
    
    return result;
  }

  async scrapeMultipleHotels(urls: string[]): Promise<BatchScrapingResult> {
    console.log(`\n🏨🏨 Scraping ${urls.length} hotels...`);
    
    const startTime = Date.now();
    const results: ScrapingResult[] = [];
    let successfulScrapes = 0;
    let failedScrapes = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n[${i + 1}/${urls.length}] Scraping: ${url}`);
      
      const result = await this.scrapeSingleHotel(url);
      results.push(result);
      
      if (result.success) {
        successfulScrapes++;
      } else {
        failedScrapes++;
      }
      
      // Add delay between requests to be respectful
      if (i < urls.length - 1) {
        console.log('⏳ Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
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

    console.log(`\n📊 Batch scraping completed:`);
    console.log(`   ✅ Successful: ${successfulScrapes}`);
    console.log(`   ❌ Failed: ${failedScrapes}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);

    return batchResult;
  }

  async close(): Promise<void> {
    await this.scraper.close();
    console.log('🔒 Scraper closed');
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run scrape <hotel_url>');
    console.log('   or: npm run scrape --batch <url1> <url2> ...');
    process.exit(1);
  }

  const scraper = new HotelMonitoringScraper();
  
  try {
    await scraper.initialize();
    
    if (args[0] === '--batch') {
      const urls = args.slice(1);
      const result = await scraper.scrapeMultipleHotels(urls);
      console.log('\n📄 Results:', JSON.stringify(result, null, 2));
    } else {
      const url = args[0];
      const result = await scraper.scrapeSingleHotel(url);
      console.log('\n📄 Result:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await scraper.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 