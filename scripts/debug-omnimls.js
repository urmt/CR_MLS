const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://omnimls.com/v/results/listing-type_sale', {waitUntil: 'domcontentloaded', timeout: 20000});
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // Test the broad selectors
  const selectors = [
    '.property-card',
    '.listing-card', 
    '.resultado',
    'article[class*="property"]',
    '[data-listing-id]',
    '.card'
  ];
  
  console.log('Testing selectors:\n');
  for (const sel of selectors) {
    const count = $(sel).length;
    if (count > 0) {
      console.log(`${sel}: ${count} elements`);
    }
  }
  
  // Get first card element
  const first = $('.card').first();
  if (first.length) {
    console.log('\n=== First .card HTML (1000 chars) ===\n');
    console.log(first.html().substring(0, 1000));
  }
  
  await browser.close();
})();
