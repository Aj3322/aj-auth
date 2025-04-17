/**
 * Standard API response format for consistent API responses
 * @class ApiResponse
 * @template T - Type of the data payload
 */
export class ApiResponse<T = any> {
  public readonly statusCode: number;
  public readonly data: T;
  public readonly message: string;
  public readonly success: boolean;
  public readonly timestamp: string;

  /**
   * Create a standardized API response
   * @param {number} statusCode - HTTP status code
   * @param {T} data - Response payload
   * @param {string} [message="Success"] - Human-readable message
   */
  constructor(statusCode: number, data: T, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Convert to plain object for JSON serialization
   * @returns {object} Plain object representation
   */
  public toJSON(): {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
  } {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

// Dual export pattern for npm package compatibility
export default ApiResponse;

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiResponse;
  module.exports.default = ApiResponse;
  module.exports.ApiResponse = ApiResponse;
}