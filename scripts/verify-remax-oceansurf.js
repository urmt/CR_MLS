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
  
  await page.goto('https://www.remax-oceansurf-cr.com/properties', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $('.views-row');
  console.log(`\nFound ${listings.length} listings\n`);
  
  const properties = [];
  
  listings.slice(0, 5).each((i, el) => {
    const $el = $(el);
    
    const title = $el.find('h2, h3, .title').first().text().trim();
    let price = $el.find('[class*="price"]').first().text().trim();
    let location = $el.find('[class*="location"]').first().text().trim();
    const link = $el.find('a').first().attr('href');
    
    // Clean up price and location
    price = price.replace('Price:', '').trim();
    location = location.replace('Location:', '').trim();
    
    const property = {
      title: title || 'No title',
      price_text: price || 'No price',
      location: location || 'No location',
      url: link ? `https://www.remax-oceansurf-cr.com${link}` : 'No link'
    };
    
    properties.push(property);
    
    console.log(`Property ${i + 1}:`);
    console.log(`  Title: ${property.title.substring(0, 50)}`);
    console.log(`  Price: ${property.price_text}`);
    console.log(`  Location: ${property.location}`);
    console.log(`  URL: ${property.url}`);
    console.log('');
  });
  
  await browser.close();
  
  const valid = properties.filter(p => p.title !== 'No title' && p.price_text !== 'No price' && p.location !== 'No location');
  console.log(`\n✅ Successfully extracted: ${valid.length}/5 complete properties`);
  console.log(`✅ ${properties.filter(p => p.title !== 'No title').length}/5 titles`);
  console.log(`✅ ${properties.filter(p => p.price_text !== 'No price' && p.price_text !== '').length}/5 prices`);
  console.log(`✅ ${properties.filter(p => p.url && p.url !== 'No link').length}/5 URLs`);
})();
