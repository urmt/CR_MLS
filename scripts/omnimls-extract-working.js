const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto('https://omnimls.com/v/results/listing-type_sale', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 6000));
  
  const properties = await page.evaluate(() => {
    // Use the discovered selector
    const listings = document.querySelectorAll('.flex-grow-1.d-flex.flex-column.bd-highlight.mb-3');
    const results = [];
    
    listings.forEach((listing, i) => {
      if (i < 5) {
        const text = listing.textContent;
        
        // Extract title (usually the longest text element)
        const headings = listing.querySelectorAll('h1, h2, h3, h4, h5, a[href*="listing"]');
        let title = '';
        headings.forEach(h => {
          const t = h.textContent.trim();
          if (t.length > title.length && t.length < 200) {
            title = t;
          }
        });
        
        // Extract price
        const priceMatch = text.match(/\$[\d,]+/);
        const price = priceMatch ? priceMatch[0] : '';
        
        // Extract location (look for city/country patterns)
        const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/);
        const location = locationMatch ? locationMatch[0] : '';
        
        // Extract link
        const link = listing.querySelector('a[href*="listing"]')?.href || '';
        
        results.push({
          title: title || 'No title',
          price: price || 'No price',
          location: location || 'No location',
          url: link || 'No link'
        });
      }
    });
    
    return {
      total: listings.length,
      properties: results
    };
  });
  
  console.log(`Found ${properties.total} listings\n`);
  
  properties.properties.forEach((p, i) => {
    console.log(`${i+1}. ${p.title.substring(0, 50)}`);
    console.log(`   Price: ${p.price}`);
    console.log(`   Location: ${p.location.substring(0, 40)}`);
    console.log(`   URL: ${p.url ? 'Yes' : 'No'}`);
    console.log(`   Valid: ${!!(p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location')}\n`);
  });
  
  await browser.close();
  
  const valid = properties.properties.filter(p => 
    p.title !== 'No title' && p.price !== 'No price' && p.location !== 'No location'
  ).length;
  
  console.log(`\n━━━ RESULT ━━━`);
  console.log(`✅ ${valid}/${properties.properties.length} valid properties`);
  console.log(`Total available: ${properties.total} listings`);
  
  if (valid >= 3) {
    console.log('\n✅ RECOMMENDATION: OmniMLS is WORTH IMPLEMENTING');
    console.log(`   ${properties.total} properties available per page`);
  } else {
    console.log('\n❌ RECOMMENDATION: NOT WORTH IT - extraction unreliable');
  }
})();
