import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Express middleware to validate request against Zod schema.
 * @param schema Zod schema for validation
 */
export const validateRequest = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors
        });
      } else {
        next(error);
      }
    }
  };

// Named + Default Export for compatibility with ESM and CommonJS
const exported = {
  validateRequest,
};

export default exported;

// CommonJS fallback
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exported;
  module.exports.default = exported;
}
