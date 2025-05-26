/* eslint-env node, es2022 */
/* global Buffer, process, console */
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_ICON = path.join(process.cwd(), 'src/assets/logo.png');
const OUTPUT_DIR = path.join(process.cwd(), 'public/icons');

async function generateIcons() {
  try {
    // Cria o diretório de saída se não existir
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Carrega a imagem fonte
    const sourceImage = sharp(SOURCE_ICON);

    // Gera os ícones em diferentes tamanhos
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      await sourceImage
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Gerado ícone ${size}x${size}`);
    }

    // Gera o ícone maskable
    const maskableSize = 512;
    const padding = maskableSize * 0.1; // 10% de padding
    const safeArea = maskableSize - padding * 2;

    await sourceImage
      .clone()
      .resize(safeArea, safeArea, {
        fit: 'contain',
        background: { r: 66, g: 133, b: 244, alpha: 1 }, // Cor primária do app
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 66, g: 133, b: 244, alpha: 1 },
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'maskable-icon.png'));
    console.log('✓ Gerado ícone maskable');

    // Gera os ícones dos atalhos
    const shortcutIcons = [
      {
        name: 'shortcut-vistoria.png',
        icon: '📋',
      },
      {
        name: 'shortcut-agenda.png',
        icon: '📅',
      },
    ];

    for (const shortcut of shortcutIcons) {
      const size = 192;
      const canvas = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        },
      });

      // Aqui você pode adicionar lógica para desenhar o ícone
      // Por enquanto, vamos apenas criar um placeholder colorido
      await canvas
        .composite([
          {
            input: Buffer.from(
              `<svg width="${size}" height="${size}">
                <rect width="${size}" height="${size}" rx="40" fill="#4285f4"/>
                <text x="50%" y="50%" font-family="Arial" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle">
                  ${shortcut.icon}
                </text>
              </svg>`
            ),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toFile(path.join(OUTPUT_DIR, shortcut.name));
      console.log(`✓ Gerado ícone de atalho ${shortcut.name}`);
    }

    console.log('\n✨ Todos os ícones foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();
