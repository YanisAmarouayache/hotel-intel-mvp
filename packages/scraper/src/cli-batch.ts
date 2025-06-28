import { HotelMonitoringScraper } from './index.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: tsx src/cli-batch.ts <url1> <url2> ...');
    process.exit(1);
  }
  
  const urls = args;
  const scraper = new HotelMonitoringScraper();
  
  try {
    await scraper.initialize();
    const result = await scraper.scrapeMultipleHotels(urls);
    // Affiche le résultat JSON sur la dernière ligne (pour parsing subprocess)
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error('Error:', e);
    process.exit(2);
  } finally {
    await scraper.close();
  }
}

main(); 