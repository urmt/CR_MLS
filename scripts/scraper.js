#!/usr/bin/env node

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

// Load configuration
const sources = require('../database/scraping/sources.json');
const categories = require('../database/config/categories.json');

class CostaRicaPropertyScraper {
  constructor() {
    this.browser = null;
    this.results = {
      scraped: [],
      errors: [],
      duplicates: 0,
      new_properties: 0
    };
  }

  async init() {
    console.log('🚀 Starting Costa Rica Property Scraper...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Load existing properties to check for duplicates
    this.existingProperties = await this.loadExistingProperties();
  }

  async loadExistingProperties() {
    try {
      const activeProperties = await fs.readJson('../database/properties/active.json').catch(() => ({ properties: [] }));
      const pendingProperties = await fs.readJson('../database/properties/pending.json').catch(() => ({ properties: [] }));
      
      return [...activeProperties.properties, ...pendingProperties.properties];
    } catch (error) {
      console.warn('Could not load existing properties:', error.message);
      return [];
    }
  }

  async scrapeSource(sourceName, sourceConfig) {
    console.log(`🔍 Scraping ${sourceConfig.name}...`);
    
    if (!sourceConfig.active) {
      console.log(`⏭️  Skipping ${sourceName} - not active`);
      return;
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent
      await page.setUserAgent(sources.scraping_rules.user_agent);
      
      for (const [endpointName, endpoint] of Object.entries(sourceConfig.endpoints)) {
        console.log(`  📄 Scraping ${endpointName} from ${sourceName}...`);
        
        for (let pageNum = 1; pageNum <= sourceConfig.max_pages; pageNum++) {
          const url = `${sourceConfig.base_url}${endpoint}?page=${pageNum}`;
          
          try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForTimeout(sources.scraping_rules.delay_between_requests);
            
            const html = await page.content();
            const $ = cheerio.load(html);
            const listings = $(sourceConfig.selectors.listing);
            
            if (listings.length === 0) {
              console.log(`    ⚠️  No listings found on page ${pageNum}, stopping`);
              break;
            }
            
            for (let i = 0; i < listings.length; i++) {
              const listing = listings.eq(i);
              const property = await this.extractPropertyData(listing, sourceConfig, $, url);
              
              if (property && this.isValidProperty(property)) {
                if (!this.isDuplicate(property)) {
                  property.source = sourceName;
                  property.category = this.categorizeProperty(property);
                  property.scraped_at = new Date().toISOString();
                  property.id = this.generatePropertyId(property);
                  
                  this.results.scraped.push(property);
                  this.results.new_properties++;
                } else {
                  this.results.duplicates++;
                }
              }
            }
            
            console.log(`    ✅ Page ${pageNum}: Found ${listings.length} listings`);
            
            // Respect rate limiting
            await page.waitForTimeout(sources.scraping_rules.delay_between_requests);
            
          } catch (error) {
            console.error(`    ❌ Error on page ${pageNum}:`, error.message);
            this.results.errors.push({
              source: sourceName,
              endpoint: endpointName,
              page: pageNum,
              error: error.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scraping ${sourceName}:`, error.message);
      this.results.errors.push({
        source: sourceName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await page.close();
    }
  }

  async extractPropertyData(listing, sourceConfig, $, baseUrl) {
    try {
      const property = {};
      
      // Extract basic fields
      const titleElement = listing.find(sourceConfig.selectors.title);
      property.title = titleElement.text().trim();
      
      const priceElement = listing.find(sourceConfig.selectors.price);
      property.price_text = priceElement.text().trim();
      property.price_usd = this.parsePrice(property.price_text);
      
      const locationElement = listing.find(sourceConfig.selectors.location);
      property.location = locationElement.text().trim();
      
      // Extract link
      const linkElement = listing.find(sourceConfig.selectors.link);
      const relativeUrl = linkElement.attr('href');
      property.url = relativeUrl ? new URL(relativeUrl, baseUrl).href : null;
      
      // Extract images
      const imageElements = listing.find(sourceConfig.selectors.images);
      property.images = [];
      imageElements.each((i, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && property.images.length < sources.scraping_rules.max_images_per_property) {
          property.images.push(new URL(src, baseUrl).href);
        }
      });
      
      // Extract description if available
      if (sourceConfig.selectors.details) {
        const detailsElement = listing.find(sourceConfig.selectors.details);
        property.description = detailsElement.text().trim();
      }
      
      return property;
    } catch (error) {
      console.error('Error extracting property data:', error.message);
      return null;
    }
  }

  parsePrice(priceText) {
    if (!priceText) return null;
    
    // Remove currency symbols and spaces
    const cleanPrice = priceText.replace(/[^0-9.,]/g, '');
    const numericPrice = parseFloat(cleanPrice.replace(/,/g, ''));
    
    // Convert colones to USD (approximate rate: 1 USD = 500 colones)
    if (priceText.includes('₡') || priceText.toLowerCase().includes('colon')) {
      return Math.round(numericPrice / 500);
    }
    
    return numericPrice || null;
  }

  isValidProperty(property) {
    const rules = sources.scraping_rules;
    
    // Check required fields
    for (const field of rules.required_fields) {
      if (!property[field] || property[field].toString().trim() === '') {
        return false;
      }
    }
    
    // Check price range
    if (property.price_usd) {
      if (property.price_usd < rules.min_price_usd || property.price_usd > rules.max_price_usd) {
        return false;
      }
    }
    
    return true;
  }

  isDuplicate(property) {
    // Simple duplicate detection based on title similarity
    return this.existingProperties.some(existing => {
      const similarity = this.calculateSimilarity(property.title, existing.title);
      return similarity > 0.8;
    });
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  categorizeProperty(property) {
    const title = property.title.toLowerCase();
    const description = (property.description || '').toLowerCase();
    const text = `${title} ${description}`;
    
    // Check each category
    for (const [categoryKey, categoryConfig] of Object.entries(categories.categories)) {
      for (const subcategory of categoryConfig.subcategories) {
        const keywords = subcategory.split('_');
        if (keywords.some(keyword => text.includes(keyword))) {
          return categoryKey;
        }
      }
    }
    
    return 'residential'; // Default category
  }

  generatePropertyId(property) {
    const data = `${property.title}-${property.location}-${property.price_usd}`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 12);
  }

  async saveResults() {
    console.log('💾 Saving scraping results...');
    
    // Load existing pending properties
    const pendingFile = path.join(__dirname, '../database/properties/pending.json');
    let pendingData = { properties: [], last_updated: null };
    
    try {
      pendingData = await fs.readJson(pendingFile);
    } catch (error) {
      console.log('Creating new pending.json file');
    }
    
    // Add new properties to pending
    pendingData.properties = [...pendingData.properties, ...this.results.scraped];
    pendingData.last_updated = new Date().toISOString();
    
    await fs.writeJson(pendingFile, pendingData, { spaces: 2 });
    
    // Update last run info
    const lastRunFile = path.join(__dirname, '../database/scraping/last-run.json');
    const lastRunData = {
      timestamp: new Date().toISOString(),
      results: {
        new_properties: this.results.new_properties,
        duplicates: this.results.duplicates,
        errors: this.results.errors.length
      }
    };
    
    await fs.writeJson(lastRunFile, lastRunData, { spaces: 2 });
    
    // Save errors if any
    if (this.results.errors.length > 0) {
      const errorsFile = path.join(__dirname, '../database/scraping/errors.json');
      let errorsData = { errors: [] };
      
      try {
        errorsData = await fs.readJson(errorsFile);
      } catch (error) {
        // File doesn't exist, create new one
      }
      
      errorsData.errors = [...errorsData.errors, ...this.results.errors];
      await fs.writeJson(errorsFile, errorsData, { spaces: 2 });
    }
  }

  async run() {
    try {
      await this.init();
      
      // Scrape all active sources
      for (const [sourceName, sourceConfig] of Object.entries(sources.sources)) {
        await this.scrapeSource(sourceName, sourceConfig);
      }
      
      await this.saveResults();
      
      console.log('✅ Scraping completed!');
      console.log(`📊 Results: ${this.results.new_properties} new properties, ${this.results.duplicates} duplicates, ${this.results.errors.length} errors`);
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new CostaRicaPropertyScraper();
  scraper.run().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CostaRicaPropertyScraper;