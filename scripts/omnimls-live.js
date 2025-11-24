const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://omnimls.com/v/results/listing-type_sale', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 5000));
  
  const result = await page.evaluate(() => {
    const selectors = ['.card', '[class*="item"]', 'article', '[data-id]'];
    const counts = {};
    
    selectors.forEach(sel => {
      counts[sel] = document.querySelectorAll(sel).length;
    });
    
    // Get first card
    const cards = document.querySelectorAll('.card');
    let firstHTML = '';
    if (cards[0]) {
      firstHTML = cards[0].outerHTML.substring(0, 1000);
    }
    
    // Try to find listing-like elements
    const allClasses = new Set();
    document.querySelectorAll('[class]').forEach(el => {
      el.className.split(' ').forEach(c => {
        if (c.includes('listing') || c.includes('property') || c.includes('result')) {
          allClasses.add(c);
        }
      });
    });
    
    return {
      counts,
      firstHTML,
      relevantClasses: Array.from(allClasses).slice(0, 20)
    };
  });
  
  console.log('Selector counts:', result.counts);
  console.log('\nRelevant classes:', result.relevantClasses);
  console.log('\nFirst card HTML:\n', result.firstHTML);
  
  await browser.close();
})();
