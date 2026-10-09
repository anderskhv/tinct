import { metadata, categories } from './taxonomy.js?v=20261008rel9';

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
  const value = rounded < 60 ? String(rounded) : String(Math.floor(rounded / 60)) + (rounded % 60 ? '.5' : '');
  const unit = rounded < 60 ? (compact ? 'min' : ' minutes') : (compact ? 'h' : rounded === 60 ? ' hour' : ' hours');
  return `~${value}${unit}${compact ? '' : remaining ? ' left' : ' to read'}`;
}

/**
 * A book's era as Tinct's own books write it ("1927", "c. 1000", "c. 175 AD",
 * "c. 700 BC"). Catalogued dates are kept as written; a bare year (an added
 * book's composition year, e.g. "60" or "-4"; never one already written like "458 BC") reads as an approximate date:
 * before 1000 with "AD" (or "BC"), before 1500 with "c.".
 */
export function eraLabel(value) {
  const text = String(value ?? '').trim();
  const bare = /^(-?\d{1,4})$/.exec(text);
  if (!bare) return text;
  const year = Number(bare[1]);
  if (!Number.isFinite(year) || year === 0) return '';
  if (year < 0) return `c. ${-year} BC`;
  if (year < 1000) return `c. ${year} AD`;
  if (year < 1500) return `c. ${year}`;
  return String(year);
}

export function bookMetadata(book, options = {}) {
  // Keep historical dates (including approximate/ancient dates) as catalogued.
  // Do not turn a composition date into a claimed first-publication date.
  return [eraLabel(book?.displayYear), readingTime(book, options)].filter(Boolean).join(' · ');
}

/** Shared factual label, never inferred from the cover artwork. */
export function bookCategory(book) {
  const form = metadata[book?.id || book?.bookId]?.form;
  return ({ novel: 'Fiction', epic: 'Poetry', political: 'Politics', memoir: 'Memoir' })[form]
    || categories.find(category => category.id === form)?.label || '';
}

/** DOM text nodes keep catalogue text safe in both library layouts. */
export function renderBookMetadata(element, book, { compact = false, percent = null } = {}) {
  element.replaceChildren();
  const category = bookCategory(book);
  if (category) {
    const label = document.createElement('span');
    label.className = 'metadata-category'; label.textContent = category;
    element.append(label);
  }
  const details = document.createElement('span');
  details.className = 'metadata-details';
  const date = document.createElement('span');
  date.textContent = eraLabel(book?.displayYear);
  const time = document.createElement('span');
  time.textContent = readingTime(book, { compact, percent });
  if (date.textContent) details.append(date);
  if (time.textContent) details.append(time);
  element.append(details);
}
