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
  
  console.log('Loading RE/MAX Ocean Surf properties...\n');
  
  await page.goto('https://www.remax-oceansurf-cr.com/properties', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // Get all unique class names with "property" in them
  const propertyClasses = new Set();
  $('[class*="property"]').each((i, el) => {
    const classes = $(el).attr('class');
    if (classes) {
      classes.split(' ').forEach(c => {
        if (c.includes('property')) propertyClasses.add(c);
      });
    }
  });
  
  console.log('Classes with "property":');
  Array.from(propertyClasses).slice(0, 15).forEach(c => console.log(`  ${c}`));
  
  // Try to find repeating elements that look like listings
  const testSelectors = [
    '.property-result',
    '.property-item',
    '.property-box',
    'article',
    '.views-row'
  ];
  
  console.log('\n=== Testing potential listing containers ===');
  for (const sel of testSelectors) {
    const count = $(sel).length;
    if (count > 0) {
      console.log(`${sel}: ${count} elements`);
    }
  }
  
  await browser.close();
})();
