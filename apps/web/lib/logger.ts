/**
 * Enterprise-level logging solution for Xevon AI
 * Provides structured logging with multiple levels, context tracking, and observability
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  stack?: string;
  timestamp: string;
  environment: string;
  service: string;
  version: string;
}

class Logger {
  private readonly environment: string;
  private readonly service: string;
  private readonly version: string;
  private readonly minLogLevel: LogLevel;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.service = 'xevon-ai';
    this.version = process.env.npm_package_version || '1.0.0';
    this.minLogLevel = this.getMinLogLevel();
  }

  private getMinLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    switch (envLevel) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      case 'fatal': return LogLevel.FATAL;
      default: return this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLogLevel;
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.environment !== 'production') {
      // Pretty, human-readable format for development/staging
      return this.formatPrettyLog(entry);
    } else {
      // JSON format for production (structured logging)
      return JSON.stringify(entry);
    }
  }

  private formatPrettyLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    // Color codes for different log levels
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m', // Magenta
    };
    
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const dim = '\x1b[2m';
    
    const levelColor = colors[entry.level] || '';
    const levelName = LogLevel[entry.level].padEnd(5);
    
    // Format the main log line
    let logLine = `${dim}${timestamp}${reset} ${levelColor}${bold}${levelName}${reset} ${entry.message}`;
    
    // Add context in a readable format
    if (Object.keys(entry.context).length > 0) {
      const contextEntries = Object.entries(entry.context)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          // Format different types of values nicely
          let formattedValue: string;
          if (typeof value === 'object' && value !== null) {
            formattedValue = JSON.stringify(value);
            if (formattedValue.length > 50) {
              formattedValue = formattedValue.substring(0, 47) + '...';
            }
          } else {
            formattedValue = String(value);
          }
          return `${dim}${key}${reset}=${bold}${formattedValue}${reset}`;
        });
      
      if (contextEntries.length > 0) {
        // Group related context fields
        const importantFields = ['requestId', 'userId', 'method', 'route', 'statusCode', 'duration'];
        const important = contextEntries.filter(entry => 
          importantFields.some(field => entry.includes(`${field}=`))
        );
        const other = contextEntries.filter(entry => 
          !importantFields.some(field => entry.includes(`${field}=`))
        );
        
        if (important.length > 0) {
          logLine += `\n  ${dim}├─${reset} ${important.join(` ${dim}│${reset} `)}`;
        }
        
        if (other.length > 0) {
          const chunks = this.chunkArray(other, 3); // Group in chunks of 3
          chunks.forEach((chunk, index) => {
            const isLast = index === chunks.length - 1;
            const prefix = isLast ? '└─' : '├─';
            logLine += `\n  ${dim}${prefix}${reset} ${chunk.join(` ${dim}│${reset} `)}`;
          });
        }
      }
    }
    
    // Add error stack trace if present
    if (entry.error && entry.stack) {
      logLine += `\n${dim}Error Stack:${reset}\n${entry.stack
        .split('\n')
        .map(line => `  ${dim}│${reset} ${line}`)
        .join('\n')}`;
    }
    
    return logLine;
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
      },
      error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      service: this.service,
      version: this.version,
    };
  }

  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);
    const formattedMessage = this.formatLogEntry(entry);

    // Output to appropriate stream based on level
    if (level >= LogLevel.ERROR) {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    // In production, you might want to send logs to external services
    // This is where you'd integrate with services like:
    // - DataDog, New Relic, Sentry
    // - CloudWatch, Google Cloud Logging
    // - ELK Stack, Grafana Loki
    if (this.environment === 'production') {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(_entry: LogEntry): void {
    // Placeholder for external logging service integration
    // Example integrations:
    
    // Sentry for error tracking
    // if (entry.level >= LogLevel.ERROR && entry.error) {
    //   Sentry.captureException(entry.error, {
    //     contexts: { custom: entry.context },
    //     level: entry.level >= LogLevel.FATAL ? 'fatal' : 'error'
    //   });
    // }

    // DataDog logs
    // if (process.env.DATADOG_API_KEY) {
    //   // Send to DataDog
    // }
  }

  // Public logging methods
  debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Specialized logging methods
  request(message: string, req: Request, context: LogContext = {}): void {
    const url = new URL(req.url);
    this.info(message, {
      ...context,
      method: req.method,
      route: url.pathname,
      query: url.search,
      userAgent: req.headers.get('user-agent') || undefined,
    });
  }

  response(message: string, status: number, duration: number, context: LogContext = {}): void {
    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, message, {
      ...context,
      statusCode: status,
      duration,
    });
  }

  webhook(message: string, eventType: string, context: LogContext = {}): void {
    this.info(message, {
      ...context,
      eventType,
      webhookType: 'incoming',
    });
  }

  security(message: string, context: LogContext = {}, error?: Error): void {
    this.warn(`[SECURITY] ${message}`, context, error);
  }

  performance(message: string, duration: number, context: LogContext = {}): void {
    const level = duration > 5000 ? LogLevel.WARN : duration > 1000 ? LogLevel.INFO : LogLevel.DEBUG;
    this.log(level, message, {
      ...context,
      duration,
      metric: 'performance',
    });
  }

  // Utility methods for creating child loggers with persistent context
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, childContext: LogContext = {}, error?: Error) => {
      originalLog(level, message, { ...context, ...childContext }, error);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Request ID generation utility
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Context extraction utilities
export function extractRequestContext(req: Request): LogContext {
  const url = new URL(req.url);
  return {
    method: req.method,
    route: url.pathname,
    query: url.search || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
    contentType: req.headers.get('content-type') || undefined,
  };
}

export function sanitizePayload(payload: unknown, maxLength: number = 1000): unknown {
  if (typeof payload === 'string') {
    return payload.length > maxLength ? `${payload.substring(0, maxLength)}...` : payload;
  }
  
  if (typeof payload === 'object' && payload !== null) {
    const str = JSON.stringify(payload);
    if (str.length > maxLength) {
      // Return a safe truncated representation instead of trying to parse malformed JSON
      return `[Object: ${str.substring(0, maxLength)}...]`;
    }
    return payload;
  }
  
  return payload;
}