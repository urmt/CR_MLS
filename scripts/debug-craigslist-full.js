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
  
  const result = $('.cl-search-result').first();
  
  console.log('=== Complete first result HTML (first 2500 chars) ===\n');
  console.log(result.html().substring(0, 2500));
  
  console.log('\n\n=== Looking for text nodes ===\n');
  console.log('All text:', result.text().substring(0, 200));
  
  console.log('\n\n=== Testing various selectors ===\n');
  
  const tests = [
    'a.main',
    'div.label',
    'div.meta',
    'span.priceinfo',
    'span.price',
    '.gallery-card a[title]',
    '.gallery-card img[alt]'
  ];
  
  for (const selector of tests) {
    const el = result.find(selector);
    if (el.length > 0) {
      console.log(`${selector}:`);
      console.log(`  text: "${el.text().trim().substring(0, 80)}"`);
      console.log(`  title attr: "${el.attr('title')}"`);
      console.log(`  alt attr: "${el.attr('alt')}"`);
    }
  }
  
  await browser.close();
})();
