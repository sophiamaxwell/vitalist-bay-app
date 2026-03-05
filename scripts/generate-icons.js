// Generate PWA icons using canvas (run with: node scripts/generate-icons.js)
// This creates placeholder icons - replace with actual branding later

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG-based PNG placeholder
function generateIcon(size) {
  // Create a simple SVG that can be used as a placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
    <g transform="translate(${size / 2}, ${size / 2})">
      <g transform="translate(${-size * 0.25}, ${-size * 0.25}) scale(${size / 48})">
        <path fill="white" d="M8 2v4M16 2v4"/>
        <rect fill="none" stroke="white" stroke-width="2" x="3" y="4" width="18" height="18" rx="2"/>
        <path fill="none" stroke="white" stroke-width="2" d="M3 10h18"/>
        <path fill="none" stroke="white" stroke-width="2" d="M9 16l2 2 4-4"/>
      </g>
    </g>
  </svg>`;
  
  return svg;
}

// Generate icons for each size
sizes.forEach(size => {
  const svg = generateIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
});

// Create a simple screenshot placeholder
const screenshotWide = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#0a0a0a"/>
  <text x="640" y="360" text-anchor="middle" fill="#10b981" font-size="48" font-family="system-ui">Vitalist Bay Events</text>
</svg>`;

const screenshotNarrow = `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1334" viewBox="0 0 750 1334">
  <rect width="750" height="1334" fill="#0a0a0a"/>
  <text x="375" y="667" text-anchor="middle" fill="#10b981" font-size="48" font-family="system-ui">Vitalist Bay Events</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'screenshot-wide.svg'), screenshotWide);
fs.writeFileSync(path.join(iconsDir, 'screenshot-narrow.svg'), screenshotNarrow);

console.log('Generated screenshot placeholders');
console.log('\\nNote: For production, convert SVG to PNG using a tool like sharp or ImageMagick');
console.log('Example: convert icon-512x512.svg icon-512x512.png');
