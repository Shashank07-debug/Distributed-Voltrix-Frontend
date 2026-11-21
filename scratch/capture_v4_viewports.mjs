import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\shash\\.gemini\\antigravity\\brain\\76e7efa3-e4a8-4894-82da-c31786f46281';

const captures = [
  { name: 'v4-top-1440', w: 1440, h: 900, url: 'http://localhost:5173/' },
  { name: 'v4-top-768', w: 768, h: 950, url: 'http://localhost:5173/' },
  { name: 'v4-top-375', w: 375, h: 800, url: 'http://localhost:5173/' },
  { name: 'v4-middle-1440', w: 1440, h: 900, url: 'http://localhost:5173/#workflow' },
  { name: 'v4-middle-768', w: 768, h: 900, url: 'http://localhost:5173/#workflow' },
  { name: 'v4-middle-375', w: 375, h: 800, url: 'http://localhost:5173/#workflow' },
  { name: 'v4-bottom-1440', w: 1440, h: 900, url: 'http://localhost:5173/#contact' },
  { name: 'v4-bottom-768', w: 768, h: 900, url: 'http://localhost:5173/#contact' },
  { name: 'v4-bottom-375', w: 375, h: 800, url: 'http://localhost:5173/#contact' },
  { name: 'v4-mobile-menu-375', w: 375, h: 800, url: 'http://localhost:5173/?menu=open' },
  { name: 'v4-mobile-menu-768', w: 768, h: 900, url: 'http://localhost:5173/?menu=open' },
];

for (const c of captures) {
  const tmpFile = path.join(os.tmpdir(), `${c.name}.png`);
  const finalFile = path.join(outDir, `${c.name}.png`);
  console.log(`Capturing ${c.name}...`);
  try {
    execSync(`"${chromePath}" --headless=new --virtual-time-budget=3000 --screenshot="${tmpFile}" --window-size=${c.w},${c.h} --hide-scrollbars "${c.url}"`, { stdio: 'ignore' });
    if (fs.existsSync(tmpFile)) {
      fs.copyFileSync(tmpFile, finalFile);
      fs.unlinkSync(tmpFile);
      console.log(`Saved ${c.name}.png`);
    }
  } catch (err) {
    console.error(`Failed ${c.name}:`, err.message);
  }
}

console.log('Finished capturing standard viewports.');
