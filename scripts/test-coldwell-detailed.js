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
  
  console.log('Testing Coldwell Banker structure...\n');
  
  await page.goto('https://www.coldwellbankercostarica.com/luxury', { 
    waitUntil: 'domcontentloaded', 
    timeout: 20000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  console.log('=== Analyzing [data-id] elements ===\n');
  
  const listings = $('[data-id]');
  console.log(`Found ${listings.length} elements with data-id\n`);
  
  listings.slice(0, 3).each((i, el) => {
    const $el = $(el);
    console.log(`\nElement ${i + 1}:`);
    console.log(`  Tag: ${el.name}`);
    console.log(`  Classes: ${$el.attr('class')}`);
    console.log(`  data-id: ${$el.attr('data-id')}`);
    
    // Look for title/price/location
    const title = $el.find('h3, h4, .title, [class*="title"]').first().text().trim();
    const price = $el.find('.price, [class*="price"]').first().text().trim();
    const location = $el.find('.location, [class*="location"], .address').first().text().trim();
    const link = $el.find('a').first().attr('href');
    
    console.log(`  Title: ${title.substring(0, 60)}`);
    console.log(`  Price: ${price.substring(0, 40)}`);
    console.log(`  Location: ${location.substring(0, 40)}`);
    console.log(`  Link: ${link}`);
    
    // Show first 400 chars of HTML
    console.log(`\n  HTML preview:\n${$el.html().substring(0, 400)}...`);
  });
  
  await browser.close();
})();
