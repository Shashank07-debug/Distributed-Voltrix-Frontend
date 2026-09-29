import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicBrandDir = path.resolve(__dirname, '../public/brand');
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicBrandDir)) {
  fs.mkdirSync(publicBrandDir, { recursive: true });
}

// 1. Exact SVG source of truth
const LOGO_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="56" y1="88" x2="456" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7C3AED"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <path fill="url(#g)" fill-rule="evenodd"
    d="M56 88 H168 L256 272 L344 88 H456 L256 428 Z M340 154 L284 246 H320 L290 334 L354 234 H318 Z"/>
  <circle cx="256" cy="452" r="20" fill="#22D3EE"/>
</svg>`;

const LOGO_MONO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path fill="#111111" fill-rule="evenodd"
    d="M56 88 H168 L256 272 L344 88 H456 L256 428 Z M340 154 L284 246 H320 L290 334 L354 234 H318 Z"/>
  <circle cx="256" cy="452" r="20" fill="#111111"/>
</svg>`;

const LOGO_FULL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 512">
  <defs>
    <linearGradient id="g" x1="56" y1="88" x2="456" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7C3AED"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <path fill="url(#g)" fill-rule="evenodd"
    d="M56 88 H168 L256 272 L344 88 H456 L256 428 Z M340 154 L284 246 H320 L290 334 L354 234 H318 Z"/>
  <circle cx="256" cy="452" r="20" fill="#22D3EE"/>
  <text x="560" y="320" font-family="Space Grotesk, sans-serif" font-size="230" font-weight="600" letter-spacing="-0.02em" fill="#FFFFFF">Voltrix</text>
</svg>`;

// Write SVGs
fs.writeFileSync(path.join(publicBrandDir, 'logo-mark.svg'), LOGO_MARK_SVG.trim());
fs.writeFileSync(path.join(publicBrandDir, 'logo-mono.svg'), LOGO_MONO_SVG.trim());
fs.writeFileSync(path.join(publicBrandDir, 'logo-full.svg'), LOGO_FULL_SVG.trim());

console.log('✓ Written SVG files to public/brand/');

// Helper to wrap SVG in padded background for app icons
function getIconSvg(size, paddingPercent = 0.2) {
  const markSize = Math.round(size * (1 - paddingPercent * 2));
  const offset = Math.round(size * paddingPercent);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#07070B"/>
    <g transform="translate(${offset}, ${offset}) scale(${markSize / 512})">
      <defs>
        <linearGradient id="g_icon_${size}" x1="56" y1="88" x2="456" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#7C3AED"/>
          <stop offset="1" stop-color="#22D3EE"/>
        </linearGradient>
      </defs>
      <path fill="url(#g_icon_${size})" fill-rule="evenodd"
        d="M56 88 H168 L256 272 L344 88 H456 L256 428 Z M340 154 L284 246 H320 L290 334 L354 234 H318 Z"/>
      <circle cx="256" cy="452" r="20" fill="#22D3EE"/>
    </g>
  </svg>`;
}

// 1200x630 OG Image SVG template
const OG_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#07070B"/>
  <!-- Ambient background glows -->
  <circle cx="200" cy="150" r="300" fill="#7C3AED" opacity="0.15" filter="blur(80px)"/>
  <circle cx="1000" cy="480" r="300" fill="#22D3EE" opacity="0.15" filter="blur(80px)"/>

  <!-- Left Logo Mark with Glow -->
  <g transform="translate(120, 115) scale(0.78)" filter="drop-shadow(0 0 24px rgba(124,58,237,0.5)) drop-shadow(0 0 48px rgba(34,211,238,0.3))">
    <defs>
      <linearGradient id="g_og" x1="56" y1="88" x2="456" y2="440" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#7C3AED"/>
        <stop offset="1" stop-color="#22D3EE"/>
      </linearGradient>
    </defs>
    <path fill="url(#g_og)" fill-rule="evenodd"
      d="M56 88 H168 L256 272 L344 88 H456 L256 428 Z M340 154 L284 246 H320 L290 334 L354 234 H318 Z"/>
    <circle cx="256" cy="452" r="20" fill="#22D3EE"/>
  </g>

  <!-- Right Text Content -->
  <text x="560" y="270" font-family="Space Grotesk, sans-serif" font-size="110" font-weight="700" letter-spacing="-0.03em" fill="#FFFFFF">Voltrix</text>
  <text x="560" y="350" font-family="Inter, sans-serif" font-size="36" font-weight="500" fill="#A78BFA">Autonomous AI App Builder</text>
  <text x="560" y="420" font-family="Inter, sans-serif" font-size="28" font-weight="400" fill="#8E919F">Describe it. Voltrix builds it.</text>
</svg>`;

async function generatePngAssets() {
  const markBuffer = Buffer.from(LOGO_MARK_SVG);

  // favicon-32.png
  await sharp(markBuffer).resize(32, 32).png().toFile(path.join(publicBrandDir, 'favicon-32.png'));

  // favicon-512.png
  await sharp(markBuffer).resize(512, 512).png().toFile(path.join(publicBrandDir, 'favicon-512.png'));

  // apple-touch-icon.png (180x180, ~20% padding, background #07070B)
  const appleTouchSvg = getIconSvg(180, 0.2);
  await sharp(Buffer.from(appleTouchSvg)).png().toFile(path.join(publicBrandDir, 'apple-touch-icon.png'));

  // icon-192.png & icon-512.png for site.webmanifest
  const icon192Svg = getIconSvg(192, 0.2);
  await sharp(Buffer.from(icon192Svg)).png().toFile(path.join(publicBrandDir, 'icon-192.png'));

  const icon512Svg = getIconSvg(512, 0.2);
  await sharp(Buffer.from(icon512Svg)).png().toFile(path.join(publicBrandDir, 'icon-512.png'));

  // og-image.png (1200x630)
  await sharp(Buffer.from(OG_IMAGE_SVG)).png().toFile(path.join(publicBrandDir, 'og-image.png'));

  console.log('✓ Generated PNG assets in public/brand/');
}

// Write Web Manifest in public/
const WEB_MANIFEST = {
  name: 'Voltrix',
  short_name: 'Voltrix',
  icons: [
    { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: '#07070B',
  background_color: '#07070B',
  display: 'standalone',
  start_url: '/',
};

fs.writeFileSync(
  path.join(publicDir, 'site.webmanifest'),
  JSON.stringify(WEB_MANIFEST, null, 2)
);
console.log('✓ Written public/site.webmanifest');

generatePngAssets()
  .then(() => console.log('✓ Brand generation complete!'))
  .catch((err) => {
    console.error('Error generating brand assets:', err);
    process.exit(1);
  });
