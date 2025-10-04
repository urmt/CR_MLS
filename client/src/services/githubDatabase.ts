import axios from 'axios';
import EncryptionManager from '../utils/encryption';

export interface Property {
  id: string;
  title: string;
  price_usd: number;
  price_text: string;
  location: string;
  description?: string;
  images: string[];
  url?: string;
  source: string;
  category: string;
  scraped_at: string;
}

export interface DatabaseFile {
  active: { properties: Property[]; last_updated: string };
  pending: { properties: Property[]; last_updated: string };
  sold: { properties: Property[]; last_updated: string };
  archived: { properties: Property[]; last_updated: string };
}

export interface CategoryConfig {
  name: string;
  subcategories: string[];
  email_price: number;
  pdf_template: string;
  auto_email: boolean;
  frequency: string;
}

export interface ScrapingSource {
  name: string;
  base_url: string;
  endpoints: Record<string, string>;
  selectors: Record<string, string>;
  active: boolean;
  scrape_frequency: string;
  max_pages: number;
}

class GitHubDatabaseService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private credentials = EncryptionManager.getCredentials();

  /**
   * Fetch data from GitHub raw content
   */
  private async fetchFromGitHub<T>(path: string): Promise<T> {
    const cacheKey = path;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const url = `${this.credentials?.github.rawContentUrl}/${path}`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      const data = response.data;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${path} from GitHub:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.warn(`Using expired cache for ${path}`);
        return cached.data as T;
      }
      
      throw error;
    }
  }

  /**
   * Get active properties
   */
  async getActiveProperties(): Promise<Property[]> {
    try {
      const data = await this.fetchFromGitHub<{ properties: Property[] }>('properties/active.json');
      return data.properties || [];
    } catch (error) {
      console.error('Failed to load active properties:', error);
      return [];
    }
  }

  /**
   * Get pending properties
   */
  async getPendingProperties(): Promise<Property[]> {
    try {
      const data = await this.fetchFromGitHub<{ properties: Property[] }>('properties/pending.json');
      return data.properties || [];
    } catch (error) {
      console.error('Failed to load pending properties:', error);
      return [];
    }
  }

  /**
   * Get all properties (active + pending)
   */
  async getAllProperties(): Promise<Property[]> {
    try {
      const [active, pending] = await Promise.all([
        this.getActiveProperties(),
        this.getPendingProperties()
      ]);
      return [...active, ...pending];
    } catch (error) {
      console.error('Failed to load all properties:', error);
      return [];
    }
  }

  /**
   * Get properties by category
   */
  async getPropertiesByCategory(category: string): Promise<Property[]> {
    const properties = await this.getAllProperties();
    return properties.filter(property => property.category === category);
  }

  /**
   * Get properties by price range
   */
  async getPropertiesByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]> {
    const properties = await this.getAllProperties();
    return properties.filter(property => 
      property.price_usd >= minPrice && property.price_usd <= maxPrice
    );
  }

  /**
   * Search properties by text
   */
  async searchProperties(searchTerm: string): Promise<Property[]> {
    const properties = await this.getAllProperties();
    const term = searchTerm.toLowerCase();
    
    return properties.filter(property =>
      property.title.toLowerCase().includes(term) ||
      property.location.toLowerCase().includes(term) ||
      (property.description && property.description.toLowerCase().includes(term))
    );
  }

  /**
   * Get category configuration
   */
  async getCategoryConfig(): Promise<Record<string, CategoryConfig>> {
    try {
      const data = await this.fetchFromGitHub<{ categories: Record<string, CategoryConfig> }>('config/categories.json');
      return data.categories || {};
    } catch (error) {
      console.error('Failed to load category config:', error);
      return {};
    }
  }

  /**
   * Get scraping sources configuration
   */
  async getScrapingSources(): Promise<Record<string, ScrapingSource>> {
    try {
      const data = await this.fetchFromGitHub<{ sources: Record<string, ScrapingSource> }>('scraping/sources.json');
      return data.sources || {};
    } catch (error) {
      console.error('Failed to load scraping sources:', error);
      return {};
    }
  }

  /**
   * Get last scraping run info
   */
  async getLastScrapingRun(): Promise<{ timestamp: string; results: any } | null> {
    try {
      return await this.fetchFromGitHub('scraping/last-run.json');
    } catch (error) {
      console.error('Failed to load last scraping run:', error);
      return null;
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    const properties = await this.getAllProperties();
    return properties.find(property => property.id === id) || null;
  }

  /**
   * Get recent properties (last 7 days)
   */
  async getRecentProperties(days: number = 7): Promise<Property[]> {
    const properties = await this.getAllProperties();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return properties.filter(property => {
      const scrapedDate = new Date(property.scraped_at);
      return scrapedDate >= cutoffDate;
    });
  }

  /**
   * Get properties statistics
   */
  async getPropertyStats(): Promise<{
    total: number;
    by_category: Record<string, number>;
    by_source: Record<string, number>;
    avg_price: number;
    price_range: { min: number; max: number };
  }> {
    const properties = await this.getAllProperties();
    
    const by_category: Record<string, number> = {};
    const by_source: Record<string, number> = {};
    let total_price = 0;
    let min_price = Infinity;
    let max_price = 0;

    properties.forEach(property => {
      // Count by category
      by_category[property.category] = (by_category[property.category] || 0) + 1;
      
      // Count by source
      by_source[property.source] = (by_source[property.source] || 0) + 1;
      
      // Price calculations
      if (property.price_usd > 0) {
        total_price += property.price_usd;
        min_price = Math.min(min_price, property.price_usd);
        max_price = Math.max(max_price, property.price_usd);
      }
    });

    return {
      total: properties.length,
      by_category,
      by_source,
      avg_price: properties.length > 0 ? total_price / properties.length : 0,
      price_range: {
        min: min_price === Infinity ? 0 : min_price,
        max: max_price
      }
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Refresh specific cache entry
   */
  async refreshCache(path: string): Promise<void> {
    this.cache.delete(path);
  }
}

export default new GitHubDatabaseService();