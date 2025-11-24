const puppeteer = require('puppeteer');

async function testCasaManana(browser) {
  console.log('\n━━━ Casa de Mañana ━━━');
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  await page.goto('https://casademananacr.com/es/nuestros-listados', {waitUntil: 'domcontentloaded', timeout: 15000});
  await new Promise(r => setTimeout(r, 3000));
  
  const props = await page.evaluate(() => {
    const listings = document.querySelectorAll('.item-listing-wrap');
    const results = [];
    
    listings.forEach((listing, i) => {
      if (i < 5) {
        const title = listing.querySelector('h2, .item-title')?.textContent?.trim();
        const price = listing.querySelector('.item-price')?.textContent?.trim();
        const location = listing.querySelector('.item-address')?.textContent?.trim();
        const link = listing.querySelector('a')?.href;
        
        results.push({title: title || 'No title', price: price || 'No price', location: location || 'No location', url: link || 'No link'});
      }
    });
    
    return {total: listings.length, properties: results};
  });
  
  console.log(`Found ${props.total} listings`);
  props.properties.slice(0, 3).forEach((p, i) => {
    const valid = !!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location');
    console.log(`${i+1}. ${p.title.substring(0, 40)} | ${p.price} | ${valid ? '✅' : '❌'}`);
  });
  
  await page.close();
  return props.properties.filter(p => p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location').length;
}

async function testImmo(browser) {
  console.log('\n━━━ Immo Costa Rica ━━━');
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  await page.goto('https://immocostarica.com/for-sale/luxury-home', {waitUntil: 'domcontentloaded', timeout: 15000});
  await new Promise(r => setTimeout(r, 3000));
  
  const props = await page.evaluate(() => {
    const cards = document.querySelectorAll('.card');
    const results = [];
    
    cards.forEach((card, i) => {
      if (i < 5) {
        const title = card.querySelector('h2, h3, h4, .card-title, [class*="title"]')?.textContent?.trim();
        const price = card.querySelector('.price, [class*="price"]')?.textContent?.trim();
        const location = card.querySelector('.location, [class*="location"], [class*="address"]')?.textContent?.trim();
        const link = card.querySelector('a')?.href;
        
        results.push({title: title || 'No title', price: price || 'No price', location: location || 'No location', url: link || 'No link'});
      }
    });
    
    return {total: cards.length, properties: results};
  });
  
  console.log(`Found ${props.total} cards`);
  props.properties.slice(0, 3).forEach((p, i) => {
    const valid = !!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location');
    console.log(`${i+1}. ${p.title.substring(0, 40)} | ${p.price} | ${valid ? '✅' : '❌'}`);
  });
  
  await page.close();
  return props.properties.filter(p => p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location').length;
}

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  
  const casaValid = await testCasaManana(browser);
  const immoValid = await testImmo(browser);
  
  await browser.close();
  
  console.log(`\n\n━━━ SUMMARY ━━━`);
  console.log(`Casa de Mañana: ${casaValid}/5 valid`);
  console.log(`Immo Costa Rica: ${immoValid}/5 valid`);
})();
