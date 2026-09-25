// Choose once per visit. A reader's room must not change under an open book.
export function readingRoom(hour = new Date().getHours()) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function sceneAsset(id, wide) {
  const variant = wide ? 'wide' : 'phone';
  if (id === 'frankenstein') return wide ? 'room-wide' : 'room';
  return id.startsWith('table-') ? `${id}-${variant}` : `scene-${id}-${variant}`;
}

// Keep the painted table edge behind the real book bases at every viewport.
// Unlike a background-size:cover crop, this preserves the room's eye level.
export function tableCrop(w, h, iw, ih, tableY, edgeY) {
  const scale = Math.max(w / iw, h / ih, edgeY / tableY, (h - edgeY) / (ih - tableY));
  const sw = w / scale, sh = h / scale;
  return { x: (iw - sw) * .7, y: tableY - edgeY / scale, w: sw, h: sh, scale };
}
