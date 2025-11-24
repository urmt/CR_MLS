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
  
  const properties = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="ListingInformationCard_card"]');
    const results = [];
    
    cards.forEach((card, i) => {
      if (i < 5) {
        // Try different approaches to get title
        const saveButton = card.querySelector('[aria-label*="Save Property"]');
        let title = '';
        if (saveButton) {
          const ariaLabel = saveButton.getAttribute('aria-label');
          title = ariaLabel.replace('Save Property: ', '');
        }
        
        // Get all text nodes and find price pattern
        const allText = card.textContent;
        const priceMatch = allText.match(/\$[\d,]+/);
        const price = priceMatch ? priceMatch[0] : '';
        
        // Try to find location/address
        const textParts = allText.split('\n').filter(t => t.trim());
        const location = textParts.find(t => t.includes(',') || t.length > 10) || '';
        
        const link = card.querySelector('a')?.href;
        
        results.push({
          title: title || 'No title',
          price: price || 'No price',
          location: location || textParts[2] || 'No location',
          url: link || 'No link'
        });
      }
    });
    
    return results;
  });
  
  console.log(`\nFound ${await page.$$eval('[class*="ListingInformationCard_card"]', els => els.length)} listings\n`);
  
  properties.forEach((p, i) => {
    console.log(`Property ${i + 1}:`);
    console.log(`  Title: ${p.title.substring(0, 70)}`);
    console.log(`  Price: ${p.price}`);
    console.log(`  Location: ${p.location.substring(0, 60)}`);
    console.log(`  URL: ${p.url.substring(0, 90)}`);
    console.log('');
  });
  
  const successCounts = {
    titles: properties.filter(p => p.title !== 'No title').length,
    prices: properties.filter(p => p.price !== 'No price').length,
    urls: properties.filter(p => p.url && p.url !== 'No link').length
  };
  
  console.log(`\n✅ Successfully extracted: ${successCounts.titles}/5 titles`);
  console.log(`✅ Successfully extracted: ${successCounts.prices}/5 prices`);
  console.log(`✅ Successfully extracted: ${successCounts.urls}/5 URLs`);
  
  await browser.close();
})();
