/**
 * Structured logging system for Costa Rica MLS Real-Data Report Generator
 * Writes JSON lines to logs/run-<timestamp>.log for complete audit trail
 */

import * as fs from 'fs';
import * as path from 'path';
import { getConfig } from '../config';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source?: string;
  endpoint?: string;
  status?: number;
  error?: string;
  message: string;
  metadata?: Record<string, any>;
  duration?: number;
}

export class Logger {
  private logFilePath: string;
  private runId: string;
  private startTime: number;

  constructor() {
    this.runId = Date.now().toString();
    this.startTime = Date.now();
    this.logFilePath = path.join(process.cwd(), 'logs', `run-${this.runId}.log`);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Log the start of the run
    this.info('Pipeline started', {
      runId: this.runId,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    });
  }

  /**
   * Log a debug message
   */
  public debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log an info message
   */
  public info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log an error message
   */
  public error(message: string, error?: Error | string, metadata?: Record<string, any>): void {
    const errorString = error instanceof Error ? error.message : error;
    const errorMetadata = error instanceof Error ? {
      stack: error.stack,
      name: error.name,
      ...metadata
    } : metadata;
    
    this.log('error', message, errorMetadata, errorString);
  }

  /**
   * Log an HTTP request/response
   */
  public http(
    source: string, 
    endpoint: string, 
    status: number, 
    duration: number,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const message = `HTTP ${source} ${endpoint} - ${status}`;
    
    this.log(level, message, {
      source,
      endpoint,
      status,
      duration,
      error,
      ...metadata
    });
  }

  /**
   * Log an enrichment step
   */
  public enrichment(
    step: string,
    propertyId: string,
    success: boolean,
    duration: number,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const level = success ? 'info' : 'warn';
    const message = `Enrichment ${step} for ${propertyId}: ${success ? 'SUCCESS' : 'FAILED'}`;
    
    this.log(level, message, {
      enrichmentStep: step,
      propertyId,
      success,
      duration,
      error,
      ...metadata
    });
  }

  /**
   * Log pipeline statistics
   */
  public stats(message: string, stats: Record<string, any>): void {
    this.info(message, {
      statistics: stats,
      pipelineDuration: Date.now() - this.startTime
    });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogEntry['level'], 
    message: string, 
    metadata?: Record<string, any>,
    error?: string
  ): void {
    const config = getConfig();
    
    // Skip debug logs if log level is higher
    if (level === 'debug' && config.pipeline.logLevel !== 'debug') {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };
    
    if (error) {
      entry.error = error;
    }

    const jsonLine = JSON.stringify(entry) + '\n';
    
    // Write to file
    fs.appendFileSync(this.logFilePath, jsonLine, 'utf8');
    
    // Also write to console for immediate feedback
    const consoleMessage = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;
    if (level === 'error') {
      console.error(consoleMessage, error || '');
    } else if (level === 'warn') {
      console.warn(consoleMessage);
    } else {
      console.log(consoleMessage);
    }
  }

  /**
   * Get the current log file path
   */
  public getLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * Get the current run ID
   */
  public getRunId(): string {
    return this.runId;
  }

  /**
   * Create a timer function for measuring duration
   */
  public timer(name: string): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`Timer ${name}: ${duration}ms`, { duration, timerName: name });
      return duration;
    };
  }

  /**
   * Create a scoped logger for a specific source
   */
  public scope(source: string): ScopedLogger {
    return new ScopedLogger(this, source);
  }

  /**
   * Close the logger and write final stats
   */
  public close(): void {
    const totalDuration = Date.now() - this.startTime;
    this.info('Pipeline completed', {
      runId: this.runId,
      totalDuration,
      logFile: this.logFilePath
    });
  }
}

/**
 * Scoped logger that automatically adds source context
 */
export class ScopedLogger {
  constructor(private logger: Logger, private source: string) {}

  public debug(message: string, metadata?: Record<string, any>): void {
    this.logger.debug(message, { source: this.source, ...metadata });
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.logger.info(message, { source: this.source, ...metadata });
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(message, { source: this.source, ...metadata });
  }

  public error(message: string, error?: Error | string, metadata?: Record<string, any>): void {
    this.logger.error(message, error, { source: this.source, ...metadata });
  }

  public http(
    endpoint: string, 
    status: number, 
    duration: number,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    this.logger.http(this.source, endpoint, status, duration, error, metadata);
  }

  public enrichment(
    step: string,
    propertyId: string,
    success: boolean,
    duration: number,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    this.logger.enrichment(step, propertyId, success, duration, error, { source: this.source, ...metadata });
  }

  public timer(name: string): () => number {
    return this.logger.timer(`${this.source}:${name}`);
  }
}

// Global logger instance
let globalLogger: Logger | null = null;

/**
 * Get the global logger instance
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

/**
 * Create a scoped logger for a specific source
 */
export function createLogger(source: string): ScopedLogger {
  return getLogger().scope(source);
}

/**
 * Close the global logger
 */
export function closeLogger(): void {
  if (globalLogger) {
    globalLogger.close();
    globalLogger = null;
  }
}