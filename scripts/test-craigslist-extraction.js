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
  
  console.log('Loading Craigslist Costa Rica real estate...');
  
  await page.goto('https://costarica.craigslist.org/search/rea', { 
    waitUntil: 'domcontentloaded', 
    timeout: 15000 
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $('.cl-search-result');
  console.log(`\nFound ${listings.length} listings\n`);
  
  const properties = [];
  
  listings.slice(0, 5).each((index, el) => {
    const $el = $(el);
    
    const title = $el.find('span.label').text().trim();
    const price = $el.find('span.priceinfo').text().trim();
    const location = $el.find('div.meta').text().trim();
    const link = $el.find('a.cl-search-anchor').attr('href');
    
    const property = {
      title: title || 'No title',
      price: price || 'No price',
      location: location || 'No location',
      url: link || 'No link'
    };
    
    properties.push(property);
    
    console.log(`Property ${index + 1}:`);
    console.log(`  Title: ${property.title}`);
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
})();
