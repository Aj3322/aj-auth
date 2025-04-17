import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from './appError';

/**
 * Wrapper for async route handlers that provides proper error handling
 * @template T - Type of the request body
 * @template U - Type of the response body
 * @param {Function} fn - Async route handler function
 * @returns {RequestHandler} Wrapped middleware function with proper error handling
 */
function catchAsync<T = any, U = any>(
  fn: (req: Request<T>, res: Response<U>, next: NextFunction) => Promise<any>
): RequestHandler<T, U> {
  return (req: Request<T>, res: Response<U>, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: Error) => {
      // Enhance error with request context
      if (err instanceof ApiError) {
        err = Object.assign(err, {
          requestContext: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
            body: req.body,
            ip: req.ip,
            headers: {
              'user-agent': req.get('user-agent'),
              referer: req.get('referer')
            }
          }
        });
      } else {
        // Convert to ApiError if not already
        err = new ApiError(
          500, 
          err.message, 
          [], 
          err.stack
        );
        Object.assign(err, {
          requestContext: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
            body: req.body
          }
        });
      }
      next(err);
    });
  };
}

// TypeScript exports
export default catchAsync;
export { catchAsync };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = catchAsync;
  module.exports.default = catchAsync;
}