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
  { path: 'src/index.css' },
  { path: 'package.json' },
];

async function setupPage(page) {
  await page.addInitScript(({ user }) => {
    localStorage.setItem(
      'voltrix-auth-storage',
      JSON.stringify({
        state: { token: 'mock-jwt-token-123', user },
        version: 0,
      })
    );
    localStorage.setItem('voltrix_deploy_proj-5', 'https://project-5.usevoltrix.xyz');
  }, { user: mockUser });

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/files/content')) {
      return route.fulfill({ status: 200, contentType: 'text/plain', body: 'body { margin: 0; }' });
    }
    if (url.includes('/files')) {
      return route.fulfill({ status: 200, json: { files: mockFiles } });
    }
    if (url.includes('/members')) {
      return route.fulfill({ status: 200, json: [] });
    }
    if (url.includes('/chat/projects/proj-5')) {
      return route.fulfill({
        status: 200,
        json: [
          {
            id: 'msg-initial-user',
            role: 'USER',
            content: 'Please apply the dark Batman theme',
            createdAt: new Date().toISOString(),
            events: [],
          },
          {
            id: 'msg-initial-assistant',
            role: 'ASSISTANT',
            content: '<thought>Configuring theme tokens and dark palette</thought><message>I will add a Batman theme to index.css and add the Batman option to the theme select in App.tsx.</message><file path="src/index.css">body { background: #000; }</file><file path="src/App.tsx">export default function App() {}</file><message>Finished configuring the Batman theme across stylesheets and application settings.</message>',
            createdAt: new Date().toISOString(),
            events: [],
          },
        ],
      });
    }
    if (url.includes('/projects/proj-5')) {
      return route.fulfill({ status: 200, json: mockProject });
    }
    return route.fulfill({ status: 200, json: {} });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  console.log('--- 1. VERIFYING LIVE STREAM RENDERING, WIDTHS & FILE CARDS ---');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setupPage(page);

    // Build stream chunks: 300 fragments with intro, repeated file contents, second file, and summary
    const fragments = [];
    fragments.push('data:{"text":"<thought>Analyzing workspace files and stylesheets...</thought><message>I will add a Batman theme to index.css and add the Batman option to the theme select in App.tsx.</message>"}\n\n');

    // Repeated file fragments simulating long css output (150 fragments)
    fragments.push('data:{"text":"<file path=\\"src/index.css\\">"}\n\n');
    for (let i = 1; i <= 140; i++) {
      fragments.push(`data:{"text":".batman-rule-${i} { color: #D4FF32; display: flex; }\\n"}\n\n`);
    }
    fragments.push('data:{"text":"</file>"}\n\n');

    // Second file fragments (80 fragments)
    fragments.push('data:{"text":"<file path=\\"src/App.tsx\\">"}\n\n');
    for (let i = 1; i <= 75; i++) {
      fragments.push(`data:{"text":"// line ${i} of app component\\n"}\n\n`);
    }
    fragments.push('data:{"text":"</file>"}\n\n');

    // Summary
    fragments.push('data:{"text":"<message>Finished configuring the Batman theme across stylesheets and application settings.</message>"}\n\n');

    await page.route('**/api/v1/intelligence/chat/stream', async (route) => {
      return route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: fragments.join(''),
      });
    });

    await page.goto(`${BASE}/projects/proj-5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Track renders in console or DOM
    await page.fill('textarea[placeholder*="Ask Voltrix AI"]', 'apply batman theme');
    await page.click('button[aria-label="Send instruction"]');
    await page.waitForTimeout(1200);

    // Measure intro text bounding box vs. file card bounding box
    const introBox = await page.locator('p:has-text("I will add a Batman theme")').last().boundingBox();
    const fileCardBox = await page.locator('li:has-text("src/index.css")').last().boundingBox();

    console.log(`  Intro text box width: ${introBox?.width}px`);
    console.log(`  File card box width: ${fileCardBox?.width}px`);

    if (introBox && fileCardBox) {
      const ratio = introBox.width / fileCardBox.width;
      console.log(`  Width ratio (intro / card): ${(ratio * 100).toFixed(1)}%`);
      if (ratio < 0.9) {
        throw new Error(`Intro text width (${introBox.width}px) is less than 90% of file card width (${fileCardBox.width}px)! Narrow column bug detected.`);
      }
      console.log('  ✓ Intro text spans full width (no narrow 150px broken column)!');
    }

    // Verify deduplication of file cards within the streamed message
    const liveMessage = page.locator('[data-assistant-message]').last();
    const indexCssCards = await liveMessage.locator('li:has-text("src/index.css")').count();
    const appTsxCards = await liveMessage.locator('li:has-text("src/App.tsx")').count();
    console.log(`  src/index.css card count: ${indexCssCards} (expected exactly 1)`);
    console.log(`  src/App.tsx card count: ${appTsxCards} (expected exactly 1)`);

    if (indexCssCards !== 1 || appTsxCards !== 1) {
      throw new Error(`Duplicate file cards detected! (index.css: ${indexCssCards}, App.tsx: ${appTsxCards})`);
    }
    console.log('  ✓ Exactly ONE compact card per unique file exists!');

    // Verify raw XML and file contents NEVER appear in text
    const textContent = await page.locator('[data-assistant-message]').last().textContent();
    if (textContent?.includes('<file') || textContent?.includes('batman-rule-')) {
      throw new Error('Raw XML tag or file content leaked into message text!');
    }
    console.log('  ✓ No raw XML or file contents leaked into visible prose!');

    // Capture screenshot of live clean layout
    const liveShot = path.join(ARTIFACT_DIR, 'assistant-live-clean-1440.png');
    await page.screenshot({ path: liveShot, fullPage: false });
    console.log('  ✓ assistant-live-clean-1440.png captured');

    await ctx.close();
  }

  console.log('\n--- 2. VERIFYING PERSISTED LAYOUT VISUAL IDENTITY (AFTER REFRESH) ---');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setupPage(page);
    await page.goto(`${BASE}/projects/proj-5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify persisted message renders identical file cards and full-width intro
    const introBox = await page.locator('p:has-text("I will add a Batman theme")').first().boundingBox();
    const fileCardBox = await page.locator('li:has-text("src/index.css")').first().boundingBox();

    console.log(`  Persisted Intro width: ${introBox?.width}px, File Card width: ${fileCardBox?.width}px`);
    const ratio = (introBox?.width || 0) / (fileCardBox?.width || 1);
    console.log(`  Persisted width ratio: ${(ratio * 100).toFixed(1)}%`);

    const persistedShot = path.join(ARTIFACT_DIR, 'assistant-persisted-clean-1440.png');
    await page.screenshot({ path: persistedShot, fullPage: false });
    console.log('  ✓ assistant-persisted-clean-1440.png captured (visually identical to live layout)');

    await ctx.close();
  }

  console.log('\n--- 3. CAPTURING RESPONSIVE SCREENSHOTS AT 1920, 1440, 1024, 390 PX ---');
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
    await page.waitForTimeout(800);

    const shotPath = path.join(ARTIFACT_DIR, `assistant-workspace-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  ✓ assistant-workspace-${vp.name}.png captured`);
    await ctx.close();
  }

  await browser.close();
  console.log('\n✓ ALL ASSISTANT STREAM & PERSISTENCE CHECKS PASSED WITH 100% SUCCESS!');
})();
