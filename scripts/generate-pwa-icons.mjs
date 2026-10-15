import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-JS PNG encoder to generate crisp 192x192, 512x512, maskable 512x512, and 180x180 apple-touch-icon PNGs
// depicting the Tragoo Check dark squircle, purple glass, and lime-green checkmark.
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function createTragooPng(size, isMaskable = false) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const scale = isMaskable ? 0.82 : 0.94;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter type 0
    for (let x = 0; x < size; x++) {
      // Normalized coordinates [-1, 1]
      const nx = ((x / size - 0.5) * 2) / scale;
      const ny = ((y / size - 0.5) * 2) / scale;

      // Default background: dark charcoal #18181B
      let r = 24, g = 24, b = 27, a = 255;

      // Inner card subtle border
      const maxCoord = Math.max(Math.abs(nx), Math.abs(ny));
      if (maxCoord < 0.92 && maxCoord > 0.89) {
        r = 39; g = 39; b = 42;
      }

      // Glass trapezoid geometry: y in [-0.62, 0.42], width tapers from 0.34 at top to 0.23 at bottom
      const gyTop = -0.58;
      const gyBot = 0.40;
      if (ny >= gyTop && ny <= gyBot) {
        const t = (ny - gyTop) / (gyBot - gyTop);
        const halfW = 0.33 * (1 - t) + 0.22 * t;
        const absX = Math.abs(nx);

        // Glass outline
        const isBorder =
          (absX <= halfW && absX >= halfW - 0.065) ||
          (absX <= halfW && (ny <= gyTop + 0.06 || ny >= gyBot - 0.065));

        // Liquid wave inside glass
        const waveY = -0.26 + 0.035 * Math.sin(nx * 9);
        const isLiquid = absX <= halfW - 0.03 && ny >= waveY && ny <= gyBot - 0.03;

        if (isBorder || isLiquid) {
          r = 147; g = 51; b = 234; // Purple #9333EA
        }
      }

      // Checkmark geometry: P1(-0.22, -0.02) -> P2(-0.03, 0.17) -> P3(0.45, -0.33)
      const d1 = distToSegment(nx, ny, -0.22, -0.02, -0.03, 0.17);
      const d2 = distToSegment(nx, ny, -0.03, 0.17, 0.45, -0.33);
      const dCheck = Math.min(d1, d2);

      if (dCheck < 0.125) {
        // Dark cutout ring around checkmark
        r = 24; g = 24; b = 27;
      }
      if (dCheck < 0.075) {
        // Bright lime-green checkmark #39E722
        r = 57; g = 231; b = 34;
      }

      // Bottom brand bar accent ("Tragoo" purple left + "Check" green right)
      if (ny >= 0.56 && ny <= 0.65 && Math.abs(nx) <= 0.56) {
        if (nx < -0.03) {
          r = 147; g = 51; b = 234;
        } else if (nx > 0.03) {
          r = 57; g = 231; b = 34;
        }
      }

      const idx = rowStart + 1 + x * 4;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createTragooPng(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createTragooPng(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createTragooPng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createTragooPng(180, false));
console.log('Generated PWA PNG icons in /public');
