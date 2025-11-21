#!/usr/bin/env node

/**
 * Test script to explore OmniMLS structure for Costa Rica properties
 * This script will help us identify the correct selectors and URL patterns
 */

const puppeteer = require('puppeteer');

async function exploreOmniMLS() {
  console.log('🔍 Exploring OmniMLS structure...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  try {
    // Test different URL patterns for Costa Rica
    const urlsToTest = [
      'https://omnimls.com/en/home/',
      'https://omnimls.com/v/results/listing-type_sale/',
      'https://omnimls.com/v/results/listing-type_sale/country_costa-rica/',
      'https://omnimls.com/v/results/listing-type_rent/country_costa-rica/',
      'https://omnimls.com/v/results/?country=costa-rica',
      'https://omnimls.com/en/search/?location=costa%20rica'
    ];
    
    for (const url of urlsToTest) {
      console.log(`\n📍 Testing URL: ${url}`);
      
      try {
        await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        });
        
        // Wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get all classes that might contain listings
        const allClasses = await page.evaluate(() => {
          const classes = new Set();
          document.querySelectorAll('*').forEach(el => {
            if (el.className && typeof el.className === 'string') {
              el.className.split(' ').forEach(c => {
                if (c.includes('card') || c.includes('listing') || c.includes('property') || 
                    c.includes('resultado') || c.includes('item')) {
                  classes.add(c);
                }
              });
            }
          });
          return Array.from(classes);
        });
        
        console.log(`  🔍 Relevant classes found:`, allClasses.slice(0, 20));
        
        // Try to find property listings with various selectors
        const selectors = [
          '.property-card',
          '.listing-card',
          '.resultado',
          '.propiedad',
          '[class*="card"][class*="property"]',
          '[class*="card"]',
          '[class*="resultado"]',
          '[data-listing-id]',
          'article',
          '.item',
          '[id*="listing"]'
        ];
        
        for (const selector of selectors) {
          const count = await page.$$eval(selector, elements => elements.length).catch(() => 0);
          if (count > 0) {
            console.log(`  ✅ Found ${count} elements with selector: ${selector}`);
            
            // Get sample data from first element
            const sampleData = await page.evaluate((sel) => {
              const element = document.querySelector(sel);
              if (!element) return null;
              
              return {
                innerHTML: element.innerHTML.substring(0, 500),
                classes: element.className,
                id: element.id,
                dataAttrs: Array.from(element.attributes)
                  .filter(attr => attr.name.startsWith('data-'))
                  .map(attr => ({ name: attr.name, value: attr.value }))
              };
            }, selector);
            
            if (sampleData) {
              console.log(`  📋 Sample element:`, JSON.stringify(sampleData, null, 2));
            }
          }
        }
        
        // Check for Costa Rica mentions in the page
        const costaRicaMentions = await page.evaluate(() => {
          const bodyText = document.body.innerText.toLowerCase();
          return bodyText.includes('costa rica');
        });
        
        console.log(`  🇨🇷 Costa Rica mentioned: ${costaRicaMentions}`);
        
        // Look for country filters or dropdowns
        const countrySelectors = await page.evaluate(() => {
          const selectors = [];
          document.querySelectorAll('select, [class*="country"], [class*="location"]').forEach(el => {
            if (el.innerText.toLowerCase().includes('costa') || 
                el.outerHTML.toLowerCase().includes('costa')) {
              selectors.push({
                tag: el.tagName,
                classes: el.className,
                id: el.id,
                text: el.innerText.substring(0, 100)
              });
            }
          });
          return selectors;
        });
        
        if (countrySelectors.length > 0) {
          console.log(`  🔽 Found country filters:`, JSON.stringify(countrySelectors, null, 2));
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    // Try to find the search/filter API endpoint
    console.log('\n\n🔍 Checking for API endpoints...');
    
    await page.goto('https://omnimls.com/v/results/listing-type_sale/', { 
      waitUntil: 'networkidle2',
      timeout: 20000 
    });
    
    // Monitor network requests
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('api') || url.includes('search') || url.includes('filter') || url.includes('listing')) {
        apiCalls.push({
          url: url,
          status: response.status(),
          type: response.request().resourceType()
        });
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (apiCalls.length > 0) {
      console.log('  📡 API calls detected:');
      apiCalls.forEach(call => {
        console.log(`    - ${call.url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Exploration complete!');
}

// Run the exploration
exploreOmniMLS().catch(console.error);
