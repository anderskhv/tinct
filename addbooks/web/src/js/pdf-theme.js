'use strict';
// Tinct · Add a book: the PDF viewer follows the reader's theme (Light, Book, Dark, and the
// e-ink display profile). The theme is the Tinct reader's own setting: localStorage
// `tinct-lab-prefs` (app/src/lab/labPrefs.ts, one appearance per layout: phone, desktop),
// and `tinct:display-profile` for e-ink (public/lab/display-profile.js). Choosing a theme
// here writes the same setting, so the reader and this viewer always agree.
// Pages: Light and Book tint the white sheet to the paper (multiply: white becomes paper,
// black ink stays ink); Dark recolours the drawn page so paper is dark and text light, with
// pictures kept as they are, a little dimmed (not shown as negatives); e-ink stays white.
// Used by js/reader.js (window.TinctPdfTheme); the tests import this file directly.
(function (global) {
  const PREFS_KEY = 'tinct-lab-prefs';
  const PROFILE_KEY = 'tinct:display-profile';
  // The reader's papers and inks (app/src/lab/lab.css: .lab, .lab.is-book-theme, .lab.is-night).
  const PALETTE = {
    light: { paper: '#ece7db', ink: '#0b0b0b' },
    book: { paper: '#e7dcc7', ink: '#201a13' },
    dark: { paper: '#171411', ink: '#bdb3a7' },
    eink: { paper: '#ffffff', ink: '#111111' },
  };
  const THEMES = ['book', 'light', 'dark'];
  const isTheme = v => v === 'system' || v === 'light' || v === 'dark' || v === 'book';

  function parse(raw) { try { const v = JSON.parse(raw || 'null'); return v && typeof v === 'object' ? v : null } catch { return null } }
  // The stored theme for this layout, as labPrefs.ts reads it ('system' when none is stored).
  function storedTheme(raw, layout) {
    const src = parse(raw);
    if (!src) return 'system';
    if (src.version === 2 && src.shared && typeof src.shared === 'object') {
      const a = src[layout === 'phone' ? 'phone' : 'desktop'];
      return a && isTheme(a.theme) ? a.theme : 'system';
    }
    if (isTheme(src.theme)) return src.theme;
    return Object.keys(src).length ? (src.darkMode === true ? 'dark' : 'light') : 'system';
  }
  // The theme the viewer paints: 'light' | 'book' | 'dark' | 'eink'.
  function resolveTheme(raw, layout, systemDark, eink) {
    if (eink) return 'eink';
    const t = storedTheme(raw, layout);
    return t === 'system' ? (systemDark ? 'dark' : 'light') : t;
  }
  // The prefs with this layout's theme set, as the reader's Settings sheet writes it.
  // Returns the new JSON string, or null when the stored prefs cannot be read safely.
  function withTheme(raw, layout, theme) {
    if (!THEMES.includes(theme)) return null;
    let src = parse(raw);
    if (raw && !src) return null;
    const profile = layout === 'phone' ? 'phone' : 'desktop';
    if (!src || src.version !== 2 || !src.shared) {
      // Version 1 (one flat object) or none: the reader reads it for both layouts, so it is kept flat.
      src = Object.assign({}, src || {}, { theme, darkMode: theme === 'dark' });
      return JSON.stringify(src);
    }
    src[profile] = Object.assign({}, src[profile] || {}, { theme, darkMode: theme === 'dark' });
    return JSON.stringify(src);
  }
  function readEink(search, stored) {
    const q = new URLSearchParams(search || '').get('eink');
    if (q === '1' || q === '0') return q === '1';
    return stored === 'eink';
  }

  /* ---------- Dark pages ---------- */
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  // The rectangles (canvas pixels) where pictures are painted, from the page's operator list:
  // the unit square under the transform at each image paint. A picture covering most of the
  // page is a scan of text and is recoloured with the text, so it is not listed.
  function imageRects(opList, OPS, viewportTransform, width, height) {
    const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
    const paints = new Set([OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.paintImageXObjectRepeat, OPS.paintJpegXObject].filter(v => v != null));
    let ctm = viewportTransform.slice();
    const stack = [], out = [];
    const { fnArray, argsArray } = opList;
    for (let i = 0; i < fnArray.length; i++) {
      const fn = fnArray[i], args = argsArray[i];
      if (fn === OPS.save) stack.push(ctm);
      else if (fn === OPS.restore) ctm = stack.pop() || ctm;
      else if (fn === OPS.transform) ctm = mul(ctm, args);
      else if (fn === OPS.paintFormXObjectBegin) { stack.push(ctm); if (Array.isArray(args?.[0]) && args[0].length === 6) ctm = mul(ctm, args[0]) }
      else if (fn === OPS.paintFormXObjectEnd) ctm = stack.pop() || ctm;
      else if (paints.has(fn)) {
        const pts = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]]);
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        const r = { x: Math.max(0, Math.min(...xs)), y: Math.max(0, Math.min(...ys)), r: Math.min(width, Math.max(...xs)), b: Math.min(height, Math.max(...ys)) };
        if (r.r - r.x < 2 || r.b - r.y < 2) continue;
        if ((r.r - r.x) * (r.b - r.y) > width * height * 0.6) continue;
        out.push(r);
      }
    }
    return out;
  }
  // Recolours drawn page pixels (RGBA, in place) for the dark theme: the page's paper becomes
  // the dark paper, its ink the light ink, colours keep their hue with their lightness turned
  // over; inside `keep` (pictures) pixels stay as drawn, dimmed by `dim`.
  function recolourDark(data, width, height, keep = [], palette = PALETTE.dark, dim = 0.82) {
    const [pr, pg, pb] = rgb(palette.paper), [ir, ig, ib] = rgb(palette.ink);
    const dr = ir - pr, dg = ig - pg, db = ib - pb;
    const rects = keep.map(k => ({ x0: Math.floor(k.x), y0: Math.floor(k.y), x1: Math.ceil(k.r), y1: Math.ceil(k.b) }));
    for (let y = 0; y < height; y++) {
      const spans = rects.filter(k => y >= k.y0 && y < k.y1);
      let i = y * width * 4;
      for (let x = 0; x < width; x++, i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (spans.length && spans.some(k => x >= k.x0 && x < k.x1)) { data[i] = r * dim; data[i + 1] = g * dim; data[i + 2] = b * dim; continue }
        const max = r > g ? (r > b ? r : b) : (g > b ? g : b), min = r < g ? (r < b ? r : b) : (g < b ? g : b);
        if (max - min < 24) {
          // Grey: paper to ink by how dark it was.
          const t = 1 - (r * 0.3 + g * 0.59 + b * 0.11) / 255;
          data[i] = pr + dr * t; data[i + 1] = pg + dg * t; data[i + 2] = pb + db * t;
        } else {
          // Colour: lightness turned over, hue kept, then set into the dark page's range.
          const turn = 255 - max - min;
          data[i] = pr + (r + turn) / 255 * dr; data[i + 1] = pg + (g + turn) / 255 * dg; data[i + 2] = pb + (b + turn) / 255 * db;
        }
      }
    }
    return data;
  }

  global.TinctPdfTheme = { PREFS_KEY, PROFILE_KEY, PALETTE, THEMES, storedTheme, resolveTheme, withTheme, readEink, imageRects, recolourDark };
})(typeof window !== 'undefined' ? window : globalThis);
