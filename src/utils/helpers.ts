/**
 * Utility functions for Costa Rica MLS Real-Data Report Generator
 */

import * as crypto from 'crypto';
import { createLogger } from './logger';
import { httpGet } from './httpClient';
import { getConfig } from '../config';
import { CurrencyRate, Coordinates } from '../types';

const logger = createLogger('helpers');

// Cache for currency rates
const currencyCache: Map<string, CurrencyRate> = new Map();

/**
 * Convert price to USD using BCCR exchange rates
 */
export async function priceToUSD(price: number, currency: string): Promise<number> {
  if (currency === 'USD') {
    return price;
  }
  
  if (currency !== 'CRC') {
    logger.warn(`Unsupported currency: ${currency}, treating as USD`);
    return price;
  }
  
  try {
    const rate = await getExchangeRate('CRC', 'USD');
    const usdPrice = price / rate.rate;
    
    logger.debug(`Converted ${price} CRC to ${usdPrice} USD`, {
      originalPrice: price,
      currency,
      exchangeRate: rate.rate,
      convertedPrice: usdPrice
    });
    
    return Math.round(usdPrice * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    logger.error('Failed to convert price to USD', error, {
      price,
      currency
    });
    
    // Fallback: use approximate rate
    const fallbackRate = 500; // Approximate CRC to USD rate
    return Math.round((price / fallbackRate) * 100) / 100;
  }
}

/**
 * Get exchange rate from BCCR API with caching
 */
async function getExchangeRate(from: string, to: string): Promise<CurrencyRate> {
  const cacheKey = `${from}-${to}`;
  const cached = currencyCache.get(cacheKey);
  
  // Use cached rate if less than 1 hour old
  if (cached && Date.now() - new Date(cached.timestamp).getTime() < 3600000) {
    return cached;
  }
  
  const config = getConfig();
  
  try {
    // BCCR indicator 317 is USD exchange rate
    const url = `${config.bccr.baseUrl}?indicador=317&formato=json`;
    
    const response = await httpGet('bccr', url, {
      auth: {
        username: config.bccr.user,
        password: config.bccr.password
      }
    });
    
    // Parse BCCR response format
    const data = response.data;
    if (data && data.length > 0) {
      const latestRate = data[data.length - 1]; // Get most recent rate
      const rate: CurrencyRate = {
        from,
        to,
        rate: parseFloat(latestRate.valor),
        timestamp: new Date().toISOString()
      };
      
      currencyCache.set(cacheKey, rate);
      logger.debug(`Updated exchange rate ${from}/${to}`, rate);
      
      return rate;
    } else {
      throw new Error('Invalid response from BCCR API');
    }
  } catch (error) {
    logger.error('Failed to fetch exchange rate from BCCR', error, {
      from,
      to,
      endpoint: config.bccr.baseUrl
    });
    
    // Return cached rate even if expired, or default
    if (cached) {
      logger.warn('Using expired cached exchange rate', cached);
      return cached;
    }
    
    throw error;
  }
}

/**
 * Generate a unique listing ID using SHA-256
 */
export function generateId(source: string, externalId: string): string {
  const input = `${source}:${externalId}`;
  const hash = crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  
  logger.debug(`Generated ID for ${input}`, {
    source,
    externalId,
    generatedId: hash
  });
  
  return hash;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const deltaLatRad = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLngRad = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  
  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Normalize Costa Rican address for geocoding
 */
export function normalizeAddress(address: string): string {
  return address
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/,\s*Costa Rica$/i, '') // Remove trailing "Costa Rica"
    .replace(/,\s*CR$/i, '') // Remove trailing "CR"
    .replace(/\bCR\b/g, 'Costa Rica') // Expand CR to Costa Rica
    .replace(/\bSJ\b/g, 'San José') // Expand SJ to San José
    .replace(/\bProv\./g, 'Provincia') // Expand Prov. to Provincia
    .replace(/\bCantón\b/g, 'Canton') // Normalize Canton
    .trim();
}

/**
 * Extract province from address string
 */
export function extractProvince(address: string): string {
  const normalizedAddress = address.toLowerCase();
  
  const provinces = [
    'san josé', 'san jose', 'sj',
    'alajuela',
    'cartago',
    'heredia',
    'guanacaste',
    'puntarenas',
    'limón', 'limon'
  ];
  
  for (const province of provinces) {
    if (normalizedAddress.includes(province)) {
      // Return standardized province name
      switch (province) {
        case 'san josé':
        case 'san jose':
        case 'sj':
          return 'San José';
        case 'alajuela':
          return 'Alajuela';
        case 'cartago':
          return 'Cartago';
        case 'heredia':
          return 'Heredia';
        case 'guanacaste':
          return 'Guanacaste';
        case 'puntarenas':
          return 'Puntarenas';
        case 'limón':
        case 'limon':
          return 'Limón';
      }
    }
  }
  
  // Default to San José if no province found
  return 'San José';
}

/**
 * Parse price from text with various formats
 */
export function parsePrice(priceText: string): { amount: number; currency: string } | null {
  if (!priceText) return null;
  
  // Remove common formatting
  const cleaned = priceText
    .replace(/[,.\s]/g, '') // Remove separators initially
    .replace(/[$¢₡]/g, '') // Remove currency symbols
    .toUpperCase();
  
  // Extract numbers
  const numberMatch = priceText.match(/[\d,.]+([\d]{3})?/);
  if (!numberMatch) return null;
  
  // Parse the number properly
  let numberStr = numberMatch[0];
  let amount: number;
  
  // Handle different decimal/thousand separators
  if (numberStr.includes('.') && numberStr.includes(',')) {
    // Both separators - determine which is decimal
    const lastDot = numberStr.lastIndexOf('.');
    const lastComma = numberStr.lastIndexOf(',');
    
    if (lastDot > lastComma) {
      // Dot is decimal separator
      numberStr = numberStr.replace(/,/g, '');
    } else {
      // Comma is decimal separator
      numberStr = numberStr.replace(/\./g, '').replace(',', '.');
    }
  } else if (numberStr.includes(',')) {
    // Only comma - check if it's thousands or decimal
    const parts = numberStr.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal separator
      numberStr = numberStr.replace(',', '.');
    } else {
      // Likely thousands separator
      numberStr = numberStr.replace(/,/g, '');
    }
  }
  
  amount = parseFloat(numberStr);
  
  if (isNaN(amount)) return null;
  
  // Determine currency
  let currency = 'USD'; // Default
  
  if (priceText.includes('₡') || priceText.includes('¢') || 
      priceText.toUpperCase().includes('COL') || 
      priceText.toUpperCase().includes('CRC') ||
      amount > 100000) { // Likely CRC due to large amount
    currency = 'CRC';
  }
  
  logger.debug(`Parsed price: ${priceText} -> ${amount} ${currency}`, {
    originalText: priceText,
    parsedAmount: amount,
    detectedCurrency: currency
  });
  
  return { amount, currency };
}

/**
 * Sanitize HTML content to plain text
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .trim();
}

/**
 * Validate and normalize coordinates
 */
export function normalizeCoordinates(lat: any, lng: any): Coordinates | null {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }
  
  // Costa Rica bounds check
  if (latitude < 8.0 || latitude > 11.3 || longitude < -87.1 || longitude > -82.5) {
    logger.warn(`Coordinates outside Costa Rica bounds: ${latitude}, ${longitude}`);
    return null;
  }
  
  return {
    lat: Math.round(latitude * 1000000) / 1000000, // Round to 6 decimal places
    lng: Math.round(longitude * 1000000) / 1000000
  };
}

/**
 * Sleep for specified milliseconds (utility for rate limiting)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      logger.debug(`Retry attempt ${attempt} failed, waiting ${delayMs}ms`, {
        attempt,
        maxAttempts,
        delayMs,
        error: lastError.message
      });
      
      await sleep(delayMs);
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Chunk an array into smaller arrays of specified size
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Clear all caches (useful for testing)
 */
export function clearCaches(): void {
  currencyCache.clear();
  logger.debug('Cleared all utility caches');
}