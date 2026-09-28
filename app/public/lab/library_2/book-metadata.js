// One deliberately approximate silent-reading estimate for the whole library.
// Catalogue word counts are book-level, not audio length or a measured personal speed.
export const READING_WORDS_PER_MINUTE = 170;

export function readingMinutes(book, percent = null) {
  const words = book?.wordCount;
  if (typeof words !== 'number' || !Number.isFinite(words) || words <= 0) return null;
  const fraction = typeof percent === 'number' && Number.isFinite(percent) ? 1 - Math.max(0, Math.min(100, percent)) / 100 : 1;
  return words * fraction / READING_WORDS_PER_MINUTE;
}

export function readingTime(book, { compact = false, percent = null } = {}) {
  const minutes = readingMinutes(book, percent);
  if (minutes === null) return '';
  const remaining = typeof percent === 'number' && Number.isFinite(percent);
  if (remaining && minutes < 5) return compact ? '<5min' : '<5 minutes left';
  const rounded = minutes < 60 ? Math.max(5, Math.round(minutes / 5) * 5) : Math.max(60, Math.round(minutes / 30) * 30);
  const value = rounded < 60 ? String(rounded) : String(Math.floor(rounded / 60)) + (rounded % 60 ? '½' : '');
  const unit = rounded < 60 ? (compact ? 'min' : ' minutes') : (compact ? 'h' : rounded === 60 ? ' hour' : ' hours');
  return `~${value}${unit}${compact ? '' : remaining ? ' left' : ' to read'}`;
}

export function bookMetadata(book, options = {}) {
  // Keep historical dates (including approximate/ancient dates) as catalogued.
  // Do not turn a composition date into a claimed first-publication date.
  return [book?.displayYear, readingTime(book, options)].filter(Boolean).join(' · ');
}
