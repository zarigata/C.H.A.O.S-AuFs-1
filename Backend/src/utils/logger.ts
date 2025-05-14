/**
 * ██████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. LOGGING UTILITY                                █
 * █ Centralized logger for consistent application logging     █
 * ██████████████████████████████████████████████████████████████
 */

/**
 * [STRUCT] Logger implementation with colorized output
 * Extended to handle cross-platform console formatting and 
 * potentially send logs to external services in production
 */
class Logger {
  // [ANSI] Terminal color codes for visual differentiation
  private colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bright: {
      red: '\x1b[91m',
      green: '\x1b[92m',
      yellow: '\x1b[93m',
      blue: '\x1b[94m',
      magenta: '\x1b[95m',
      cyan: '\x1b[96m',
      white: '\x1b[97m',
    }
  };

  // [TIME] Timestamp generator for log entries
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // [UTIL] Format message with specified color
  private colorize(message: string, color: keyof typeof this.colors | string): string {
    // [CHECK] Handle nested color properties
    if (color.includes('.')) {
      const [group, specificColor] = color.split('.');
      // @ts-ignore - Dynamic access
      return `${this.colors[group][specificColor]}${message}${this.colors.reset}`;
    }
    
    // [STD] Handle direct color properties
    // @ts-ignore - Dynamic access
    return `${this.colors[color]}${message}${this.colors.reset}`;
  }

  /**
   * [API] Log informational message
   * Used for general application flow and status updates
   */
  info(message: string, ...args: any[]): void {
    const timestamp = this.colorize(`[${this.getTimestamp()}]`, 'cyan');
    const level = this.colorize('[INFO]', 'bright.green');
    console.log(`${timestamp} ${level} ${message}`, ...args);
  }

  /**
   * [API] Log warning message
   * Used for non-critical issues that don't impede functionality
   */
  warn(message: string, ...args: any[]): void {
    const timestamp = this.colorize(`[${this.getTimestamp()}]`, 'cyan');
    const level = this.colorize('[WARN]', 'yellow');
    console.warn(`${timestamp} ${level} ${message}`, ...args);
  }

  /**
   * [API] Log error message
   * Used for critical issues that affect functionality
   */
  error(message: string, ...args: any[]): void {
    const timestamp = this.colorize(`[${this.getTimestamp()}]`, 'cyan');
    const level = this.colorize('[ERROR]', 'bright.red');
    console.error(`${timestamp} ${level} ${message}`, ...args);
  }

  /**
   * [API] Log debug message
   * Only shown in development environment
   */
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = this.colorize(`[${this.getTimestamp()}]`, 'cyan');
      const level = this.colorize('[DEBUG]', 'magenta');
      console.debug(`${timestamp} ${level} ${message}`, ...args);
    }
  }
}

// [EXPORT] Singleton instance for application-wide use
export const logger = new Logger();
