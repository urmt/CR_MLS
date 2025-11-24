const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://www.remax-costa-rica.com/advanced-search-results-properties/', {waitUntil: 'domcontentloaded', timeout: 20000});
  await new Promise(r => setTimeout(r, 4000));
  
  const properties = await page.evaluate(() => {
    const listings = document.querySelectorAll('.property_listing');
    const results = [];
    
    listings.forEach((listing, i) => {
      if (i < 5) {
        const title = listing.querySelector('h4, h3, h2, .property-title, [class*="title"]')?.textContent?.trim();
        const price = listing.querySelector('.price, .property-price, [class*="price"]')?.textContent?.trim();
        const location = listing.querySelector('.property_categs, .location, [class*="location"], [class*="address"]')?.textContent?.trim();
        const link = listing.querySelector('a')?.href;
        
        results.push({
          title: title || 'No title',
          price: price || 'No price',
          location: location || 'No location',
          url: link || 'No link'
        });
      }
    });
    
    return {
      total: listings.length,
      properties: results
    };
  });
  
  console.log(`Found ${properties.total} listings\n`);
  
  properties.properties.forEach((p, i) => {
    console.log(`${i+1}. ${p.title.substring(0, 50)}`);
    console.log(`   Price: ${p.price.substring(0, 30)}`);
    console.log(`   Location: ${p.location.substring(0, 40)}`);
    console.log(`   URL: ${p.url}`);
    console.log(`   Valid: ${!!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location')}\n`);
  });
  
  await browser.close();
  
  const valid = properties.properties.filter(p => p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location').length;
  console.log(`✅ ${valid}/5 properties have all required fields`);
})();
