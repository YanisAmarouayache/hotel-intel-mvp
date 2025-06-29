import { HotelMonitoringScraper } from './index.js';

async function testScraper() {
  console.log('🧪 Testing TypeScript Hotel Scraper...');
  
  const scraper = new HotelMonitoringScraper();
  
  try {
    await scraper.initialize();
    
    // Test with a sample hotel URL
    const testUrl = 'https://www.booking.com/hotel/fr/brach-paris.fr.html';
    console.log(`\n🏨 Testing with: ${testUrl}`);
    
    const result = await scraper.scrapeSingleHotel(testUrl);
    
    console.log('\n📄 Test Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Test successful!');
      console.log(`🏨 Hotel: ${result.data?.hotel.name}`);
      console.log(`💰 Pricing entries: ${result.data?.pricing.length}`);
    } else {
      console.log('\n❌ Test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await scraper.close();
  }
}

testScraper(); 