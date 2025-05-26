/* eslint-env node */
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SOURCE_SVG = path.join(process.cwd(), 'src/assets/logo.svg');
const OUTPUT_PNG = path.join(process.cwd(), 'src/assets/logo.png');

async function convertSvgToPng() {
  try {
    const svgBuffer = await fs.readFile(SOURCE_SVG);
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(OUTPUT_PNG);
    
    console.log('✨ Logo convertido com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao converter logo:', error);
    process.exit(1);
  }
}

convertSvgToPng(); 