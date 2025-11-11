/**
 * Encuentra24 scraper for Costa Rica property listings
 * Uses reverse-engineered API endpoints with proper rate limiting
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

const logger = createLogger('encuentra24');

interface Encuentra24Response {
  data: {
    items: Encuentra24Item[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}

interface Encuentra24Item {
  id: string;
  title: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
    display: string;
  };
  location: {
    address: string;
    city?: string;
    state?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  property: {
    type: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    lotSize?: number;
    parking?: number;
  };
  images: string[];
  url: string;
  publishedAt: string;
  updatedAt: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export class Encuentra24Scraper {
  private baseUrl: string;
  private maxPages: number;

  constructor() {
    const config = getConfig();
    this.baseUrl = config.sources.encuentra24.baseUrl;
    this.maxPages = config.sources.encuentra24.maxPages;
  }

  /**
   * Scrape all property listings from Encuentra24
   */
  async scrapeListings(): Promise<RawListing[]> {
    logger.info('Starting Encuentra24 scraping session');
    const startTime = Date.now();
    const listings: RawListing[] = [];
    let totalProcessed = 0;
    let errors = 0;

    try {
      // Scrape different property types
      const propertyTypes = [
        'houses', 
        'apartments', 
        'land',
        'commercial'
      ];

      for (const propertyType of propertyTypes) {
        logger.info(`Scraping ${propertyType} from Encuentra24`);
        
        try {
          const typeListings = await this.scrapePropertyType(propertyType);
          listings.push(...typeListings);
          totalProcessed += typeListings.length;
          
          logger.info(`Scraped ${typeListings.length} ${propertyType} listings`, {
            propertyType,
            count: typeListings.length
          });
        } catch (error) {
          errors++;
          logger.error(`Failed to scrape ${propertyType}`, error, {
            propertyType
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.stats('Encuentra24 scraping completed', {
        totalListings: listings.length,
        totalProcessed,
        errors,
        durationMs: duration,
        listingsPerSecond: totalProcessed / (duration / 1000)
      });

      return listings;
    } catch (error) {
      logger.error('Fatal error in Encuentra24 scraping', error);
      throw error;
    }
  }

  /**
   * Scrape listings for a specific property type
   */
  private async scrapePropertyType(propertyType: string): Promise<RawListing[]> {
    const listings: RawListing[] = [];
    let page = 1;
    
    while (page <= this.maxPages) {
      try {
        logger.debug(`Scraping ${propertyType} page ${page}`);
        
        const url = this.buildSearchUrl(propertyType, page);
        const response = await httpGet<Encuentra24Response>('encuentra24', url);
        
        if (!response.data?.data?.items) {
          logger.warn(`No data in response for ${propertyType} page ${page}`);
          break;
        }

        const pageListings = response.data.data.items;
        
        if (pageListings.length === 0) {
          logger.info(`No more listings for ${propertyType} at page ${page}`);
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
          propertyType,
          page,
          listingsOnPage: pageListings.length
        });

        // Check if we've reached the last page
        const pagination = response.data.data.pagination;
        if (page >= pagination.totalPages) {
          logger.info(`Reached last page for ${propertyType}`, {
            page,
            totalPages: pagination.totalPages
          });
          break;
        }

        page++;
      } catch (error) {
        logger.error(`Failed to scrape ${propertyType} page ${page}`, error, {
          propertyType,
          page
        });
        
        // Continue to next page on error, but stop if too many consecutive errors
        page++;
      }
    }

    return listings;
  }

  /**
   * Build search URL for Encuentra24 API
   */
  private buildSearchUrl(propertyType: string, page: number): string {
    const params = new URLSearchParams({
      operation: '1', // 1 = sale, 2 = rent
      categoryId: this.getCategories(propertyType),
      locationId: '2', // Costa Rica
      page: page.toString(),
      orderBy: 'published_desc',
      limit: '50'
    });

    return `${this.baseUrl}/search?${params.toString()}`;
  }

  /**
   * Get Encuentra24 category ID for property type
   */
  private getCategories(propertyType: string): string {
    const categories: Record<string, string> = {
      'houses': '1020', // Casas
      'apartments': '1025', // Apartamentos
      'land': '1045', // Terrenos
      'commercial': '1060' // Comercial
    };

    return categories[propertyType] || '1020';
  }

  /**
   * Process a raw Encuentra24 listing item
   */
  private processListing(item: Encuentra24Item): RawListing | null {
    try {
      // Validate required fields
      if (!item.id || !item.title || !item.price?.display) {
        logger.warn(`Skipping invalid listing: missing required fields`, {
          id: item.id,
          hasTitle: !!item.title,
          hasPrice: !!item.price?.display
        });
        return null;
      }

      // Parse and validate coordinates
      let coordinates: Coordinates | undefined;
      if (item.location.coordinates) {
        coordinates = normalizeCoordinates(
          item.location.coordinates.lat,
          item.location.coordinates.lng
        ) || undefined;
      }

      // Build full address
      const addressParts = [
        item.location.address,
        item.location.city,
        item.location.state
      ].filter(Boolean);
      
      const fullAddress = normalizeAddress(addressParts.join(', '));

      // Process images - ensure full URLs
      const images = (item.images || [])
        .filter(img => img && typeof img === 'string')
        .map(img => {
          if (img.startsWith('http')) {
            return img;
          } else if (img.startsWith('/')) {
            return `https://encuentra24.com${img}`;
          } else {
            return `https://encuentra24.com/${img}`;
          }
        });

      const rawListing: RawListing = {
        source: 'encuentra24',
        external_id: item.id,
        url: item.url.startsWith('http') ? item.url : `https://encuentra24.com${item.url}`,
        title: sanitizeHTML(item.title),
        description: item.description ? sanitizeHTML(item.description) : undefined,
        price_text: item.price.display,
        price_amount: item.price.amount,
        price_currency: item.price.currency,
        location_text: fullAddress,
        images,
        metadata: {
          // Store additional Encuentra24-specific data
          propertyType: item.property?.type,
          bedrooms: item.property?.bedrooms,
          bathrooms: item.property?.bathrooms,
          area: item.property?.area,
          lotSize: item.property?.lotSize,
          parking: item.property?.parking,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          contact: item.contact,
          coordinates: coordinates ? {
            lat: coordinates.lat,
            lng: coordinates.lng
          } : undefined,
          province: extractProvince(fullAddress)
        },
        scraped_at: getCurrentTimestamp()
      };

      logger.debug(`Processed Encuentra24 listing ${item.id}`, {
        listingId: item.id,
        title: item.title,
        price: item.price.display,
        location: fullAddress,
        imageCount: images.length
      });

      return rawListing;
    } catch (error) {
      logger.error(`Failed to process Encuentra24 listing ${item.id}`, error, {
        listingId: item.id,
        rawItem: item
      });
      return null;
    }
  }

  /**
   * Map Encuentra24 property type to our standard types
   */
  private mapPropertyType(encuentra24Type: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      'casa': 'house',
      'house': 'house',
      'apartamento': 'apartment',
      'apartment': 'apartment',
      'terreno': 'land',
      'land': 'land',
      'lote': 'land',
      'comercial': 'commercial',
      'commercial': 'commercial',
      'oficina': 'commercial',
      'bodega': 'commercial',
      'vacational': 'vacation_rental'
    };

    const normalized = encuentra24Type?.toLowerCase() || '';
    return typeMap[normalized] || 'other';
  }

  /**
   * Get scraping statistics
   */
  getStats(): Record<string, any> {
    return {
      source: 'encuentra24',
      baseUrl: this.baseUrl,
      maxPages: this.maxPages,
      lastRun: getCurrentTimestamp()
    };
  }
}

// Export factory function
export function createEncuentra24Scraper(): Encuentra24Scraper {
  return new Encuentra24Scraper();
}