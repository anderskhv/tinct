// Reviewed prose handoff, 29 September 2026. Keep source wording exact.
// Chapter-aware reader character stores remain separate from this library gallery.
export const reviewedHooks = {
  "frankenstein": "What happens when we create a new intelligence but refuse to recognise and honor its personhood?",
  "pride-and-prejudice": "What if you're wrong about the person you can't stand?",
  "odyssey": "Would you refuse to become a god?",
  "crime-and-punishment": "Can you circumvent the moral order?",
  "the-prince": "How good can you afford to be?",
  "meditations": "Why is it so hard to be the person you mean to be?",
  "jekyll-and-hyde": "Which is the real you: the person you show, or the one you hide?",
  "candide": "Do we live in the best possible world?",
  "julius-caesar": "Would you kill a friend to save your country?",
  "jane-eyre": "What would you refuse to give up, even for love?",
  "bible": "The book of books. The stories behind the world you know."
};
const pending = new Map();
export async function loadReviewedIntroduction(book) {
  if (!Object.hasOwn(reviewedHooks, book.id)) return false;
  if (!pending.has(book.id)) pending.set(book.id, fetch('/lab/library_2/intro-data/' + encodeURIComponent(book.id) + '.json?v=20260929reviewed')
    .then(response => { if (!response.ok) throw new Error('Introduction unavailable'); return response.json(); })
    .catch(error => { pending.delete(book.id); throw error; }));
  applyReviewedIntroduction(book, await pending.get(book.id));
  return true;
}
export function applyReviewedIntroduction(book, copy) {
  if (copy.id !== book.id) throw new Error('Introduction book mismatch');
  const previous = book.characters || [];
  book.authorFlap = copy.author;
  book.hook = copy.hook.text;
  book.preface = copy.preface.paragraphs;
  book.prefaceSignature = copy.preface.signature || null;
  book.orientation = copy.orientation.text;
  book.reviewedIntroduction = true;
  if (copy.gallery) {
    book.galleryTitle = copy.gallery.sectionTitle;
    book.galleryExpandLabel = copy.gallery.expandLabel;
    book.characters = copy.gallery.characters.map(character => {
      const original = character.existingAlias
        ? previous.find(entry => entry.aliases?.includes(character.existingAlias))
        : null;
      return {
        ...original,
        aliases: original?.aliases || [character.name],
        name: character.name,
        subtitle: character.role,
        body: character.body,
        introKey: character.editorialId,
        introVisibility: character.visibility,
        revealAfterChapter: character.revealAfterChapter || null,
      };
    });
  }
}
export function reviewedCast(book, expanded = false, progress = null) {
  if (!book.reviewedIntroduction || !book.galleryTitle) return null;
  return book.characters.filter(character => {
    if (character.introVisibility === 'hold_until_revealed') {
      return expanded && (progress?.completed === true || (Number.isInteger(character.revealAfterChapter) && character.revealAfterChapter > 0 && Number.isInteger(progress?.chapterNumber) && progress.chapterNumber >= character.revealAfterChapter));
    }
    return expanded || character.introVisibility === 'featured';
  });
}
