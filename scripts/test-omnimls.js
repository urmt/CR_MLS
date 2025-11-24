const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const config = require('../database/scraping/sources.json').sources.omnimls_cr;

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  const url = config.base_url + config.endpoints.sale;
  console.log(`Testing: ${url}\n`);
  
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 20000});
  await new Promise(r => setTimeout(r, 5000)); // OmniMLS needs longer load
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  const listings = $(config.selectors.listing);
  console.log(`Found ${listings.length} listings\n`);
  
  let extracted = 0;
  listings.slice(0, 5).each((i, el) => {
    const $el = $(el);
    
    const title = $el.find(config.selectors.title).text().trim();
    const price = $el.find(config.selectors.price).text().trim();
    const location = $el.find(config.selectors.location).text().trim();
    
    if (title && price && location) {
      extracted++;
      console.log(`${i+1}. ${title.substring(0, 50)}`);
      console.log(`   Price: ${price.substring(0, 30)}`);
      console.log(`   Location: ${location.substring(0, 40)}`);
      console.log(`   Valid: true\n`);
    }
  });
  
  await browser.close();
  console.log(`✅ ${extracted}/5 properties extracted with all fields`);
})();
