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
  
  console.log('Loading KRAIN listings...\n');
  
  await page.goto('https://krainrealestate.com/home-search/listings', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  console.log('=== Testing selectors ===');
  console.log('.property-card:', $('.property-card').length);
  console.log('.listing-card:', $('.listing-card').length);
  console.log('.property:', $('.property').length);
  console.log('[class*="property"]:', $('[class*="property"]').length);
  console.log('[class*="listing"]:', $('[class*="listing"]').length);
  console.log('[class*="card"]:', $('[class*="card"]').length);
  console.log('article:', $('article').length);
  
  await browser.close();
})();
