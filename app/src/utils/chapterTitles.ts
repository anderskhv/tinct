const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

function romanToNumber(value: string): number | null {
  const roman = value.toUpperCase()
  if (!/^[IVXLCDM]+$/.test(roman)) return null

  let total = 0
  for (let i = 0; i < roman.length; i++) {
    const current = ROMAN_VALUES[roman[i]]
    const next = ROMAN_VALUES[roman[i + 1]]
    if (!current) return null
    total += next && current < next ? -current : current
  }

  // Reject non-canonical forms so ordinary words made of roman letters do
  // not accidentally normalize if they appear after labels.
  const canonical = toRoman(total)
  return canonical === roman ? total : null
}

function toRoman(value: number): string {
  const parts: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]

  let remaining = value
  let out = ''
  for (const [n, roman] of parts) {
    while (remaining >= n) {
      out += roman
      remaining -= n
    }
  }
  return out
}

export function normalizeChapterTitle(title: string): string {
  return title.replace(
    /\b(Book|Chapter|Part|Act|Scene|Canto|Meditation)\s+([IVXLCDM]+)\b/gi,
    (match, label: string, roman: string) => {
      const value = romanToNumber(roman)
      return value ? `${label} ${value}` : match
    },
  )
}
