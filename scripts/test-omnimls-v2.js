#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  console.log('Loading OmniMLS search results...');
  await page.goto('https://omnimls.com/v/results/listing-type_sale', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  console.log('Waiting for JavaScript...');
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const selectors = [
    '.property-card', '.listing-card', '[class*="PropertyCard"]',
    '[class*="ListingCard"]', '[class*="property"]', 'div[class*="Card"]',
    'article', '[data-testid*="property"]'
  ];
  
  console.log('\n📊 OmniMLS Results:');
  for (const selector of selectors) {
    const count = $(selector).length;
    if (count > 0 && count < 500) {
      console.log(`\n✅ ${selector}: ${count} elements`);
      const first = $(selector).first();
      const title = first.find('h1, h2, h3, h4').text().trim();
      if (title) console.log(`   Sample: ${title.substring(0, 50)}`);
    }
  }
  
  await browser.close();
})();
