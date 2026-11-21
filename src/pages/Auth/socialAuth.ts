/**
 * socialAuth.ts — Social OAuth handler stubs.
 *
 * Both providers are in "coming soon" mode.
 * When the backend supports OAuth, replace the toast calls here with
 * the real startOAuth(providerId) call from src/config/oauth.ts.
 *
 * PROTECTED: do NOT modify src/config/oauth.ts or src/api/auth.ts.
 */
import { toast } from 'sonner';

export type SocialProvider = 'github' | 'google';

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  github: 'GitHub',
  google: 'Google',
};

/**
 * Trigger the social sign-in flow for the given provider.
 * Currently shows a "coming soon" toast. Wire real OAuth here later.
 */
export function triggerSocialAuth(provider: SocialProvider): void {
  const label = PROVIDER_LABELS[provider];
  toast(`${label} login is coming soon.`, {
    description: "We're working on it. Use email for now.",
    duration: 3000,
    position: 'bottom-center',
  });
}
