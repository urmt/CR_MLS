#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');

const configs = require('../database/scraping/sources.json').sources;
const sources = {
  craigslist_cr: configs.craigslist_cr,
  coldwell_banker_cr: configs.coldwell_banker_cr,
  remax_oceansurf: configs.remax_oceansurf
};

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const results = [];
  
  for (const [name, config] of Object.entries(sources)) {
    console.log(`\n🔍 Testing ${config.name}...`);
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    const endpoint = Object.values(config.endpoints)[0];
    const url = config.base_url + endpoint;
    
    console.log(`   URL: ${url}`);
    
    try {
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 20000});
      await new Promise(r => setTimeout(r, 3000));
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      const listings = $(config.selectors.listing);
      console.log(`   Found: ${listings.length} listings`);
      
      let extracted = 0;
      listings.slice(0, 10).each((i, el) => {
        const $el = $(el);
        
        const title = $el.find(config.selectors.title).text().trim();
        let price_text = $el.find(config.selectors.price).text().trim();
        let location = $el.find(config.selectors.location).text().trim();
        
        // Site-specific cleanup
        price_text = price_text.replace(/Price:/g, '').trim();
        location = location.replace(/Location:/g, '').trim();
        
        const linkEl = $el.find(config.selectors.link);
        let urlOut = linkEl.attr('href') || '';
        if (urlOut && urlOut.startsWith('/')) urlOut = config.base_url + urlOut;
        
        if (title && price_text && location) {
          extracted++;
          results.push({
            source: name,
            source_name: config.name,
            title: title.substring(0, 120),
            price_text,
            location: location.substring(0, 120),
            url: urlOut,
            id: crypto.createHash('md5').update(title + location + price_text).digest('hex').substring(0, 12),
            scraped_at: new Date().toISOString()
          });
        }
      });
      
      console.log(`   ✅ Extracted: ${extracted}/${Math.min(listings.length,10)} valid properties`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
  
  console.log(`\n📊 Summary: ${results.length} properties extracted from 3 sources`);
  
  // Save to pending
  const pendingFile = path.join(__dirname, '../database/properties/pending.json');
  let pending = {properties: [], last_updated: null};
  
  try {
    pending = await fs.readJson(pendingFile);
  } catch (e) {
    // create fresh
  }
  
  pending.properties = [...pending.properties, ...results];
  pending.last_updated = new Date().toISOString();
  await fs.writeJson(pendingFile, pending, {spaces: 2});
  console.log(`✅ Saved ${results.length} properties to ${pendingFile}`);
})();
