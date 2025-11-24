#!/usr/bin/env node

const puppeteer = require('puppeteer');

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
  
  // Extract property data
  const properties = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="ListingInformationCard_card"]');
    const results = [];
    
    cards.forEach((card, i) => {
      if (i < 5) {
        const title = card.querySelector('h2, h3, [class*="title"]')?.textContent.trim();
        const price = card.querySelector('[class*="price"]')?.textContent.trim();
        const location = card.querySelector('[class*="address"], [class*="location"]')?.textContent.trim();
        const link = card.querySelector('a')?.href;
        
        results.push({
          title: title || 'No title',
          price: price || 'No price',
          location: location || 'No location',
          url: link || 'No link'
        });
      }
    });
    
    return results;
  });
  
  console.log(`\nFound ${await page.$$eval('[class*="ListingInformationCard_card"]', els => els.length)} listings\n`);
  
  properties.forEach((p, i) => {
    console.log(`Property ${i + 1}:`);
    console.log(`  Title: ${p.title.substring(0, 60)}`);
    console.log(`  Price: ${p.price}`);
    console.log(`  Location: ${p.location}`);
    console.log(`  URL: ${p.url}`);
    console.log('');
  });
  
  console.log(`\n✅ Successfully extracted: ${properties.filter(p => p.title !== 'No title').length}/5 titles`);
  console.log(`✅ Successfully extracted: ${properties.filter(p => p.price !== 'No price').length}/5 prices`);
  console.log(`✅ Successfully extracted: ${properties.filter(p => p.url && p.url !== 'No link').length}/5 URLs`);
  
  await browser.close();
})();
