'use strict';
// Tinct · Add a book: where a page's formulas, figures and tables are, worked out off the main thread while the
// pages are drawn there (Anders, 20 Oct 2026: converting a PDF to its Tinct text took a while). The same rules as
// on the main thread (pdf-regions.js, margin.js findFigures), so a page has the same regions either way: the
// croppers (js/pdf-text-view.js, app/src/lab/userBook/pdfEdition.ts) fall back to working them out themselves.
// In: { id, ink, W, H, spans, body, vp } (as the croppers build them). Out: { ready } once loaded, then { id, regions } or { id, error }.
importScripts('pdf-regions.js' + self.location.search, 'margin.js' + self.location.search);
self.postMessage({ ready: true });
self.onmessage = e => {
  const { id, ink, W, H, spans, body, vp } = e.data || {};
  try {
    self.postMessage({ id, regions: self.TinctPdfRegions.find({ ink, W, H, spans, body, vp }, self.TinctMargin) });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
