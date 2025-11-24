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
  const third = $('.views-row').eq(2);
  
  console.log('All views-field elements:\n');
  third.find('[class*="views-field"]').each((i, el) => {
    const classes = $(el).attr('class');
    const text = $(el).text().trim().substring(0, 60);
    console.log(`${classes}:`);
    console.log(`  "${text}"\n`);
  });
  
  await browser.close();
})();
