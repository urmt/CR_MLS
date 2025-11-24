#!/usr/bin/env node
const puppeteer = require('puppeteer');
const sources = require('../database/scraping/sources.json').sources;

const toTest = ['inhaus_cr', 'terraquea', 'casa_de_manana', 'immo_costa_rica'];

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  
  for (const name of toTest) {
    const config = sources[name];
    if (!config) {
      console.log(`\n❌ ${name} not found in config`);
      continue;
    }
    
    console.log(`\n🔍 ${config.name}`);
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');
    
    const endpoint = Object.values(config.endpoints)[0];
    const url = config.base_url + endpoint;
    
    try {
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await new Promise(r => setTimeout(r, 3000));
      
      const result = await page.evaluate((sel) => {
        const listings = document.querySelectorAll(sel);
        const firstText = listings[0]?.textContent?.substring(0, 100);
        return {
          count: listings.length,
          firstText
        };
      }, config.selectors.listing);
      
      console.log(`   URL: ${url}`);
      console.log(`   Selector: ${config.selectors.listing}`);
      console.log(`   Found: ${result.count} elements`);
      if (result.count > 0) {
        console.log(`   First text: ${result.firstText}`);
      }
      console.log(`   Status: ${result.count > 0 ? '✅ FOUND' : '❌ NONE'}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
})();
