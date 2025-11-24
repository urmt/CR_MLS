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
  
  await page.goto('https://www.coldwellbankercostarica.com/costa-rica/property-for-sale/is-luxury/yes', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $('.property-item');
  console.log(`\nFound ${listings.length} property items\n`);
  
  listings.slice(0, 3).each((i, el) => {
    const $el = $(el);
    
    console.log(`\n=== Property ${i + 1} ===`);
    
    // Test various selectors
    const tests = {
      'h3': $el.find('h3').text().trim(),
      'h4': $el.find('h4').text().trim(),
      '.property-title': $el.find('.property-title').text().trim(),
      '[class*="title"]': $el.find('[class*="title"]').first().text().trim(),
      '.price': $el.find('.price').text().trim(),
      '[class*="price"]': $el.find('[class*="price"]').first().text().trim(),
      '.property-type-address': $el.find('.property-type-address').text().trim(),
      '[class*="address"]': $el.find('[class*="address"]').first().text().trim(),
      'a[href]': $el.find('a[href]').first().attr('href')
    };
    
    for (const [selector, value] of Object.entries(tests)) {
      if (value && value.length > 0) {
        console.log(`${selector}: ${value.substring(0, 70)}`);
      }
    }
  });
  
  await browser.close();
})();
