/** A reviewed lexical equivalence; its internal display boundary is estimated. */
export interface SpokenTokenGroup {
  from: number
  to: number
  spokenText: string
  start: number
  end: number
  boundaryMethod: 'duration-proportion-v1'
}
export interface GroupAlignment {
  expectedWords?: number
  heardWords?: number
  matchedWords?: number
  matchRatio?: number
  matchedWordIndexes?: number[]
  tokenGroups?: SpokenTokenGroup[]
}

export function tokenGroupCoverage(alignment: GroupAlignment, words: { text: string; start: number; end: number }[]): number | undefined {
  if (!alignment || !Array.isArray(words) || !words.length || words.some(word => !word || typeof word.text !== 'string' || !Number.isFinite(word.start) || !Number.isFinite(word.end) || word.start < 0 || word.end < word.start)) return undefined
  const { expectedWords, heardWords, matchedWords, matchedWordIndexes, tokenGroups, matchRatio } = alignment
  if (!Array.isArray(tokenGroups) || !tokenGroups.length || !Array.isArray(matchedWordIndexes) || expectedWords !== words.length
    || !Number.isInteger(matchedWords) || !Number.isInteger(heardWords)
    || matchedWordIndexes.length !== matchedWords || typeof matchRatio !== 'number'
    || !Number.isFinite(matchRatio) || Math.abs(matchRatio - matchedWords! / words.length) > .0001) return undefined
  const covered = new Set<number>()
  for (const index of matchedWordIndexes) {
    if (!Number.isInteger(index) || index < 0 || index >= words.length || covered.has(index)) return undefined
    covered.add(index)
  }
  if (heardWords! < matchedWords! + tokenGroups.length) return undefined
  const normal = (word: string) => word.toLowerCase().replace(/[^a-z]/g, '')
  for (const group of tokenGroups) {
    if (!group || typeof group !== 'object' || !Number.isInteger(group.from) || group.to !== group.from + 2 || group.from < 0 || group.to > words.length
      || typeof group.spokenText !== 'string' || group.boundaryMethod !== 'duration-proportion-v1'
      || !Number.isFinite(group.start) || !Number.isFinite(group.end) || group.start < 0 || group.end <= group.start) return undefined
    const [first, second] = words.slice(group.from, group.to)
    // Only the confirmed Manual fixture is supported. Do not infer arbitrary compounds.
    if (normal(first.text) !== 'every' || normal(second.text) !== 'thing' || normal(group.spokenText) !== 'everything'
      || Math.abs(first.start - group.start) > .001 || Math.abs(second.end - group.end) > .001
      || Math.abs(second.start - (group.start + group.end) / 2) > .001
      || Math.abs(first.end - second.start) > .001 || second.start < first.start || second.start > second.end) return undefined
    for (let index = group.from; index < group.to; index++) {
      if (covered.has(index)) return undefined
      covered.add(index)
    }
  }
  return covered.size / words.length
}
