// Convert hero.jpeg to hero.webp using sharp
// Run with: node scripts/convert-hero-to-webp.js

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function main() {
  const projectRoot = process.cwd();
  const input = path.join(projectRoot, 'public', 'images', 'hero.jpeg');
  const output = path.join(projectRoot, 'public', 'images', 'hero.webp');

  if (!fs.existsSync(input)) {
    console.error('Input image not found:', input);
    process.exit(1);
  }

  try {
    const img = sharp(input);
    const metadata = await img.metadata();

    // Resize down if wider than 1920px; otherwise keep original width
    const width = metadata.width && metadata.width > 1920 ? 1920 : metadata.width;

    await img
      .resize({ width })
      .webp({ quality: 80 })
      .toFile(output);

    const outStats = fs.statSync(output);
    console.log('Created', path.relative(projectRoot, output), `(${Math.round(outStats.size / 1024)} KB)`);
  } catch (err) {
    console.error('Failed to create WebP:', err);
    process.exit(1);
  }
}

main();
