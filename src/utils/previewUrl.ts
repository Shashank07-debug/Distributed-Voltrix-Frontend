/**
 * Normalizes preview URLs for Voltrix deployments.
 *
 * Rules:
 * 1. Parse with new URL().
 * 2. For any host ending in .usevoltrix.xyz, remove the port (:8090, etc.),
 *    force https, and drop trailing slashes/junk.
 * 3. Never hardcode any project ID (keeps dynamic subdomain).
 * 4. Wrapped in try/catch and returns input unchanged if not a valid URL.
 */
export function normalizePreviewUrl(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  try {
    const urlToParse = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlToParse);

    if (parsed.hostname.endsWith('.usevoltrix.xyz') || parsed.hostname === 'usevoltrix.xyz') {
      parsed.protocol = 'https:';
      parsed.port = '';
      if (parsed.pathname === '/' && !parsed.search && !parsed.hash) {
        return `https://${parsed.hostname}`;
      }
      return parsed.toString().replace(/\/$/, '');
    }

    return parsed.toString();
  } catch {
    return raw;
  }
}
