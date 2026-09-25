// Historical images, served locally. Sources and licences: assets/ATTRIBUTION.md.
// Match the author rather than the book so other works share the same portrait.
const portraits = [
  [/Jane Austen/i, 'jane-austen', 'Jane Austen, drawn by her sister Cassandra Austen'],
  [/Dostoevsky|Dostoyevsky/i, 'dostoevsky', 'Fyodor Dostoevsky, painted by Vasily Perov'],
  [/Machiavelli/i, 'machiavelli', 'Niccolò Machiavelli, painted by Santi di Tito'],
  [/^Homer$/i, 'homer', 'An ancient imagined likeness of Homer, British Museum'],
  [/Marcus Aurelius/i, 'marcus-aurelius', 'Sculpted portrait of Marcus Aurelius'],
];

export function authorPortrait(author) {
  const match = portraits.find(([pattern]) => pattern.test(author));
  return match ? { src: `assets/authors/${match[1]}.jpg`, alt: match[2] } : null;
}

export function warmPortrait(author) {
  const portrait = authorPortrait(author);
  if (!portrait) return;
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = 'low';
  image.src = portrait.src;
}
