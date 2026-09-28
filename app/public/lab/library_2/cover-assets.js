// Public image URLs shared by the table and the reader's idle preloader.
const painted = new Set(['frankenstein','jekyll-and-hyde','candide','julius-caesar','the-prince','meditations','jane-eyre','odyssey','crime-and-punishment','pride-and-prejudice','to-the-lighthouse']);
export function coverAsset(id, fallback) {
  return painted.has(id) ? `/lab/library_2/assets/${id}.jpg` : fallback;
}
