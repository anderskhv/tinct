import { DurableObject } from 'cloudflare:workers'

/**
 * The shares table (share a highlight as an image; approved by Anders with
 * docs/share-quote/CODER-BRIEF.md). One strongly consistent object, so a link
 * unfurls the moment it is created.
 *
 * The public record is the passage and how it was drawn. `creator_id` is kept
 * privately for analytics, is never returned by `get`, and is cleared when
 * the account is deleted (`forgetCreator`).
 */

import { SHARE_ID_ALPHABET as ID_ALPHABET, SHARE_ID_PATTERN, type ShareRecord, type ShareRecordInput } from './shareRecord'

export type { ShareRecord, ShareRecordInput } from './shareRecord'

function newId(): string {
  const bytes = new Uint8Array(7)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => ID_ALPHABET[byte % ID_ALPHABET.length]).join('')
}

type Row = {
  id: string; created_at: number; book_id: string; edition_key: string; chapter: number
  paragraph: number; from_word: number; end_paragraph: number; to_word: number
  look: string; format: string; context: number; tagline: number
}

export class ShareStore extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env)
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY, created_at INTEGER NOT NULL,
      book_id TEXT NOT NULL, edition_key TEXT NOT NULL, chapter INTEGER NOT NULL,
      paragraph INTEGER NOT NULL, from_word INTEGER NOT NULL, end_paragraph INTEGER NOT NULL, to_word INTEGER NOT NULL,
      look TEXT NOT NULL, format TEXT NOT NULL, context INTEGER NOT NULL, tagline INTEGER NOT NULL,
      creator_id TEXT)`)
    ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS shares_creator ON shares(creator_id)')
  }

  create(input: ShareRecordInput, creatorId: string | null): ShareRecord {
    const createdAt = Date.now()
    for (let attempt = 0; attempt < 5; attempt++) {
      const id = newId()
      const taken = this.ctx.storage.sql.exec('SELECT 1 FROM shares WHERE id=?', id).toArray().length > 0
      if (taken) continue
      this.ctx.storage.sql.exec(
        'INSERT INTO shares VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        id, createdAt, input.bookId, input.editionKey, input.chapterNumber,
        input.paragraphIndex, input.fromWord, input.endParagraphIndex, input.toWord,
        input.look, input.format, input.context ? 1 : 0, input.tagline ? 1 : 0, creatorId,
      )
      return { ...input, id, createdAt }
    }
    throw new Error('share id space exhausted')
  }

  get(id: string): ShareRecord | null {
    if (!SHARE_ID_PATTERN.test(id)) return null
    const row = this.ctx.storage.sql.exec<Row>('SELECT id, created_at, book_id, edition_key, chapter, paragraph, from_word, end_paragraph, to_word, look, format, context, tagline FROM shares WHERE id=?', id).toArray()[0]
    if (!row) return null
    return {
      id: row.id, createdAt: row.created_at, bookId: row.book_id, editionKey: row.edition_key, chapterNumber: row.chapter,
      paragraphIndex: row.paragraph, fromWord: row.from_word, endParagraphIndex: row.end_paragraph, toWord: row.to_word,
      look: row.look as ShareRecord['look'], format: row.format as ShareRecord['format'], context: row.context === 1, tagline: row.tagline === 1,
    }
  }

  /** Account deletion: the shares stay public, the link to the account goes. */
  forgetCreator(creatorId: string): number {
    return this.ctx.storage.sql.exec('UPDATE shares SET creator_id=NULL WHERE creator_id=?', creatorId).rowsWritten
  }
}
