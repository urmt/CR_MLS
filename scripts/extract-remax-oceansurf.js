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
  
  await page.goto('https://www.remax-oceansurf-cr.com/properties', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $('.views-row');
  console.log(`\nFound ${listings.length} listings\n`);
  
  listings.slice(0, 3).each((i, el) => {
    const $el = $(el);
    
    console.log(`\n=== Listing ${i + 1} ===`);
    
    // Try various selectors
    const title = $el.find('h2, h3, .title, [class*="title"]').first().text().trim();
    const price = $el.find('.price, [class*="price"]').first().text().trim();
    const location = $el.find('.location, [class*="location"], .address').first().text().trim();
    const link = $el.find('a').first().attr('href');
    
    console.log(`Title: ${title.substring(0, 60)}`);
    console.log(`Price: ${price}`);
    console.log(`Location: ${location}`);
    console.log(`Link: ${link}`);
    
    // Show HTML structure
    console.log(`\nHTML preview (400 chars):\n${$el.html().substring(0, 400)}...`);
  });
  
  await browser.close();
})();
