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
  
  await page.goto('https://www.coldwellbankercostarica.com/costa-rica/property-for-sale/is-luxury/yes', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const first = $('.property-item').first();
  
  console.log('=== First property HTML (1000 chars) ===\n');
  console.log(first.html().substring(0, 1000));
  
  console.log('\n\n=== All attributes on property-item ===');
  const attrs = first.get(0).attribs;
  for (const [key, val] of Object.entries(attrs)) {
    console.log(`${key}: ${val.substring(0, 100)}`);
  }
  
  await browser.close();
})();
