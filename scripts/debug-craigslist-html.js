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
  
  await page.goto('https://costarica.craigslist.org/search/rea', { 
    waitUntil: 'domcontentloaded', 
    timeout: 15000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $('.cl-search-result').first();
  
  console.log('=== First listing HTML ===\n');
  console.log(listings.html().substring(0, 1500));
  
  console.log('\n\n=== Testing selectors on first listing ===\n');
  
  const tests = [
    { name: 'Title (.title)', selector: '.title' },
    { name: 'Title (.titlestring)', selector: '.titlestring' },
    { name: 'Title (h3)', selector: 'h3' },
    { name: 'Price (.price)', selector: '.price' },
    { name: 'Location (.location)', selector: '.location' },
    { name: 'Location (.meta)', selector: '.meta' }
  ];
  
  for (const test of tests) {
    const value = listings.find(test.selector).text().trim();
    console.log(`${test.name}: "${value.substring(0, 60)}"`);
  }
  
  await browser.close();
})();
