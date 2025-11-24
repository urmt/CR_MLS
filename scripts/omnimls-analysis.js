#!/usr/bin/env node
const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 OmniMLS Feasibility Analysis\n');
  
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://omnimls.com/v/results/listing-type_sale', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 6000)); // Extra wait for JS
  
  const analysis = await page.evaluate(() => {
    // Check if it's a SPA framework
    const hasReact = !!document.querySelector('[data-reactroot], [data-reactid]');
    const hasVue = !!document.querySelector('[data-v-]');
    const hasAngular = !!document.querySelector('[ng-version]');
    
    // Look for results container
    const mainContent = document.querySelector('main, #main, .main, #content, .content');
    
    // Check for property/listing elements in various ways
    const allElements = document.querySelectorAll('*');
    let propertyLikeElements = [];
    
    // Look for elements that might contain property data
    Array.from(allElements).forEach(el => {
      const text = el.textContent;
      const hasPrice = text.match(/\$[\d,]+/) || text.match(/USD/i);
      const hasBeds = text.match(/\d+\s*(bed|bedroom|BR)/i);
      const hasBaths = text.match(/\d+\s*(bath|bathroom|BA)/i);
      
      if (hasPrice && (hasBeds || hasBaths) && el.children.length > 2 && el.children.length < 30) {
        propertyLikeElements.push({
          tag: el.tagName,
          classes: el.className,
          textLength: text.length,
          childCount: el.children.length
        });
      }
    });
    
    // Get unique containers
    const uniqueContainers = {};
    propertyLikeElements.forEach(el => {
      const key = `${el.tag}.${el.classes}`;
      if (!uniqueContainers[key]) {
        uniqueContainers[key] = {count: 0, ...el};
      }
      uniqueContainers[key].count++;
    });
    
    // Check if data is in JavaScript variables
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent);
    const hasJSONData = scripts.some(s => s.includes('listings') || s.includes('properties'));
    
    return {
      framework: hasReact ? 'React' : hasVue ? 'Vue' : hasAngular ? 'Angular' : 'Unknown',
      hasMainContent: !!mainContent,
      propertyLikeElements: Object.values(uniqueContainers).filter(c => c.count > 5),
      totalPropertyLike: propertyLikeElements.length,
      hasJSONData,
      bodyHTML: document.body.innerHTML.length
    };
  });
  
  console.log('Framework:', analysis.framework);
  console.log('Has main content:', analysis.hasMainContent);
  console.log('Body HTML size:', analysis.bodyHTML, 'chars');
  console.log('JSON data in scripts:', analysis.hasJSONData);
  console.log('Total property-like elements:', analysis.totalPropertyLike);
  console.log('\nProperty-like containers (5+ instances):', analysis.propertyLikeElements.length);
  
  if (analysis.propertyLikeElements.length > 0) {
    console.log('\n✅ FOUND POTENTIAL CONTAINERS:');
    analysis.propertyLikeElements.forEach(c => {
      console.log(`  ${c.tag}.${c.classes.substring(0, 50)} - Count: ${c.count}`);
    });
  }
  
  // Try to extract one property manually
  console.log('\n━━━ Manual Extraction Test ━━━');
  
  const testExtract = await page.evaluate(() => {
    // Look for elements with price AND location indicators
    const allDivs = document.querySelectorAll('div, article, section');
    let found = null;
    
    for (let div of allDivs) {
      const text = div.textContent;
      if (text.match(/\$[\d,]+/) && text.match(/\d+\s*bed/i) && text.length > 50 && text.length < 1000) {
        found = {
          html: div.outerHTML.substring(0, 800),
          text: text.substring(0, 300)
        };
        break;
      }
    }
    
    return found;
  });
  
  if (testExtract) {
    console.log('Found property element!');
    console.log('Text preview:', testExtract.text.substring(0, 150));
  } else {
    console.log('❌ No property elements found with manual extraction');
  }
  
  await browser.close();
  
  // Final verdict
  console.log('\n━━━ VERDICT ━━━');
  if (analysis.totalPropertyLike > 10 && analysis.propertyLikeElements.length > 0) {
    console.log('✅ SCRAPABLE - Found repeating property-like elements');
    console.log('   Recommended: Use the most common container class found above');
  } else if (analysis.hasJSONData) {
    console.log('⚠️  POSSIBLE - Data may be in JS, needs API extraction');
  } else {
    console.log('❌ NOT SCRAPABLE - No consistent property elements found');
    console.log('   Site likely uses API calls or iframe embedding');
  }
})();
