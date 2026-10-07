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
}

export interface ShareRecord extends ShareRecordInput {
  id: string
  createdAt: number
}

export const SHARE_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
export const SHARE_ID_PATTERN = /^[a-hj-km-np-z2-9]{7}$/

