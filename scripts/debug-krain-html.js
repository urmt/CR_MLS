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
  
  const first = $('[class*="ListingInformationCard_card"]').first();
  
  console.log('=== Full first card HTML (2000 chars) ===\n');
  console.log(first.html().substring(0, 2000));
  
  await browser.close();
})();
