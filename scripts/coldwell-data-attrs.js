#!/usr/bin/env node

const puppeteer = require('puppeteer');

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
  
  // Extract property data using JavaScript
  const properties = await page.evaluate(() => {
    const items = document.querySelectorAll('.property-item');
    const results = [];
    
    items.forEach((item, i) => {
      if (i < 3) {
        const title = item.querySelector('[class*="title"]')?.textContent.trim();
        const price = item.querySelector('[class*="price"]')?.textContent.trim();
        const location = item.querySelector('.property-type-address')?.textContent.trim();
        
        // Get all data attributes
        const dataAttrs = {};
        for (const attr of item.attributes) {
          if (attr.name.startsWith('data-')) {
            dataAttrs[attr.name] = attr.value;
          }
        }
        
        // Look for clickable elements with property URL
        const links = Array.from(item.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(href => href && href !== '#' && href.includes('property'));
        
        results.push({ title, price, location, dataAttrs, links });
      }
    });
    
    return results;
  });
  
  console.log(JSON.stringify(properties, null, 2));
  
  await browser.close();
})();
