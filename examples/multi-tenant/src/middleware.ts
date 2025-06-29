import type { Request, Response, NextFunction } from 'express';
import type { TenantContext } from './types.js';
import { getTenantBySubdomain } from './data-store.js';

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
  const host = req.headers.host;

  if (!host) {
    res.status(400).send(`
      <h1>Invalid Request</h1>
      <p>No host header found. Please access via subdomain:</p>
      <ul>
        <li><a href="http://acme.localhost:3000">acme.localhost:3000</a></li>
        <li><a href="http://beta.localhost:3000">beta.localhost:3000</a></li>
      </ul>
    `);
    return;
  }

  // Extract subdomain (everything before the first dot, or the whole host if no dots)
  const subdomain = host.split('.')[0];

  // For localhost development, handle both localhost:3000 and subdomain.localhost:3000
  let tenant;
  if (host.includes('localhost')) {
    tenant = getTenantBySubdomain(subdomain!);
  }

  if (!tenant) {
    res.status(404).send(`
      <h1>Tenant Not Found</h1>
      <p>No tenant found for subdomain: <strong>${subdomain}</strong></p>
      <p>Available tenants:</p>
      <ul>
        <li><a href="http://acme.localhost:3000">acme.localhost:3000</a> (Acme Corp)</li>
        <li><a href="http://beta.localhost:3000">beta.localhost:3000</a> (Beta Industries)</li>
      </ul>
      <p><small>Make sure to add these entries to your /etc/hosts file for local development</small></p>
    `);
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

  res.status(500).send(`
    <h1>Server Error</h1>
    <p>Something went wrong: ${err.message}</p>
    <a href="/">← Go Back</a>
  `);
};
