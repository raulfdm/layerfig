import type { Request, Response, NextFunction } from 'express';
import type { TenantContext } from './types';
import { getTenantBySubdomain } from './data-store';
import { getTentantSettings } from './utils';

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

const tentantsSettings = getTentantSettings()

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
        ${tentantsSettings.map(t => `<li><a href="${t.url}">${t.url}</a></li>`).join('\n')}
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
        ${tentantsSettings.map(t => `<li><a href="${t.url}">${t.url}</a> (${t.name})</li>`).join('\n')}
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
  _req: Request,
  res: Response,
): void => {
  console.error('Error:', err);

  res.status(500).send(`
    <h1>Server Error</h1>
    <p>Something went wrong: ${err.message}</p>
    <a href="/">← Go Back</a>
  `);
};
