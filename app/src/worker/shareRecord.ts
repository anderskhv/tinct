/** Share link records (see shareStore.ts); no runtime imports, so routes and tests can use them. */

export interface ShareRecordInput {
  bookId: string
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
  look: 'paper' | 'book' | 'night' | 'eink'
  format: 'phone' | 'desktop'
  context: boolean
  tagline: boolean
  /** The reader's alignment when shared: the image is set the same way. */
  align: 'justify' | 'left'
  /** The highlight colour behind the highlighted words (on unless turned off). */
  highlight: boolean
}

export interface ShareRecord extends ShareRecordInput {
  id: string
  createdAt: number
}

export const SHARE_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
export const SHARE_ID_PATTERN = /^[a-hj-km-np-z2-9]{7}$/

/**
 * The drawing flags, stored in the shares table's `tagline` column (shareStore.ts):
 * bit 0 the credit, bit 1 the highlight colour off, bit 2 left-aligned.
 */
const CREDIT = 1
const NO_HIGHLIGHT = 2
const LEFT_ALIGNED = 4

/** The drawing flags of `input`, as stored in the `tagline` column. */
export function shareFlags(input: Pick<ShareRecordInput, 'tagline' | 'highlight' | 'align'>): number {
  return (input.tagline ? CREDIT : 0) | (input.highlight === false ? NO_HIGHLIGHT : 0) | (input.align === 'left' ? LEFT_ALIGNED : 0)
}

/** The `tagline` column read back as the drawing options. */
export function readShareFlags(flags: number): Pick<ShareRecordInput, 'tagline' | 'highlight' | 'align'> {
  return { tagline: (flags & CREDIT) !== 0, highlight: (flags & NO_HIGHLIGHT) === 0, align: flags & LEFT_ALIGNED ? 'left' : 'justify' }
}
