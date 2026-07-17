// The pixel room — a hand-drawn 2D scene rendered on a 480x270 canvas,
// scaled up with nearest-neighbor for a crisp pixel-art look.
//
// Everything is drawn in scene coordinates (480x270). LAYOUT is shared with
// the DOM hotspot overlay so the clickable regions always match the art.

export const SCENE_W = 480;
export const SCENE_H = 270;

// ---------------------------------------------------------------------------
// Layout — object bounding boxes in scene coordinates
// ---------------------------------------------------------------------------
export const LAYOUT = {
  wallY: 186, // wall / floor junction
  shelf: { x: 12, y: 96, w: 48, h: 134 }, // bookshelf (skills)
  window: { x: 74, y: 26, w: 104, h: 92 },
  plant: { x: 160, y: 146, w: 26, h: 44 },
  desk: { x: 196, y: 158, w: 140, h: 70 }, // includes legs
  monitor: { x: 240, y: 100, w: 72, h: 58 }, // screen + stand (work)
  lamp: { x: 198, y: 116, w: 26, h: 42 },
  mug: { x: 318, y: 140, w: 14, h: 18 },
  frames: { x: 232, y: 50, w: 62, h: 40 }, // diplomas (education)
  cabinet: { x: 340, y: 176, w: 32, h: 54 }, // file cabinet (resume)
  phone: { x: 340, y: 154, w: 30, h: 22 }, // rotary phone (contact)
  poster: { x: 336, y: 94, w: 36, h: 46 }, // synthwave poster (about)
  arcade: { x: 380, y: 84, w: 52, h: 150 }, // arcade cabinet (demos)
  crt: { x: 438, y: 146, w: 38, h: 88 }, // old CRT on crate (terminal)
  cat: { x: 248, y: 236, w: 44, h: 24 },
  rug: { x: 204, y: 230, w: 132, h: 36 },
};

// ---------------------------------------------------------------------------
// Palette — cozy dusk. Shadows lean purple, light leans amber.
// ---------------------------------------------------------------------------
const C = {
  // night sky
  sky: '#0b0d21',
  skyHi: '#141838',
  star: '#e8e6ff',
  starDim: '#7d81b8',
  moon: '#f4efd9',
  moonDim: '#d9d2ae',
  city: '#171a38',
  cityLit: '#ffd98a',
  rain: '#8fa3d9',

  // room
  wall: '#262a4d',
  wallLo: '#20234226',
  wallDk: '#1f2242',
  base: '#181b36',
  baseHi: '#2c3054',
  floor: '#41334c',
  floorLo: '#372b41',
  floorHi: '#4f3e5c',
  plank: '#2f2539',

  // wood
  wood: '#8a5d3f',
  woodHi: '#a5754e',
  woodLo: '#6b4530',
  woodDk: '#4a3122',

  // light
  ember: '#ffb44f',
  emberHi: '#ffe6b0',
  emberLo: '#c97e2e',

  // screens
  cyan: '#7ee8e0',
  cyanDim: '#3ecfc4',
  screen: '#0e2b33',
  crtGreen: '#69f0a0',
  crtDark: '#0d2417',

  // accents
  rose: '#ff6b9d',
  purple: '#b07ee8',
  red: '#e0523f',
  redHi: '#f27b6a',
  blue: '#5a8fd8',
  green: '#6fae64',
  yellow: '#f2c94c',

  // misc
  ink: '#0c0e22',
  paper: '#eae6ff',
  cream: '#e8ddc0',
  metal: '#5b5878',
  metalHi: '#74719a',
  metalLo: '#454263',
  beige: '#c9bda1',
  beigeLo: '#a99e83',
  catFur: '#2c2f4e',
  catDark: '#20233c',
};

type Ctx = CanvasRenderingContext2D;

export interface SceneState {
  hovered: string | null;
  lampOn: boolean;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const px = (
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
) => {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

const alpha = (c: Ctx, a: number, fn: () => void) => {
  const prev = c.globalAlpha;
  c.globalAlpha = a * prev;
  fn();
  c.globalAlpha = prev;
};

// deterministic pseudo-random (so the room looks the same on every visit)
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------------------
// Background: wall, floor, string lights
// ---------------------------------------------------------------------------
function drawRoomShell(c: Ctx, t: number) {
  const { wallY } = LAYOUT;
  // wall with a subtle vertical gradient (three bands)
  px(c, 0, 0, SCENE_W, wallY, C.wall);
  px(c, 0, 0, SCENE_W, 34, C.wallDk);
  alpha(c, 0.5, () => px(c, 0, 34, SCENE_W, 18, C.wallDk));
  // sparse wall texture specks
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(rnd(i) * SCENE_W);
    const y = Math.floor(rnd(i + 50) * (wallY - 20)) + 10;
    alpha(c, 0.35, () => px(c, x, y, 1, 1, C.wallDk));
  }
  // baseboard
  px(c, 0, wallY - 8, SCENE_W, 8, C.base);
  px(c, 0, wallY - 8, SCENE_W, 1, C.baseHi);
  // floor — long horizontal boards, warm and clearly distinct from the wall
  px(c, 0, wallY, SCENE_W, SCENE_H - wallY, C.floor);
  alpha(c, 0.6, () => px(c, 0, wallY, SCENE_W, 4, C.floorHi));
  for (let y = wallY + 9, row = 0; y < SCENE_H; y += 11, row++) {
    alpha(c, 0.6, () => px(c, 0, y, SCENE_W, 1, C.plank));
    // one subtle board end per row
    const x = ((rnd(row * 13.7) * SCENE_W) | 0) % SCENE_W;
    alpha(c, 0.2, () => px(c, x, y + 1, 1, 10, C.plank));
    // faint grain streaks
    const gx = (rnd(row * 7.1) * SCENE_W) | 0;
    alpha(c, 0.2, () => px(c, gx, y + 4, 26, 1, C.floorLo));
  }
  // gets darker toward the viewer
  alpha(c, 0.18, () => px(c, 0, SCENE_H - 26, SCENE_W, 26, C.ink));
}

function drawStringLights(c: Ctx, t: number) {
  // sagging wire with warm bulbs — three gentle arcs across the top
  const hooks = [0, 160, 320, 480];
  c.fillStyle = C.metalLo;
  for (let s = 0; s < 3; s++) {
    const x0 = hooks[s];
    const x1 = hooks[s + 1];
    for (let x = x0; x <= x1; x += 2) {
      const p = (x - x0) / (x1 - x0);
      const sag = Math.sin(p * Math.PI) * 8;
      px(c, x, 6 + sag, 1, 1, C.metalLo);
    }
  }
  const bulbCols = [C.ember, C.rose, C.cyanDim, C.purple];
  let i = 0;
  for (let s = 0; s < 3; s++) {
    const x0 = hooks[s];
    const x1 = hooks[s + 1];
    for (let x = x0 + 20; x < x1 - 8; x += 26) {
      const p = (x - x0) / (x1 - x0);
      const sag = Math.sin(p * Math.PI) * 8;
      const col = bulbCols[i % bulbCols.length];
      const tw = 0.62 + 0.38 * Math.sin(t * 1.8 + i * 1.7);
      px(c, x, 7 + sag, 1, 2, C.metalLo); // stem
      alpha(c, tw, () => {
        px(c, x - 1, 9 + sag, 3, 3, col);
        alpha(c, 0.25, () => px(c, x - 3, 7 + sag, 7, 7, col)); // halo
      });
      i++;
    }
  }
}

// ---------------------------------------------------------------------------
// Window: night sky, moon, stars, city, rain
// ---------------------------------------------------------------------------
function drawWindow(c: Ctx, t: number) {
  const W = LAYOUT.window;
  const fx = W.x,
    fy = W.y,
    fw = W.w,
    fh = W.h;
  // outer frame
  px(c, fx - 4, fy - 4, fw + 8, fh + 8, C.woodDk);
  px(c, fx - 3, fy - 3, fw + 6, fh + 6, C.wood);
  px(c, fx - 3, fy - 3, fw + 6, 1, C.woodHi);
  // sky
  px(c, fx, fy, fw, fh, C.sky);
  alpha(c, 0.65, () => px(c, fx, fy + fh - 34, fw, 34, C.skyHi));

  // stars (fixed, twinkling)
  for (let i = 0; i < 26; i++) {
    const sx = fx + 3 + rnd(i * 3.7) * (fw - 6);
    const sy = fy + 3 + rnd(i * 9.1) * (fh - 40);
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rnd(i) * 1.2) + i));
    alpha(c, tw, () =>
      px(c, sx, sy, 1, 1, rnd(i + 99) > 0.75 ? C.star : C.starDim),
    );
  }

  // moon, top-left pane — halo built from stepped circles, not squares
  const mx = fx + 18,
    my = fy + 16;
  const halo = (r: number, a: number) => {
    alpha(c, a, () => {
      px(
        c,
        mx + 5 - r,
        my + 5 - Math.round(r * 0.62),
        r * 2,
        Math.round(r * 1.24),
        C.moon,
      );
      px(
        c,
        mx + 5 - Math.round(r * 0.62),
        my + 5 - r,
        Math.round(r * 1.24),
        r * 2,
        C.moon,
      );
    });
  };
  halo(11, 0.05);
  halo(8, 0.07);
  px(c, mx, my, 10, 10, C.moon);
  px(c, mx + 1, my - 1, 8, 1, C.moon);
  px(c, mx + 1, my + 10, 8, 1, C.moon);
  px(c, mx - 1, my + 1, 1, 8, C.moon);
  px(c, mx + 10, my + 1, 1, 8, C.moon);
  px(c, mx + 2, my + 3, 2, 2, C.moonDim);
  px(c, mx + 6, my + 6, 2, 1, C.moonDim);
  px(c, mx + 5, my + 1, 1, 1, C.moonDim);

  // city skyline
  const cityY = fy + fh - 26;
  const widths = [11, 8, 14, 9, 12, 10, 13, 9, 12, 10];
  let bx = fx;
  let bi = 0;
  while (bx < fx + fw) {
    const bw = widths[bi % widths.length];
    const bh = 8 + rnd(bi * 5.3) * 18;
    px(c, bx, cityY + (26 - bh), Math.min(bw, fx + fw - bx), bh, C.city);
    // lit windows
    for (let wy = 0; wy < bh - 3; wy += 4) {
      for (let wx = 1; wx < bw - 2; wx += 3) {
        if (rnd(bi * 31 + wx * 7 + wy * 13) > 0.55) {
          const blink = Math.sin(t * 0.4 + bi * 3 + wx + wy) > -0.7;
          if (blink && bx + wx + 1 < fx + fw) {
            const col = rnd(bi + wx * wy) > 0.8 ? C.cyanDim : C.cityLit;
            alpha(c, 0.85, () =>
              px(c, bx + wx, cityY + (26 - bh) + wy + 2, 1, 1, col),
            );
          }
        }
      }
    }
    bx += bw + 1;
    bi++;
  }

  // rain (clipped to window)
  c.save();
  c.beginPath();
  c.rect(fx, fy, fw, fh);
  c.clip();
  for (let i = 0; i < 16; i++) {
    const speed = 55 + rnd(i) * 45;
    const rx = fx + rnd(i * 13.7) * fw + Math.sin(i) * 2;
    const ry = fy + ((rnd(i * 7.3) * fh + t * speed) % (fh + 8)) - 4;
    alpha(c, 0.5, () => {
      px(c, rx, ry, 1, 4, C.rain);
      px(c, rx + 0.5, ry + 4, 1, 2, C.rain);
    });
  }
  c.restore();

  // mullions (cross bars)
  px(c, fx + fw / 2 - 1, fy, 3, fh, C.wood);
  px(c, fx, fy + fh / 2 - 1, fw, 3, C.wood);
  px(c, fx + fw / 2 - 1, fy, 1, fh, C.woodHi);
  px(c, fx, fy + fh / 2 - 1, fw, 1, C.woodHi);
  // sill
  px(c, fx - 6, fy + fh + 4, fw + 12, 4, C.wood);
  px(c, fx - 6, fy + fh + 4, fw + 12, 1, C.woodHi);
  px(c, fx - 6, fy + fh + 7, fw + 12, 1, C.woodDk);
  // tiny succulent on the sill
  px(c, fx + fw - 18, fy + fh - 1, 8, 5, '#b0714e');
  px(c, fx + fw - 17, fy + fh - 5, 2, 4, C.green);
  px(c, fx + fw - 14, fy + fh - 6, 2, 5, '#598c50');
  px(c, fx + fw - 12, fy + fh - 4, 2, 3, C.green);
}

// ---------------------------------------------------------------------------
// Bookshelf (skills)
// ---------------------------------------------------------------------------
function drawBookshelf(c: Ctx, t: number) {
  const S = LAYOUT.shelf;
  // shadow on floor
  alpha(c, 0.3, () => px(c, S.x - 2, S.y + S.h - 2, S.w + 8, 5, C.ink));
  // carcass
  px(c, S.x, S.y, S.w, S.h, C.woodLo);
  px(c, S.x + 2, S.y + 2, S.w - 4, S.h - 4, C.woodDk);
  px(c, S.x, S.y, S.w, 2, C.wood);
  px(c, S.x, S.y, 2, S.h, C.wood);
  // shelves + books
  const bookCols = [
    C.red,
    C.blue,
    C.green,
    C.yellow,
    C.purple,
    C.rose,
    C.cyanDim,
    C.emberLo,
  ];
  for (let s = 0; s < 4; s++) {
    const shelfY = S.y + 10 + s * 30;
    px(c, S.x + 2, shelfY + 20, S.w - 4, 3, C.wood);
    px(c, S.x + 2, shelfY + 20, S.w - 4, 1, C.woodHi);
    // a row of books
    let bx = S.x + 5;
    let k = 0;
    while (bx < S.x + S.w - 8) {
      const bw = 3 + Math.floor(rnd(s * 17 + k) * 4);
      const bh = 13 + Math.floor(rnd(s * 29 + k * 3) * 7);
      const col = bookCols[Math.floor(rnd(s * 7 + k * 11) * bookCols.length)];
      // one leaning book per shelf: draw as a step
      if (k === 4 && s % 2 === 0) {
        px(c, bx, shelfY + 20 - bh + 4, bw + 2, bh - 4, col);
        px(c, bx + 2, shelfY + 20 - bh + 2, bw, 2, col);
      } else {
        px(c, bx, shelfY + 20 - bh, bw, bh, col);
        alpha(c, 0.35, () => px(c, bx, shelfY + 20 - bh, 1, bh, C.ink));
        // spine label dot
        alpha(c, 0.7, () =>
          px(c, bx + 1, shelfY + 20 - bh + 3, bw - 2, 1, C.paper),
        );
      }
      bx += bw + 1;
      k++;
    }
  }
  // trophy on top
  const tx = S.x + 18,
    ty = S.y - 12;
  px(c, tx + 2, ty + 9, 8, 3, C.woodDk); // base
  px(c, tx + 4, ty + 6, 4, 3, C.emberLo); // stem
  px(c, tx + 2, ty, 8, 6, C.yellow); // cup
  px(c, tx + 1, ty, 1, 3, C.yellow);
  px(c, tx + 10, ty, 1, 3, C.yellow);
  px(c, tx + 3, ty + 1, 2, 2, C.emberHi); // shine
}

// ---------------------------------------------------------------------------
// Plant
// ---------------------------------------------------------------------------
function drawPlant(c: Ctx, t: number) {
  const P = LAYOUT.plant;
  const bx = P.x + P.w / 2;
  const by = P.y + P.h; // floor point
  alpha(c, 0.3, () => px(c, P.x + 2, by - 2, P.w - 2, 4, C.ink));
  // pot
  px(c, bx - 7, by - 12, 14, 10, '#b0714e');
  px(c, bx - 8, by - 14, 16, 3, '#c98a5e');
  px(c, bx - 7, by - 12, 2, 10, '#8c5638');
  // monstera-style: curving stems, each carrying a broad leaf
  const sway = Math.sin(t * 0.8) * 1.2;
  const stemTop = by - 14; // pot rim
  const leaf = (
    lx: number,
    ly: number,
    w: number,
    h: number,
    col: string,
    hi: string,
  ) => {
    px(c, lx, ly + 1, w, h - 2, col);
    px(c, lx + 1, ly, w - 2, h, col);
    px(c, lx + 1, ly + 1, 2, 2, hi); // sheen
  };
  const stems: [number, number, string, string][] = [
    [-9, -22, '#4c7a45', '#6fae64'],
    [-1, -30, '#6fae64', '#9ed48f'],
    [7, -19, '#598c50', '#7bc86f'],
  ];
  stems.forEach(([dx, dy, col, hi], i) => {
    const s = Math.round(sway * (i % 2 === 0 ? 1 : -1));
    // stem: rises and bends toward its leaf
    const steps = -dy - 6;
    for (let k = 0; k < steps; k++) {
      const sx2 = bx + Math.round((dx * k) / steps);
      px(c, sx2, stemTop - k, 1, 1, '#3f6339');
    }
    leaf(bx + dx + s - 4, stemTop + dy, 9, 7, col, hi);
  });
}

// ---------------------------------------------------------------------------
// Desk + monitor + lamp + keyboard + mug
// ---------------------------------------------------------------------------
function drawDesk(c: Ctx, t: number, s: SceneState) {
  const D = LAYOUT.desk;
  const topY = D.y; // 158
  // floor shadow
  alpha(c, 0.3, () => px(c, D.x + 2, D.y + D.h - 2, D.w + 4, 5, C.ink));
  // legs
  px(c, D.x + 4, topY + 8, 6, D.h - 8, C.woodLo);
  px(c, D.x + D.w - 10, topY + 8, 6, D.h - 8, C.woodLo);
  px(c, D.x + 4, topY + 8, 2, D.h - 8, C.woodDk);
  px(c, D.x + D.w - 10, topY + 8, 2, D.h - 8, C.woodDk);
  // desktop
  px(c, D.x, topY, D.w, 8, C.wood);
  px(c, D.x, topY, D.w, 2, C.woodHi);
  px(c, D.x, topY + 6, D.w, 2, C.woodDk);
  // grain
  alpha(c, 0.4, () => {
    px(c, D.x + 18, topY + 3, 24, 1, C.woodLo);
    px(c, D.x + 70, topY + 4, 30, 1, C.woodLo);
    px(c, D.x + 110, topY + 2, 16, 1, C.woodLo);
  });
  // a small notebook resting in the lamplight
  px(c, D.x + 22, topY - 4, 16, 4, '#d8b06a');
  px(c, D.x + 22, topY - 4, 16, 1, '#f0cf8e');
  px(c, D.x + 24, topY - 2, 12, 1, '#a8813f');
  px(c, D.x + 29, topY - 4, 1, 4, C.rose); // bookmark

  drawMonitor(c, t);
  drawKeyboard(c, t);
  drawMug(c, t);
  drawLamp(c, t, s);
}

function drawMonitor(c: Ctx, t: number) {
  const M = LAYOUT.monitor;
  const sx = M.x,
    sy = M.y; // screen block 72x48, stand below
  // stand
  px(c, sx + 30, sy + 48, 12, 6, C.metalLo);
  px(c, sx + 22, sy + 54, 28, 3, C.metal);
  px(c, sx + 22, sy + 54, 28, 1, C.metalHi);
  // bezel
  px(c, sx, sy, 72, 48, C.ink);
  px(c, sx + 1, sy + 1, 70, 46, '#171a30');
  // screen
  const scr = { x: sx + 4, y: sy + 4, w: 64, h: 40 };
  px(c, scr.x, scr.y, scr.w, scr.h, C.screen);
  // scrolling "code" — deterministic infinite scroll
  c.save();
  c.beginPath();
  c.rect(scr.x + 1, scr.y + 1, scr.w - 2, scr.h - 2);
  c.clip();
  const lineH = 4;
  const scroll = t * 3;
  const first = Math.floor(scroll / lineH);
  const codeCols = [C.cyan, C.rose, C.purple, C.ember, '#5b6b9e', C.cyanDim];
  for (let li = first; li < first + 12; li++) {
    const y = scr.y + 2 + (li * lineH - scroll);
    const indent = Math.floor(rnd(li * 3.3) * 3) * 5;
    let x = scr.x + 3 + indent;
    const nSeg = 1 + Math.floor(rnd(li * 7.7) * 3);
    for (let g = 0; g < nSeg; g++) {
      const w = 4 + Math.floor(rnd(li * 13 + g * 5) * 12);
      const col = codeCols[Math.floor(rnd(li * 11 + g * 3) * codeCols.length)];
      alpha(c, 0.9, () => px(c, x, y, w, 2, col));
      x += w + 3;
      if (x > scr.x + scr.w - 8) break;
    }
  }
  // blinking cursor at the bottom
  if (Math.sin(t * 4) > 0) {
    px(c, scr.x + 4, scr.y + scr.h - 5, 3, 3, C.cyan);
  }
  c.restore();
  // occasional soft flicker
  const flick = Math.sin(t * 1.3) > 0.985 ? 0.08 : 0;
  if (flick) alpha(c, flick, () => px(c, scr.x, scr.y, scr.w, scr.h, C.cyan));
  // screen edge glow — thin feathered halo around the bezel
  alpha(c, 0.1, () => {
    px(c, sx - 1, sy - 1, 74, 1, C.cyanDim);
    px(c, sx - 1, sy + 48, 74, 1, C.cyanDim);
    px(c, sx - 1, sy, 1, 48, C.cyanDim);
    px(c, sx + 72, sy, 1, 48, C.cyanDim);
  });
  alpha(c, 0.05, () => {
    px(c, sx - 3, sy - 3, 78, 2, C.cyanDim);
    px(c, sx - 3, sy + 49, 78, 2, C.cyanDim);
    px(c, sx - 3, sy - 1, 2, 52, C.cyanDim);
    px(c, sx + 73, sy - 1, 2, 52, C.cyanDim);
  });
  // power LED
  px(c, sx + 34, sy + 49, 2, 1, C.cyan);
}

function drawKeyboard(c: Ctx, t: number) {
  const M = LAYOUT.monitor;
  const kx = M.x + 8,
    ky = LAYOUT.desk.y - 7;
  px(c, kx, ky, 48, 7, C.metalLo);
  px(c, kx, ky, 48, 1, C.metalHi);
  for (let r = 0; r < 2; r++) {
    for (let k = 0; k < 14; k++) {
      px(c, kx + 2 + k * 3.3, ky + 2 + r * 3, 2, 2, C.metal);
    }
  }
  // mouse
  px(c, kx + 56, ky + 2, 6, 5, C.metal);
  px(c, kx + 56, ky + 2, 6, 1, C.metalHi);
}

function drawMug(c: Ctx, t: number) {
  const M = LAYOUT.mug;
  // mug body
  px(c, M.x, M.y + 6, 11, 12, C.rose);
  px(c, M.x + 1, M.y + 6, 9, 1, '#ffa0c0');
  px(c, M.x + 9, M.y + 6, 2, 12, '#c94f78');
  // handle
  px(c, M.x + 11, M.y + 9, 3, 2, C.rose);
  px(c, M.x + 12, M.y + 11, 2, 3, C.rose);
  px(c, M.x + 11, M.y + 14, 3, 2, C.rose);
  // coffee surface
  px(c, M.x + 1, M.y + 7, 8, 1, '#5a3a28');
  // steam — three phased wisps
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.45 + k * 0.33) % 1;
    const sy = M.y + 5 - p * 16;
    const sx = M.x + 3 + k * 2 + Math.sin(t * 2 + p * 6 + k * 2) * 2;
    alpha(c, (1 - p) * 0.5, () => px(c, sx, sy, 2, 2, C.paper));
  }
}

function drawLamp(c: Ctx, t: number, s: SceneState) {
  const L = LAYOUT.lamp;
  const baseY = LAYOUT.desk.y; // desk surface
  // base
  px(c, L.x, baseY - 3, 16, 3, C.metalLo);
  px(c, L.x + 1, baseY - 3, 14, 1, C.metalHi);
  // arm: lower segment up, upper segment angled right
  px(c, L.x + 7, baseY - 22, 2, 19, C.metalLo);
  px(c, L.x + 7, baseY - 26, 10, 2, C.metalLo);
  px(c, L.x + 15, baseY - 28, 8, 3, C.metalLo);
  // head (cone opening right-down)
  px(c, L.x + 20, baseY - 30, 8, 8, C.metal);
  px(c, L.x + 20, baseY - 30, 8, 1, C.metalHi);
  if (s.lampOn) {
    px(c, L.x + 22, baseY - 24, 6, 2, C.emberHi); // glowing opening
  } else {
    px(c, L.x + 22, baseY - 24, 6, 2, C.metalLo);
  }
  // joint dots
  px(c, L.x + 7, baseY - 23, 2, 2, C.metalHi);
  px(c, L.x + 15, baseY - 27, 2, 2, C.metalHi);
}

// ---------------------------------------------------------------------------
// Wall decor: diploma frames (education), synthwave poster (about)
// ---------------------------------------------------------------------------
function drawFrames(c: Ctx) {
  const F = LAYOUT.frames;
  const drawOne = (
    x: number,
    y: number,
    w: number,
    h: number,
    seal: string,
  ) => {
    px(c, x - 2, y - 2, w + 4, h + 4, C.woodDk);
    px(c, x - 1, y - 1, w + 2, h + 2, C.wood);
    px(c, x, y, w, h, C.cream);
    // engraved text lines
    alpha(c, 0.5, () => {
      px(c, x + 3, y + 4, w - 6, 1, C.woodDk);
      px(c, x + 5, y + 7, w - 10, 1, C.woodDk);
      px(c, x + 4, y + 10, w - 8, 1, C.woodDk);
    });
    // seal + ribbon
    px(c, x + w - 7, y + h - 7, 4, 4, seal);
    px(c, x + w - 6, y + h - 3, 1, 2, seal);
    px(c, x + w - 5, y + h - 3, 1, 2, seal);
    // hanging nail
    px(c, x + w / 2, y - 4, 1, 2, C.metalHi);
  };
  drawOne(F.x, F.y + 2, 26, 34, C.red); // CMU
  drawOne(F.x + 34, F.y + 6, 26, 30, C.blue); // VIT
}

function drawPoster(c: Ctx, t: number) {
  const P = LAYOUT.poster;
  // paper
  px(c, P.x, P.y, P.w, P.h, '#241543');
  px(c, P.x, P.y, P.w, 1, '#3a2a63');
  px(c, P.x, P.y, 1, P.h, '#3a2a63');
  const sx = P.x + P.w / 2;
  const horizon = P.y + 24;
  // setting sun — stepped circle sinking into the horizon, with scanline gaps
  const rows: [number, number][] = [
    [-10, 8],
    [-9, 12],
    [-8, 14],
    [-7, 16],
    [-6, 16],
    [-5, 18],
    [-4, 18],
    [-3, 18],
    [-1, 18],
  ];
  rows.forEach(([dy, w]) => {
    px(c, sx - w / 2, horizon + dy, w, 1, C.rose);
  });
  alpha(c, 0.6, () => px(c, sx - 5, horizon - 9, 8, 3, '#ffa0c0')); // hot core
  // horizon
  px(c, P.x + 2, horizon, P.w - 4, 1, C.cyanDim);
  // perspective grid below the horizon
  alpha(c, 0.75, () => {
    px(c, P.x + 3, horizon + 4, P.w - 6, 1, C.cyanDim);
    px(c, P.x + 3, horizon + 9, P.w - 6, 1, C.cyanDim);
    px(c, P.x + 3, horizon + 15, P.w - 6, 1, C.cyanDim);
    // converging rails
    for (let r = 0; r < 8; r++) {
      const y = horizon + 1 + r * 2;
      const dx = 1 + r * 1.7;
      px(c, sx - dx, y, 1, 1, C.cyanDim);
      px(c, sx + dx, y, 1, 1, C.cyanDim);
      px(c, sx, y, 1, 1, C.cyanDim);
    }
  });
  // pins
  px(c, P.x + 1, P.y + 1, 2, 2, C.yellow);
  px(c, P.x + P.w - 3, P.y + 1, 2, 2, C.cyan);
}

// ---------------------------------------------------------------------------
// File cabinet (resume) + rotary phone (contact)
// ---------------------------------------------------------------------------
function drawCabinet(c: Ctx) {
  const B = LAYOUT.cabinet;
  alpha(c, 0.3, () => px(c, B.x, B.y + B.h - 2, B.w + 5, 4, C.ink));
  px(c, B.x, B.y, B.w, B.h, C.metal);
  px(c, B.x, B.y, B.w, 1, C.metalHi);
  px(c, B.x, B.y, 1, B.h, C.metalHi);
  px(c, B.x + B.w - 2, B.y, 2, B.h, C.metalLo);
  // drawers
  for (let d = 0; d < 2; d++) {
    const dy = B.y + 5 + d * 24;
    px(c, B.x + 3, dy, B.w - 7, 19, C.metalLo);
    px(c, B.x + 3, dy, B.w - 7, 1, C.metalHi);
    px(c, B.x + 9, dy + 4, B.w - 19, 2, C.metalHi); // handle
    // label card on top drawer
    if (d === 0) px(c, B.x + 10, dy + 9, 8, 5, C.cream);
  }
  // a paper peeking out of the top
  px(c, B.x + 6, B.y - 2, 12, 2, C.paper);
}

function drawPhone(c: Ctx, t: number) {
  const P = LAYOUT.phone;
  const x = P.x + 3,
    y = P.y + 6;
  // body
  px(c, x, y + 6, 24, 10, C.red);
  px(c, x + 2, y + 4, 20, 4, C.red);
  px(c, x, y + 6, 24, 1, C.redHi);
  px(c, x + 21, y + 6, 3, 10, '#b03a2c');
  // dial
  px(c, x + 8, y + 7, 8, 7, '#ffd9d0');
  px(c, x + 10, y + 9, 4, 3, C.red);
  // handset resting on top
  px(c, x - 1, y, 26, 4, '#b03a2c');
  px(c, x - 2, y - 2, 6, 5, '#b03a2c');
  px(c, x + 20, y - 2, 6, 5, '#b03a2c');
  px(c, x - 1, y, 26, 1, C.redHi);
  // coiled cord
  alpha(c, 0.8, () => {
    px(c, x + 24, y + 10, 2, 1, '#b03a2c');
    px(c, x + 26, y + 12, 2, 1, '#b03a2c');
    px(c, x + 24, y + 14, 2, 1, '#b03a2c');
  });
}

// ---------------------------------------------------------------------------
// Arcade cabinet (demos) — with a real Game of Life on screen
// ---------------------------------------------------------------------------
const GOL_W = 13;
const GOL_H = 10;
let golGrid: number[] = [];
let golLastStep = -1;
let golSeedCounter = 1;

function golReset() {
  golGrid = [];
  for (let i = 0; i < GOL_W * GOL_H; i++) {
    golGrid.push(rnd(i * 3.1 + golSeedCounter * 17.7) > 0.62 ? 1 : 0);
  }
  golSeedCounter++;
}

function golStep() {
  const next: number[] = new Array(GOL_W * GOL_H).fill(0);
  for (let y = 0; y < GOL_H; y++) {
    for (let x = 0; x < GOL_W; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const xx = (x + dx + GOL_W) % GOL_W;
          const yy = (y + dy + GOL_H) % GOL_H;
          n += golGrid[yy * GOL_W + xx];
        }
      }
      const alive = golGrid[y * GOL_W + x];
      next[y * GOL_W + x] = alive
        ? n === 2 || n === 3
          ? 1
          : 0
        : n === 3
        ? 1
        : 0;
    }
  }
  golGrid = next;
}

function drawArcade(c: Ctx, t: number) {
  const A = LAYOUT.arcade;
  alpha(c, 0.35, () => px(c, A.x, A.y + A.h - 2, A.w + 5, 5, C.ink));
  // cabinet body — deep plum with side highlight
  px(c, A.x, A.y + 14, A.w, A.h - 14, '#472b5e');
  px(c, A.x, A.y + 14, 3, A.h - 14, '#5c3a78');
  px(c, A.x + A.w - 3, A.y + 14, 3, A.h - 14, '#33204a');
  // marquee
  px(c, A.x - 2, A.y, A.w + 4, 14, '#33204a');
  const pulse = 0.7 + 0.3 * Math.sin(t * 2.2);
  alpha(c, pulse, () => {
    px(c, A.x + 1, A.y + 3, A.w - 2, 8, C.rose);
    alpha(c, 0.5, () => px(c, A.x - 2, A.y - 2, A.w + 4, 18, C.rose));
  });
  // "PLAY" in chunky dark pixels on the lit marquee
  const lx = A.x + 10,
    ly = A.y + 5;
  c.fillStyle = '#33204a';
  // P
  px(c, lx, ly, 2, 5, '#33204a');
  px(c, lx, ly, 4, 1, '#33204a');
  px(c, lx + 3, ly, 1, 3, '#33204a');
  px(c, lx, ly + 2, 4, 1, '#33204a');
  // L
  px(c, lx + 7, ly, 2, 5, '#33204a');
  px(c, lx + 7, ly + 4, 4, 1, '#33204a');
  // A
  px(c, lx + 14, ly, 2, 5, '#33204a');
  px(c, lx + 17, ly, 2, 5, '#33204a');
  px(c, lx + 14, ly, 4, 1, '#33204a');
  px(c, lx + 14, ly + 2, 4, 1, '#33204a');
  // Y
  px(c, lx + 22, ly, 1, 2, '#33204a');
  px(c, lx + 26, ly, 1, 2, '#33204a');
  px(c, lx + 23, ly + 1, 3, 2, '#33204a');
  px(c, lx + 24, ly + 2, 1, 3, '#33204a');
  // screen
  const scr = { x: A.x + 6, y: A.y + 22, w: A.w - 12, h: 32 };
  px(c, scr.x - 2, scr.y - 2, scr.w + 4, scr.h + 4, C.ink);
  px(c, scr.x, scr.y, scr.w, scr.h, '#0d1128');
  // game of life
  if (golGrid.length === 0) golReset();
  if (t - golLastStep > 0.42) {
    golStep();
    golLastStep = t;
    const pop = golGrid.reduce((a, b) => a + b, 0);
    if (pop < 4) golReset();
  }
  for (let y = 0; y < GOL_H; y++) {
    for (let x = 0; x < GOL_W; x++) {
      if (golGrid[y * GOL_W + x]) {
        px(c, scr.x + 1 + x * 3, scr.y + 1 + y * 3, 2, 2, C.cyan);
      }
    }
  }
  alpha(c, 0.12, () =>
    px(c, scr.x - 4, scr.y - 4, scr.w + 8, scr.h + 8, C.cyanDim),
  );
  // control deck
  px(c, A.x + 2, A.y + 62, A.w - 4, 10, '#5c3a78');
  px(c, A.x + 2, A.y + 62, A.w - 4, 1, '#7a52a0');
  // joystick
  px(c, A.x + 12, A.y + 58, 2, 6, C.metalLo);
  px(c, A.x + 11, A.y + 56, 4, 3, C.red);
  // buttons
  px(c, A.x + 26, A.y + 65, 4, 3, C.yellow);
  px(c, A.x + 34, A.y + 65, 4, 3, C.cyan);
  // lower panel: coin door + neon side stripes
  px(c, A.x + 8, A.y + 84, A.w - 16, 44, '#33204a');
  px(c, A.x + 8, A.y + 84, A.w - 16, 1, '#241536');
  alpha(c, 0.55, () => {
    px(c, A.x + 5, A.y + 82, 2, 48, C.rose);
    px(c, A.x + A.w - 7, A.y + 82, 2, 48, C.cyanDim);
  });
  // coin door
  const cdx = A.x + 16,
    cdy = A.y + 94;
  px(c, cdx, cdy, 20, 24, C.metalLo);
  px(c, cdx + 1, cdy + 1, 18, 22, C.metal);
  px(c, cdx + 1, cdy + 1, 18, 1, C.metalHi);
  // two coin slots
  px(c, cdx + 5, cdy + 5, 2, 7, C.ink);
  px(c, cdx + 13, cdy + 5, 2, 7, C.ink);
  px(c, cdx + 4, cdy + 4, 4, 1, C.metalHi);
  px(c, cdx + 12, cdy + 4, 4, 1, C.metalHi);
  // coin return + lock
  px(c, cdx + 7, cdy + 16, 6, 4, C.metalLo);
  px(c, cdx + 8, cdy + 17, 4, 2, C.ink);
  // feet
  px(c, A.x + 2, A.y + A.h - 4, 6, 4, C.ink);
  px(c, A.x + A.w - 8, A.y + A.h - 4, 6, 4, C.ink);
}

// ---------------------------------------------------------------------------
// Old CRT on a crate (terminal easter egg)
// ---------------------------------------------------------------------------
function drawCrt(c: Ctx, t: number) {
  const R = LAYOUT.crt;
  const crateY = R.y + 34; // CRT body is 34 tall — the crate starts right under it
  const crateH = R.h - 34;
  alpha(c, 0.3, () => px(c, R.x - 1, crateY + crateH - 2, R.w + 4, 4, C.ink));
  // crate
  px(c, R.x, crateY, R.w, crateH, C.woodLo);
  px(c, R.x, crateY, R.w, 2, C.wood);
  px(c, R.x, crateY + 17, R.w, 2, C.woodDk);
  px(c, R.x, crateY + 34, R.w, 2, C.woodDk);
  px(c, R.x + 2, crateY, 2, crateH, C.woodDk);
  px(c, R.x + R.w - 4, crateY, 2, crateH, C.woodDk);
  // CRT body
  const cy = R.y;
  px(c, R.x + 1, cy, R.w - 2, 34, C.beige);
  px(c, R.x + 1, cy, R.w - 2, 1, '#ded3b8');
  px(c, R.x + 1, cy + 30, R.w - 2, 4, C.beigeLo);
  // screen
  px(c, R.x + 5, cy + 4, R.w - 10, 22, C.ink);
  px(c, R.x + 7, cy + 6, R.w - 14, 18, C.crtDark);
  // green prompt lines
  alpha(c, 0.9, () => {
    px(c, R.x + 9, cy + 9, 8, 1, C.crtGreen);
    px(c, R.x + 9, cy + 12, 12, 1, C.crtGreen);
    px(c, R.x + 9, cy + 15, 6, 1, C.crtGreen);
  });
  // blinking cursor
  if (Math.sin(t * 3.2) > 0) {
    px(c, R.x + 9, cy + 18, 4, 3, C.crtGreen);
  }
  alpha(c, 0.1, () => px(c, R.x + 4, cy + 3, R.w - 8, 24, C.crtGreen));
  // vents + power light
  alpha(c, 0.6, () => {
    px(c, R.x + 7, cy + 29, 10, 1, C.beigeLo);
    px(c, R.x + 19, cy + 29, 10, 1, C.beigeLo);
  });
  const led = Math.sin(t * 0.9) > -0.6;
  px(c, R.x + R.w - 8, cy + 29, 2, 2, led ? C.red : '#5e2a22');
  // dust: a cobweb corner
  alpha(c, 0.25, () => {
    px(c, R.x + R.w - 2, cy - 4, 1, 4, C.paper);
    px(c, R.x + R.w - 4, cy - 2, 2, 1, C.paper);
  });
}

// ---------------------------------------------------------------------------
// Rug + sleeping cat
// ---------------------------------------------------------------------------
function drawRug(c: Ctx) {
  const R = LAYOUT.rug;
  // stepped oval
  const rug = '#554566';
  const rugLo = '#4a3c59';
  px(c, R.x + 12, R.y, R.w - 24, R.h, rug);
  px(c, R.x + 4, R.y + 5, R.w - 8, R.h - 10, rug);
  px(c, R.x, R.y + 9, R.w, R.h - 18, rug);
  alpha(c, 0.5, () => px(c, R.x + 4, R.y + R.h - 12, R.w - 8, 7, rugLo));
  // border pattern
  alpha(c, 0.8, () => {
    px(c, R.x + 14, R.y + 2, R.w - 28, 1, C.ember);
    px(c, R.x + 14, R.y + R.h - 3, R.w - 28, 1, C.ember);
    for (let x = R.x + 16; x < R.x + R.w - 16; x += 8) {
      px(c, x, R.y + 5, 2, 1, C.rose);
      px(c, x + 4, R.y + R.h - 7, 2, 1, C.rose);
    }
  });
}

function drawCat(c: Ctx, t: number) {
  const K = LAYOUT.cat;
  const x = K.x + 4,
    y = K.y + 6;
  const fur = '#454a73';
  const furHi = '#565c8a';
  const dark = '#31355a';
  // shadow under the cat
  alpha(c, 0.25, () => px(c, x - 2, y + 12, 46, 3, C.ink));
  // body — curled loaf
  px(c, x + 4, y + 2, 30, 12, fur);
  px(c, x + 6, y, 26, 4, fur);
  px(c, x + 2, y + 6, 4, 8, fur);
  px(c, x + 34, y + 6, 3, 6, fur);
  px(c, x + 8, y + 1, 22, 2, furHi); // back highlight
  // stripes
  px(c, x + 13, y + 1, 2, 7, dark);
  px(c, x + 19, y, 2, 8, dark);
  px(c, x + 25, y + 1, 2, 7, dark);
  // head (left)
  px(c, x - 2, y + 2, 12, 10, fur);
  px(c, x - 2, y + 2, 10, 2, furHi);
  px(c, x - 2, y - 1, 3, 4, fur); // ear
  px(c, x + 6, y - 1, 3, 4, fur); // ear
  px(c, x - 1, y, 1, 2, '#e88ba0'); // inner ear
  px(c, x + 7, y, 1, 2, '#e88ba0');
  // sleeping eyes + nose
  px(c, x, y + 6, 3, 1, C.ink);
  px(c, x + 5, y + 6, 3, 1, C.ink);
  px(c, x + 3, y + 8, 2, 1, '#e88ba0');
  // whisker dots
  alpha(c, 0.5, () => {
    px(c, x - 4, y + 7, 2, 1, C.paper);
    px(c, x + 9, y + 7, 2, 1, C.paper);
  });
  // tail — sweeps with a slow sway
  const sway = Math.sin(t * 1.6);
  const tipY = y + 3 + sway * 4;
  px(c, x + 36, y + 8, 6, 3, fur);
  px(c, x + 40, y + 4 + sway * 3, 3, 7, fur);
  px(c, x + 41, tipY, 3, 3, dark);
  // zzz — proper little Z's drifting up
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.35 + k * 0.33) % 1;
    if (p < 0.85) {
      const sz = 3 + k; // grows as it rises
      const zx = x + 4 + p * 12 + k * 2;
      const zy = y - 6 - p * 16;
      alpha(c, (1 - p) * 0.85, () => {
        px(c, zx, zy, sz, 1, C.paper); // top bar
        for (let d = 0; d < sz - 2; d++) {
          px(c, zx + sz - 2 - d, zy + 1 + d, 1, 1, C.paper); // diagonal
        }
        px(c, zx, zy + sz - 1, sz, 1, C.paper); // bottom bar
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Light overlays
// ---------------------------------------------------------------------------
function drawLightOverlays(c: Ctx, t: number, s: SceneState) {
  const L = LAYOUT.lamp;
  const deskY = LAYOUT.desk.y;

  if (s.lampOn) {
    // glow around the lamp head
    alpha(c, 0.12, () => px(c, L.x + 16, deskY - 34, 16, 14, C.ember));
    alpha(c, 0.07, () => px(c, L.x + 12, deskY - 38, 24, 22, C.ember));
    // lamp cone: widening strips of warm light falling right-down onto the desk
    const hx = L.x + 24,
      hy = deskY - 25;
    for (let i = 0; i < 22; i++) {
      const y = hy + i;
      const w = 4 + i * 2.4;
      alpha(c, 0.07, () => px(c, hx - 2 + i * 0.4, y, w, 1, C.ember));
    }
    // pool on desk
    alpha(c, 0.18, () => px(c, hx - 2, deskY - 1, 56, 3, C.ember));
    alpha(c, 0.1, () => px(c, hx - 8, deskY - 1, 72, 6, C.ember));
    // dust motes in the beam
    for (let i = 0; i < 7; i++) {
      const p = (t * 0.06 + rnd(i * 5.1)) % 1;
      const mx = hx + 2 + rnd(i * 3.3) * 34 + Math.sin(t * 0.7 + i) * 2;
      const my = hy + 3 + p * 18;
      const twinkle = 0.25 + 0.3 * Math.sin(t * 1.5 + i * 2.2);
      alpha(c, Math.max(0, twinkle), () => px(c, mx, my, 1, 1, C.emberHi));
    }
  }

  // monitor glow pooling on the desk + keyboard
  const M = LAYOUT.monitor;
  alpha(c, 0.1, () => px(c, M.x - 6, deskY - 1, 84, 4, C.cyanDim));
  alpha(c, 0.05, () => px(c, M.x - 12, deskY + 3, 96, 8, C.cyanDim));

  // moonlight falling from the window onto the floor
  const W = LAYOUT.window;
  alpha(c, 0.05, () => {
    px(c, W.x - 8, LAYOUT.wallY, W.w + 4, 30, C.rain);
    px(c, W.x - 14, LAYOUT.wallY + 30, W.w + 10, 22, C.rain);
  });

  // arcade marquee glow on the floor
  const A = LAYOUT.arcade;
  alpha(c, 0.05, () => px(c, A.x - 6, LAYOUT.wallY + 20, A.w + 12, 40, C.rose));
}

// re-drawn on top of the "lights out" dimmer so screens stay bright
function drawEmissives(c: Ctx, t: number) {
  drawStringLights(c, t);
  drawWindow(c, t);
  drawMonitor(c, t);
  drawArcade(c, t);
  drawCrt(c, t);
}

function drawVignette(c: Ctx) {
  alpha(c, 0.16, () => {
    px(c, 0, 0, SCENE_W, 10, C.ink);
    px(c, 0, SCENE_H - 10, SCENE_W, 10, C.ink);
    px(c, 0, 0, 10, SCENE_H, C.ink);
    px(c, SCENE_W - 10, 0, 10, SCENE_H, C.ink);
  });
  alpha(c, 0.1, () => {
    px(c, 0, 0, SCENE_W, 24, C.ink);
    px(c, 0, SCENE_H - 20, SCENE_W, 20, C.ink);
  });
}

// hover highlight: pulsing corner ticks around the hovered object
function drawHoverHighlight(c: Ctx, t: number, id: string | null) {
  if (!id) return;
  const box = (LAYOUT as any)[hotspotLayoutKey(id)];
  if (!box) return;
  const pad = 3;
  const x = box.x - pad,
    y = box.y - pad,
    w = box.w + pad * 2,
    h = box.h + pad * 2;
  const pulse = 0.55 + 0.45 * Math.sin(t * 6);
  alpha(c, pulse, () => {
    const arm = 5;
    const col = C.emberHi;
    // corners
    px(c, x, y, arm, 1, col);
    px(c, x, y, 1, arm, col);
    px(c, x + w - arm, y, arm, 1, col);
    px(c, x + w - 1, y, 1, arm, col);
    px(c, x, y + h - 1, arm, 1, col);
    px(c, x, y + h - arm, 1, arm, col);
    px(c, x + w - arm, y + h - 1, arm, 1, col);
    px(c, x + w - 1, y + h - arm, 1, arm, col);
  });
  alpha(c, pulse * 0.14, () => px(c, x, y, w, h, C.emberHi));
}

export function hotspotLayoutKey(id: string): string {
  const map: Record<string, string> = {
    work: 'monitor',
    demos: 'arcade',
    skills: 'shelf',
    education: 'frames',
    contact: 'phone',
    resume: 'cabinet',
    terminal: 'crt',
    about: 'poster',
    cat: 'cat',
    lamp: 'lamp',
  };
  return map[id] || id;
}

// ---------------------------------------------------------------------------
// Main draw
// ---------------------------------------------------------------------------
export function drawScene(c: Ctx, t: number, s: SceneState) {
  c.clearRect(0, 0, SCENE_W, SCENE_H);
  drawRoomShell(c, t);
  drawStringLights(c, t);
  drawWindow(c, t);
  drawFrames(c);
  drawPoster(c, t);
  drawBookshelf(c, t);
  drawPlant(c, t);
  drawDesk(c, t, s);
  drawCabinet(c);
  drawPhone(c, t);
  drawArcade(c, t);
  drawCrt(c, t);
  drawRug(c);
  drawCat(c, t);

  if (!s.lampOn) {
    // lights out — dim the room, then let the screens glow through
    alpha(c, 0.34, () => px(c, 0, 0, SCENE_W, SCENE_H, '#05061a'));
    drawEmissives(c, t);
  }

  drawLightOverlays(c, t, s);
  drawVignette(c);
  drawHoverHighlight(c, t, s.hovered);
}
