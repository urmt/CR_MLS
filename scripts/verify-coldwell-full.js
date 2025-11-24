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
  
  console.log('Testing Coldwell Banker with updated selectors...\n');
  
  await page.goto('https://www.coldwellbankercostarica.com/costa-rica/property-for-sale/is-luxury/yes', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $('.property-item');
  console.log(`Found ${listings.length} property items\n`);
  
  const properties = [];
  
  listings.slice(0, 5).each((i, el) => {
    const $el = $(el);
    
    const title = $el.find('[class*="title"]').first().text().trim();
    const price = $el.find('[class*="price"]').first().text().trim();
    const location = $el.find('.property-type-address').text().trim();
    const link = $el.find('a[href*="/property/"]').first().attr('href');
    
    const property = {
      title: title || 'No title',
      price: price || 'No price',
      location: location || 'No location',
      url: link || 'No link'
    };
    
    properties.push(property);
    
    console.log(`Property ${i + 1}:`);
    console.log(`  Title: ${property.title.substring(0, 60)}`);
    console.log(`  Price: ${property.price}`);
    console.log(`  Location: ${property.location}`);
    console.log(`  URL: ${property.url}`);
    console.log('');
  });
  
  await browser.close();
  
  console.log('\n✅ EXTRACTION TEST COMPLETE');
  console.log(`Total found: ${listings.length} listings`);
  console.log(`Successfully extracted: ${properties.filter(p => p.title !== 'No title').length}/5 titles`);
  console.log(`Successfully extracted: ${properties.filter(p => p.price !== 'No price').length}/5 prices`);
  console.log(`Successfully extracted: ${properties.filter(p => p.url && p.url !== 'No link').length}/5 URLs`);
})();
