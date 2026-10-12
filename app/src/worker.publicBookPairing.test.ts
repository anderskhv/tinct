import { describe, expect, it } from 'vitest'
import { pairedWithModern } from './worker/routes/publicBooks'

const original = { key: 'original-en', style: 'original', aligned: false }
const entryOriginal = { key: 'original-en', style: 'original', group: 'human', aligned: false }
const modern = { key: 'modern-en', style: 'modern', aligned: true }

describe('an added book: its original pairs with its Modern English', () => {
  it('marks the original aligned once the Modern English exists (Memoirs of Victor Hugo, 12 Oct)', () => {
    const meta = pairedWithModern({ book: { editions: [original, modern] }, entry: { editions: [entryOriginal, { ...modern, group: 'modern' }] } })
    expect(meta.book.editions.find(e => e.key === 'original-en')?.aligned).toBe(true)
    expect(meta.entry.editions?.find(e => e.key === 'original-en')?.aligned).toBe(true)
  })
  it('leaves a book with only its original as it was', () => {
    const stored = { book: { editions: [original] }, entry: { editions: [entryOriginal] } }
    expect(pairedWithModern(stored)).toBe(stored)
  })
})
