import { error } from '../utils/response.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const errors = result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return error(res, 'Validation failed', 400, errors);
      }

      // Replace body with parsed / transformed data (body is writable)
      if (result.data.body) req.body = result.data.body;

      // For query and params, merge onto req since they may be read-only in Express 5
      if (result.data.query) {
        req.parsedQuery = result.data.query;
      }
      if (result.data.params) {
        req.parsedParams = result.data.params;
      }

      next();
    } catch (err) {
      console.error('Validate middleware error:', err);
      return error(res, 'Validation error', 400);
    }
  };
};
