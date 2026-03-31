/**
 * Sprite Generation Script
 * Generates placeholder pixel art sprites for all creatures, eggs, cosmetics, and extension icons.
 * Run with: npx ts-node scripts/generate-sprites.ts
 */

import { createCanvas, type CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEB_PUBLIC = path.join(ROOT, 'packages', 'web', 'public');
const CREATURE_DIR = path.join(WEB_PUBLIC, 'sprites', 'creatures');
const EGG_DIR = path.join(WEB_PUBLIC, 'sprites', 'eggs');
const COSMETIC_DIR = path.join(WEB_PUBLIC, 'sprites', 'cosmetics');
const ICON_DIR = path.join(ROOT, 'packages', 'extension', 'icons');

const CREATURE_COUNT = 115;
const SPRITE_SIZE = 32;
const EGG_WIDTH = 24;
const EGG_HEIGHT = 32;

// ── Rarity palettes ──

const RARITY_PALETTES: Record<number, { body: string; light: string; dark: string; eye: string; accent: string }> = {
  1: { body: '#a8a878', light: '#c8c898', dark: '#888860', eye: '#333333', accent: '#b8b888' },
  2: { body: '#78c850', light: '#98e870', dark: '#58a830', eye: '#333333', accent: '#68b840' },
  3: { body: '#6890f0', light: '#88b0ff', dark: '#4870d0', eye: '#ffffff', accent: '#78a0f0' },
  4: { body: '#f8d030', light: '#ffe860', dark: '#d8b010', eye: '#333333', accent: '#f0c020' },
  5: { body: '#f85888', light: '#ff78a8', dark: '#d83868', eye: '#ffffff', accent: '#f06888' },
};

const RARITY_NAMES = ['', 'common', 'uncommon', 'rare', 'legendary', 'mythic'];

// ── Seeded random ──

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Helper: draw a pixel (ctx is already in pixel-art mode) ──

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

// ── Helper: fill oval region ──

function fillOval(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
      }
    }
  }
}

// ── Helper: fill rounded rect ──

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      // Check if inside rounded rect
      let inside = true;
      // Top-left corner
      if (px < r && py < r) {
        inside = (px - r) * (px - r) + (py - r) * (py - r) <= r * r;
      }
      // Top-right corner
      if (px >= w - r && py < r) {
        inside = (px - (w - r - 1)) * (px - (w - r - 1)) + (py - r) * (py - r) <= r * r;
      }
      // Bottom-left corner
      if (px < r && py >= h - r) {
        inside = (px - r) * (px - r) + (py - (h - r - 1)) * (py - (h - r - 1)) <= r * r;
      }
      // Bottom-right corner
      if (px >= w - r && py >= h - r) {
        inside = (px - (w - r - 1)) * (px - (w - r - 1)) + (py - (h - r - 1)) * (py - (h - r - 1)) <= r * r;
      }
      if (inside) {
        ctx.fillRect(x + px, y + py, 1, 1);
      }
    }
  }
}

// ── Creature rarity lookup ──

function getCreatureRarity(id: number): number {
  if (id >= 101) {
    if (id <= 105) return 1;
    if (id <= 109) return 2;
    if (id <= 112) return 3;
    if (id <= 114) return 4;
    return 5;
  }
  if (id <= 45) return 1;
  if (id <= 70) return 2;
  if (id <= 85) return 3;
  if (id <= 95) return 4;
  return 5;
}

function isSafariCreature(id: number): boolean {
  return id >= 101 && id <= 115;
}

// ── Body shape drawers (8+ shapes) ──

type ShapeDrawer = (ctx: CanvasRenderingContext2D, palette: typeof RARITY_PALETTES[1], rand: () => number) => { eyeY: number; eyeLeftX: number; eyeRightX: number; mouthY: number; mouthX: number };

const bodyShapes: ShapeDrawer[] = [
  // 0: Round blob
  (ctx, p, rand) => {
    fillOval(ctx, 16, 18, 9, 9, p.body);
    fillOval(ctx, 16, 16, 8, 7, p.light);
    // feet
    fillOval(ctx, 12, 27, 3, 2, p.dark);
    fillOval(ctx, 20, 27, 3, 2, p.dark);
    return { eyeY: 15, eyeLeftX: 12, eyeRightX: 19, mouthY: 20, mouthX: 15 };
  },
  // 1: Tall / upright
  (ctx, p, rand) => {
    fillOval(ctx, 16, 20, 6, 10, p.body);
    fillOval(ctx, 16, 18, 5, 8, p.light);
    // feet
    px(ctx, 13, 29, p.dark); px(ctx, 14, 29, p.dark);
    px(ctx, 18, 29, p.dark); px(ctx, 19, 29, p.dark);
    return { eyeY: 14, eyeLeftX: 13, eyeRightX: 18, mouthY: 18, mouthX: 15 };
  },
  // 2: Wide / chubby
  (ctx, p, rand) => {
    fillOval(ctx, 16, 19, 11, 7, p.body);
    fillOval(ctx, 16, 18, 10, 5, p.light);
    // stubby feet
    fillOval(ctx, 10, 26, 3, 2, p.dark);
    fillOval(ctx, 22, 26, 3, 2, p.dark);
    return { eyeY: 17, eyeLeftX: 11, eyeRightX: 20, mouthY: 21, mouthX: 15 };
  },
  // 3: Triangle / spiky (pointing up)
  (ctx, p, rand) => {
    ctx.fillStyle = p.body;
    for (let y = 8; y < 28; y++) {
      const progress = (y - 8) / 20;
      const halfW = Math.floor(2 + progress * 11);
      for (let x = 16 - halfW; x <= 16 + halfW; x++) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.fillStyle = p.light;
    for (let y = 10; y < 24; y++) {
      const progress = (y - 10) / 14;
      const halfW = Math.floor(1 + progress * 8);
      for (let x = 16 - halfW; x <= 16 + halfW; x++) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return { eyeY: 18, eyeLeftX: 12, eyeRightX: 19, mouthY: 22, mouthX: 15 };
  },
  // 4: Diamond
  (ctx, p, rand) => {
    ctx.fillStyle = p.body;
    for (let y = 6; y < 28; y++) {
      const mid = 16;
      const dist = y <= 17 ? (y - 6) : (28 - y);
      const halfW = Math.floor(dist * 0.9);
      for (let x = mid - halfW; x <= mid + halfW; x++) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.fillStyle = p.light;
    for (let y = 9; y < 25; y++) {
      const dist = y <= 17 ? (y - 9) : (25 - y);
      const halfW = Math.floor(dist * 0.7);
      for (let x = 16 - halfW; x <= 16 + halfW; x++) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return { eyeY: 15, eyeLeftX: 13, eyeRightX: 18, mouthY: 19, mouthX: 15 };
  },
  // 5: Ghost / bell shape
  (ctx, p, rand) => {
    // Rounded top
    fillOval(ctx, 16, 14, 8, 8, p.body);
    // Rectangular bottom
    ctx.fillStyle = p.body;
    ctx.fillRect(8, 14, 17, 12);
    // Wavy bottom
    for (let x = 8; x < 25; x++) {
      const wave = (x % 4 < 2) ? 0 : 2;
      ctx.fillRect(x, 26 + wave, 1, 2);
    }
    // Highlight
    fillOval(ctx, 16, 13, 6, 6, p.light);
    return { eyeY: 14, eyeLeftX: 12, eyeRightX: 19, mouthY: 19, mouthX: 15 };
  },
  // 6: Star / spiky ball
  (ctx, p, rand) => {
    fillOval(ctx, 16, 17, 7, 7, p.body);
    // spikes
    const spikePts = [
      [16, 6], [9, 10], [23, 10], [8, 22], [24, 22], [16, 28],
    ];
    for (const [sx, sy] of spikePts) {
      fillOval(ctx, sx, sy, 2, 2, p.body);
    }
    fillOval(ctx, 16, 16, 5, 5, p.light);
    return { eyeY: 15, eyeLeftX: 13, eyeRightX: 18, mouthY: 19, mouthX: 15 };
  },
  // 7: Mushroom / cap shape
  (ctx, p, rand) => {
    // Cap (wide ellipse top)
    fillOval(ctx, 16, 13, 10, 6, p.body);
    fillOval(ctx, 16, 12, 8, 4, p.light);
    // Stem
    ctx.fillStyle = p.dark;
    ctx.fillRect(12, 18, 9, 10);
    ctx.fillStyle = p.body;
    ctx.fillRect(13, 19, 7, 8);
    return { eyeY: 22, eyeLeftX: 14, eyeRightX: 18, mouthY: 25, mouthX: 15 };
  },
  // 8: Slime / blob with flat bottom
  (ctx, p, rand) => {
    fillOval(ctx, 16, 16, 9, 8, p.body);
    ctx.fillStyle = p.body;
    ctx.fillRect(7, 16, 19, 12);
    fillOval(ctx, 16, 14, 7, 6, p.light);
    // Flat bottom highlight
    ctx.fillStyle = p.dark;
    ctx.fillRect(7, 27, 19, 1);
    return { eyeY: 15, eyeLeftX: 12, eyeRightX: 19, mouthY: 20, mouthX: 15 };
  },
  // 9: Cat-like / ears on top
  (ctx, p, rand) => {
    // ears
    ctx.fillStyle = p.dark;
    ctx.fillRect(9, 7, 3, 4);
    ctx.fillRect(20, 7, 3, 4);
    // head + body merged
    fillOval(ctx, 16, 17, 8, 9, p.body);
    fillOval(ctx, 16, 15, 7, 7, p.light);
    // feet
    px(ctx, 11, 26, p.dark); px(ctx, 12, 26, p.dark);
    px(ctx, 20, 26, p.dark); px(ctx, 21, 26, p.dark);
    return { eyeY: 15, eyeLeftX: 12, eyeRightX: 19, mouthY: 19, mouthX: 15 };
  },
  // 10: Egg-like / oval standing up
  (ctx, p, rand) => {
    fillOval(ctx, 16, 17, 7, 11, p.body);
    fillOval(ctx, 16, 15, 6, 8, p.light);
    return { eyeY: 15, eyeLeftX: 13, eyeRightX: 18, mouthY: 20, mouthX: 15 };
  },
  // 11: Square / boxy robot
  (ctx, p, rand) => {
    ctx.fillStyle = p.body;
    ctx.fillRect(8, 8, 16, 18);
    ctx.fillStyle = p.light;
    ctx.fillRect(10, 10, 12, 14);
    // antenna
    px(ctx, 16, 5, p.dark); px(ctx, 16, 6, p.dark); px(ctx, 16, 7, p.dark);
    px(ctx, 15, 4, p.dark); px(ctx, 17, 4, p.dark);
    // feet
    ctx.fillStyle = p.dark;
    ctx.fillRect(9, 26, 4, 2);
    ctx.fillRect(19, 26, 4, 2);
    return { eyeY: 14, eyeLeftX: 12, eyeRightX: 19, mouthY: 20, mouthX: 14 };
  },
];

// ── Variation decorations ──

function addVariations(ctx: CanvasRenderingContext2D, id: number, palette: typeof RARITY_PALETTES[1], rand: () => number) {
  const variation = id % 12;

  switch (variation) {
    case 0: // ear bumps (round)
      fillOval(ctx, 10, 8, 2, 2, palette.dark);
      fillOval(ctx, 22, 8, 2, 2, palette.dark);
      break;
    case 1: // tail right
      px(ctx, 26, 20, palette.dark);
      px(ctx, 27, 19, palette.dark);
      px(ctx, 28, 18, palette.dark);
      px(ctx, 29, 17, palette.dark);
      break;
    case 2: // spots
      px(ctx, 12, 18, palette.dark);
      px(ctx, 19, 14, palette.dark);
      px(ctx, 14, 22, palette.dark);
      break;
    case 3: // antennae
      px(ctx, 13, 6, palette.dark); px(ctx, 13, 7, palette.dark);
      px(ctx, 12, 5, palette.accent);
      px(ctx, 19, 6, palette.dark); px(ctx, 19, 7, palette.dark);
      px(ctx, 20, 5, palette.accent);
      break;
    case 4: // cheek blush
      px(ctx, 9, 18, '#ff9999');  px(ctx, 10, 18, '#ff9999');
      px(ctx, 22, 18, '#ff9999'); px(ctx, 23, 18, '#ff9999');
      break;
    case 5: // horn
      px(ctx, 16, 5, palette.dark);
      px(ctx, 16, 6, palette.dark);
      px(ctx, 16, 7, palette.accent);
      break;
    case 6: // wings
      px(ctx, 5, 15, palette.accent); px(ctx, 6, 14, palette.accent); px(ctx, 6, 16, palette.accent);
      px(ctx, 27, 15, palette.accent); px(ctx, 26, 14, palette.accent); px(ctx, 26, 16, palette.accent);
      break;
    case 7: // tail left
      px(ctx, 5, 22, palette.dark);
      px(ctx, 4, 21, palette.dark);
      px(ctx, 3, 20, palette.dark);
      break;
    case 8: // top tuft
      px(ctx, 15, 6, palette.accent); px(ctx, 16, 5, palette.accent); px(ctx, 17, 6, palette.accent);
      break;
    case 9: // belly stripe
      for (let x = 13; x <= 19; x++) {
        px(ctx, x, 20, palette.dark);
      }
      break;
    case 10: // side fins
      px(ctx, 6, 17, palette.accent); px(ctx, 7, 16, palette.accent); px(ctx, 7, 18, palette.accent);
      px(ctx, 25, 17, palette.accent); px(ctx, 24, 16, palette.accent); px(ctx, 24, 18, palette.accent);
      break;
    case 11: // freckles
      px(ctx, 11, 16, palette.dark);
      px(ctx, 13, 17, palette.dark);
      px(ctx, 20, 16, palette.dark);
      px(ctx, 18, 17, palette.dark);
      break;
  }
}

// ── Draw eyes ──

function drawEyes(ctx: CanvasRenderingContext2D, eyeLeftX: number, eyeRightX: number, eyeY: number, eyeColor: string, id: number) {
  const eyeStyle = id % 5;

  // White of eye
  px(ctx, eyeLeftX, eyeY, '#ffffff');
  px(ctx, eyeLeftX + 1, eyeY, '#ffffff');
  px(ctx, eyeRightX, eyeY, '#ffffff');
  px(ctx, eyeRightX + 1, eyeY, '#ffffff');

  // Pupil variations
  switch (eyeStyle) {
    case 0: // Normal dots
      px(ctx, eyeLeftX + 1, eyeY, eyeColor);
      px(ctx, eyeRightX, eyeY, eyeColor);
      break;
    case 1: // Wide eyes (both pixels dark)
      px(ctx, eyeLeftX, eyeY, eyeColor);
      px(ctx, eyeLeftX + 1, eyeY, eyeColor);
      px(ctx, eyeRightX, eyeY, eyeColor);
      px(ctx, eyeRightX + 1, eyeY, eyeColor);
      break;
    case 2: // Looking right
      px(ctx, eyeLeftX + 1, eyeY, eyeColor);
      px(ctx, eyeRightX + 1, eyeY, eyeColor);
      break;
    case 3: // Looking left
      px(ctx, eyeLeftX, eyeY, eyeColor);
      px(ctx, eyeRightX, eyeY, eyeColor);
      break;
    case 4: // Happy (closed / line eyes)
      px(ctx, eyeLeftX, eyeY, eyeColor);
      px(ctx, eyeLeftX + 1, eyeY, eyeColor);
      px(ctx, eyeRightX, eyeY, eyeColor);
      px(ctx, eyeRightX + 1, eyeY, eyeColor);
      px(ctx, eyeLeftX, eyeY - 1, '#ffffff');
      px(ctx, eyeRightX + 1, eyeY - 1, '#ffffff');
      break;
  }
}

// ── Draw mouth ──

function drawMouth(ctx: CanvasRenderingContext2D, mouthX: number, mouthY: number, id: number, palette: typeof RARITY_PALETTES[1]) {
  const mouthStyle = id % 6;
  const c = palette.dark;

  switch (mouthStyle) {
    case 0: // Simple line
      px(ctx, mouthX, mouthY, c);
      px(ctx, mouthX + 1, mouthY, c);
      px(ctx, mouthX + 2, mouthY, c);
      break;
    case 1: // Smile
      px(ctx, mouthX, mouthY, c);
      px(ctx, mouthX + 1, mouthY + 1, c);
      px(ctx, mouthX + 2, mouthY, c);
      break;
    case 2: // Open mouth (O)
      px(ctx, mouthX, mouthY, c);
      px(ctx, mouthX + 2, mouthY, c);
      px(ctx, mouthX, mouthY + 1, c);
      px(ctx, mouthX + 2, mouthY + 1, c);
      px(ctx, mouthX + 1, mouthY, '#ff6666');
      px(ctx, mouthX + 1, mouthY + 1, '#ff6666');
      break;
    case 3: // Dot
      px(ctx, mouthX + 1, mouthY, c);
      break;
    case 4: // Grin
      px(ctx, mouthX - 1, mouthY, c);
      px(ctx, mouthX, mouthY + 1, c);
      px(ctx, mouthX + 1, mouthY + 1, c);
      px(ctx, mouthX + 2, mouthY + 1, c);
      px(ctx, mouthX + 3, mouthY, c);
      break;
    case 5: // Fang smile
      px(ctx, mouthX, mouthY, c);
      px(ctx, mouthX + 1, mouthY + 1, c);
      px(ctx, mouthX + 2, mouthY, c);
      px(ctx, mouthX, mouthY + 1, '#ffffff'); // fang
      break;
  }
}

// ── Safari leaf indicator ──

function drawLeafIndicator(ctx: CanvasRenderingContext2D) {
  // Small green leaf in top-right corner
  px(ctx, 27, 2, '#44aa44');
  px(ctx, 28, 1, '#44aa44');
  px(ctx, 29, 1, '#44aa44');
  px(ctx, 28, 2, '#66cc66');
  px(ctx, 29, 2, '#66cc66');
  px(ctx, 30, 2, '#44aa44');
  px(ctx, 29, 3, '#44aa44');
}

// ── Generate a creature sprite ──

function generateCreature(id: number): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  const rarity = getCreatureRarity(id);
  const palette = RARITY_PALETTES[rarity];
  const rand = seededRandom(id * 31337);

  // Pick shape based on id
  const shapeIndex = id % bodyShapes.length;
  const shapeDrawer = bodyShapes[shapeIndex];
  const { eyeY, eyeLeftX, eyeRightX, mouthY, mouthX } = shapeDrawer(ctx, palette, rand);

  // Draw eyes
  drawEyes(ctx, eyeLeftX, eyeRightX, eyeY, palette.eye, id);

  // Draw mouth
  drawMouth(ctx, mouthX, mouthY, id, palette);

  // Add variations
  addVariations(ctx, id, palette, rand);

  // Safari leaf indicator
  if (isSafariCreature(id)) {
    drawLeafIndicator(ctx);
  }

  return canvas.toBuffer('image/png');
}

// ── Generate unknown silhouette ──

function generateUnknown(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  // Dark silhouette blob
  fillOval(ctx, 16, 18, 9, 9, '#333333');
  // Question mark
  px(ctx, 14, 14, '#666666');
  px(ctx, 15, 13, '#666666');
  px(ctx, 16, 13, '#666666');
  px(ctx, 17, 13, '#666666');
  px(ctx, 18, 14, '#666666');
  px(ctx, 17, 15, '#666666');
  px(ctx, 16, 16, '#666666');
  px(ctx, 16, 17, '#666666');
  px(ctx, 16, 19, '#666666');

  return canvas.toBuffer('image/png');
}

// ── Generate egg sprite ──

function generateEgg(rarity: number): Buffer {
  const canvas = createCanvas(EGG_WIDTH, EGG_HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, EGG_WIDTH, EGG_HEIGHT);

  const palette = RARITY_PALETTES[rarity];
  const rand = seededRandom(rarity * 7919);

  // Draw egg oval
  const cx = 12;
  const cy = 16;
  const rx = 9;
  const ry = 13;

  // Outline
  fillOval(ctx, cx, cy, rx, ry, palette.dark);
  // Body
  fillOval(ctx, cx, cy, rx - 1, ry - 1, palette.body);

  // Highlight / shine (upper-left area)
  fillOval(ctx, cx - 2, cy - 4, 3, 4, palette.light);

  // Speckle pattern
  const speckleCount = 5 + rarity * 2;
  for (let i = 0; i < speckleCount; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * 0.7;
    const sx = Math.round(cx + Math.cos(angle) * rx * dist);
    const sy = Math.round(cy + Math.sin(angle) * ry * dist);
    if (sx >= 0 && sx < EGG_WIDTH && sy >= 0 && sy < EGG_HEIGHT) {
      px(ctx, sx, sy, palette.dark);
    }
  }

  // Small white shine dot
  px(ctx, cx - 3, cy - 6, '#ffffff');
  px(ctx, cx - 2, cy - 6, '#ffffff');

  return canvas.toBuffer('image/png');
}

// ── Cosmetic sprite generators ──

function generateHatTophat(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Brim
  ctx.fillStyle = '#222222';
  ctx.fillRect(6, 22, 20, 3);
  // Body
  ctx.fillStyle = '#333333';
  ctx.fillRect(10, 8, 12, 14);
  // Band
  ctx.fillStyle = '#cc3333';
  ctx.fillRect(10, 18, 12, 2);
  // Highlight
  ctx.fillStyle = '#555555';
  ctx.fillRect(11, 9, 2, 12);
  return canvas.toBuffer('image/png');
}

function generateHatCrown(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Base
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(8, 18, 16, 8);
  // Points
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(8, 12, 3, 6);
  ctx.fillRect(14, 10, 4, 8);
  ctx.fillRect(21, 12, 3, 6);
  // Gems
  px(ctx, 9, 14, '#ff3333');
  px(ctx, 16, 12, '#3333ff');
  px(ctx, 22, 14, '#33cc33');
  // Outline darker
  ctx.fillStyle = '#d8b010';
  ctx.fillRect(8, 25, 16, 1);
  return canvas.toBuffer('image/png');
}

function generateHatParty(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Cone shape
  for (let y = 6; y < 28; y++) {
    const progress = (y - 6) / 22;
    const halfW = Math.floor(1 + progress * 8);
    ctx.fillStyle = (y % 4 < 2) ? '#ff6699' : '#66ccff';
    for (let x = 16 - halfW; x <= 16 + halfW; x++) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Pom pom on top
  fillOval(ctx, 16, 5, 2, 2, '#ffff33');
  return canvas.toBuffer('image/png');
}

function generateHatCowboy(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Wide brim
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(2, 20, 28, 3);
  // Crown
  ctx.fillStyle = '#A0522D';
  ctx.fillRect(9, 10, 14, 10);
  // Dip in middle top
  ctx.clearRect(13, 10, 6, 2);
  ctx.fillStyle = '#A0522D';
  ctx.fillRect(13, 11, 6, 1);
  // Band
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(9, 18, 14, 2);
  return canvas.toBuffer('image/png');
}

function generateHatWizard(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Cone
  for (let y = 2; y < 26; y++) {
    const progress = (y - 2) / 24;
    const halfW = Math.floor(1 + progress * 9);
    ctx.fillStyle = '#4444aa';
    for (let x = 16 - halfW; x <= 16 + halfW; x++) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Brim
  ctx.fillStyle = '#333388';
  ctx.fillRect(4, 26, 24, 3);
  // Stars
  px(ctx, 14, 12, '#ffff66');
  px(ctx, 18, 18, '#ffff66');
  px(ctx, 12, 20, '#ffff66');
  return canvas.toBuffer('image/png');
}

function generateAccSunglasses(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Bridge
  ctx.fillStyle = '#222222';
  ctx.fillRect(6, 14, 20, 2);
  // Left lens
  ctx.fillStyle = '#222222';
  ctx.fillRect(6, 12, 8, 6);
  ctx.fillStyle = '#4444aa';
  ctx.fillRect(7, 13, 6, 4);
  // Right lens
  ctx.fillStyle = '#222222';
  ctx.fillRect(18, 12, 8, 6);
  ctx.fillStyle = '#4444aa';
  ctx.fillRect(19, 13, 6, 4);
  // Shine
  px(ctx, 8, 13, '#8888ff');
  px(ctx, 20, 13, '#8888ff');
  return canvas.toBuffer('image/png');
}

function generateAccScarf(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Scarf wrap
  ctx.fillStyle = '#cc3333';
  ctx.fillRect(8, 14, 16, 4);
  ctx.fillStyle = '#aa2222';
  ctx.fillRect(8, 16, 16, 2);
  // Hanging end
  ctx.fillStyle = '#cc3333';
  ctx.fillRect(20, 18, 4, 10);
  ctx.fillStyle = '#aa2222';
  ctx.fillRect(22, 18, 2, 10);
  // Fringe
  px(ctx, 20, 28, '#dd4444');
  px(ctx, 22, 28, '#dd4444');
  return canvas.toBuffer('image/png');
}

function generateAccBowtie(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Left triangle
  ctx.fillStyle = '#cc3333';
  for (let y = 0; y < 6; y++) {
    const w = 6 - y;
    ctx.fillRect(10, 13 + y, w, 1);
    ctx.fillRect(10, 19 - y, w, 1);
  }
  // Right triangle
  for (let y = 0; y < 6; y++) {
    const w = 6 - y;
    ctx.fillRect(22 - w, 13 + y, w, 1);
    ctx.fillRect(22 - w, 19 - y, w, 1);
  }
  // Center knot
  ctx.fillStyle = '#aa2222';
  ctx.fillRect(15, 14, 2, 4);
  return canvas.toBuffer('image/png');
}

function generateAccCape(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Cape flowing
  ctx.fillStyle = '#8833cc';
  for (let y = 4; y < 30; y++) {
    const progress = (y - 4) / 26;
    const halfW = Math.floor(4 + progress * 8);
    const wave = Math.sin(y * 0.5) * 1;
    for (let x = 16 - halfW; x <= 16 + halfW; x++) {
      ctx.fillRect(Math.round(x + wave), y, 1, 1);
    }
  }
  // Inner color
  ctx.fillStyle = '#aa55ee';
  for (let y = 6; y < 28; y++) {
    const progress = (y - 6) / 22;
    const halfW = Math.floor(2 + progress * 6);
    for (let x = 16 - halfW; x <= 16 + halfW; x++) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Clasp
  px(ctx, 15, 5, '#f8d030');
  px(ctx, 16, 5, '#f8d030');
  px(ctx, 17, 5, '#f8d030');
  return canvas.toBuffer('image/png');
}

function generateAccMonocle(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Circle frame
  ctx.fillStyle = '#f8d030';
  for (let a = 0; a < 360; a += 5) {
    const rad = (a * Math.PI) / 180;
    px(ctx, Math.round(16 + Math.cos(rad) * 6), Math.round(16 + Math.sin(rad) * 6), '#f8d030');
  }
  // Glass
  fillOval(ctx, 16, 16, 5, 5, 'rgba(100,150,255,0.3)');
  ctx.fillStyle = '#aaccff';
  fillOval(ctx, 16, 16, 4, 4, '#ddeeff');
  // Shine
  px(ctx, 13, 13, '#ffffff');
  px(ctx, 14, 13, '#ffffff');
  // Chain
  for (let y = 22; y < 30; y++) {
    px(ctx, 16 + (y - 22), y, '#f8d030');
  }
  return canvas.toBuffer('image/png');
}

function generateBgMeadow(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  // Sky
  ctx.fillStyle = '#88ccff';
  ctx.fillRect(0, 0, 32, 18);
  // Ground
  ctx.fillStyle = '#66aa44';
  ctx.fillRect(0, 18, 32, 14);
  ctx.fillStyle = '#77bb55';
  ctx.fillRect(0, 18, 32, 2);
  // Sun
  fillOval(ctx, 26, 6, 3, 3, '#ffdd44');
  // Flowers
  px(ctx, 5, 22, '#ff6699'); px(ctx, 5, 21, '#44aa44');
  px(ctx, 12, 24, '#ffff66'); px(ctx, 12, 23, '#44aa44');
  px(ctx, 22, 23, '#ff6699'); px(ctx, 22, 22, '#44aa44');
  return canvas.toBuffer('image/png');
}

function generateBgStars(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  // Night sky
  ctx.fillStyle = '#111133';
  ctx.fillRect(0, 0, 32, 32);
  // Stars
  const rand = seededRandom(42);
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(rand() * 32);
    const y = Math.floor(rand() * 32);
    const bright = rand() > 0.5 ? '#ffffff' : '#aaaacc';
    px(ctx, x, y, bright);
  }
  // Moon
  fillOval(ctx, 6, 8, 3, 3, '#ffffcc');
  fillOval(ctx, 7, 7, 2, 2, '#111133'); // crescent
  return canvas.toBuffer('image/png');
}

function generateBgOcean(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  // Sky
  ctx.fillStyle = '#ffbb77';
  ctx.fillRect(0, 0, 32, 14);
  // Sun
  fillOval(ctx, 16, 12, 4, 3, '#ff8844');
  // Water
  for (let y = 14; y < 32; y++) {
    const shade = Math.floor(40 + (y - 14) * 3);
    ctx.fillStyle = `rgb(${shade}, ${shade + 40}, ${shade + 100})`;
    ctx.fillRect(0, y, 32, 1);
  }
  // Wave highlights
  px(ctx, 4, 16, '#88bbff'); px(ctx, 5, 16, '#88bbff');
  px(ctx, 14, 20, '#88bbff'); px(ctx, 15, 20, '#88bbff');
  px(ctx, 24, 18, '#88bbff'); px(ctx, 25, 18, '#88bbff');
  return canvas.toBuffer('image/png');
}

function generateBgForest(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  // Sky through canopy
  ctx.fillStyle = '#336633';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#88ccaa';
  ctx.fillRect(0, 0, 32, 8);
  // Tree trunks
  ctx.fillStyle = '#664422';
  ctx.fillRect(4, 8, 3, 24);
  ctx.fillRect(16, 6, 3, 26);
  ctx.fillRect(26, 10, 3, 22);
  // Canopy
  fillOval(ctx, 5, 8, 5, 4, '#338833');
  fillOval(ctx, 17, 6, 6, 5, '#228822');
  fillOval(ctx, 27, 9, 4, 4, '#339933');
  // Ground
  ctx.fillStyle = '#553311';
  ctx.fillRect(0, 28, 32, 4);
  return canvas.toBuffer('image/png');
}

function generateBgRoom(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  // Wall
  ctx.fillStyle = '#ddccaa';
  ctx.fillRect(0, 0, 32, 22);
  // Floor
  ctx.fillStyle = '#aa8866';
  ctx.fillRect(0, 22, 32, 10);
  // Window
  ctx.fillStyle = '#88ccff';
  ctx.fillRect(20, 4, 8, 8);
  ctx.fillStyle = '#ddccaa';
  ctx.fillRect(24, 4, 1, 8);
  ctx.fillRect(20, 8, 8, 1);
  // Rug
  ctx.fillStyle = '#cc5544';
  ctx.fillRect(4, 26, 16, 4);
  ctx.fillStyle = '#dd6655';
  ctx.fillRect(6, 27, 12, 2);
  return canvas.toBuffer('image/png');
}

function generateFxSparkles(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  const rand = seededRandom(123);
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(rand() * 30) + 1;
    const y = Math.floor(rand() * 30) + 1;
    const c = rand() > 0.5 ? '#ffff88' : '#ffffff';
    px(ctx, x, y, c);
    // Cross pattern for some
    if (rand() > 0.5) {
      px(ctx, x - 1, y, c);
      px(ctx, x + 1, y, c);
      px(ctx, x, y - 1, c);
      px(ctx, x, y + 1, c);
    }
  }
  return canvas.toBuffer('image/png');
}

function generateFxHearts(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  function drawHeart(cx: number, cy: number, color: string) {
    px(ctx, cx - 1, cy, color);
    px(ctx, cx + 1, cy, color);
    px(ctx, cx - 2, cy + 1, color);
    px(ctx, cx, cy + 1, color);
    px(ctx, cx + 2, cy + 1, color);
    px(ctx, cx - 1, cy + 2, color);
    px(ctx, cx + 1, cy + 2, color);
    px(ctx, cx, cy + 3, color);
  }
  drawHeart(8, 6, '#ff4466');
  drawHeart(22, 10, '#ff6688');
  drawHeart(14, 20, '#ff4466');
  return canvas.toBuffer('image/png');
}

function generateFxFire(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Fire columns
  const rand = seededRandom(456);
  for (let x = 4; x < 28; x += 3) {
    const height = Math.floor(rand() * 12) + 6;
    for (let y = 30 - height; y < 30; y++) {
      const progress = (y - (30 - height)) / height;
      let c: string;
      if (progress < 0.3) c = '#ffff44';
      else if (progress < 0.6) c = '#ff8800';
      else c = '#ff3300';
      px(ctx, x, y, c);
      if (rand() > 0.3) px(ctx, x + 1, y, c);
    }
  }
  return canvas.toBuffer('image/png');
}

function generateFxBubbles(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  const rand = seededRandom(789);
  for (let i = 0; i < 8; i++) {
    const cx = Math.floor(rand() * 26) + 3;
    const cy = Math.floor(rand() * 26) + 3;
    const r = Math.floor(rand() * 3) + 2;
    // Circle outline
    for (let a = 0; a < 360; a += 15) {
      const rad = (a * Math.PI) / 180;
      px(ctx, Math.round(cx + Math.cos(rad) * r), Math.round(cy + Math.sin(rad) * r), '#88ccff');
    }
    // Shine
    px(ctx, cx - 1, cy - 1, '#ffffff');
  }
  return canvas.toBuffer('image/png');
}

function generateFxLightning(): Buffer {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  // Bolt 1
  const bolt = [[14, 2], [12, 6], [16, 10], [13, 14], [17, 18], [14, 22], [16, 26], [15, 30]];
  for (let i = 0; i < bolt.length - 1; i++) {
    const [x1, y1] = bolt[i];
    const [x2, y2] = bolt[i + 1];
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x1 + (x2 - x1) * s / steps);
      const y = Math.round(y1 + (y2 - y1) * s / steps);
      px(ctx, x, y, '#ffff44');
      px(ctx, x + 1, y, '#ffff88');
    }
  }
  // Bolt 2 (smaller)
  const bolt2 = [[22, 4], [20, 8], [24, 12], [21, 16]];
  for (let i = 0; i < bolt2.length - 1; i++) {
    const [x1, y1] = bolt2[i];
    const [x2, y2] = bolt2[i + 1];
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x1 + (x2 - x1) * s / steps);
      const y = Math.round(y1 + (y2 - y1) * s / steps);
      px(ctx, x, y, '#ffff44');
    }
  }
  return canvas.toBuffer('image/png');
}

// ── Extension icon generator ──

function generateExtensionIcon(size: number): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const scale = size / 32;

  // Egg shape
  const cx = Math.round(size / 2);
  const cy = Math.round(size / 2 + 2 * scale);
  const rx = Math.round(10 * scale);
  const ry = Math.round(13 * scale);

  // Outline
  fillOval(ctx, cx, cy, rx, ry, '#d83868');
  // Body
  fillOval(ctx, cx, cy, rx - Math.ceil(scale), ry - Math.ceil(scale), '#f85888');
  // Highlight
  fillOval(ctx, cx - Math.round(2 * scale), cy - Math.round(4 * scale), Math.round(3 * scale), Math.round(4 * scale), '#ff78a8');

  // "H" letter
  const letterColor = '#ffffff';
  const lx = Math.round(cx - 4 * scale);
  const ly = Math.round(cy - 4 * scale);
  const lh = Math.round(8 * scale);
  const lw = Math.round(8 * scale);
  const thick = Math.max(1, Math.round(1.5 * scale));

  // Left stroke of H
  ctx.fillStyle = letterColor;
  ctx.fillRect(lx, ly, thick, lh);
  // Right stroke of H
  ctx.fillRect(lx + lw - thick, ly, thick, lh);
  // Middle bar of H
  ctx.fillRect(lx, ly + Math.round(lh / 2) - Math.floor(thick / 2), lw, thick);

  return canvas.toBuffer('image/png');
}

// ── Main ──

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  console.log('Generating placeholder sprites...\n');

  // Create directories
  ensureDir(CREATURE_DIR);
  ensureDir(EGG_DIR);
  ensureDir(COSMETIC_DIR);
  ensureDir(ICON_DIR);

  // Generate creature sprites
  console.log(`Generating ${CREATURE_COUNT} creature sprites (32x32)...`);
  for (let id = 1; id <= CREATURE_COUNT; id++) {
    const filename = String(id).padStart(3, '0') + '.png';
    const buf = generateCreature(id);
    fs.writeFileSync(path.join(CREATURE_DIR, filename), buf);
  }
  console.log(`  -> ${CREATURE_COUNT} creature sprites written to ${CREATURE_DIR}`);

  // Generate unknown silhouette
  const unknownBuf = generateUnknown();
  fs.writeFileSync(path.join(CREATURE_DIR, 'unknown.png'), unknownBuf);
  console.log('  -> unknown.png silhouette written');

  // Generate egg sprites (one per rarity)
  console.log('\nGenerating 5 egg sprites (24x32)...');
  for (let rarity = 1; rarity <= 5; rarity++) {
    const filename = `egg-${RARITY_NAMES[rarity]}.png`;
    const buf = generateEgg(rarity);
    fs.writeFileSync(path.join(EGG_DIR, filename), buf);
  }
  console.log(`  -> 5 egg sprites written to ${EGG_DIR}`);

  // Generate cosmetic sprites
  console.log('\nGenerating 20 cosmetic sprites (32x32)...');
  const cosmeticGenerators: Record<string, () => Buffer> = {
    'hat-tophat.png': generateHatTophat,
    'hat-crown.png': generateHatCrown,
    'hat-party.png': generateHatParty,
    'hat-cowboy.png': generateHatCowboy,
    'hat-wizard.png': generateHatWizard,
    'acc-sunglasses.png': generateAccSunglasses,
    'acc-scarf.png': generateAccScarf,
    'acc-bowtie.png': generateAccBowtie,
    'acc-cape.png': generateAccCape,
    'acc-monocle.png': generateAccMonocle,
    'bg-meadow.png': generateBgMeadow,
    'bg-stars.png': generateBgStars,
    'bg-ocean.png': generateBgOcean,
    'bg-forest.png': generateBgForest,
    'bg-room.png': generateBgRoom,
    'fx-sparkles.png': generateFxSparkles,
    'fx-hearts.png': generateFxHearts,
    'fx-fire.png': generateFxFire,
    'fx-bubbles.png': generateFxBubbles,
    'fx-lightning.png': generateFxLightning,
  };

  for (const [filename, generator] of Object.entries(cosmeticGenerators)) {
    const buf = generator();
    fs.writeFileSync(path.join(COSMETIC_DIR, filename), buf);
  }
  console.log(`  -> 20 cosmetic sprites written to ${COSMETIC_DIR}`);

  // Generate extension icons
  console.log('\nGenerating extension icons...');
  for (const size of [16, 48, 128]) {
    const filename = `icon-${size}.png`;
    const buf = generateExtensionIcon(size);
    fs.writeFileSync(path.join(ICON_DIR, filename), buf);
  }
  console.log(`  -> 3 extension icons written to ${ICON_DIR}`);

  console.log('\nDone! All sprites generated successfully.');
}

main();
