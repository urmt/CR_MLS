#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

// Load configuration
const sources = require('../database/scraping/sources.json');

async function testCraigslist() {
  console.log('🧪 Testing Craigslist Costa Rica Scraper\n');
  
  const sourceConfig = sources.sources.craigslist_cr;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    const endpoint = sourceConfig.endpoints.real_estate;
    const url = `${sourceConfig.base_url}${endpoint}`;
    
    console.log(`📍 URL: ${url}`);
    console.log(`🔍 Selector: ${sourceConfig.selectors.listing}\n`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Test the configured selector
    const listings = $(sourceConfig.selectors.listing);
    
    console.log(`✅ Found ${listings.length} listings\n`);
    
    if (listings.length === 0) {
      console.log('❌ NO LISTINGS FOUND - Selector may be broken!\n');
      await browser.close();
      return;
    }
    
    // Extract data from first 5 properties
    const properties = [];
    
    for (let i = 0; i < Math.min(5, listings.length); i++) {
      const listing = listings.eq(i);
      
      const title = listing.find(sourceConfig.selectors.title).text().trim();
      const price = listing.find(sourceConfig.selectors.price).text().trim();
      const location = listing.find(sourceConfig.selectors.location).text().trim();
      const link = listing.find(sourceConfig.selectors.link).attr('href');
      
      const property = {
        title: title || 'No title',
        price: price || 'No price',
        location: location || 'No location',
        link: link || 'No link',
        source: 'craigslist_cr'
      };
      
      properties.push(property);
      
      console.log(`📋 Property ${i + 1}:`);
      console.log(`   Title: ${property.title.substring(0, 60)}`);
      console.log(`   Price: ${property.price}`);
      console.log(`   Location: ${property.location.substring(0, 40)}`);
      console.log(`   Link: ${property.link ? property.link.substring(0, 50) + '...' : 'none'}`);
      console.log('');
    }
    
    // Save results
    const outputFile = path.join(__dirname, '../test-craigslist-results.json');
    await fs.writeJson(outputFile, { count: listings.length, properties }, { spaces: 2 });
    
    console.log(`\n💾 Saved ${properties.length} sample properties to test-craigslist-results.json`);
    console.log(`\n✅ TEST PASSED - Craigslist scraper is working!`);
    console.log(`📊 Total available: ${listings.length} properties`);
    
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testCraigslist();
