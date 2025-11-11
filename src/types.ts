/**
 * Core data types for Costa Rica MLS Real-Data Report Generator
 */

// Core property listing structure
export interface PropertyListing {
  // Core identification
  listing_id: string; // SHA-256 hash of source + external ID
  source: 'encuentra24' | 'craigslist' | 'lamudi';
  external_id: string; // Original ID from the source
  
  // Basic property information
  title: string;
  description?: string;
  price_usd: number;
  price_currency: 'USD' | 'CRC';
  price_original: number;
  
  // Location data
  address: string;
  province: string;
  canton?: string;
  district?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Property details
  property_type: 'house' | 'apartment' | 'land' | 'commercial' | 'vacation_rental' | 'other';
  bedrooms?: number;
  bathrooms?: number;
  area_m2?: number;
  lot_size_m2?: number;
  parking_spaces?: number;
  
  // Media
  images: string[];
  virtual_tour_url?: string;
  
  // Listing metadata
  listed_date: string;
  scraped_at: string;
  last_updated: string;
  
  // Enriched data from external sources
  enrichment: PropertyEnrichment;
}

// Enriched data from various Costa Rican data sources
export interface PropertyEnrichment {
  // Registro Nacional data
  registro_nacional?: {
    cadastral_number?: string;
    owner_name?: string;
    title_status?: 'clear' | 'encumbered' | 'disputed' | 'unknown';
    last_updated: string;
    error?: string;
  };
  
  // Municipal tax information
  municipal_tax?: {
    valor_catastral?: number; // Cadastral value in CRC
    impuesto_territorial?: number; // Annual property tax in CRC
    luxury_tax_applicable?: boolean;
    payment_status?: 'current' | 'delinquent' | 'unknown';
    last_updated: string;
    error?: string;
  };
  
  // School proximity data
  schools?: {
    nearest_public_school?: {
      name: string;
      distance_km: number;
      quality_rating?: number; // 1-10 if available
    };
    nearest_private_school?: {
      name: string;
      distance_km: number;
      quality_rating?: number;
    };
    last_updated: string;
    error?: string;
  };
  
  // Flood risk assessment
  flood_risk?: {
    risk_level: 'low' | 'medium' | 'high' | 'unknown';
    zone_classification?: string;
    historical_events?: number; // Count of past flood events
    last_updated: string;
    error?: string;
  };
  
  // Energy efficiency certification
  energy_efficiency?: {
    certified: boolean;
    certification_level?: 'A' | 'B' | 'C' | 'D' | 'E';
    certification_date?: string;
    certifying_body?: string;
    last_updated: string;
    error?: string;
  };
  
  // HOA/Condominium fees
  hoa_fees?: {
    monthly_fee_usd?: number;
    monthly_fee_crc?: number;
    amenities?: string[];
    management_company?: string;
    last_updated: string;
    error?: string;
  };
  
  // Market data from BCCR
  market_data?: {
    market_price_index?: number; // Current housing price index
    average_mortgage_rate_percent?: number; // Current average mortgage rate
    price_trend_12_months?: number; // Percentage change in area prices
    exchange_rate_usd_crc?: number; // Current USD to CRC exchange rate
    last_updated: string;
    error?: string;
  };
}

// Raw listing data from sources (before enrichment)
export interface RawListing {
  source: 'encuentra24' | 'craigslist' | 'lamudi';
  external_id: string;
  url: string;
  title: string;
  description?: string;
  price_text: string;
  price_amount?: number;
  price_currency?: string;
  location_text: string;
  images: string[];
  metadata: Record<string, any>; // Source-specific fields
  scraped_at: string;
}

// Configuration for enrichment modules
export interface EnrichmentConfig {
  enabled: boolean;
  timeout_ms: number;
  retry_attempts: number;
  cache_ttl_hours?: number;
}

// Pipeline statistics
export interface PipelineStats {
  run_id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  
  // Source statistics
  sources: {
    encuentra24: {
      listings_found: number;
      listings_processed: number;
      errors: number;
    };
    craigslist: {
      listings_found: number;
      listings_processed: number;
      errors: number;
    };
  };
  
  // Enrichment statistics
  enrichment: {
    [key: string]: {
      attempted: number;
      successful: number;
      failed: number;
      avg_duration_ms: number;
    };
  };
  
  // Final results
  results: {
    total_listings: number;
    new_listings: number;
    updated_listings: number;
    removed_listings: number;
    pdfs_generated: number;
  };
}

// Error tracking
export interface EnrichmentError {
  listing_id: string;
  enrichment_step: string;
  error_message: string;
  error_code?: string;
  timestamp: string;
  retry_count: number;
}

// Utility types for price conversion
export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

// Geographic utilities
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// School data structure
export interface School {
  name: string;
  type: 'public' | 'private';
  coordinates: Coordinates;
  quality_rating?: number;
  student_count?: number;
  grades?: string;
}

// Municipality data
export interface Municipality {
  name: string;
  canton: string;
  province: string;
  open_data_portal?: string;
  tax_data_url?: string;
  zoning_data_url?: string;
}

// Type guards for validation
export function isValidPropertyListing(obj: any): obj is PropertyListing {
  return (
    typeof obj === 'object' &&
    typeof obj.listing_id === 'string' &&
    typeof obj.source === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price_usd === 'number' &&
    typeof obj.address === 'string' &&
    Array.isArray(obj.images) &&
    typeof obj.scraped_at === 'string' &&
    typeof obj.enrichment === 'object'
  );
}

export function isValidCoordinates(obj: any): obj is Coordinates {
  return (
    typeof obj === 'object' &&
    typeof obj.lat === 'number' &&
    typeof obj.lng === 'number' &&
    obj.lat >= -90 && obj.lat <= 90 &&
    obj.lng >= -180 && obj.lng <= 180
  );
}

// Constants
export const COSTA_RICA_PROVINCES = [
  'San José',
  'Alajuela',
  'Cartago',
  'Heredia',
  'Guanacaste',
  'Puntarenas',
  'Limón'
] as const;

export const PROPERTY_TYPES = [
  'house',
  'apartment', 
  'land',
  'commercial',
  'vacation_rental',
  'other'
] as const;

export const RISK_LEVELS = ['low', 'medium', 'high', 'unknown'] as const;

export type Province = typeof COSTA_RICA_PROVINCES[number];
export type PropertyType = typeof PROPERTY_TYPES[number];
export type RiskLevel = typeof RISK_LEVELS[number];