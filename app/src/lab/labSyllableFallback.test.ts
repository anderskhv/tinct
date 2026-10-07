import { describe, expect, it } from 'vitest'
import { drawSyllables, fallbackBreaks } from './labSyllableFallback'

/** A word with its offered breaks drawn. */
function offered(word: string): string {
  let out = ''
  let from = 0
  for (const at of fallbackBreaks(word)) { out += `${word.slice(from, at)}-`; from = at }
  return out + word.slice(from)
}

describe('guessed syllables for words the patterns leave whole', () => {
  it.each([
    // Nehemiah 12 and the names Anders gave as references.
    ['Zechariah', 'Zech-a-ri-ah', 'Zech-a-riah'],
    ['Amariah', 'Am-a-ri-ah', 'Ama-riah'],
    ['Hilkiah', 'Hil-ki-ah', 'Hil-kiah'],
    ['Jehohanan', 'Je-ho-ha-nan', 'Jeho-ha-nan'],
    ['Malchijah', 'Mal-chi-jah', 'Mal-chi-jah'],
    ['Joiarib', 'Joi-a-rib', 'Joi-a-rib'],
    // Russian and Greek names.
    ['Bolkonsky', 'Bol-kon-sky', 'Bol-kon-sky'],
    ['Kutuzov', 'Ku-tu-zov', 'Kutu-zov'],
    ['Telemachus', 'Te-le-ma-chus', 'Tele-ma-chus'],
    ['Polyphemus', 'Po-ly-phe-mus', 'Poly-phe-mus'],
    ['Dolokhov', 'Do-lo-khov', 'Dolo-khov'],
    ['Pyrrhus', 'Pyr-rhus', 'Pyr-rhus'],
  ])('%s: syllables %s, offered %s', (word, syllables, breaks) => {
    expect(drawSyllables(word)).toBe(syllables)
    expect(offered(word)).toBe(breaks)
  })

  it('keeps three letters each side and digraphs whole', () => {
    // "Ros-tov" is two syllables, but six letters is below the guessing length.
    expect(fallbackBreaks('Rostov')).toEqual([])
    for (const word of ['Zechariah', 'Telemachus', 'Shtcherbatsky', 'Nebuchadnezzar']) {
      for (const at of fallbackBreaks(word)) {
        expect(at).toBeGreaterThanOrEqual(3)
        expect(word.length - at).toBeGreaterThanOrEqual(3)
        expect(['ch', 'sh', 'th', 'ph', 'kh']).not.toContain(word.slice(at - 1, at + 1).toLowerCase())
      }
    }
    // "iah" is i-ah only before the final -ah, which is never a tail on its own.
    expect(fallbackBreaks('Hananiah').every(at => at <= 'Hananiah'.length - 4)).toBe(true)
  })

  it('never guesses in an all-caps word, one with a hyphen, digit or apostrophe', () => {
    expect(fallbackBreaks('ZECHARIAH')).toEqual([])
    expect(fallbackBreaks('Zech-ariah')).toEqual([])
    expect(fallbackBreaks('Zechariah2')).toEqual([])
    expect(fallbackBreaks('O’Zechariah')).toEqual([])
  })

  it('takes a per-word correction from the exceptions map', () => {
    expect(drawSyllables('Gateshead')).toBe('Gates-head')
    expect(offered('Gateshead')).toBe('Gates-head')
  })

  /**
   * The 200 commonest words of seven letters or more in the English editions
   * that the en-us patterns leave whole (counted over every *-en edition,
   * October 2026). Nearly all are whole on purpose ("start-ed", "broth-er"),
   * so the guess must leave them alone; the few it breaks are listed, so any
   * change to the rules shows up here.
   */
  const COMMON = ['thought', 'through', 'against', 'whether', 'brought', 'greater', 'replied', 'friends', 'brother', 'strange', 'strength', 'thoughts', 'evening', 'reached', 'quickly', 'stopped', 'clearly', 'straight', 'learned', 'pleased', 'equally', 'changed', 'courage', 'promise', 'telling', 'scarcely', 'clothes', 'mankind', 'shouted', 'obliged', 'laughed', 'putting', 'started', 'princess', 'plainly', 'promised', 'stranger', 'dressed', 'watched', 'pressed', 'crossed', 'wounded', 'wretched', 'ashamed', 'greatly', 'stronger', 'falling', 'amongst', 'dropped', 'touched', 'whereas', 'blessed', 'progress', 'virtues', 'painful', 'treated', 'supreme', 'granted', 'pointed', 'classes', 'glanced', 'closely', 'princes', 'thereby', 'branches', 'younger', 'singing', 'founded', 'kitchen', 'colonies', 'friendly', 'changes', 'smaller', 'stretched', 'weather', 'shillings', 'chiefly', 'poverty', 'rightly', 'beloved', 'arranged', 'grounds', 'wherein', 'stepped', 'tonight', 'streets', 'stirred', 'species', 'earnest', 'prayers', 'leisure', 'tyranny', 'presently', 'vengeance', 'rapidly', 'valiant', 'slightly', 'slipped', 'strongly', 'strangers', 'mounted', 'adopted', 'wealthy', 'silently', 'province', 'priests', 'prospect', 'lightly', 'springs', 'killing', 'earthly', 'avoided', 'dragged', 'promises', 'charged', 'praised', 'marched', 'farewell', 'wrapped', 'weapons', 'provinces', 'stretch', 'nowhere', 'process', 'pulling', 'strangely', 'knocked', 'painted', 'pleases', 'sounded', 'stripped', 'elected', 'counted', 'duchess', 'essence', 'wrought', 'crushed', 'rolling', 'healthy', 'sailors', 'strongest', 'flushed', 'dwelling', 'guardian', 'scoundrel', 'climbed', 'trusted', 'shortly', 'arrange', 'strictly', 'sharply', 'earnestly', 'therein', 'thither', 'hastily', 'colonel', 'alarmed', 'steadily', 'briefly', 'cleared', 'tempted', 'guessed', 'lessons', 'schools', 'penalty', 'worldly', 'knights', 'weighed', 'leather', 'teacher', 'claimed', 'planted', 'streams', 'largest', 'snatched', 'lighted', 'breathe', 'wronged', 'sources', 'crowded', 'trousers', 'chivalry', 'favourable', 'whereof', 'strikes', 'hideous', 'reaches', 'trained', 'drowned', 'colours', 'thereof', 'blushed', 'grieved', 'monastery', 'plunged', 'tongues', 'crowned', 'swiftly', 'drunken', 'doubted']

  it('leaves common English words alone: 7 of 200 get a guessed break', () => {
    expect(COMMON).toHaveLength(200)
    const guessed = COMMON.filter(word => fallbackBreaks(word).length > 0).map(offered)
    expect(guessed).toEqual(['man-kind', 'pros-pect', 'fare-well', 'guar-dian', 'scoun-drel', 'chiv-alry', 'monas-tery'])
  })
})
