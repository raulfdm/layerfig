import type { Request, Response, NextFunction } from 'express';
import type { TenantContext } from './types';
import { getTenantById, getTenantBySubdomain } from './data-store';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Try to get tenant from header first
  const tenantIdHeader = req.headers['x-tenant-id'] as string;

  let tenant;

  if (tenantIdHeader) {
    tenant = getTenantById(tenantIdHeader);
  } else {
    // Try to get tenant from subdomain
    const host = req.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];

      if(!subdomain){
        res.status(400).json({
          error: 'Tenant not found',
          message: 'Please provide a valid tenant ID in X-Tenant-ID header or use a valid subdomain',
        });
        return;
      }

      tenant = getTenantBySubdomain(subdomain);
    }
  }

  if (!tenant) {
    res.status(400).json({
      error: 'Tenant not found',
      message: 'Please provide a valid tenant ID in X-Tenant-ID header or use a valid subdomain',
    });
    return;
  }

  req.tenantContext = {
    tenantId: tenant.id,
    tenant,
  };

  next();
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};
