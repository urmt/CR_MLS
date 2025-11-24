const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://casademananacr.com/es/nuestros-listados', {waitUntil: 'domcontentloaded', timeout: 15000});
  await new Promise(r => setTimeout(r, 3000));
  
  const properties = await page.evaluate(() => {
    const listings = document.querySelectorAll('[class*="listing"]');
    const results = [];
    
    // Filter to get actual property listings (not all 89 elements are properties)
    const filtered = Array.from(listings).filter(el => {
      const text = el.textContent;
      return text.length > 50 && (text.includes('$') || text.includes('₡'));
    });
    
    filtered.slice(0, 5).forEach(listing => {
      const title = listing.querySelector('h1, h2, h3, h4, .title, [class*="title"]')?.textContent?.trim();
      const price = listing.querySelector('.price, [class*="price"]')?.textContent?.trim();
      const location = listing.querySelector('.location, [class*="location"], [class*="address"]')?.textContent?.trim();
      const link = listing.querySelector('a')?.href;
      
      results.push({
        title: title || 'No title',
        price: price || 'No price',
        location: location || 'No location',
        url: link || 'No link'
      });
    });
    
    return {
      total: listings.length,
      filtered: filtered.length,
      properties: results
    };
  });
  
  console.log(`Found ${properties.total} [class*="listing"] elements`);
  console.log(`Filtered to ${properties.filtered} potential properties\n`);
  
  properties.properties.forEach((p, i) => {
    console.log(`${i+1}. ${p.title.substring(0, 50)}`);
    console.log(`   Price: ${p.price}`);
    console.log(`   Location: ${p.location}`);
    console.log(`   Valid: ${!!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location')}\n`);
  });
  
  await browser.close();
  
  const valid = properties.properties.filter(p => p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location').length;
  console.log(`✅ ${valid}/${properties.properties.length} valid`);
})();
