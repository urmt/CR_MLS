/**
 * Configuration system for Costa Rica MLS Real-Data Report Generator
 * Reads secrets from GitHub Actions environment or local .env file
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  // BCCR (Central Bank of Costa Rica) API credentials
  bccr: {
    user: string;
    password: string;
    baseUrl: string;
    rateLimit: number; // requests per second
  };
  
  // Registro Nacional credentials for property ownership lookup
  registroNacional: {
    cert: string; // base64 PEM certificate
    token: string;
    baseUrl: string;
    rateLimit: number;
  };
  
  // Municipal API tokens for various cantons
  municipal: {
    sanJose?: string;
    escazu?: string;
    santaAna?: string;
    rateLimit: number;
  };
  
  // Data source configurations
  sources: {
    encuentra24: {
      baseUrl: string;
      rateLimit: number;
      maxPages: number;
    };
    craigslist: {
      baseUrl: string;
      rateLimit: number;
      maxListings: number;
    };
  };
  
  // External services
  external: {
    moptArcgis: string; // MOPT flood risk service
    minaeDataUrl: string; // MINAE energy efficiency data
    rateLimit: number;
  };
  
  // Pipeline configuration
  pipeline: {
    maxConcurrency: number;
    timeoutMs: number;
    retryAttempts: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

class ConfigManager {
  private config: Config | null = null;

  /**
   * Get configuration, loading it if not already loaded
   */
  public getConfig(): Config {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): Config {
    // Load from .env file if it exists (for local development)
    this.loadEnvFile();

    return {
      bccr: {
        user: this.getEnvVar('BCCR_API_USER'),
        password: this.getEnvVar('BCCR_API_PASS'),
        baseUrl: 'https://gee.bccr.fi.cr/indicadores-economicos/servicio-web',
        rateLimit: 2 // Conservative rate limit for BCCR
      },
      
      registroNacional: {
        cert: this.getEnvVar('REGISTRO_NACIONAL_CERT'),
        token: this.getEnvVar('REGISTRO_NACIONAL_TOKEN'),
        baseUrl: 'http://www.registronacional.go.cr/wsdl/PropertyService',
        rateLimit: 1 // Very conservative for government service
      },
      
      municipal: {
        sanJose: process.env.SANJOSE_OPENDATA_TOKEN,
        escazu: process.env.ESCAZU_OPENDATA_TOKEN,
        santaAna: process.env.SANTAANA_OPENDATA_TOKEN,
        rateLimit: 3
      },
      
      sources: {
        encuentra24: {
          baseUrl: 'https://api.encuentra24.com/v1',
          rateLimit: 5,
          maxPages: 50
        },
        craigslist: {
          baseUrl: 'https://costa-rica.craigslist.org',
          rateLimit: 2, // Be respectful to Craigslist
          maxListings: 200
        }
      },
      
      external: {
        moptArcgis: 'https://arcgis.mopt.go.cr/arcgis/rest/services/RiesgoInundacion/MapServer/0/query',
        minaeDataUrl: 'https://data.go.cr/dataset/edificios-verdes-minae/resource/edificios_verdes.csv',
        rateLimit: 3
      },
      
      pipeline: {
        maxConcurrency: 10,
        timeoutMs: 30000,
        retryAttempts: 3,
        logLevel: (process.env.LOG_LEVEL as any) || 'info'
      }
    };
  }

  /**
   * Load .env file for local development
   */
  private loadEnvFile(): void {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=');
            process.env[key.trim()] = value.trim();
          }
        }
      }
    }
  }

  /**
   * Get required environment variable with validation
   */
  private getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set. Please configure it in GitHub Secrets or .env file.`);
    }
    return value;
  }

  /**
   * Validate all required configuration is present
   */
  public validateConfig(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    try {
      const config = this.getConfig();
      
      // Check required secrets
      if (!config.bccr.user) missing.push('BCCR_API_USER');
      if (!config.bccr.password) missing.push('BCCR_API_PASS');
      if (!config.registroNacional.cert) missing.push('REGISTRO_NACIONAL_CERT');
      if (!config.registroNacional.token) missing.push('REGISTRO_NACIONAL_TOKEN');
      
      return {
        valid: missing.length === 0,
        missing
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Required environment variable')) {
        const varName = error.message.match(/Required environment variable (\w+)/)?.[1];
        if (varName) missing.push(varName);
      }
      
      return {
        valid: false,
        missing
      };
    }
  }

  /**
   * Get rate limiter settings for a specific service
   */
  public getRateLimit(service: string): number {
    const config = this.getConfig();
    
    switch (service) {
      case 'bccr': return config.bccr.rateLimit;
      case 'registro-nacional': return config.registroNacional.rateLimit;
      case 'municipal': return config.municipal.rateLimit;
      case 'encuentra24': return config.sources.encuentra24.rateLimit;
      case 'craigslist': return config.sources.craigslist.rateLimit;
      case 'external': return config.external.rateLimit;
      default: return 1; // Conservative default
    }
  }
}

// Singleton instance
export const configManager = new ConfigManager();

// Convenience function
export function getConfig(): Config {
  return configManager.getConfig();
}

// Export for testing
export { ConfigManager };