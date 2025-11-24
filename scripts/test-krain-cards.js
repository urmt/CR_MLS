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
  
  await page.goto('https://krainrealestate.com/home-search/listings', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const cards = $('[class*="card"]');
  
  console.log(`\nFound ${cards.length} elements with "card" in class\n`);
  
  // Get unique card classes
  const uniqueClasses = new Set();
  cards.each((i, el) => {
    const classes = $(el).attr('class');
    if (classes) {
      classes.split(' ').forEach(c => {
        if (c.includes('card')) uniqueClasses.add(c);
      });
    }
  });
  
  console.log('Card classes:');
  uniqueClasses.forEach(c => console.log(`  ${c}`));
  
  // Check if there are listing-related elements
  const first = cards.first();
  console.log('\n=== First card structure (500 chars) ===');
  console.log(first.html() ? first.html().substring(0, 500) : 'No HTML');
  
  await browser.close();
})();
