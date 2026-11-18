import { VITE_API_BASE_URL } from '../api/config';

export type OAuthProviderId = 'google' | 'github';

export interface OAuthProvider {
  id: OAuthProviderId;
  label: string;
  path: string;
  enabled: boolean;
}

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    // TO BE CONFIRMED when the backend OAuth is built
    path: '/oauth2/authorization/google',
    enabled: false,
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    // TO BE CONFIRMED when the backend OAuth is built
    path: '/oauth2/authorization/github',
    enabled: false,
  },
];

/**
 * Initiates an OAuth redirection to the backend authorization endpoint.
 * Only executes when the provider's `enabled` flag is true.
 */
export const startOAuth = (providerId: OAuthProviderId): void => {
  const provider = OAUTH_PROVIDERS.find((p) => p.id === providerId);
  if (!provider || !provider.enabled) {
    return;
  }

  const base = VITE_API_BASE_URL.replace(/\/$/, '');
  const path = provider.path.startsWith('/') ? provider.path : `/${provider.path}`;
  window.location.assign(`${base}${path}`);
};
