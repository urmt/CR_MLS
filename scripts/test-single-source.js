#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const sources = require('../database/scraping/sources.json');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  const sourceConfig = sources.sources.craigslist_cr;
  const url = sourceConfig.base_url + sourceConfig.endpoints.real_estate;
  
  console.log('Testing:', url);
  
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
  await new Promise(r => setTimeout(r, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $(sourceConfig.selectors.listing);
  console.log(`Found ${listings.length} listings\n`);
  
  const properties = [];
  for (let i = 0; i < Math.min(listings.length, 5); i++) {
    const listing = listings.eq(i);
    
    const title = listing.find(sourceConfig.selectors.title).text().trim();
    const price_text = listing.find(sourceConfig.selectors.price).text().trim();
    const location = listing.find(sourceConfig.selectors.location).text().trim();
    const link = listing.find(sourceConfig.selectors.link).attr('href');
    
    const prop = {title, price_text, location, url: link};
    properties.push(prop);
    
    console.log(`Property ${i+1}:`, prop.title.substring(0, 40));
    console.log(`  Price: ${prop.price_text}`);
    console.log(`  Location: ${prop.location.substring(0, 30)}`);
    console.log(`  Valid:`, !!(prop.title && prop.price_text && prop.location));
    console.log('');
  }
  
  await browser.close();
  
  const validCount = properties.filter(p => p.title && p.price_text && p.location).length;
  console.log(`\n✅ ${validCount}/${properties.length} properties have all required fields`);
})();
