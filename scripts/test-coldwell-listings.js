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
  
  console.log('Loading property listings page...\n');
  
  await page.goto('https://www.coldwellbankercostarica.com/costa-rica/property-for-sale/is-luxury/yes', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // Look for common listing containers
  console.log('=== Testing selectors ===');
  console.log('.property-item:', $('.property-item').length);
  console.log('.listing-item:', $('.listing-item').length);
  console.log('.property-card:', $('.property-card').length);
  console.log('.card:', $('.card').length);
  console.log('article:', $('article').length);
  console.log('[itemtype*="Product"]:', $('[itemtype*="Product"]').length);
  
  // Find all classes that contain "property" or "listing"
  const uniqueClasses = new Set();
  $('[class]').each((i, el) => {
    const classes = $(el).attr('class').split(' ');
    classes.forEach(c => {
      if (c.includes('property') || c.includes('listing') || c.includes('card') || c.includes('item')) {
        uniqueClasses.add(c);
      }
    });
  });
  
  console.log('\n=== Relevant class names ===');
  Array.from(uniqueClasses).slice(0, 15).forEach(c => console.log(c));
  
  await browser.close();
})();
