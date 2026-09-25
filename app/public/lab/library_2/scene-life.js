// Quiet life in each signature scene, drawn over the painting in the same
// canvas pass as Frankenstein's rain: flames that flicker and throw light,
// snow and distant lights outside the Roman tent, glints on water, dust in a
// sunbeam. Coordinates are in each image's own pixels (wide 1536x864; phone
// 1024x1408, The Prince phone 1024x1344), so the effects stay on their
// objects whatever the crop.

const flicker = (t, seed) => 0.62 + 0.2 * Math.sin(t * 0.0131 + seed) + 0.11 * Math.sin(t * 0.0317 + seed * 2.1) + 0.07 * Math.sin(t * 0.0719 + seed * 3.7);

const SCENES = {
  meditations: {
    wide: { flames: [[938, 128, 170]], snow: [1245, 0, 1536, 560], lights: [[1276, 276], [1300, 283], [1330, 280], [1392, 276], [1445, 272]] },
    phone: { flames: [[410, 150, 150]], snow: [790, 0, 1024, 720], lights: [[826, 330], [852, 338], [884, 342], [930, 335]] },
  },
  'the-prince': {
    wide: { flames: [[822, 278, 190]], reflections: [[822, 640, 22, 150]], sky: [1072, 0, 1425, 330] },
    phone: { flames: [[302, 280, 170]], reflections: [[302, 780, 20, 150]], sky: [606, 0, 940, 380] },
  },
  'crime-and-punishment': {
    wide: { flames: [[1110, 278, 150]], reflections: [[1110, 640, 18, 120]], water: [1100, 222, 1345, 298] },
    phone: { flames: [[704, 316, 130]], reflections: [[704, 820, 16, 120]], water: [690, 214, 900, 320] },
  },
  odyssey: {
    wide: { flames: [[680, 270, 150]], reflections: [[680, 620, 20, 120]], water: [1035, 330, 1400, 410] },
    phone: { flames: [[344, 356, 140]], reflections: [[344, 800, 18, 130]], water: [668, 392, 940, 470] },
  },
  'pride-and-prejudice': {
    wide: { motes: [950, 60, 1460, 580], beam: [[1300, 60], [980, 580]] },
    phone: { motes: [520, 60, 1000, 780], beam: [[860, 60], [560, 780]] },
  },
};

// Stable pseudo-random particles, generated once per scene.
const rnd = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const particles = new Map();
function field(key, n) {
  if (!particles.has(key)) {
    const r = rnd([...key].reduce((h, c) => h * 31 + c.charCodeAt(0), 7));
    particles.set(key, Array.from({ length: n }, () => ({ x: r(), y: r(), s: r(), p: r() * Math.PI * 2 })));
  }
  return particles.get(key);
}

function glow(ctx, x, y, r, colour, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${colour},${alpha})`);
  g.addColorStop(0.35, `rgba(${colour},${alpha * 0.45})`);
  g.addColorStop(1, `rgba(${colour},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/**
 * Draw the scene's life for image `img` placed with `crop` (from sceneCrop).
 * `alpha` fades it with the scene crossfade.
 */
export function drawSceneLife(ctx, id, wide, img, crop, alpha, time) {
  const spec = SCENES[id]?.[wide ? 'wide' : 'phone'];
  if (!spec || alpha <= 0 || !img) return;
  ctx.save();
  ctx.scale(crop.scale, crop.scale);
  ctx.translate(-crop.x, -crop.y);
  ctx.globalCompositeOperation = 'lighter';

  (spec.flames || []).forEach(([x, y, r], i) => {
    const f = flicker(time, i * 1.7 + x * 0.01);
    glow(ctx, x, y, r * (0.9 + 0.12 * f), '255,160,70', 0.16 * f * alpha);
    glow(ctx, x, y - 4, 16 + 6 * f, '255,215,150', 0.28 * f * alpha);
  });
  (spec.reflections || []).forEach(([x, y, rx, ry], i) => {
    const f = flicker(time, i * 1.7 + x * 0.01);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    glow(ctx, 0, 0, rx * 1.6, '255,170,90', 0.1 * f * alpha);
    ctx.restore();
  });
  if (spec.sky) {
    const [x0, y0, x1, y1] = spec.sky;
    const breathe = 0.5 + 0.5 * Math.sin(time * 0.00045);
    const g = ctx.createLinearGradient(0, y1, 0, y0);
    g.addColorStop(0, `rgba(255,140,80,${0.07 * breathe * alpha})`);
    g.addColorStop(1, 'rgba(255,140,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  (spec.lights || []).forEach(([x, y], i) => {
    const tw = 0.55 + 0.45 * Math.sin(time * (0.0011 + i * 0.00023) + i * 2.3);
    glow(ctx, x, y, 12, '255,190,110', 0.35 * tw * alpha);
  });
  if (spec.water) {
    const [x0, y0, x1, y1] = spec.water;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.clip();
    field(`${id}-water-${wide}`, 46).forEach(g => {
      const a = Math.max(0, Math.sin(time * (0.0008 + g.s * 0.0014) + g.p));
      if (a < 0.05) return;
      const x = x0 + g.x * (x1 - x0) + Math.sin(time * 0.0004 + g.p) * 6;
      const y = y0 + g.y * (y1 - y0);
      const len = 5 + g.s * 16 * (0.4 + (y - y0) / (y1 - y0));
      ctx.fillStyle = `rgba(255,236,200,${0.32 * a * a * alpha})`;
      ctx.fillRect(x - len / 2, y, len, 1.4);
    });
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';
  if (spec.snow) {
    const [x0, y0, x1, y1] = spec.snow;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.clip();
    field(`${id}-snow-${wide}`, 70).forEach(f => {
      const h = y1 - y0, speed = 0.012 + f.s * 0.02;
      const y = y0 + ((f.y * h + time * speed) % h);
      const x = x0 + f.x * (x1 - x0) + Math.sin(time * 0.0007 + f.p) * 10;
      ctx.fillStyle = `rgba(235,240,245,${(0.35 + f.s * 0.4) * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.9 + f.s * 1.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
  if (spec.motes) {
    const [x0, y0, x1, y1] = spec.motes, [[bx0, by0], [bx1, by1]] = spec.beam;
    const bdx = bx1 - bx0, bdy = by1 - by0, blen = Math.hypot(bdx, bdy);
    field(`${id}-motes-${wide}`, 80).forEach(m => {
      const x = x0 + ((m.x * (x1 - x0) + time * (0.004 + m.s * 0.006) + Math.sin(time * 0.0005 + m.p) * 18) % (x1 - x0));
      const y = y0 + ((m.y * (y1 - y0) + time * (0.003 + m.s * 0.004)) % (y1 - y0));
      // Brightest inside the sunbeam: distance from the beam's axis.
      const d = Math.abs((x - bx0) * bdy - (y - by0) * bdx) / blen;
      const inBeam = Math.max(0, 1 - d / 150);
      const a = inBeam * (0.35 + 0.35 * Math.sin(time * 0.002 + m.p)) * alpha;
      if (a < 0.02) return;
      ctx.fillStyle = `rgba(255,236,196,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + m.s * 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}
