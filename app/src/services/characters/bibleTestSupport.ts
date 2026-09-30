import { readFileSync } from 'node:fs'
import { verifyCharacters, type CharacterAsset, type VerifiedCharacters } from './characterCards'

export const bibleEditions = ['kjv-en', 'web-en', 'bsb-en', 'webc-en'] as const

/** The per-edition sidecar exactly as the reader downloads it, verified against the served edition bytes. */
export async function loadBible(editionKey: string): Promise<VerifiedCharacters> {
  const asset: CharacterAsset = JSON.parse(readFileSync(`public/data/characters/bible.v1.${editionKey}.json`, 'utf8'))
  const raw = Uint8Array.from(readFileSync(`public/data/editions/bible-${editionKey}.json`)).buffer
  const data = await verifyCharacters(asset, 'bible', editionKey, raw)
  if (!data) throw new Error(`bible ${editionKey} did not verify`)
  return data
}

/**
 * resolveCharacter scans every mention in the edition, which is fine for one tap
 * but quadratic over a whole-Bible sweep. This narrows the mention list to the
 * mention's own paragraph first; the resolver still applies its normal rules
 * (narrowest containing span, ties fail closed) to that paragraph.
 */
export function paragraphScoped(data: VerifiedCharacters) {
  const byParagraph = new Map<string, VerifiedCharacters>()
  const groups = new Map<string, VerifiedCharacters['edition']['mentions']>()
  for (const m of data.edition.mentions) {
    const key = `${m.chapterNumber}.${m.paragraphIndex}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(m)
  }
  return (chapterNumber: number, paragraphIndex: number): VerifiedCharacters => {
    const key = `${chapterNumber}.${paragraphIndex}`
    if (!byParagraph.has(key)) byParagraph.set(key, { ...data, edition: { ...data.edition, mentions: groups.get(key) ?? [] } })
    return byParagraph.get(key)!
  }
}
