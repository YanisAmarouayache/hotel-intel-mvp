import * as puppeteer from 'puppeteer';

async function debugPuppeteer() {
  console.log('🚀 Starting Puppeteer debug mode...');
  
  // Launch browser in non-headless mode
  const browser = await puppeteer.launch({
    headless: false, // Show the browser window
    slowMo: 1000, // Slow down operations by 1 second so you can see what's happening
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    timeout: 60000,
  });

  const page = await browser.newPage();
  
  // Listen for GraphQL requests BEFORE navigation
  const graphqlRequests: any[] = [];
  
  // Listen to requests (outgoing)
  page.on('request', (request) => {
    const requestUrl = request.url();
    if (requestUrl.includes('/dml/graphql')) {
      console.log(`📤 GraphQL request sent: ${requestUrl}`);
    }
  });
  
  // Listen to responses (incoming)
  page.on('response', async (response) => {
    const responseUrl = response.url();
    if (responseUrl.includes('/dml/graphql')) {
      try {
        console.log(`📡 Intercepted GraphQL response: ${responseUrl}`);
        const responseData = await response.json();
        graphqlRequests.push({
          url: responseUrl,
          data: responseData,
          status: response.status()
        });
        console.log(`📊 GraphQL response status: ${response.status()}`);
        console.log(`📊 Response data keys: ${Object.keys(responseData)}`);
        if (responseData.data?.availabilityCalendar?.days) {
          console.log(`📊 Days found: ${responseData.data.availabilityCalendar.days.length}`);
        }
      } catch (e) {
        console.log(`❌ Error parsing GraphQL response: ${e.message}`);
      }
    }
  });
  
  try {
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to a sample Booking.com hotel page
    const testUrl = 'https://www.booking.com/hotel/fr/le-bristol-paris.fr.html';
    console.log(`📄 Navigating to: ${testUrl}`);
    
    await page.goto(testUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    console.log('⏳ Waiting 3 seconds for page to load...');
    await page.waitForTimeout(3000);

    // Try to find and click on date selector
    console.log('📅 Looking for date selectors...');
    
    // Simple approach: just look for the second date-display-field-start
    const targetSelector = '[data-testid="date-display-field-start"]';
    console.log(`🔍 Looking for: ${targetSelector}`);
    
    try {
      const elements = await page.$$(targetSelector);
      console.log(`📊 Found ${elements.length} elements with data-testid="date-display-field-start"`);
      
      if (elements.length >= 2) {
        console.log('✅ Found at least 2 elements, clicking on the second one (index 1)');
        await elements[1].click();
        console.log('⏳ Waiting 2 seconds after click...');
        await page.waitForTimeout(2000);
      } else if (elements.length === 1) {
        console.log('⚠️ Found only 1 element, clicking on it');
        await elements[0].click();
        console.log('⏳ Waiting 2 seconds after click...');
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ No date-display-field-start elements found!');
        throw new Error('No date selector found');
      }
    } catch (e) {
      console.log(`❌ Error with date selector: ${e.message}`);
      throw e;
    }

    // Wait for GraphQL requests
    console.log('⏳ Waiting 5 seconds for GraphQL requests...');
    await page.waitForTimeout(5000);

    console.log(`📊 Total GraphQL requests intercepted: ${graphqlRequests.length}`);
    
    // Show what we found
    if (graphqlRequests.length > 0) {
      console.log('🎉 GraphQL requests found!');
      graphqlRequests.forEach((req, index) => {
        console.log(`Request ${index + 1}:`);
        console.log(`  URL: ${req.url}`);
        console.log(`  Status: ${req.status}`);
        if (req.data?.data?.availabilityCalendar?.days) {
          console.log(`  Days found: ${req.data.data.availabilityCalendar.days.length}`);
        }
      });
    } else {
      console.log('❌ No GraphQL requests found');
    }

    // Keep the browser open for 10 seconds so you can inspect
    console.log('⏳ Keeping browser open for 100 seconds for inspection...');
    await page.waitForTimeout(100000);

  } catch (error) {
    console.error(`❌ Error during debug: ${error.message}`);
  } finally {
    console.log('🔄 Closing browser...');
    await browser.close();
  }
}

// Run the debug script
debugPuppeteer().catch(console.error); 