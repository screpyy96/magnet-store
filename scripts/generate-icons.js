const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { createCanvas } = require('canvas');

// Dimensiuni necesare pentru manifest.json
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Culoare de fundal pentru icoane (rozul din brand)
const backgroundColor = { r: 236, g: 72, b: 153, alpha: 1 };

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function createScreenshot(width, height, outputPath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fundal roz
  ctx.fillStyle = `rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`;
  ctx.fillRect(0, 0, width, height);
  
  // Text sau elemente de design pentru screenshot
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Titlu
  const title = 'My Sweet Magnets';
  const titleFontSize = Math.round(width * 0.06);
  ctx.font = `bold ${titleFontSize}px Arial`;
  ctx.fillText(title, width / 2, height / 3);
  
  // Subtitlu
  const subtitle = 'Create Your Custom Magnets';
  const subtitleFontSize = Math.round(width * 0.03);
  ctx.font = `${subtitleFontSize}px Arial`;
  ctx.fillText(subtitle, width / 2, height / 2);
  
  // Logo centrat (dacă este disponibil)
  try {
    const logo = await sharp(inputFile)
      .resize(Math.round(width * 0.4), Math.round(width * 0.4), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    
    const logoImg = await sharp(logo).toBuffer();
    const { width: logoWidth, height: logoHeight } = await sharp(logoImg).metadata();
    
    const x = Math.round((width - logoWidth) / 2);
    const y = Math.round((height - logoHeight) / 2 + height * 0.1);
    
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 236, g: 72, b: 153, alpha: 1 }
      }
    })
    .composite([
      {
        input: logoImg,
        top: y,
        left: x
      }
    ])
    .png()
    .toFile(outputPath);
  } catch (err) {
    console.error('Eroare la generarea screenshot-ului:', err);
  }
}

async function generateIcons() {
  try {
    // Verificăm dacă fișierul sursă există
    try {
      await fs.access(inputFile);
    } catch (err) {
      console.error(`Fișierul sursă nu a fost găsit: ${inputFile}`);
      return;
    }

    // Creăm directorul de ieșire dacă nu există
    await ensureDir(outputDir);

    // Generăm toate dimensiunile de icoane
    await Promise.all(
      sizes.map(async (size) => {
        const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
        
        await sharp(inputFile)
          .resize(size, size, {
            fit: 'contain',
            background: backgroundColor
          })
          .toFile(outputFile);
        
        console.log(`Generat: ${outputFile}`);
      })
    );

    // Generăm favicon.ico
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: backgroundColor
      })
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    console.log('Generat: favicon.ico');

    // Generăm screenshot-uri pentru PWA
    const screenshotsDir = path.join(__dirname, '../public/screenshots');
    await ensureDir(screenshotsDir);
    
    // Screenshot portrait
    await createScreenshot(
      1080, 
      1920, 
      path.join(screenshotsDir, 'screenshot1.webp')
    );
    
    // Screenshot landscape
    await createScreenshot(
      1920,
      1080,
      path.join(screenshotsDir, 'screenshot2.webp')
    );

    console.log('Toate icoanele au fost generate cu succes!');
  } catch (err) {
    console.error('Eroare la generarea icoanelor:', err);
  }
}

generateIcons();
