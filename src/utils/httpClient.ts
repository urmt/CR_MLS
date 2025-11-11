/**
 * HTTP client with rate limiting, retries, and comprehensive logging
 * for Costa Rica MLS Real-Data Report Generator
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger } from './logger';
import { getConfig } from '../config';

const logger = createLogger('http-client');

interface RateLimiter {
  lastRequest: number;
  requestCount: number;
  windowStart: number;
}

class HttpClient {
  private clients: Map<string, AxiosInstance> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();

  /**
   * Get or create an axios instance for a specific service
   */
  private getClient(service: string): AxiosInstance {
    if (!this.clients.has(service)) {
      const config = getConfig();
      
      const client = axios.create({
        timeout: config.pipeline.timeoutMs,
        headers: {
          'User-Agent': 'Costa Rica MLS Real-Data Report Generator',
          'Accept': 'application/json, text/html, */*',
        },
      });

      // Add request interceptor for rate limiting
      client.interceptors.request.use(async (config) => {
        await this.enforceRateLimit(service);
        return config;
      });

      // Add response interceptor for logging
      client.interceptors.response.use(
        (response) => {
          logger.http(
            config.url || '',
            response.status,
            0, // Duration calculated elsewhere
            undefined,
            { service, responseSize: JSON.stringify(response.data).length }
          );
          return response;
        },
        (error) => {
          const status = error.response?.status || 0;
          const errorMessage = error.message || 'Unknown error';
          
          logger.http(
            error.config?.url || '',
            status,
            0,
            errorMessage,
            { service, errorType: error.code }
          );
          
          throw error;
        }
      );

      this.clients.set(service, client);
    }

    return this.clients.get(service)!;
  }

  /**
   * Enforce rate limiting for a specific service
   */
  private async enforceRateLimit(service: string): Promise<void> {
    const config = getConfig();
    const maxRequestsPerSecond = config.getRateLimit?.(service) || 1;
    
    if (!this.rateLimiters.has(service)) {
      this.rateLimiters.set(service, {
        lastRequest: 0,
        requestCount: 0,
        windowStart: Date.now()
      });
    }

    const limiter = this.rateLimiters.get(service)!;
    const now = Date.now();
    
    // Reset window if it's been more than 1 second
    if (now - limiter.windowStart >= 1000) {
      limiter.windowStart = now;
      limiter.requestCount = 0;
    }
    
    // If we've hit the rate limit, wait
    if (limiter.requestCount >= maxRequestsPerSecond) {
      const waitTime = 1000 - (now - limiter.windowStart);
      if (waitTime > 0) {
        logger.debug(`Rate limiting ${service}: waiting ${waitTime}ms`, {
          service,
          requestCount: limiter.requestCount,
          maxRequests: maxRequestsPerSecond
        });
        await this.sleep(waitTime);
        
        // Reset the window after waiting
        limiter.windowStart = Date.now();
        limiter.requestCount = 0;
      }
    }
    
    limiter.requestCount++;
    limiter.lastRequest = now;
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Perform an HTTP GET request with retries
   */
  async get<T = any>(
    service: string,
    url: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const client = this.getClient(service);
    const config = getConfig();
    const timer = logger.timer(`GET ${url}`);

    for (let attempt = 1; attempt <= config.pipeline.retryAttempts; attempt++) {
      try {
        const response = await client.get<T>(url, options);
        const duration = timer();
        
        logger.http(url, response.status, duration, undefined, {
          service,
          attempt,
          responseSize: JSON.stringify(response.data).length
        });
        
        return response;
      } catch (error) {
        const duration = timer();
        const isLastAttempt = attempt === config.pipeline.retryAttempts;
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status || 0;
          const errorMessage = error.message;
          
          logger.http(url, status, duration, errorMessage, {
            service,
            attempt,
            isLastAttempt,
            errorType: error.code
          });
          
          // Don't retry on 4xx errors (except 429 Too Many Requests)
          if (status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
          
          // If this isn't the last attempt, wait before retrying
          if (!isLastAttempt) {
            const backoffMs = attempt * 1000; // Linear backoff
            logger.debug(`Retrying ${url} in ${backoffMs}ms (attempt ${attempt + 1})`, {
              service,
              attempt,
              backoffMs,
              error: errorMessage
            });
            await this.sleep(backoffMs);
          } else {
            throw error;
          }
        } else {
          logger.error(`Non-Axios error in GET ${url}`, error, {
            service,
            attempt,
            isLastAttempt
          });
          if (isLastAttempt) {
            throw error;
          }
        }
      }
    }

    throw new Error(`Failed to GET ${url} after ${config.pipeline.retryAttempts} attempts`);
  }

  /**
   * Perform an HTTP POST request with retries
   */
  async post<T = any>(
    service: string,
    url: string,
    data?: any,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const client = this.getClient(service);
    const config = getConfig();
    const timer = logger.timer(`POST ${url}`);

    for (let attempt = 1; attempt <= config.pipeline.retryAttempts; attempt++) {
      try {
        const response = await client.post<T>(url, data, options);
        const duration = timer();
        
        logger.http(url, response.status, duration, undefined, {
          service,
          attempt,
          method: 'POST',
          requestSize: data ? JSON.stringify(data).length : 0,
          responseSize: JSON.stringify(response.data).length
        });
        
        return response;
      } catch (error) {
        const duration = timer();
        const isLastAttempt = attempt === config.pipeline.retryAttempts;
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status || 0;
          const errorMessage = error.message;
          
          logger.http(url, status, duration, errorMessage, {
            service,
            attempt,
            isLastAttempt,
            method: 'POST',
            errorType: error.code
          });
          
          // Don't retry on 4xx errors (except 429 Too Many Requests)
          if (status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
          
          if (!isLastAttempt) {
            const backoffMs = attempt * 1000;
            await this.sleep(backoffMs);
          } else {
            throw error;
          }
        } else {
          logger.error(`Non-Axios error in POST ${url}`, error, {
            service,
            attempt,
            isLastAttempt
          });
          if (isLastAttempt) {
            throw error;
          }
        }
      }
    }

    throw new Error(`Failed to POST ${url} after ${config.pipeline.retryAttempts} attempts`);
  }

  /**
   * Download a file (CSV, Excel, etc.) with proper handling
   */
  async downloadFile(
    service: string,
    url: string,
    options?: AxiosRequestConfig
  ): Promise<Buffer> {
    const client = this.getClient(service);
    const timer = logger.timer(`DOWNLOAD ${url}`);

    try {
      const response = await client.get(url, {
        ...options,
        responseType: 'arraybuffer'
      });
      
      const duration = timer();
      const buffer = Buffer.from(response.data);
      
      logger.http(url, response.status, duration, undefined, {
        service,
        method: 'DOWNLOAD',
        fileSize: buffer.length,
        contentType: response.headers['content-type']
      });
      
      return buffer;
    } catch (error) {
      const duration = timer();
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        logger.http(url, status, duration, error.message, {
          service,
          method: 'DOWNLOAD',
          errorType: error.code
        });
      }
      
      throw error;
    }
  }

  /**
   * Make a SOAP request (for Registro Nacional)
   */
  async soap(
    service: string,
    url: string,
    soapAction: string,
    xmlBody: string,
    headers?: Record<string, string>
  ): Promise<string> {
    const client = this.getClient(service);
    const timer = logger.timer(`SOAP ${url}`);

    try {
      const response = await client.post(url, xmlBody, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
          ...headers
        }
      });
      
      const duration = timer();
      
      logger.http(url, response.status, duration, undefined, {
        service,
        method: 'SOAP',
        soapAction,
        requestSize: xmlBody.length,
        responseSize: response.data.length
      });
      
      return response.data;
    } catch (error) {
      const duration = timer();
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        logger.http(url, status, duration, error.message, {
          service,
          method: 'SOAP',
          soapAction,
          errorType: error.code
        });
      }
      
      throw error;
    }
  }

  /**
   * Get rate limiting statistics for monitoring
   */
  getRateLimitStats(): Record<string, { requestCount: number; windowStart: number }> {
    const stats: Record<string, any> = {};
    
    for (const [service, limiter] of this.rateLimiters.entries()) {
      stats[service] = {
        requestCount: limiter.requestCount,
        windowStart: limiter.windowStart,
        timeSinceWindow: Date.now() - limiter.windowStart
      };
    }
    
    return stats;
  }

  /**
   * Clear all rate limiters (useful for testing)
   */
  clearRateLimiters(): void {
    this.rateLimiters.clear();
  }
}

// Singleton instance
export const httpClient = new HttpClient();

// Convenience functions
export async function httpGet<T = any>(
  service: string,
  url: string,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return httpClient.get<T>(service, url, options);
}

export async function httpPost<T = any>(
  service: string,
  url: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return httpClient.post<T>(service, url, data, options);
}

export async function downloadFile(
  service: string,
  url: string,
  options?: AxiosRequestConfig
): Promise<Buffer> {
  return httpClient.downloadFile(service, url, options);
}

export async function soapRequest(
  service: string,
  url: string,
  soapAction: string,
  xmlBody: string,
  headers?: Record<string, string>
): Promise<string> {
  return httpClient.soap(service, url, soapAction, xmlBody, headers);
}