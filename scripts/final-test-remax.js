const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const sources = require('../database/scraping/sources.json');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  const config = sources.sources.remax_oceansurf;
  const url = config.base_url + config.endpoints.all;
  
  await page.goto(url, {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 4000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $(config.selectors.listing);
  console.log(`Found ${listings.length} listings\n`);
  
  let validCount = 0;
  for (let i = 0; i < Math.min(listings.length, 5); i++) {
    const $el = listings.eq(i);
    
    const title = $el.find(config.selectors.title).text().trim();
    const price = $el.find(config.selectors.price).text().trim().replace('Price:', '').trim();
    const location = $el.find(config.selectors.location).text().trim().replace('Location:', '').trim();
    
    if (title && price && location) validCount++;
    
    console.log(`${i+1}. ${title.substring(0, 40)}`);
    console.log(`   Price: ${price.substring(0, 30)}`);
    console.log(`   Location: ${location.substring(0, 30)}`);
    console.log(`   Valid: ${!!(title && price && location)}\n`);
  }
  
  await browser.close();
  console.log(`✅ ${validCount}/5 properties have all required fields`);
})();
