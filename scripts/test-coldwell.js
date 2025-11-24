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
  
  console.log('Testing Coldwell Banker Costa Rica...\n');
  
  try {
    await page.goto('https://www.coldwellbankercostarica.com/luxury', { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Test current selectors
    console.log('=== Testing current selectors ===');
    console.log('.listing-card:', $('.listing-card').length);
    console.log('.property-card:', $('.property-card').length);
    console.log('.property:', $('.property').length);
    console.log('[class*="listing"]:', $('[class*="listing"]').length);
    console.log('[class*="property"]:', $('[class*="property"]').length);
    
    // Get a sample of class names
    console.log('\n=== Sample elements with "property" or "listing" in class ===');
    $('[class*="property"], [class*="listing"]').slice(0, 3).each((i, el) => {
      console.log(`${i + 1}. ${el.attribs.class}`);
    });
    
    // Try to find repeating elements
    console.log('\n=== Looking for repeating container elements ===');
    const commonSelectors = ['article', '.item', '.card', '[data-id]', '[itemtype]'];
    for (const sel of commonSelectors) {
      const count = $(sel).length;
      if (count > 5) {
        console.log(`${sel}: ${count} elements`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
