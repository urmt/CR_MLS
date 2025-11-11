/**
 * Price Change Tracking and Notification System
 * Monitors property price changes and triggers real-time notifications
 */

import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../utils/logger';
import { PropertyListing } from '../types';

const logger = createLogger('price-tracker');

export interface PriceHistory {
  listing_id: string;
  source: string;
  external_id: string;
  title: string;
  changes: PriceChange[];
  first_seen_price: number;
  current_price: number;
  price_trend: 'increasing' | 'decreasing' | 'stable';
  last_updated: string;
}

export interface PriceChange {
  date: string;
  old_price: number;
  new_price: number;
  change_amount: number;
  change_percent: number;
  change_type: 'increase' | 'decrease';
}

export interface PriceChangeNotification {
  listing_id: string;
  title: string;
  url?: string;
  location: string;
  property_type: string;
  old_price: number;
  new_price: number;
  change_amount: number;
  change_percent: number;
  change_type: 'increase' | 'decrease';
  images: string[];
  detected_at: string;
}

export class PriceChangeTracker {
  private priceHistoryPath: string;
  private notificationsPath: string;

  constructor() {
    this.priceHistoryPath = path.join(process.cwd(), 'database', 'price-history.json');
    this.notificationsPath = path.join(process.cwd(), 'database', 'price-notifications.json');
    
    // Ensure database directory exists
    const dbDir = path.dirname(this.priceHistoryPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  /**
   * Track price changes for a batch of listings
   * Returns array of properties with price changes detected
   */
  async trackPriceChanges(listings: PropertyListing[]): Promise<PriceChangeNotification[]> {
    logger.info(`Tracking price changes for ${listings.length} listings`);
    const startTime = Date.now();
    
    const priceHistory = this.loadPriceHistory();
    const notifications: PriceChangeNotification[] = [];
    let changesDetected = 0;

    for (const listing of listings) {
      try {
        const change = this.detectPriceChange(listing, priceHistory);
        
        if (change) {
          notifications.push(change);
          changesDetected++;
          
          logger.info(`Price change detected for ${listing.listing_id}`, {
            listingId: listing.listing_id,
            title: listing.title,
            oldPrice: change.old_price,
            newPrice: change.new_price,
            changePercent: change.change_percent
          });
        }

        // Update price history for this listing
        this.updatePriceHistory(listing, priceHistory, change);
      } catch (error) {
        logger.error(`Failed to track price for listing ${listing.listing_id}`, error);
      }
    }

    // Save updated price history
    this.savePriceHistory(priceHistory);

    // Save notifications for later processing
    if (notifications.length > 0) {
      this.saveNotifications(notifications);
    }

    const duration = Date.now() - startTime;
    logger.stats('Price tracking completed', {
      totalListings: listings.length,
      changesDetected,
      durationMs: duration
    });

    return notifications;
  }

  /**
   * Detect if a listing has a price change
   */
  private detectPriceChange(
    listing: PropertyListing,
    priceHistory: Map<string, PriceHistory>
  ): PriceChangeNotification | null {
    const historical = priceHistory.get(listing.listing_id);
    
    // If this is the first time we've seen this listing, no change to report
    if (!historical) {
      return null;
    }

    const currentPrice = listing.price_usd;
    const previousPrice = historical.current_price;

    // Check if price has actually changed (with 0.01 tolerance for rounding)
    if (Math.abs(currentPrice - previousPrice) < 0.01) {
      return null;
    }

    const changeAmount = currentPrice - previousPrice;
    const changePercent = (changeAmount / previousPrice) * 100;
    const changeType = changeAmount > 0 ? 'increase' : 'decrease';

    // Create notification
    const notification: PriceChangeNotification = {
      listing_id: listing.listing_id,
      title: listing.title,
      url: this.buildListingUrl(listing),
      location: listing.address,
      property_type: listing.property_type,
      old_price: previousPrice,
      new_price: currentPrice,
      change_amount: Math.abs(changeAmount),
      change_percent: Math.abs(changePercent),
      change_type,
      images: listing.images.slice(0, 3), // Include up to 3 images
      detected_at: new Date().toISOString()
    };

    return notification;
  }

  /**
   * Update price history for a listing
   */
  private updatePriceHistory(
    listing: PropertyListing,
    priceHistory: Map<string, PriceHistory>,
    change: PriceChangeNotification | null
  ): void {
    let history = priceHistory.get(listing.listing_id);

    if (!history) {
      // First time seeing this listing - create new history entry
      history = {
        listing_id: listing.listing_id,
        source: listing.source,
        external_id: listing.external_id,
        title: listing.title,
        changes: [],
        first_seen_price: listing.price_usd,
        current_price: listing.price_usd,
        price_trend: 'stable',
        last_updated: new Date().toISOString()
      };
    } else if (change) {
      // Price changed - record the change
      const priceChange: PriceChange = {
        date: new Date().toISOString(),
        old_price: change.old_price,
        new_price: change.new_price,
        change_amount: change.change_type === 'increase' ? change.change_amount : -change.change_amount,
        change_percent: change.change_type === 'increase' ? change.change_percent : -change.change_percent,
        change_type: change.change_type
      };

      history.changes.push(priceChange);
      history.current_price = listing.price_usd;
      history.last_updated = new Date().toISOString();

      // Calculate price trend based on recent changes
      history.price_trend = this.calculatePriceTrend(history);
    } else {
      // No price change - just update last_updated
      history.last_updated = new Date().toISOString();
    }

    priceHistory.set(listing.listing_id, history);
  }

  /**
   * Calculate overall price trend from change history
   */
  private calculatePriceTrend(history: PriceHistory): 'increasing' | 'decreasing' | 'stable' {
    if (history.changes.length === 0) {
      return 'stable';
    }

    // Look at last 5 changes or all changes if fewer
    const recentChanges = history.changes.slice(-5);
    const totalChange = recentChanges.reduce((sum, change) => sum + change.change_amount, 0);

    if (totalChange > 0 && Math.abs(totalChange / history.first_seen_price) > 0.05) {
      return 'increasing';
    } else if (totalChange < 0 && Math.abs(totalChange / history.first_seen_price) > 0.05) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  /**
   * Build listing URL based on source
   */
  private buildListingUrl(listing: PropertyListing): string {
    // Try to get URL from metadata first
    if (listing.external_id) {
      switch (listing.source) {
        case 'encuentra24':
          return `https://encuentra24.com/property/${listing.external_id}`;
        case 'craigslist':
          return `https://costa-rica.craigslist.org/${listing.external_id}.html`;
        case 'lamudi' as any:
          return `https://www.lamudi.com/property/${listing.external_id}`;
        default:
          return '';
      }
    }
    return '';
  }

  /**
   * Load price history from disk
   */
  private loadPriceHistory(): Map<string, PriceHistory> {
    try {
      if (fs.existsSync(this.priceHistoryPath)) {
        const data = fs.readFileSync(this.priceHistoryPath, 'utf8');
        const historyArray: PriceHistory[] = JSON.parse(data);
        
        const historyMap = new Map<string, PriceHistory>();
        for (const entry of historyArray) {
          historyMap.set(entry.listing_id, entry);
        }
        
        logger.info(`Loaded price history for ${historyMap.size} properties`);
        return historyMap;
      }
    } catch (error) {
      logger.error('Failed to load price history', error);
    }

    logger.info('No existing price history found, starting fresh');
    return new Map();
  }

  /**
   * Save price history to disk
   */
  private savePriceHistory(priceHistory: Map<string, PriceHistory>): void {
    try {
      const historyArray = Array.from(priceHistory.values());
      const tempPath = this.priceHistoryPath + '.tmp';
      
      fs.writeFileSync(tempPath, JSON.stringify(historyArray, null, 2));
      fs.renameSync(tempPath, this.priceHistoryPath);
      
      logger.info(`Saved price history for ${historyArray.length} properties`);
    } catch (error) {
      logger.error('Failed to save price history', error);
      throw error;
    }
  }

  /**
   * Save price change notifications
   */
  private saveNotifications(notifications: PriceChangeNotification[]): void {
    try {
      // Load existing notifications
      let existingNotifications: PriceChangeNotification[] = [];
      if (fs.existsSync(this.notificationsPath)) {
        const data = fs.readFileSync(this.notificationsPath, 'utf8');
        existingNotifications = JSON.parse(data);
      }

      // Append new notifications
      existingNotifications.push(...notifications);

      // Keep only last 1000 notifications to prevent file from growing too large
      if (existingNotifications.length > 1000) {
        existingNotifications = existingNotifications.slice(-1000);
      }

      // Save atomically
      const tempPath = this.notificationsPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(existingNotifications, null, 2));
      fs.renameSync(tempPath, this.notificationsPath);

      logger.info(`Saved ${notifications.length} new price change notifications`);
    } catch (error) {
      logger.error('Failed to save notifications', error);
      throw error;
    }
  }

  /**
   * Get recent price change notifications
   */
  getRecentNotifications(limit: number = 50): PriceChangeNotification[] {
    try {
      if (fs.existsSync(this.notificationsPath)) {
        const data = fs.readFileSync(this.notificationsPath, 'utf8');
        const notifications: PriceChangeNotification[] = JSON.parse(data);
        
        // Return most recent notifications
        return notifications.slice(-limit).reverse();
      }
    } catch (error) {
      logger.error('Failed to load notifications', error);
    }
    
    return [];
  }

  /**
   * Get price history for a specific listing
   */
  getListingPriceHistory(listingId: string): PriceHistory | null {
    const priceHistory = this.loadPriceHistory();
    return priceHistory.get(listingId) || null;
  }

  /**
   * Get statistics about price changes
   */
  getStats(): {
    totalTrackedListings: number;
    listingsWithChanges: number;
    averageChangePercent: number;
    biggestIncrease: PriceHistory | null;
    biggestDecrease: PriceHistory | null;
  } {
    const priceHistory = this.loadPriceHistory();
    const historyArray = Array.from(priceHistory.values());

    const listingsWithChanges = historyArray.filter(h => h.changes.length > 0);
    
    let totalChangePercent = 0;
    let biggestIncrease: PriceHistory | null = null;
    let biggestDecrease: PriceHistory | null = null;
    let maxIncrease = 0;
    let maxDecrease = 0;

    for (const history of listingsWithChanges) {
      const totalChange = history.current_price - history.first_seen_price;
      const changePercent = (totalChange / history.first_seen_price) * 100;
      totalChangePercent += changePercent;

      if (totalChange > maxIncrease) {
        maxIncrease = totalChange;
        biggestIncrease = history;
      }
      if (totalChange < maxDecrease) {
        maxDecrease = totalChange;
        biggestDecrease = history;
      }
    }

    return {
      totalTrackedListings: historyArray.length,
      listingsWithChanges: listingsWithChanges.length,
      averageChangePercent: listingsWithChanges.length > 0 
        ? totalChangePercent / listingsWithChanges.length 
        : 0,
      biggestIncrease,
      biggestDecrease
    };
  }
}

// Export factory function
export function createPriceChangeTracker(): PriceChangeTracker {
  return new PriceChangeTracker();
}
