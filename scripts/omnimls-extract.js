const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://omnimls.com/v/results/listing-type_sale', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 6000));
  
  const properties = await page.evaluate(() => {
    const cards = document.querySelectorAll('.card');
    const results = [];
    
    cards.forEach((card, i) => {
      if (i < 5) {
        // Try to extract data
        const title = card.querySelector('h2, h3, h4, .title, [class*="title"]')?.textContent?.trim();
        const price = card.querySelector('.price, [class*="price"]')?.textContent?.trim();
        const location = card.querySelector('.location, .address, [class*="location"], [class*="address"]')?.textContent?.trim();
        const link = card.querySelector('a')?.href;
        
        results.push({
          title: title || 'No title',
          price: price || 'No price',
          location: location || 'No location',
          url: link || 'No link',
          cardClasses: card.className
        });
      }
    });
    
    return {
      total: cards.length,
      properties: results
    };
  });
  
  console.log(`Found ${properties.total} cards\n`);
  
  properties.properties.forEach((p, i) => {
    console.log(`${i+1}. ${p.title.substring(0, 50)}`);
    console.log(`   Price: ${p.price}`);
    console.log(`   Location: ${p.location.substring(0, 40)}`);
    console.log(`   URL: ${p.url}`);
    console.log(`   Valid: ${!!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location')}\n`);
  });
  
  await browser.close();
  
  const valid = properties.properties.filter(p => p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location').length;
  console.log(`✅ ${valid}/${properties.properties.length} properties have all required fields`);
})();
