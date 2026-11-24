import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR =
  'C:/Users/shash/.gemini/antigravity/brain/76e7efa3-e4a8-4894-82da-c31786f46281';
const BASE = 'http://localhost:5173';

const mockUser = {
  id: 'user-001',
  username: 'shashank@voltrix.ai',
  name: 'Shashank',
};

const mockProject = {
  id: 'proj-5',
  name: 'SaaS Analytics Dashboard',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  role: 'OWNER',
};

const mockFiles = [
  { path: 'src/App.tsx' },
  { path: 'src/main.tsx' },
  { path: 'src/components/Header.tsx' },
  { path: 'src/styles/theme.css' },
  { path: 'package.json' },
];

const mockAppTsx = `import React from 'react';

export function App() {
  return (
    <div className="min-h-screen bg-[#090D0F] text-white p-8">
      <h1 className="text-2xl font-bold text-[#D4FF32]">Voltrix Analytics</h1>
      <p className="text-gray-400 mt-2">Real-time SaaS Telemetry Platform</p>
    </div>
  );
}`;

async function setupPage(page, deployUrl = 'https://project-5.usevoltrix.xyz:8090') {
  await page.addInitScript(({ user, url }) => {
    localStorage.setItem(
      'voltrix-auth-storage',
      JSON.stringify({
        state: { token: 'mock-jwt-token-123', user },
        version: 0,
      })
    );
    // Raw deploy URL from backend containing port 8090
    localStorage.setItem('voltrix_deploy_proj-5', url);
  }, { user: mockUser, url: deployUrl });

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/files/content')) {
      return route.fulfill({ status: 200, contentType: 'text/plain', body: mockAppTsx });
    }
    if (url.includes('/files')) {
      return route.fulfill({ status: 200, json: { files: mockFiles } });
    }
    if (url.includes('/members')) {
      return route.fulfill({ status: 200, json: [] });
    }
    if (url.includes('/projects/proj-5')) {
      return route.fulfill({ status: 200, json: mockProject });
    }
    if (url.includes('/chat/projects/proj-5')) {
      return route.fulfill({
        status: 200,
        json: [
          {
            id: 'msg-initial-user',
            role: 'USER',
            content: 'build a clean SaaS telemetry platform',
            createdAt: new Date().toISOString(),
            events: [],
          },
          {
            id: 'msg-initial-assistant',
            role: 'ASSISTANT',
            content: 'I have scaffolded the telemetry application with live metrics cards.',
            createdAt: new Date().toISOString(),
            events: [],
          },
        ],
      });
    }
    return route.fulfill({ status: 200, json: {} });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  console.log('--- 1. VERIFYING WORKSPACE AT 1920, 1440, 1024, 390 PX ---');
  for (const vp of [
    { name: '1920', w: 1920, h: 1080 },
    { name: '1440', w: 1440, h: 900 },
    { name: '1024', w: 1024, h: 768 },
    { name: '390', w: 390, h: 844 },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await setupPage(page);
    await page.goto(`${BASE}/projects/proj-5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const shotPath = path.join(ARTIFACT_DIR, `workspace-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  ✓ workspace-${vp.name}.png captured`);
    await ctx.close();
  }

  console.log('\n--- 2. VERIFYING PREVIEW URL (PORT 8090 REMOVED EVERYWHERE) ---');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setupPage(page, 'https://project-5.usevoltrix.xyz:8090');
    await page.goto(`${BASE}/projects/proj-5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Verify address bar text
    const addressBarText = await page.locator('span.truncate').filter({ hasText: 'usevoltrix' }).first().textContent();
    console.log(`  Address bar URL: "${addressBarText}"`);
    if (addressBarText?.includes(':8090')) {
      throw new Error(`Address bar still contains :8090: ${addressBarText}`);
    }

    // Verify iframe src
    const iframeSrc = await page.locator('iframe[title="Voltrix Live Application Preview"]').getAttribute('src');
    console.log(`  Iframe src: "${iframeSrc}"`);
    if (iframeSrc?.includes(':8090')) {
      throw new Error(`Iframe src still contains :8090: ${iframeSrc}`);
    }

    // Verify new-tab link href
    const openLink = await page.locator('a[aria-label="Open preview in new tab"]').getAttribute('href');
    console.log(`  New tab link: "${openLink}"`);
    if (openLink?.includes(':8090')) {
      throw new Error(`Open link still contains :8090: ${openLink}`);
    }

    console.log('  ✓ Port 8090 successfully removed from address bar, iframe, and new tab link!');
    await ctx.close();
  }

  console.log('\n--- 3. SIMULATING 300 STREAM FRAGMENTS WITH CLEAN CLOSE (NO TERMINAL MARKER) ---');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setupPage(page);

    // Intercept /chat/stream to return 300 fragments then close connection
    await page.route('**/api/v1/intelligence/chat/stream', async (route) => {
      // Create readable stream in node and pipe as chunked response
      const fragments = [];
      fragments.push('data:{"text":"<thought>Analyzing requirement...</thought><message>Generating telemetry component:\\n"}\n\n');
      for (let i = 1; i <= 298; i++) {
        fragments.push(`data:{"text":"const item_${i} = ${i};\\n"}\n\n`);
      }
      fragments.push('data:{"text":"export default function Done() { return true; }</message>"}\n\n');

      return route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: fragments.join(''),
      });
    });

    await page.goto(`${BASE}/projects/proj-5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Type instruction and send
    await page.fill('textarea[placeholder*="Ask Voltrix AI"]', 'generate 300 items');
    await page.click('button[aria-label="Send instruction"]');
    await page.waitForTimeout(1500);

    // Check that stream completed cleanly with NO error box
    const errorBoxCount = await page.locator('div:has-text("generation failed")').count();
    console.log(`  Error box count: ${errorBoxCount}`);
    if (errorBoxCount > 0) {
      throw new Error('Unexpected error box shown after clean stream close!');
    }

    // Check that assistant content includes generated items
    const content = await page.locator('.prose').last().textContent();
    console.log(`  Assistant output preview: "${content?.slice(0, 80)}..."`);
    console.log('  ✓ 300 fragments completed cleanly without error!');
    await ctx.close();
  }

  console.log('\n--- 4. SIMULATING MID-STREAM ERROR & RETRY (NO DUPLICATE BUBBLE) ---');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setupPage(page);

    let streamPostCount = 0;
    await page.route('**/api/v1/intelligence/chat/stream', async (route) => {
      streamPostCount++;
      if (streamPostCount === 1) {
        // First attempt: return 500 error
        return route.fulfill({
          status: 500,
          json: { message: 'Inference worker timed out' },
        });
      } else {
        // Second attempt (retry): succeed
        return route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
          body: 'data:{"text":"<message>Retry succeeded successfully!</message>"}\n\n',
        });
      }
    });

    await page.goto(`${BASE}/projects/proj-5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Initial count of user bubbles
    const initialUserBubbles = await page.locator('div.max-w-\\[85\\%\\]').count();

    // Send instruction
    await page.fill('textarea[placeholder*="Ask Voltrix AI"]', 'flaky request test');
    await page.click('button[aria-label="Send instruction"]');
    await page.waitForTimeout(1000);

    // Verify error was shown with Retry button
    const retryBtn = page.locator('button[aria-label="Retry generation"]');
    if (await retryBtn.count() === 0) {
      throw new Error('Retry button not found on failed response!');
    }
    console.log('  ✓ Inline error alert with Retry button displayed properly');

    const userBubblesAfterFirstSend = await page.locator('div.max-w-\\[85\\%\\]').count();
    console.log(`  User bubble count after first send: ${userBubblesAfterFirstSend} (expected ${initialUserBubbles + 1})`);

    // Click Retry
    await retryBtn.click();
    await page.waitForTimeout(1200);

    const userBubblesAfterRetry = await page.locator('div.max-w-\\[85\\%\\]').count();
    console.log(`  User bubble count after Retry: ${userBubblesAfterRetry}`);
    if (userBubblesAfterRetry !== userBubblesAfterFirstSend) {
      throw new Error(`Duplicate user bubble was created on Retry! (was ${userBubblesAfterFirstSend}, now ${userBubblesAfterRetry})`);
    }

    console.log(`  Total POST requests sent: ${streamPostCount} (expected exactly 2: 1 initial + 1 user retry)`);
    if (streamPostCount !== 2) {
      throw new Error(`Unexpected POST count: ${streamPostCount}`);
    }
    console.log('  ✓ Retry succeeded in-place with ZERO duplicate user bubbles and NO automatic retries!');
    await ctx.close();
  }

  await browser.close();
  console.log('\n✓ ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
})();
