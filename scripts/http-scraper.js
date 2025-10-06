#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class HttpPropertyScraper {
  constructor() {
    this.results = {
      scraped: [],
      errors: [],
      duplicates: 0,
      new_properties: 0
    };
    this.existingProperties = [];
  }

  async init() {
    console.log('🚀 Starting HTTP Costa Rica Property Scraper...');
    
    // Load existing properties to check for duplicates
    try {
      const activeFile = path.join(__dirname, '../database/properties/active.json');
      const data = await fs.readJson(activeFile).catch(() => ({ properties: [] }));
      this.existingProperties = data.properties || [];
      console.log(`📋 Loaded ${this.existingProperties.length} existing properties for duplicate checking`);
    } catch (error) {
      console.log('No existing properties found, starting fresh');
    }
  }

  async scrapeWebsite(name, baseUrl, searchPaths, maxResults = 20) {
    console.log(`🔍 Scraping ${name}...`);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Connection': 'keep-alive'
    };

    let totalFound = 0;

    for (const searchPath of searchPaths) {
      if (totalFound >= maxResults) break;

      try {
        console.log(`  📄 Trying: ${baseUrl}${searchPath}`);
        
        const response = await axios.get(`${baseUrl}${searchPath}`, {
          headers,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500 // Accept 4xx responses
        });

        if (response.status >= 400) {
          console.log(`    ⚠️  HTTP ${response.status} - trying next path`);
          continue;
        }

        const $ = cheerio.load(response.data);
        
        // Try multiple selectors for property listings
        const selectors = [
          '.property-card', '.listing-item', '.property-item', '.property',
          '.search-result', '.result-item', '.card', '.item', '.listing',
          '[class*="property"]', '[class*="listing"]', '[class*="card"]'
        ];

        let listings = $();
        let usedSelector = '';

        for (const selector of selectors) {
          listings = $(selector);
          if (listings.length > 0) {
            usedSelector = selector;
            console.log(`    ✅ Found ${listings.length} listings with: ${selector}`);
            break;
          }
        }

        if (listings.length === 0) {
          console.log(`    ⚠️  No listings found`);
          continue;
        }

        // Extract properties from listings
        for (let i = 0; i < Math.min(listings.length, 15); i++) {
          try {
            const listing = listings.eq(i);
            const property = this.extractProperty(listing, $, baseUrl, name);
            
            if (property && this.isValidProperty(property) && !this.isDuplicate(property)) {
              property.id = this.generateId(property);
              property.scraped_at = new Date().toISOString();
              
              this.results.scraped.push(property);
              this.results.new_properties++;
              totalFound++;
              
              console.log(`    📋 Added: ${property.title.substring(0, 50)}... ($${property.price_text})`);
              
              if (totalFound >= maxResults) break;
            } else if (this.isDuplicate(property)) {
              this.results.duplicates++;
            }
          } catch (error) {
            console.error(`    ❌ Property extraction error:`, error.message);
          }
        }
        
        // Rate limiting
        await this.sleep(3000);

      } catch (error) {
        console.error(`  ❌ Request failed:`, error.message);
        this.results.errors.push({
          source: name,
          url: `${baseUrl}${searchPath}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`  📊 Total found from ${name}: ${totalFound} properties`);
    return totalFound;
  }

  extractProperty(listing, $, baseUrl, source) {
    try {
      const property = { source, images: [] };

      // Extract title - try multiple selectors
      const titleSelectors = ['h1', 'h2', 'h3', '.title', '.property-title', '.listing-title', 'a[title]', '.name'];
      for (const sel of titleSelectors) {
        const el = listing.find(sel).first();
        if (el.length && el.text().trim()) {
          property.title = el.text().trim().replace(/\s+/g, ' ');
          break;
        }
      }

      // Extract price
      const priceSelectors = ['.price', '.property-price', '.listing-price', '.cost', '[class*="price"]'];
      for (const sel of priceSelectors) {
        const el = listing.find(sel).first();
        if (el.length && el.text().trim()) {
          property.price_text = el.text().trim();
          property.price_usd = this.parsePrice(property.price_text);
          break;
        }
      }

      // Extract location
      const locationSelectors = ['.location', '.address', '.region', '[class*="location"]', '.area'];
      for (const sel of locationSelectors) {
        const el = listing.find(sel).first();
        if (el.length && el.text().trim()) {
          property.location = el.text().trim();
          break;
        }
      }

      // Extract description
      const descSelectors = ['.description', '.summary', '.details', 'p'];
      for (const sel of descSelectors) {
        const el = listing.find(sel).first();
        if (el.length && el.text().trim().length > 20) {
          property.description = el.text().trim().substring(0, 300);
          break;
        }
      }

      // Extract link
      const linkEl = listing.find('a[href]').first();
      const href = linkEl.attr('href');
      if (href) {
        try {
          property.url = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        } catch (e) {
          // Invalid URL, skip
        }
      }

      // Extract images (limit to 2)
      listing.find('img').slice(0, 2).each((i, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && !src.includes('placeholder')) {
          try {
            const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
            property.images.push(fullUrl);
          } catch (e) {
            // Invalid image URL
          }
        }
      });

      // Categorize
      property.category = this.categorizeProperty(property);

      return property;

    } catch (error) {
      console.error('Property extraction error:', error.message);
      return null;
    }
  }

  parsePrice(priceText) {
    if (!priceText) return null;
    
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const numeric = parseFloat(cleaned.replace(/,/g, ''));
    
    if (isNaN(numeric) || numeric <= 0) return null;
    
    // Convert colones to USD (1 USD = 600 colones approx)
    if (priceText.includes('₡') || priceText.toLowerCase().includes('colon')) {
      return Math.round(numeric / 600);
    }
    
    return numeric;
  }

  categorizeProperty(property) {
    const text = `${property.title || ''} ${property.description || ''}`.toLowerCase();
    
    if (text.includes('luxury') || text.includes('lujo') || (property.price_usd && property.price_usd > 500000)) {
      return 'luxury';
    }
    if (text.includes('commercial') || text.includes('office') || text.includes('comercial')) {
      return 'commercial';
    }
    if (text.includes('land') || text.includes('lot') || text.includes('terreno')) {
      return 'land';
    }
    return 'residential';
  }

  isValidProperty(property) {
    return property &&
           property.title && property.title.length > 8 &&
           property.location && property.location.length > 3 &&
           property.price_usd && property.price_usd >= 5000 && property.price_usd <= 50000000;
  }

  isDuplicate(property) {
    if (!property || !property.title) return false;
    
    return this.existingProperties.some(existing => {
      const titleSim = this.similarity(property.title, existing.title);
      const locSim = this.similarity(property.location || '', existing.location || '');
      return titleSim > 0.8 && locSim > 0.7;
    });
  }

  similarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshtein(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
  }

  levenshtein(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill());
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return matrix[str2.length][str1.length];
  }

  generateId(property) {
    const data = `${property.title}-${property.location}-${property.price_usd}`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 12);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveResults() {
    console.log('💾 Saving results...');
    
    const activeFile = path.join(__dirname, '../database/properties/active.json');
    let activeData = { properties: [], last_updated: null, total_count: 0 };
    
    try {
      activeData = await fs.readJson(activeFile);
    } catch (error) {
      console.log('Creating new active.json');
    }
    
    // Add new properties
    activeData.properties = [...(activeData.properties || []), ...this.results.scraped];
    activeData.last_updated = new Date().toISOString();
    activeData.total_count = activeData.properties.length;
    
    await fs.ensureDir(path.dirname(activeFile));
    await fs.writeJson(activeFile, activeData, { spaces: 2 });
    
    // Save to client public folder too
    const clientFile = path.join(__dirname, '../client/public/database/properties/active.json');
    await fs.ensureDir(path.dirname(clientFile));
    await fs.writeJson(clientFile, activeData, { spaces: 2 });
    
    console.log(`✅ Saved ${this.results.scraped.length} new properties`);
  }

  async run() {
    try {
      await this.init();
      
      // Define Costa Rica real estate websites to scrape
      const websites = [
        {
          name: 'Encuentra24 CR',
          baseUrl: 'https://www.encuentra24.com',
          paths: ['/costa-rica-es/bienes-raices-venta-casas', '/costa-rica-es/bienes-raices-venta-condominios', '/costa-rica-es/bienes-raices-venta-terrenos']
        },
        {
          name: 'OLX Costa Rica',
          baseUrl: 'https://www.olx.co.cr',
          paths: ['/inmuebles-venta_c348', '/inmuebles-alquiler_c349']
        }
      ];

      let totalProperties = 0;
      for (const site of websites) {
        try {
          const found = await this.scrapeWebsite(site.name, site.baseUrl, site.paths, 25);
          totalProperties += found;
          await this.sleep(5000); // Rate limiting between sites
        } catch (error) {
          console.error(`❌ Failed scraping ${site.name}:`, error.message);
        }
      }
      
      if (this.results.scraped.length > 0) {
        await this.saveResults();
      }
      
      console.log('\n✅ HTTP Scraping completed!');
      console.log(`📊 Final Results:`);
      console.log(`   - New properties: ${this.results.new_properties}`);
      console.log(`   - Duplicates: ${this.results.duplicates}`);
      console.log(`   - Errors: ${this.results.errors.length}`);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    }
  }
}

if (require.main === module) {
  const scraper = new HttpPropertyScraper();
  scraper.run()
    .then(() => {
      console.log('🎉 HTTP scraper completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 HTTP scraper failed:', error);
      process.exit(1);
    });
}

module.exports = HttpPropertyScraper;