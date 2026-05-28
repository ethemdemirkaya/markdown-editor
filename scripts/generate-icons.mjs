// Renders SVG to PNG (1024) + NSIS BMP banner/sidebar.
// Sonra: `npx @tauri-apps/cli icon src-tauri/icons/icon-source.png`

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const ICON_DIR = path.join(ROOT, 'src-tauri', 'icons');
const SVG = path.join(ICON_DIR, 'icon.svg');

function rgbToBmp(rgb, width, height) {
  const rowSize = Math.ceil((24 * width) / 32) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  const buf = Buffer.alloc(fileSize);

  // File header (BITMAPFILEHEADER, 14)
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(54, 10);

  // DIB header (BITMAPINFOHEADER, 40)
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22); // pozitif = bottom-up
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(pixelDataSize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  buf.writeUInt32LE(0, 46);
  buf.writeUInt32LE(0, 50);

  // Piksel verisi: BGR, bottom-up, row stride 4-byte aligned
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    const dstBase = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 3;
      const dstIdx = dstBase + x * 3;
      buf[dstIdx + 0] = rgb[srcIdx + 2]; // B
      buf[dstIdx + 1] = rgb[srcIdx + 1]; // G
      buf[dstIdx + 2] = rgb[srcIdx + 0]; // R
    }
  }
  return buf;
}

async function svgBuffer() {
  return fs.readFile(SVG);
}

async function writePng(buffer, size, file) {
  await sharp(buffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ICON_DIR, file));
}

async function compositeBmp(svgBuf, width, height, iconScale, file) {
  const iconSize = Math.round(Math.min(width, height) * iconScale);
  const iconPng = await sharp(svgBuf).resize(iconSize, iconSize).png().toBuffer();
  const { data, info } = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 31, g: 35, b: 40, alpha: 1 },
    },
  })
    .composite([
      {
        input: iconPng,
        left: Math.round((width - iconSize) / 2),
        top: Math.round((height - iconSize) / 2),
      },
    ])
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 3) {
    throw new Error(`Unexpected channels: ${info.channels}`);
  }

  const bmp = rgbToBmp(data, info.width, info.height);
  await fs.writeFile(path.join(ICON_DIR, file), bmp);
}

async function main() {
  await fs.mkdir(ICON_DIR, { recursive: true });
  const buf = await svgBuffer();

  console.log('→ icon-source.png (1024)');
  await writePng(buf, 1024, 'icon-source.png');

  console.log('→ nsis-header.bmp (150×57)');
  await compositeBmp(buf, 150, 57, 0.78, 'nsis-header.bmp');

  console.log('→ nsis-sidebar.bmp (164×314)');
  await compositeBmp(buf, 164, 314, 0.6, 'nsis-sidebar.bmp');

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
