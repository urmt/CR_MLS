#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const crypto = require('crypto');

const sources = {
  craigslist_cr: require('../database/scraping/sources.json').sources.craigslist_cr,
  coldwell_banker_cr: require('../database/scraping/sources.json').sources.coldwell_banker_cr,
  remax_oceansurf: require('../database/scraping/sources.json').sources.remax_oceansurf
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
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await new Promise(r => setTimeout(r, 3000));
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      const listings = $(config.selectors.listing);
      console.log(`   Found: ${listings.length} listings`);
      
      let extracted = 0;
      listings.slice(0, 5).each((i, el) => {
        const $el = $(el);
        
        const title = $el.find(config.selectors.title).text().trim();
        const price_text = $el.find(config.selectors.price).text().trim().replace(/Price:|Location:/g, '').trim();
        const location = $el.find(config.selectors.location).text().trim().replace(/Price:|Location:/g, '').trim();
        
        if (title && price_text && location) {
          extracted++;
          results.push({
            source: name,
            source_name: config.name,
            title: title.substring(0, 60),
            price_text,
            location: location.substring(0, 40),
            id: crypto.createHash('md5').update(title + location + price_text).digest('hex').substring(0, 12),
            scraped_at: new Date().toISOString()
          });
        }
      });
      
      console.log(`   ✅ Extracted: ${extracted}/5 valid properties\n`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
    
    await page.close();
  }
  
  await browser.close();
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total extracted: ${results.length} properties`);
  console.log(`   Sources: ${Object.keys(sources).length}/3 working`);
  
  console.log(`\n📋 Sample properties:\n`);
  results.slice(0, 3).forEach((p, i) => {
    console.log(`${i+1}. [${p.source_name}] ${p.title}`);
    console.log(`   Price: ${p.price_text}`);
    console.log(`   Location: ${p.location}\n`);
  });
  
  // Save to pending
  const pendingFile = '../database/properties/pending.json';
  let pending = {properties: [], last_updated: null};
  
  try {
    pending = await fs.readJson(pendingFile);
  } catch (e) {}
  
  pending.properties = [...pending.properties, ...results];
  pending.last_updated = new Date().toISOString();
  
  await fs.writeJson(pendingFile, pending, {spaces: 2});
  console.log(`✅ Saved ${results.length} properties to pending.json`);
  
})();
