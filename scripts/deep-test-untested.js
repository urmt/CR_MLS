#!/usr/bin/env node
const puppeteer = require('puppeteer');
const sources = require('../database/scraping/sources.json').sources;

const toTest = ['inhaus_cr', 'terraquea', 'casa_de_manana', 'immo_costa_rica'];

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  
  for (const name of toTest) {
    const config = sources[name];
    console.log(`\n━━━ ${config.name} ━━━`);
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');
    
    const endpoint = Object.values(config.endpoints)[0];
    const url = config.base_url + endpoint;
    
    try {
      const response = await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await new Promise(r => setTimeout(r, 3000));
      
      const status = response.status();
      console.log(`Status: ${status}`);
      console.log(`URL: ${url}`);
      
      if (status !== 200) {
        console.log('❌ Not accessible');
        await page.close();
        continue;
      }
      
      // Try multiple selector patterns
      const result = await page.evaluate(() => {
        const patterns = [
          'article',
          '[class*="property"]',
          '[class*="listing"]',
          '[class*="item"]',
          '.card'
        ];
        
        const counts = {};
        patterns.forEach(p => {
          counts[p] = document.querySelectorAll(p).length;
        });
        
        return counts;
      });
      
      console.log('Element counts:', result);
      
      // Find best match
      const best = Object.entries(result).filter(([k,v]) => v > 0 && v < 100).sort((a,b) => b[1] - a[1])[0];
      if (best) {
        console.log(`✅ Best match: ${best[0]} with ${best[1]} elements`);
      } else {
        console.log('❌ No suitable elements found');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
})();
