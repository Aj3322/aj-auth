/**
 * Custom API Error Class
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  public readonly statusCode: number;
  public readonly data: null = null;
  public readonly success: false = false;
  public readonly errors: any[];
  public readonly timestamp: string;

  /**
   * Create an API Error instance
   * @param {number} statusCode - HTTP status code
   * @param {string} [message="Something went wrong"] - Error message
   * @param {Array<any>} [errors=[]] - Additional errors
   * @param {string} [stack=""] - Error stack trace
   */
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert to JSON format
   * @returns {object} - Standardized error response
   */
  toJSON(): {
    success: false;
    statusCode: number;
    message: string;
    errors: any[];
    timestamp: string;
    stack?: string;
  } {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

// TypeScript exports
export default ApiError;
export { ApiError };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiError;
  module.exports.default = ApiError;
  module.exports.ApiError = ApiError;
}