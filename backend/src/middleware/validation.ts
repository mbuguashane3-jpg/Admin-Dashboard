import Joi from 'joi';
import type { Request, Response, NextFunction } from 'express';

export function validateRequest(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => void | Response {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
}

export const commonSchemas = {
  ticket: Joi.object({
    customer: Joi.string().required().min(1).max(100),
    issue: Joi.string().required().min(1).max(500),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').required()
  }),
  
  queryParams: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};
