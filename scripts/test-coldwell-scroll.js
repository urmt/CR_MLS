#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  console.log('Loading Coldwell Banker luxury page...\n');
  
  await page.goto('https://www.coldwellbankercostarica.com/luxury', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  // Scroll to trigger lazy loading
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Extract all links that might be property links
  const links = await page.evaluate(() => {
    const propertyLinks = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.href;
      const text = a.textContent.trim();
      if (href.includes('/listing/') || href.includes('/property/') || href.includes('/properties/')) {
        propertyLinks.push({ href, text: text.substring(0, 60) });
      }
    });
    return propertyLinks;
  });
  
  console.log(`Found ${links.length} property links:\n`);
  links.slice(0, 5).forEach((link, i) => {
    console.log(`${i + 1}. ${link.text}`);
    console.log(`   ${link.href}\n`);
  });
  
  // Check page structure
  const structure = await page.evaluate(() => {
    return {
      articles: document.querySelectorAll('article').length,
      divs_with_property: document.querySelectorAll('div[class*="property"]').length,
      divs_with_listing: document.querySelectorAll('div[class*="listing"]').length,
      sections: document.querySelectorAll('section').length,
      images_in_links: document.querySelectorAll('a img').length
    };
  });
  
  console.log('\n=== Page structure ===');
  console.log(structure);
  
  await browser.close();
})();
