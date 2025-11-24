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
      const activeFile = path.join(__dirname, '../database/properties/active.json');
      const pendingFile = path.join(__dirname, '../database/properties/pending.json');
      
      const activeProperties = await fs.readJson(activeFile).catch(() => ({ properties: [] }));
      const pendingProperties = await fs.readJson(pendingFile).catch(() => ({ properties: [] }));
      
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
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Sort endpoints by priority if defined
      const endpoints = Object.entries(sourceConfig.endpoints);
      
      for (const [endpointName, endpoint] of endpoints) {
        console.log(`  📄 Scraping ${endpointName} from ${sourceName}...`);
        
        // Try different URL patterns for pagination
        const urlPatterns = [
          `${sourceConfig.base_url}${endpoint}`,
          `${sourceConfig.base_url}${endpoint}?page=`,
          `${sourceConfig.base_url}${endpoint}/page-`,
          `${sourceConfig.base_url}${endpoint}?p=`
        ];
        
        let foundListings = false;
        
        for (let pageNum = 1; pageNum <= Math.min(sourceConfig.max_pages, 5); pageNum++) {
          let url = urlPatterns[0];
          if (pageNum > 1) {
            url = `${urlPatterns[1]}${pageNum}`;
          }
          
          try {
            console.log(`    🌐 Trying: ${url}`);
            await page.goto(url, { 
              waitUntil: 'domcontentloaded', 
              timeout: 15000 
            });
            
            // Wait for content to load (use source-specific wait_time if provided)
            const waitTime = sourceConfig.wait_time || 3000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Try to detect and handle cookie banners, captchas, etc.
            await this.handlePageObstructions(page);
            
            const html = await page.content();
            const $ = cheerio.load(html);
            
            // Try multiple selectors to find listings
            let listings = $();
            const possibleSelectors = [
              sourceConfig.selectors.listing,
              '.property-card',
              '.listing-item',
              '.property-item',
              '.property',
              '[data-testid*="property"]',
              '.search-result',
              '.result-item'
            ];
            
            for (const selector of possibleSelectors) {
              listings = $(selector);
              if (listings.length > 0) {
                console.log(`    ✅ Found ${listings.length} listings with selector: ${selector}`);
                break;
              }
            }
            
            if (listings.length === 0) {
              console.log(`    ⚠️  No listings found on page ${pageNum}`);
              if (pageNum === 1) {
                // Try alternative URL patterns on first page
                continue;
              } else {
                break;
              }
            } else {
              foundListings = true;
            }
            
            for (let i = 0; i < listings.length && i < 20; i++) {
              const listing = listings.eq(i);
              const property = await this.extractPropertyData(listing, sourceConfig, $, url);
              
              if (property && this.isValidProperty(property)) {
                // Filter by country if specified (for multi-country sources like OmniMLS)
                if (sourceConfig.filter_country) {
                  const filterCountry = sourceConfig.filter_country.toLowerCase();
                  const locationText = (property.location || '').toLowerCase();
                  const descriptionText = (property.description || '').toLowerCase();
                  const titleText = (property.title || '').toLowerCase();
                  const combinedText = `${locationText} ${descriptionText} ${titleText}`;
                  
                  // Expanded list of Costa Rica location keywords
                  const costaRicaKeywords = [
                    'costa rica', 'guanacaste', 'tamarindo', 'san jose', 'san josé',
                    'escazu', 'escazú', 'santa ana', 'heredia', 'alajuela', 'cartago',
                    'puntarenas', 'limon', 'limón', 'jaco', 'jacó', 'uvita', 'nosara',
                    'manuel antonio', 'playa', 'arenal', 'monteverde', 'dominical',
                    'flamingo', 'conchal', 'hermosa', 'samara', 'carrillo'
                  ];
                  
                  // Check if property is in the target country (main keyword or specific locations)
                  const matchesCountry = combinedText.includes(filterCountry) || 
                                        costaRicaKeywords.some(keyword => combinedText.includes(keyword));
                  
                  if (!matchesCountry) {
                    console.log(`      ⏭️  Skipped (not in ${filterCountry}): ${property.title.substring(0, 40)}...`);
                    continue;
                  }
                }
                
                if (!this.isDuplicate(property)) {
                  property.source = sourceName;
                  property.source_name = sourceConfig.name;
                  property.category = this.categorizeProperty(property);
                  property.scraped_at = new Date().toISOString();
                  property.id = this.generatePropertyId(property);
                  
                  this.results.scraped.push(property);
                  this.results.new_properties++;
                  
                  console.log(`      📋 Added: ${property.title.substring(0, 50)}...`);
                } else {
                  this.results.duplicates++;
                }
              }
            }
            
            console.log(`    ✅ Page ${pageNum}: Processed ${listings.length} listings`);
            
            // Respect rate limiting
            await new Promise(resolve => setTimeout(resolve, sources.scraping_rules.delay_between_requests));
            
          } catch (error) {
            console.error(`    ❌ Error on page ${pageNum}:`, error.message);
            this.results.errors.push({
              source: sourceName,
              endpoint: endpointName,
              page: pageNum,
              url: url,
              error: error.message,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        if (!foundListings) {
          console.log(`    ⚠️  No listings found for ${endpointName}`);
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

  async handlePageObstructions(page) {
    try {
      // Handle cookie banners
      const cookieSelectors = [
        'button[id*="accept"]',
        'button[class*="accept"]',
        'button[id*="cookie"]',
        'button[class*="cookie"]',
        '.cookie-accept',
        '#cookie-accept',
        '.accept-cookies',
        '[data-testid*="accept"]'
      ];
      
      for (const selector of cookieSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // Handle modals/popups
      const modalSelectors = [
        '.modal-close',
        '.close-modal',
        '[aria-label="Close"]',
        '.popup-close'
      ];
      
      for (const selector of modalSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (error) {
      // Ignore obstruction handling errors
    }
  }

  async extractPropertyData(listing, sourceConfig, $, baseUrl) {
    try {
      const property = {};
      
      // Extract title with fallbacks
      const titleSelectors = [
        sourceConfig.selectors.title,
        '.title',
        '.property-title',
        '.listing-title',
        'h1', 'h2', 'h3',
        '[data-testid*="title"]',
        '.name'
      ];
      
      for (const selector of titleSelectors) {
        const element = listing.find(selector);
        if (element.length && element.text().trim()) {
          property.title = element.text().trim();
          break;
        }
      }
      
      // Extract price with fallbacks
      // Special handling for OmniMLS-style text extraction
      if (sourceConfig.selectors.price === 'text') {
        const fullText = listing.text();
        // Extract price from text using regex patterns
        const pricePatterns = [
          /\$([\d,]+(?:\.\d{2})?)/,     // $123,456.00
          /USD\s*([\d,]+)/i,             // USD 123456
          /([\d,]+)\s*USD/i              // 123456 USD
        ];
        
        for (const pattern of pricePatterns) {
          const match = fullText.match(pattern);
          if (match) {
            property.price_text = match[0];
            property.price_usd = this.parsePrice(match[1]);
            break;
          }
        }
      } else {
        // Normal selector-based extraction
        const priceSelectors = [
          sourceConfig.selectors.price,
          '.price',
          '.property-price',
          '.listing-price',
          '[data-testid*="price"]',
          '.cost',
          '.amount'
        ];
        
        for (const selector of priceSelectors) {
          const element = listing.find(selector);
          if (element.length && element.text().trim()) {
            property.price_text = element.text().trim();
            property.price_usd = this.parsePrice(property.price_text);
            break;
          }
        }
      }
      
      // Extract location with fallbacks
      // Special handling for OmniMLS-style text extraction
      if (sourceConfig.selectors.location === 'text') {
        const fullText = listing.text();
        // Extract location from text - look for known Costa Rica locations
        const locationPatterns = [
          /(?:in|at|location:?)\s*([^\n]{3,50}?)(?:\s*\$|\s*USD|\s*-|\n|$)/i,
          /(San José|Guanacaste|Tamarindo|Santa Ana|Escazú|Alajuela|Heredia|Cartago|Puntarenas|Limón|Jacó|Uvita|Manuel Antonio|Nosara|Playa)[^\n]{0,40}/i
        ];
        
        for (const pattern of locationPatterns) {
          const match = fullText.match(pattern);
          if (match) {
            property.location = match[1] || match[0].trim();
            break;
          }
        }
        
        // Fallback: use first line that's not the title or price
        if (!property.location) {
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
          for (const line of lines) {
            if (!line.includes('$') && !line.includes('USD') && line !== property.title) {
              property.location = line.substring(0, 100);
              break;
            }
          }
        }
      } else {
        // Normal selector-based extraction
        const locationSelectors = [
          sourceConfig.selectors.location,
          '.location',
          '.property-location',
          '.listing-location',
          '.address',
          '[data-testid*="location"]',
          '.region'
        ];
        
        for (const selector of locationSelectors) {
          const element = listing.find(selector);
          if (element.length && element.text().trim()) {
            property.location = element.text().trim();
            break;
          }
        }
      }
      
      // Extract link with fallbacks
      const linkSelectors = [
        sourceConfig.selectors.link,
        'a[href]',
        '.property-link',
        '.listing-link'
      ];
      
      for (const selector of linkSelectors) {
        const element = listing.find(selector);
        const href = element.attr('href');
        if (href) {
          try {
            property.url = new URL(href, baseUrl).href;
            break;
          } catch (e) {
            // Invalid URL, continue
          }
        }
      }
      
      // Extract images with fallbacks
      const imageSelectors = [
        sourceConfig.selectors.images,
        'img',
        '.property-image img',
        '.listing-image img',
        '[data-testid*="image"] img'
      ];
      
      property.images = [];
      for (const selector of imageSelectors) {
        const imageElements = listing.find(selector);
        imageElements.each((i, img) => {
          const src = $(img).attr('src') || 
                     $(img).attr('data-src') || 
                     $(img).attr('data-lazy') ||
                     $(img).attr('data-original');
          if (src && property.images.length < sources.scraping_rules.max_images_per_property) {
            try {
              const fullImageUrl = new URL(src, baseUrl).href;
              if (!property.images.includes(fullImageUrl)) {
                property.images.push(fullImageUrl);
              }
            } catch (e) {
              // Invalid image URL
            }
          }
        });
        if (property.images.length > 0) break;
      }
      
      // Extract description with fallbacks
      const descriptionSelectors = [
        sourceConfig.selectors.details,
        '.description',
        '.property-description',
        '.listing-description',
        '.summary',
        '.details',
        '[data-testid*="description"]'
      ];
      
      for (const selector of descriptionSelectors) {
        const element = listing.find(selector);
        if (element.length && element.text().trim()) {
          property.description = element.text().trim().substring(0, 500);
          break;
        }
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