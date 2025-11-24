const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://omnimls.com/v/results/listing-type_sale', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 6000));
  
  // Use the complex selector from config
  const selector = '.property-card, .listing-card, .resultado, article[class*="property"], [data-listing-id], .card, [class*="item"]';
  
  const properties = await page.evaluate((sel) => {
    const cards = document.querySelectorAll(sel);
    const results = [];
    
    cards.forEach((card, i) => {
      if (i < 5) {
        const titleEl = card.querySelector('.property-title, .listing-title, .titulo, h3, h4, h2, .title, [class*="title"]');
        const priceEl = card.querySelector('.property-price, .listing-price, .precio, .price, [class*="price"]');
        const locationEl = card.querySelector('.property-location, .listing-location, .ubicacion, .location, .address, [class*="location"]');
        const linkEl = card.querySelector('a[href*="/listing/"], a');
        
        results.push({
          title: titleEl?.textContent?.trim() || 'No title',
          price: priceEl?.textContent?.trim() || 'No price',
          location: locationEl?.textContent?.trim() || 'No location',
          url: linkEl?.href || 'No link',
          tagName: card.tagName
        });
      }
    });
    
    return {
      total: cards.length,
      properties: results
    };
  }, selector);
  
  console.log(`Found ${properties.total} elements\n`);
  
  properties.properties.forEach((p, i) => {
    console.log(`${i+1}. [${p.tagName}] ${p.title.substring(0, 45)}`);
    console.log(`   Price: ${p.price.substring(0, 30)}`);
    console.log(`   Location: ${p.location.substring(0, 35)}`);
    console.log(`   Valid: ${!!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location')}\n`);
  });
  
  await browser.close();
  
  const valid = properties.properties.filter(p => p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location').length;
  console.log(`✅ ${valid}/${properties.properties.length} have all required fields`);
})();
