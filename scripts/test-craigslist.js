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
  
  console.log('Loading Craigslist Costa Rica real estate...');
  await page.goto('https://costarica.craigslist.org/search/rea', { 
    waitUntil: 'domcontentloaded', 
    timeout: 20000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // Test specific selectors for property listings
  const selectors = [
    '.cl-search-result',
    '.cl-static-search-result',
    'li.cl-search-result',
    '[data-pid]',
    '.result-row',
    '.gallery-card'
  ];
  
  console.log('\n📊 Craigslist Selector Results:');
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`\n✅ ${selector}: ${elements.length} elements`);
      
      // Show details of first 2 listings
      elements.slice(0, 2).each((i, el) => {
        const $el = $(el);
        const title = $el.find('.title, .titlestring, [class*="title"]').text().trim();
        const price = $el.find('.price, [class*="price"]').text().trim();
        const location = $el.find('.location, [class*="location"], .meta').text().trim();
        const link = $el.find('a').attr('href');
        
        console.log(`\n  Listing ${i + 1}:`);
        console.log(`    Title: ${title.substring(0, 60)}`);
        console.log(`    Price: ${price}`);
        console.log(`    Location: ${location.substring(0, 40)}`);
        console.log(`    Link: ${link ? link.substring(0, 60) : 'none'}`);
      });
    }
  }
  
  await browser.close();
})();
