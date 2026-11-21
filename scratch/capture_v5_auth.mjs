/**
 * Captures V5 auth page screenshots using Playwright (via npx).
 * Run: node scratch/capture_v5_auth.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ARTIFACT_DIR =
  'C:/Users/shash/.gemini/antigravity/brain/76e7efa3-e4a8-4894-82da-c31786f46281';
const BASE = 'http://localhost:5173';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768',  width: 768,  height: 1024 },
  { name: '375',  width: 375,  height: 812 },
];

async function shot(page, name) {
  await page.waitForTimeout(400); // settle animations
  const file = path.join(ARTIFACT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();

    /* ── Login empty ─── */
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await shot(page, `v5-login-empty-${vp.name}`);

    /* ── Login with validation errors ─── */
    await page.click('button[type="submit"]');
    await page.waitForTimeout(200);
    await shot(page, `v5-login-errors-${vp.name}`);

    /* ── Signup empty ─── */
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
    await shot(page, `v5-signup-empty-${vp.name}`);

    /* ── Signup with validation errors ─── */
    await page.click('button[type="submit"]');
    await page.waitForTimeout(200);
    await shot(page, `v5-signup-errors-${vp.name}`);

    await ctx.close();
  }

  /* ── Server error state (login with bad creds) — 1440 only ─── */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();

    // Intercept the login API call and return a 401
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials.' }),
      })
    );

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(600);
    await shot(page, 'v5-server-error-1440');

    await ctx.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to', ARTIFACT_DIR);
})();
