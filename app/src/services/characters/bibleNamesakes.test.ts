import { describe, expect, it } from 'vitest'
import { namesakesAt, resolveCharacter } from './characterCards'
import { loadBible } from './bibleTestSupport'
import { auditSharedNames } from './sharedNameAudit'

/** The card a reader gets for the first `name` after `lead` in one paragraph. */
async function cardAt(chapter: number, lead: string, name: string) {
  const data = await loadBible('webc-en')
  const index = data.paragraphs[chapter].findIndex(p => p.includes(lead + name))
  expect(index, `${lead}${name} in chapter ${chapter}`).toBeGreaterThanOrEqual(0)
  const text = data.paragraphs[chapter][index]
  const start = text.indexOf(lead + name) + lead.length
  return { data, index, start, end: start + name.length, selection: resolveCharacter(data, chapter, index, start, start + name.length, text) }
}

// Owner report, 21 Oct 2026: 1 Maccabees 13:11 "Jonathan the son of Absalom" showed Jonathan Maccabeus.
describe('sons of Absalom in 1 Maccabees (webc-en)', () => {
  it('gives the Jonathan sent to Joppa (13:11) his own card, not the brother Tryphon kills (13:23)', async () => {
    const joppa = await cardAt(1232, 'He sent ', 'Jonathan')
    const bascama = await cardAt(1232, 'he killed ', 'Jonathan')
    expect(joppa.selection?.card).toMatchObject({ id: 'jonathan-son-of-absalom', name: 'Jonathan son of Absalom' })
    expect(bascama.selection?.card.id).toBe('jonathan-maccabeus')
  })

  it('gives the captain at Hazor (11:70) his own card, not the priest of Modein (2:1)', async () => {
    const hazor = await cardAt(1230, 'except ', 'Mattathias')
    const modein = await cardAt(1221, 'In those days ', 'Mattathias')
    expect(hazor.selection?.card).toMatchObject({ id: 'mattathias-son-of-absalom', name: 'Mattathias son of Absalom' })
    expect(modein.selection?.card.id).toBe('mattathias')
  })

  it('fails the shared-name audit if 13:11 is pointed back at Jonathan Maccabeus', async () => {
    const { data, index, start } = await cardAt(1232, 'He sent ', 'Jonathan')
    const clean = auditSharedNames('webc-en', data.edition, data.paragraphs)
    expect(clean.contradictions.filter(c => c.key.startsWith('webc-en|1232.'))).toEqual([])
    const mentions = data.edition.mentions.map(m => m.chapterNumber === 1232 && m.paragraphIndex === index && m.startOffset === start ? { ...m, characterId: 'jonathan-maccabeus' } : m)
    const broken = auditSharedNames('webc-en', { ...data.edition, mentions }, data.paragraphs)
    expect(broken.contradictions).toContainEqual(expect.objectContaining({ key: `webc-en|1232.${index}.${start}`, characterId: 'jonathan-maccabeus', named: 'Absalom' }))
  })
})

describe('a name several cards share, with no reviewed mention', () => {
  it('lists the released namesakes instead of guessing (John Hyrcanus, 1 Macc 16:21)', async () => {
    const { data, index, start, end, selection } = await cardAt(1235, 'told ', 'John')
    expect(selection).toBeNull()
    const notice = namesakesAt(data, 1235, index, start, end, data.paragraphs[1235][index])
    expect(notice?.name).toBe('John')
    expect(notice?.candidates.map(c => c.id)).toEqual(expect.arrayContaining(['john-the-baptist', 'john-apostle']))
  })

  it('gives no notice on a linked name, and none before a second namesake is released', async () => {
    const linked = await cardAt(1232, 'he killed ', 'Jonathan')
    expect(namesakesAt(linked.data, 1232, linked.index, linked.start, linked.end, linked.data.paragraphs[1232][linked.index])).toBeNull()
    // Judges 18:30: Jonathan son of Gershom, before either Jonathan card is introduced.
    const judges = Object.entries(linked.data.paragraphs).find(([, ps]) => ps.some(p => p.includes('Jonathan, the son of Gershom')))
    expect(judges).toBeDefined()
    const [chapter, ps] = judges!
    const p = ps.findIndex(text => text.includes('Jonathan, the son of Gershom'))
    const at = ps[p].indexOf('Jonathan, the son of Gershom')
    expect(namesakesAt(linked.data, Number(chapter), p, at, at + 8, ps[p])).toBeNull()
  })
})
