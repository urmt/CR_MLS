const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  await page.goto('https://www.remax-oceansurf-cr.com/properties', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 4000));
  const html = await page.content();
  const $ = cheerio.load(html);
  const first = $('.views-row').eq(2); // Third one had title
  
  console.log('Text content:');
  console.log(first.text().substring(0, 300));
  
  console.log('\n\n=== HTML (1500 chars) ===\n');
  console.log(first.html().substring(0, 1500));
  
  await browser.close();
})();
