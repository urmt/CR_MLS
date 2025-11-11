/**
 * Lamudi scraper for Costa Rica property listings
 * Uses Lamudi API/web scraping with proper rate limiting
 */

import { createLogger } from '../utils/logger';
import { httpGet } from '../utils/httpClient';
import { getConfig } from '../config';
import { 
  RawListing, 
  Coordinates,
  PropertyType,
  PROPERTY_TYPES 
} from '../types';
import { 
  parsePrice, 
  normalizeCoordinates, 
  normalizeAddress,
  extractProvince,
  sanitizeHTML,
  getCurrentTimestamp
} from '../utils/helpers';

const logger = createLogger('lamudi');

interface LamudiResponse {
  results: LamudiProperty[];
  meta: {
    total_count: number;
    page: number;
    total_pages: number;
  };
}

interface LamudiProperty {
  id: string;
  title: string;
  description?: string;
  price: {
    value: number;
    currency: string;
    formatted: string;
  };
  location: {
    address: string;
    city?: string;
    region?: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  attributes: {
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    land_area?: number;
    car_spaces?: number;
    property_type?: string;
  };
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  url: string;
  listing_type: 'sale' | 'rent';
  published_at: string;
  updated_at: string;
  agent?: {
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
  };
}

export class LamudiScraper {
  private baseUrl: string;
  private maxPages: number;

  constructor() {
    const config = getConfig();
    // Lamudi typically uses their country-specific domain
    this.baseUrl = 'https://www.lamudi.com.co/costa-rica/api/search';
    this.maxPages = 50;
  }

  /**
   * Scrape all property listings from Lamudi
   */
  async scrapeListings(): Promise<RawListing[]> {
    logger.info('Starting Lamudi scraping session');
    const startTime = Date.now();
    const listings: RawListing[] = [];
    let totalProcessed = 0;
    let errors = 0;

    try {
      // Scrape different property categories
      const categories = [
        'house-for-sale',
        'apartment-for-sale',
        'land-for-sale',
        'commercial-for-sale'
      ];

      for (const category of categories) {
        logger.info(`Scraping ${category} from Lamudi`);
        
        try {
          const categoryListings = await this.scrapeCategory(category);
          listings.push(...categoryListings);
          totalProcessed += categoryListings.length;
          
          logger.info(`Scraped ${categoryListings.length} ${category} listings`, {
            category,
            count: categoryListings.length
          });
        } catch (error) {
          errors++;
          logger.error(`Failed to scrape ${category}`, error, {
            category
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.stats('Lamudi scraping completed', {
        totalListings: listings.length,
        totalProcessed,
        errors,
        durationMs: duration,
        listingsPerSecond: totalProcessed / (duration / 1000)
      });

      return listings;
    } catch (error) {
      logger.error('Fatal error in Lamudi scraping', error);
      throw error;
    }
  }

  /**
   * Scrape listings for a specific category
   */
  private async scrapeCategory(category: string): Promise<RawListing[]> {
    const listings: RawListing[] = [];
    let page = 1;
    
    while (page <= this.maxPages) {
      try {
        logger.debug(`Scraping ${category} page ${page}`);
        
        const url = this.buildSearchUrl(category, page);
        
        // Lamudi API endpoint might not exist, so we'll need fallback to web scraping
        try {
          const response = await httpGet<LamudiResponse>('lamudi', url);
          
          if (!response.data?.results) {
            logger.warn(`No data in response for ${category} page ${page}`);
            break;
          }

          const pageListings = response.data.results;
          
          if (pageListings.length === 0) {
            logger.info(`No more listings for ${category} at page ${page}`);
            break;
          }

          // Process each listing
          for (const item of pageListings) {
            try {
              const listing = this.processListing(item);
              if (listing) {
                listings.push(listing);
              }
            } catch (error) {
              logger.error(`Failed to process listing ${item.id}`, error, {
                listingId: item.id,
                title: item.title
              });
            }
          }

          logger.debug(`Processed ${pageListings.length} listings from page ${page}`, {
            category,
            page,
            listingsOnPage: pageListings.length
          });

          // Check if we've reached the last page
          if (page >= response.data.meta.total_pages) {
            logger.info(`Reached last page for ${category}`, {
              page,
              totalPages: response.data.meta.total_pages
            });
            break;
          }

          page++;
        } catch (error) {
          // If API fails, try web scraping fallback
          logger.warn(`API failed for ${category}, attempting web scraping fallback`, error);
          const scrapedListings = await this.scrapeWebPage(category, page);
          listings.push(...scrapedListings);
          
          if (scrapedListings.length === 0) {
            break;
          }
          page++;
        }
      } catch (error) {
        logger.error(`Failed to scrape ${category} page ${page}`, error, {
          category,
          page
        });
        page++;
      }
    }

    return listings;
  }

  /**
   * Fallback: Scrape from Lamudi web page HTML
   */
  private async scrapeWebPage(category: string, page: number): Promise<RawListing[]> {
    logger.info(`Web scraping ${category} page ${page}`);
    
    // This is a simplified mock - in production, you'd use Cheerio or Puppeteer
    // to parse the actual HTML from Lamudi's search results page
    
    // For now, return empty array to indicate web scraping not yet implemented
    logger.warn('Web scraping fallback not yet fully implemented');
    return [];
  }

  /**
   * Build search URL for Lamudi API
   */
  private buildSearchUrl(category: string, page: number): string {
    const params = new URLSearchParams({
      category: category,
      page: page.toString(),
      limit: '50',
      sort: 'date_desc'
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Process a raw Lamudi listing
   */
  private processListing(item: LamudiProperty): RawListing | null {
    try {
      // Validate required fields
      if (!item.id || !item.title || !item.price?.formatted) {
        logger.warn(`Skipping invalid listing: missing required fields`, {
          id: item.id,
          hasTitle: !!item.title,
          hasPrice: !!item.price?.formatted
        });
        return null;
      }

      // Parse and validate coordinates
      let coordinates: Coordinates | undefined;
      if (item.location.latitude && item.location.longitude) {
        coordinates = normalizeCoordinates(
          item.location.latitude,
          item.location.longitude
        ) || undefined;
      }

      // Build full address
      const addressParts = [
        item.location.address,
        item.location.city,
        item.location.region
      ].filter(Boolean);
      
      const fullAddress = normalizeAddress(addressParts.join(', '));

      // Process images - ensure full URLs
      const images = (item.photos || [])
        .filter(photo => photo && photo.url)
        .map(photo => {
          const url = photo.url;
          if (url.startsWith('http')) {
            return url;
          } else if (url.startsWith('/')) {
            return `https://www.lamudi.com${url}`;
          } else {
            return `https://www.lamudi.com/${url}`;
          }
        });

      const rawListing: RawListing = {
        source: 'lamudi' as any, // Will need to add to types.ts
        external_id: item.id,
        url: item.url.startsWith('http') ? item.url : `https://www.lamudi.com${item.url}`,
        title: sanitizeHTML(item.title),
        description: item.description ? sanitizeHTML(item.description) : undefined,
        price_text: item.price.formatted,
        price_amount: item.price.value,
        price_currency: item.price.currency,
        location_text: fullAddress,
        images,
        metadata: {
          // Store additional Lamudi-specific data
          propertyType: item.attributes?.property_type,
          bedrooms: item.attributes?.bedrooms,
          bathrooms: item.attributes?.bathrooms,
          floorArea: item.attributes?.floor_area,
          landArea: item.attributes?.land_area,
          carSpaces: item.attributes?.car_spaces,
          listingType: item.listing_type,
          publishedAt: item.published_at,
          updatedAt: item.updated_at,
          agent: item.agent,
          coordinates: coordinates ? {
            lat: coordinates.lat,
            lng: coordinates.lng
          } : undefined,
          province: extractProvince(fullAddress)
        },
        scraped_at: getCurrentTimestamp()
      };

      logger.debug(`Processed Lamudi listing ${item.id}`, {
        listingId: item.id,
        title: item.title,
        price: item.price.formatted,
        location: fullAddress,
        imageCount: images.length
      });

      return rawListing;
    } catch (error) {
      logger.error(`Failed to process Lamudi listing ${item.id}`, error, {
        listingId: item.id,
        rawItem: item
      });
      return null;
    }
  }

  /**
   * Map Lamudi property type to our standard types
   */
  private mapPropertyType(lamudiType: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      'house': 'house',
      'single-family-home': 'house',
      'villa': 'house',
      'apartment': 'apartment',
      'condo': 'apartment',
      'condominium': 'apartment',
      'land': 'land',
      'lot': 'land',
      'commercial': 'commercial',
      'office': 'commercial',
      'warehouse': 'commercial',
      'retail': 'commercial',
      'vacation-home': 'vacation_rental'
    };

    const normalized = lamudiType?.toLowerCase() || '';
    return typeMap[normalized] || 'other';
  }

  /**
   * Get scraping statistics
   */
  getStats(): Record<string, any> {
    return {
      source: 'lamudi',
      baseUrl: this.baseUrl,
      maxPages: this.maxPages,
      lastRun: getCurrentTimestamp()
    };
  }
}

// Export factory function
export function createLamudiScraper(): LamudiScraper {
  return new LamudiScraper();
}
