#!/usr/bin/env node
const puppeteer = require('puppeteer');
const sources = require('../database/scraping/sources.json').sources;

const toTest = [
  'neocasa_cr',
  'remax_costa_rica', 
  'conexion_inmobiliaria',
  'omnimls_cr'
];

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  
  for (const name of toTest) {
    const config = sources[name];
    if (!config || !config.active) continue;
    
    console.log(`\n🔍 ${config.name}`);
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');
    
    const endpoint = Object.values(config.endpoints)[0];
    const url = config.base_url + endpoint;
    
    try {
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await new Promise(r => setTimeout(r, 2000));
      
      const result = await page.evaluate((sel) => {
        const listings = document.querySelectorAll(sel);
        return {
          count: listings.length,
          hasTitle: listings[0]?.textContent?.length > 10
        };
      }, config.selectors.listing);
      
      console.log(`   URL: ${url}`);
      console.log(`   Found: ${result.count} listings`);
      console.log(`   Status: ${result.count > 0 ? '✅ WORKING' : '❌ NEEDS FIX'}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
})();
