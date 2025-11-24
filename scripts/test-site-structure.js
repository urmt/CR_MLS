#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testSite(url, siteName) {
  console.log(`\n🔍 Testing: ${siteName}`);
  console.log(`URL: ${url}\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('⏳ Loading page...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Test common selectors
    const testSelectors = [
      '.property', '.property-card', '.property-item', '.listing', '.listing-item',
      '.result', '.search-result', '.item', '.card', '[class*="property"]',
      '[class*="listing"]', '[class*="result"]', 'article', '.row .col'
    ];
    
    console.log('📊 Testing selectors:');
    for (const selector of testSelectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`  ✅ ${selector}: ${count} elements`);
        
        // Show first element's class and structure
        const first = $(selector).first();
        const classes = first.attr('class');
        const hasImage = first.find('img').length > 0;
        const hasLink = first.find('a').length > 0;
        console.log(`     Classes: ${classes || 'none'}`);
        console.log(`     Has image: ${hasImage}, Has link: ${hasLink}`);
      }
    }
    
    // Save HTML snippet for manual inspection
    const snippet = html.substring(0, 5000);
    console.log(`\n📄 HTML snippet saved (first 5000 chars)`);
    
    await page.screenshot({ path: `/tmp/${siteName.replace(/\s/g, '_')}.png`, fullPage: false });
    console.log(`📸 Screenshot saved to /tmp/${siteName.replace(/\s/g, '_')}.png`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Test sites
(async () => {
  const sites = [
    { name: 'OmniMLS', url: 'https://omnimls.com/en/home/' },
    { name: 'Craigslist-CR', url: 'https://costarica.craigslist.org/search/rea' }
  ];
  
  for (const site of sites) {
    await testSite(site.url, site.name);
  }
})();
