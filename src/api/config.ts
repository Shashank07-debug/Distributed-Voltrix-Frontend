/**
 * Voltrix Centralized API Gateway Configuration
 * All API requests route through the gateway using prefix definitions below.
 */

export const VITE_API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '';

export const ACCOUNT_PREFIX: string = '/api/v1/account';
export const WORKSPACE_PREFIX: string = '/api/v1/workspace';
export const INTELLIGENCE_PREFIX: string = '/api/v1/intelligence';

export const getFullUrl = (prefix: string, endpointPath: string): string => {
  // Clean slash boundaries cleanly without removing literal '/api' segments in paths
  const base = VITE_API_BASE_URL.replace(/\/$/, '');
  const p = prefix.startsWith('/') ? prefix : `/${prefix}`;
  const e = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${base}${p}${e}`;
};
