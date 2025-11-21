#!/usr/bin/env node

/**
 * Test OmniMLS scraping integration
 * Tests the new OmniMLS source with Costa Rica filtering
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const sources = require('../database/scraping/sources.json');

async function testOmniMLSScraping() {
  console.log('🧪 Testing OmniMLS Scraper Integration\n');
  
  const sourceConfig = sources.sources.omnimls_cr;
  
  if (!sourceConfig) {
    console.error('❌ OmniMLS source not found in sources.json');
    return;
  }
  
  console.log(`📋 Source: ${sourceConfig.name}`);
  console.log(`🌐 Base URL: ${sourceConfig.base_url}`);
  console.log(`🇨🇷 Country Filter: ${sourceConfig.filter_country}`);
  console.log(`📄 Endpoints:`, Object.keys(sourceConfig.endpoints));
  console.log('');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Test the first endpoint
    const firstEndpoint = Object.entries(sourceConfig.endpoints)[0];
    const [endpointName, endpointPath] = firstEndpoint;
    const url = `${sourceConfig.base_url}${endpointPath}`;
    
    console.log(`🔍 Testing endpoint: ${endpointName}`);
    console.log(`🌐 URL: ${url}\n`);
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    // Wait for JavaScript to render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Try the configured selectors
    console.log('📊 Testing selectors:\n');
    
    const selectorsToTest = sourceConfig.selectors.listing.split(', ');
    let foundListings = null;
    
    for (const selector of selectorsToTest) {
      const elements = $(selector.trim());
      if (elements.length > 0) {
        console.log(`✅ Selector "${selector}" found ${elements.length} elements`);
        if (!foundListings) {
          foundListings = elements;
        }
      } else {
        console.log(`❌ Selector "${selector}" found 0 elements`);
      }
    }
    
    if (foundListings && foundListings.length > 0) {
      console.log(`\n📋 Analyzing first listing:\n`);
      
      const firstListing = foundListings.eq(0);
      
      // Test title extraction
      const titleSelectors = sourceConfig.selectors.title.split(', ');
      for (const sel of titleSelectors) {
        const title = firstListing.find(sel.trim()).text().trim();
        if (title) {
          console.log(`  Title: "${title.substring(0, 60)}..."`);
          break;
        }
      }
      
      // Test location extraction
      const locationSelectors = sourceConfig.selectors.location.split(', ');
      for (const sel of locationSelectors) {
        const location = firstListing.find(sel.trim()).text().trim();
        if (location) {
          console.log(`  Location: "${location}"`);
          
          // Test Costa Rica filter
          const isCostaRica = location.toLowerCase().includes('costa rica');
          console.log(`  🇨🇷 Costa Rica check: ${isCostaRica ? '✅ PASS' : '❌ FAIL'}`);
          break;
        }
      }
      
      // Test price extraction
      const priceSelectors = sourceConfig.selectors.price.split(', ');
      for (const sel of priceSelectors) {
        const price = firstListing.find(sel.trim()).text().trim();
        if (price) {
          console.log(`  Price: "${price}"`);
          break;
        }
      }
      
      // Test link extraction
      const linkSelector = sourceConfig.selectors.link;
      const link = firstListing.find(linkSelector).attr('href');
      if (link) {
        console.log(`  Link: "${link}"`);
      }
      
      console.log('\n✅ OmniMLS scraper configuration appears to be working!');
      console.log('\n💡 Next steps:');
      console.log('   1. Run full scraper: node scripts/scraper.js');
      console.log('   2. Check scraped properties in database/properties/pending.json');
      console.log('   3. Verify only Costa Rica properties were scraped');
      
    } else {
      console.log('\n⚠️  No listings found with configured selectors');
      console.log('   This could mean:');
      console.log('   - The page requires more time to load JavaScript');
      console.log('   - The selectors need adjustment');
      console.log('   - The URL pattern needs to be corrected');
      
      // Save page for manual inspection
      const pageText = $('body').text();
      console.log(`\n📄 Page preview (first 500 chars):`);
      console.log(pageText.substring(0, 500).replace(/\s+/g, ' '));
    }
    
  } catch (error) {
    console.error('❌ Error testing OmniMLS:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Test complete!');
}

// Run the test
testOmniMLSScraping().catch(console.error);
