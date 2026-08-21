import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react'
import type { Book, Edition, EditionKey, Language } from '../types'
import { inferOnboardingLanguage, loadOnboardingData, type OnboardingLanguage } from '../utils/onboardingData'
import {
  countColumnPages,
  formatPrefaceCounter,
  isPrefaceMeasurementSettled,
  prefaceDisplayColumns,
  prefacePageTotal,
} from '../utils/prefacePagination'
import { measureContentfulColumnPages } from '../utils/readerPagination'

interface AcclaimEntry {
  quote: string
  source: string
  context?: string
}

interface WhyItMattersItem {
  title: string
  body: string
}

interface CastMember {
  name: string
  role: string
  description: string
}

interface OnboardingData {
  bookId: string
  title: string
  author: string
  era?: string
  length?: string
  estimatedTime?: string
  about?: string
  acclaim?: AcclaimEntry[]
  whyItMatters?: WhyItMattersItem[]
  cast?: CastMember[]
}

export interface BookOnboardingPrefaceResult {
  editionKey: EditionKey
  splitEditionKey?: EditionKey
  audioEditionKey?: EditionKey
  openSplitByDefault?: boolean
  angle: string
}

interface Props {
  book: Book
  editions: Edition[]
  defaultEditionKey?: EditionKey
  defaultAudioEditionKey?: EditionKey
  defaultSplitEditionKey?: EditionKey
  defaultOpenSplit?: boolean
  isPremium: boolean
  isMobile: boolean
  /** Reader font preferences — passed in so prose panes repaginate when
   *  the user adjusts size from the reader chrome. */
  fontSize?: number
  fontFamily?: string
  /** When true, mount on the last spread (edition) instead of the cover.
   *  Used when re-entering the preface from the book's first page. */
  startAtLastPage?: boolean
  onComplete: (result: BookOnboardingPrefaceResult) => void
  onClose: () => void
  readingLanguages: Language[]
  onReadingLanguagesChange?: (langs: Language[]) => void
}

const LANG_LABELS: Record<string, string> = { en: 'English', da: 'Dansk' }

// Single source of truth for displaying a book's year — `book.year` from the
// registry. Negative = BC, positive = AD. We add a "c." prefix for ancient
// dates because all of them are approximate.
function formatYear(year: number | null | undefined): string {
  if (year === null || year === undefined) return ''
  if (year < 0) return `c. ${Math.abs(year)} BC`
  if (year < 1500) return `c. ${year}`
  return String(year)
}

// Page estimate from word count. ~275 words per paperback page. Rounded to
// the nearest 10 for short books, nearest 50 for >500 pages, so the number
// reads as a sensible estimate not a false-precision stat.
function formatLength(wordCount: number | null | undefined): string {
  if (!wordCount || wordCount <= 0) return ''
  const raw = wordCount / 275
  const rounded = raw < 500
    ? Math.round(raw / 10) * 10
    : Math.round(raw / 50) * 50
  return `~${rounded} pages`
}

// Sections paginate sequentially — Why fully finishes before Cast starts.
// On desktop, cover and about share a spread group: the cover takes
// column 0 of a multi-column flow, then about prose fills columns 1..N.
// On mobile (single-column display), cover and about are separate pages.
type SpreadKind = 'cover-about' | 'why' | 'cast' | 'edition'
type MobilePageKind = 'cover' | 'about' | 'why' | 'cast' | 'text' | 'compare' | 'audio'

export function BookOnboardingPreface({
  book,
  editions,
  defaultEditionKey,
  defaultAudioEditionKey,
  defaultSplitEditionKey,
  defaultOpenSplit,
  isPremium,
  isMobile,
  fontSize,
  fontFamily,
  startAtLastPage,
  onComplete,
  onClose,
  readingLanguages,
  onReadingLanguagesChange,
}: Props) {
  const [data, setData] = useState<OnboardingData | null>(null)

  const [editionKey, setEditionKey] = useState<EditionKey>(() => {
    if (defaultEditionKey && editions.some(e => e.key === defaultEditionKey)) return defaultEditionKey
    const origEn = editions.find(e => e.style === 'original' && e.language === 'en')
    if (origEn) return origEn.key
    return editions[0]?.key || ''
  })

  const audioEditions = useMemo(() => editions.filter(e => e.hasAudio), [editions])
  const [audioEditionKey, setAudioEditionKey] = useState<EditionKey | undefined>(() => {
    if (defaultAudioEditionKey && audioEditions.some(e => e.key === defaultAudioEditionKey)) return defaultAudioEditionKey
    return undefined
  })

  const [splitEditionKey, setSplitEditionKey] = useState<EditionKey | undefined>(() => {
    if (defaultOpenSplit && defaultSplitEditionKey) return defaultSplitEditionKey
    return undefined
  })
  const [splitManuallyPicked, setSplitManuallyPicked] = useState(false)
  const [openSplitByDefault, setOpenSplitByDefault] = useState<boolean>(!!defaultOpenSplit)

  const availableLanguages = useMemo(
    () => Array.from(new Set(editions.map(e => e.language))),
    [editions]
  )
  const inferredOnboardingLanguage = useMemo(
    () => inferOnboardingLanguage(editions, editionKey, readingLanguages),
    [editions, editionKey, readingLanguages]
  )
  const [onboardingLanguage, setOnboardingLanguage] = useState<OnboardingLanguage>(inferredOnboardingLanguage)
  const [onboardingLanguagePicked, setOnboardingLanguagePicked] = useState(false)
  const [danishOnboardingAvailable, setDanishOnboardingAvailable] = useState(true)

  useEffect(() => {
    if (!onboardingLanguagePicked) setOnboardingLanguage(inferredOnboardingLanguage)
  }, [inferredOnboardingLanguage, onboardingLanguagePicked])

  useEffect(() => {
    let cancelled = false
    loadOnboardingData<OnboardingData>(book.id, onboardingLanguage)
      .then(result => {
        if (cancelled) return
        setData(result.data)
        setDanishOnboardingAvailable(result.danishAvailable)
        if (onboardingLanguage === 'da' && result.language === 'en') setOnboardingLanguage('en')
      })
    return () => { cancelled = true }
  }, [book.id, onboardingLanguage])

  function pickOnboardingLanguage(language: OnboardingLanguage) {
    setOnboardingLanguagePicked(true)
    setOnboardingLanguage(language)
  }

  const filteredEditions = useMemo(
    () => editions.filter(e => readingLanguages.includes(e.language)),
    [editions, readingLanguages]
  )
  const noMatchingLanguage = filteredEditions.length === 0
  const effectiveEditions = noMatchingLanguage ? editions : filteredEditions

  const sortedEditions = useMemo(() => {
    return [...effectiveEditions].sort((a, b) => {
      const score = (e: Edition) => {
        if (e.style === 'original' && e.language === 'en') return 0
        if (e.style === 'modern' && e.language === 'en') return 1
        if (e.language === 'en') return 2
        if (e.language === 'da') return 3
        return 4
      }
      return score(a) - score(b)
    })
  }, [effectiveEditions])

  useEffect(() => {
    if (!sortedEditions.some(e => e.key === editionKey) && sortedEditions.length > 0) {
      setEditionKey(sortedEditions[0].key)
    }
  }, [sortedEditions, editionKey])

  // Aligned editions for Compare = editions matching language preferences,
  // aligned, and not the primary.
  const alignedEditions = useMemo(
    () => effectiveEditions.filter(e => e.aligned && e.key !== editionKey),
    [effectiveEditions, editionKey]
  )

  // Compare default = inverse of primary (different style same language → orig EN).
  const inverseEdition = useCallback((primaryKey: EditionKey, candidates: Edition[]): EditionKey | undefined => {
    const primary = effectiveEditions.find(e => e.key === primaryKey)
    if (!primary || candidates.length === 0) return undefined
    const sameLangDifferentStyle = candidates.find(e => e.language === primary.language && e.style !== primary.style)
    if (sameLangDifferentStyle) return sameLangDifferentStyle.key
    const originalEn = candidates.find(e => e.style === 'original' && e.language === 'en')
    if (originalEn) return originalEn.key
    return candidates[0]?.key
  }, [effectiveEditions])

  useEffect(() => {
    if (splitManuallyPicked) return
    if (!openSplitByDefault) {
      setSplitEditionKey(undefined)
      return
    }
    setSplitEditionKey(inverseEdition(editionKey, alignedEditions))
  }, [editionKey, alignedEditions, splitManuallyPicked, inverseEdition, openSplitByDefault])

  function toggleLanguage(lang: Language) {
    if (!onReadingLanguagesChange) return
    if (readingLanguages.includes(lang)) {
      if (readingLanguages.length === 1) return
      onReadingLanguagesChange(readingLanguages.filter(l => l !== lang))
    } else {
      onReadingLanguagesChange([...readingLanguages, lang])
    }
  }

  // Spreads (desktop) and flat page list (mobile).
  const hasWhy = !!(data?.whyItMatters && data.whyItMatters.length > 0)
  const hasCast = !!(data?.cast && data.cast.length > 0)

  const spreads: SpreadKind[] = useMemo(() => {
    if (!data) return []
    const list: SpreadKind[] = ['cover-about']
    if (hasWhy) list.push('why')
    if (hasCast) list.push('cast')
    list.push('edition')
    return list
  }, [data, hasWhy, hasCast])

  const mobileHasCompare = useMemo(
    () => editions.some(e => e.aligned),
    [editions]
  )
  const mobilePages: MobilePageKind[] = useMemo(() => {
    if (!data) return []
    const list: MobilePageKind[] = ['cover', 'about']
    if (hasWhy) list.push('why')
    if (hasCast) list.push('cast')
    list.push('text')
    if (mobileHasCompare) list.push('compare')
    list.push('audio')
    return list
  }, [data, hasWhy, hasCast, mobileHasCompare])

  // Per-section page counts reported by PaginatedFlow components after layout.
  const [aboutPages, setAboutPages] = useState(1)
  const [whyPages, setWhyPages] = useState(1)
  const [castPages, setCastPages] = useState(1)
  const [aboutKnown, setAboutKnown] = useState(false)
  const [whyKnown, setWhyKnown] = useState(false)
  const [castKnown, setCastKnown] = useState(false)
  const recalcKey = `${fontSize ?? ''}-${fontFamily ?? ''}`
  const reportAboutPages = useCallback((n: number) => {
    setAboutPages(n)
    setAboutKnown(true)
  }, [])
  const reportWhyPages = useCallback((n: number) => {
    setWhyPages(n)
    setWhyKnown(true)
  }, [])
  const reportCastPages = useCallback((n: number) => {
    setCastPages(n)
    setCastKnown(true)
  }, [])

  // Global page index. Semantics depend on isMobile:
  //  - desktop: index over a flat sequence of "sub-pages" across all spreads.
  //    Spread 0 (cover-about) takes `aboutPages` sub-pages (cover stays on
  //    LHS while about paginates on RHS). Spread 1 (why-cast) takes
  //    max(whyPages, castPages) sub-pages. Spread 2 (edition) takes 1.
  //  - mobile: index over a flat sequence of single pages: cover, about×N,
  //    why×M, cast×K, text, audio.
  const [page, setPage] = useState(0)

  // Reset to page 0 if device mode flips OR section list changes shape.
  useEffect(() => { setPage(0) }, [isMobile, hasWhy, hasCast])

  // Clamp page index when totalPages shrinks (e.g., user reduced font size,
  // sections repaginated to fewer columns). Without this, `page` could be
  // past the new end → `isLastPage` triggers spuriously → footer "Begin
  // reading →" appears, and a stray click/arrow exits the preface.

  const desktopSpreadPages = useMemo(() => {
    return spreads.map((s) => {
      // 'cover-about' = paginated flow that includes the cover as column 0
      // followed by the about prose. Total spread count is reported by the
      // PaginatedFlow as `aboutPages`, which already accounts for the cover.
      if (s === 'cover-about') return aboutPages
      if (s === 'why') return whyPages
      if (s === 'cast') return castPages
      return 1 // edition
    })
  }, [spreads, aboutPages, whyPages, castPages])

  const measuredTotal = prefacePageTotal({
    isMobile,
    hasWhy,
    hasCast,
    hasCompare: mobileHasCompare,
    aboutPages,
    whyPages,
    castPages,
  })
  const desktopTotal = desktopSpreadPages.reduce((a, b) => a + b, 0) || 1
  const totalPages = isMobile ? measuredTotal : desktopTotal
  const measurementSettled = isPrefaceMeasurementSettled({
    hasWhy,
    hasCast,
    aboutKnown,
    whyKnown: hasWhy ? whyKnown : true,
    castKnown: hasCast ? castKnown : true,
  })
  const [frozenTotal, setFrozenTotal] = useState<number | null>(null)
  const measureResetKey = `${recalcKey}|${isMobile}|${book.id}|${onboardingLanguage}`
  const prevMeasureResetKey = useRef(measureResetKey)
  useEffect(() => {
    if (prevMeasureResetKey.current === measureResetKey) return
    prevMeasureResetKey.current = measureResetKey
    setFrozenTotal(null)
    setAboutKnown(false)
    setWhyKnown(false)
    setCastKnown(false)
  }, [measureResetKey])
  useEffect(() => {
    if (measurementSettled && frozenTotal == null) setFrozenTotal(totalPages)
  }, [measurementSettled, totalPages, frozenTotal])
  const displayTotal = frozenTotal ?? totalPages

  // Clamp on totalPages shrink — see explanation by the setPage(0) effect above.
  useEffect(() => {
    const last = (frozenTotal ?? totalPages) - 1
    if (page > last) setPage(Math.max(0, last))
  }, [totalPages, frozenTotal, page])

  // startAtLastPage support: when re-entering the preface from the book's
  // first page, land on the last preface spread (edition). We keep forcing
  // page = last whenever pageCounts settle further (about/why/cast measure
  // and report higher counts), but stop the moment the user navigates so
  // their position is preserved.
  const userNavigatedRef = useRef(false)
  useEffect(() => {
    if (!startAtLastPage) return
    if (userNavigatedRef.current) return
    if (!data || totalPages <= 0) return
    const last = totalPages - 1
    if (page !== last) setPage(last)
  }, [startAtLastPage, data, totalPages, page])

  // Decompose desktop page → {spreadIdx, pageInSpread}
  const desktopPos = useMemo(() => {
    let p = page
    for (let i = 0; i < desktopSpreadPages.length; i++) {
      if (p < desktopSpreadPages[i]) return { spreadIdx: i, pageInSpread: p }
      p -= desktopSpreadPages[i]
    }
    return { spreadIdx: spreads.length - 1, pageInSpread: 0 }
  }, [page, desktopSpreadPages, spreads.length])

  // Decompose mobile page → {section, pageInSection}
  const mobilePos = useMemo(() => {
    let p = page
    if (mobilePages.includes('cover')) {
      if (p === 0) return { section: 'cover' as MobilePageKind, pageInSection: 0 }
      p -= 1
    }
    if (mobilePages.includes('about')) {
      if (p < aboutPages) return { section: 'about' as MobilePageKind, pageInSection: p }
      p -= aboutPages
    }
    if (mobilePages.includes('why')) {
      if (p < whyPages) return { section: 'why' as MobilePageKind, pageInSection: p }
      p -= whyPages
    }
    if (mobilePages.includes('cast')) {
      if (p < castPages) return { section: 'cast' as MobilePageKind, pageInSection: p }
      p -= castPages
    }
    if (mobilePages.includes('text')) {
      if (p === 0) return { section: 'text' as MobilePageKind, pageInSection: 0 }
      p -= 1
    }
    if (mobilePages.includes('compare')) {
      if (p === 0) return { section: 'compare' as MobilePageKind, pageInSection: 0 }
      p -= 1
    }
    return { section: 'audio' as MobilePageKind, pageInSection: 0 }
  }, [page, mobilePages, aboutPages, whyPages, castPages])

  const navTotal = frozenTotal ?? Math.max(totalPages, 1)
  const isFirstPage = page === 0
  const isLastPage = page >= navTotal - 1

  const finish = useCallback(() => {
    if (!editionKey) return
    onComplete({ editionKey, splitEditionKey, audioEditionKey, openSplitByDefault, angle: '' })
  }, [editionKey, splitEditionKey, audioEditionKey, openSplitByDefault, onComplete])

  const next = useCallback(() => {
    userNavigatedRef.current = true
    if (isLastPage) finish()
    else setPage(p => p + 1)
  }, [isLastPage, finish])

  const prev = useCallback(() => {
    userNavigatedRef.current = true
    if (!isFirstPage) setPage(p => p - 1)
  }, [isFirstPage])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev() }
      // Escape intentionally NOT handled here — it overlaps with the
      // Settings sheet's dismiss handler. Use the explicit "Skip directly
      // to Chapter 1" link instead.
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  // Take focus on mount so window keydown listeners receive arrow keys
  // immediately. Without this, a fresh page load leaves focus on the
  // browser URL bar — arrows go nowhere until the user clicks the page.
  // NOTE: hooks must run unconditionally and before any early return —
  // declaring this *above* the loading-state guard preserves hook order.
  const frameRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (data && frameRef.current) frameRef.current.focus()
  }, [data])

  if (!data) {
    return (
      <div style={frame}>
        <div style={loading}>Loading…</div>
      </div>
    )
  }

  // Compute the current spread/page content
  const currentSpread = !isMobile ? spreads[desktopPos.spreadIdx] : null
  const currentMobilePage = isMobile ? mobilePos.section : null

  // Within-spread sub-page (desktop) / within-section sub-page (mobile).
  const subPage = isMobile ? mobilePos.pageInSection : desktopPos.pageInSpread

  function handleSurfaceClick(e: React.MouseEvent<HTMLDivElement>) {
    // No early-bail on interactive pages — the button/input/label check
    // below already prevents accidental advancement when tapping a
    // control. Bailing meant tapping empty space on text/compare/audio
    // pages did nothing, which surprised people.
    const sel = window.getSelection()
    if (sel && sel.toString().length > 0) return
    if (e.target instanceof HTMLElement && (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('input') ||
      e.target.closest('select') ||
      e.target.closest('label')
    )) return
    const x = e.clientX
    const w = window.innerWidth
    if (x > w / 2) next()
    else prev()
  }

  const showLanguageToggle = availableLanguages.includes('da') || readingLanguages.includes('da')

  return (
    <div ref={frameRef} tabIndex={-1} style={frame}>
      <div style={isMobile ? prefaceChromeMobile : prefaceChrome}>
        {showLanguageToggle ? (
          <PrefaceLanguageToggle
            value={onboardingLanguage}
            danishAvailable={danishOnboardingAvailable}
            onChange={pickOnboardingLanguage}
            mobile={isMobile}
          />
        ) : (
          <span />
        )}
        {!isLastPage && (
          <button onClick={finish} style={isMobile ? skipLinkMobile : skipLink} aria-label="Skip directly to Chapter 1">
            {isMobile ? 'Skip →' : 'Skip directly to Chapter 1 →'}
          </button>
        )}
      </div>

      <div style={isMobile ? surfaceMobile : surface} onClick={handleSurfaceClick}>
        {!isMobile && (
          <>
            <PrefaceLayer visible={currentSpread === 'cover-about'}>
              <FullSpread divider>
                <PaginatedFlow
                  pageIdx={currentSpread === 'cover-about' ? subPage : 0}
                  onPageCount={reportAboutPages}
                  recalcKey={recalcKey}
                  displayColumns={2}
                >
                  <CoverInColumn data={data} book={book} />
                  <AboutPane data={data} book={book} />
                </PaginatedFlow>
              </FullSpread>
            </PrefaceLayer>
            {hasWhy && (
              <PrefaceLayer visible={currentSpread === 'why'}>
                <FullSpread divider>
                  <PaginatedFlow
                    pageIdx={currentSpread === 'why' ? subPage : 0}
                    onPageCount={reportWhyPages}
                    recalcKey={recalcKey}
                    displayColumns={2}
                  >
                    <WhyPane items={data.whyItMatters || []} title={data.title} showHeader />
                  </PaginatedFlow>
                </FullSpread>
              </PrefaceLayer>
            )}
            {hasCast && (
              <PrefaceLayer visible={currentSpread === 'cast'}>
                <FullSpread divider>
                  <PaginatedFlow
                    pageIdx={currentSpread === 'cast' ? subPage : 0}
                    onPageCount={reportCastPages}
                    recalcKey={recalcKey}
                    displayColumns={2}
                  >
                    <CastPane items={data.cast || []} title={data.title} showHeader />
                  </PaginatedFlow>
                </FullSpread>
              </PrefaceLayer>
            )}
            <PrefaceLayer visible={currentSpread === 'edition'}>
              <Spread divider>
                <TextEditionPane
                  book={book}
                  availableLanguages={availableLanguages}
                  readingLanguages={readingLanguages}
                  onToggleLanguage={toggleLanguage}
                  noMatchingLanguage={noMatchingLanguage}
                  sortedEditions={sortedEditions}
                  editionKey={editionKey}
                  onSelectEdition={setEditionKey}
                  alignedEditions={alignedEditions}
                  splitEditionKey={splitEditionKey}
                  onSelectSplit={(k) => { setSplitEditionKey(k); setSplitManuallyPicked(true) }}
                  openSplitByDefault={openSplitByDefault}
                  onChangeOpenSplit={setOpenSplitByDefault}
                />
                <AudioEditionPane
                  audioEditions={audioEditions}
                  audioEditionKey={audioEditionKey}
                  onSelectAudio={setAudioEditionKey}
                  isPremium={isPremium}
                />
              </Spread>
            </PrefaceLayer>
          </>
        )}

        {isMobile && (
          <>
            <PrefaceLayer visible={currentMobilePage === 'cover'}>
              <CoverPane data={data} book={book} mobile />
            </PrefaceLayer>
            <PrefaceLayer visible={currentMobilePage === 'about'}>
              <PaginatedFlow
                pageIdx={currentMobilePage === 'about' ? subPage : 0}
                onPageCount={reportAboutPages}
                recalcKey={recalcKey}
              >
                <AboutPane data={data} book={book} mobile />
              </PaginatedFlow>
            </PrefaceLayer>
            {hasWhy && (
              <PrefaceLayer visible={currentMobilePage === 'why'}>
                <PaginatedFlow
                  pageIdx={currentMobilePage === 'why' ? subPage : 0}
                  onPageCount={reportWhyPages}
                  recalcKey={recalcKey}
                >
                  <WhyPane items={data.whyItMatters || []} title={data.title} showHeader mobile />
                </PaginatedFlow>
              </PrefaceLayer>
            )}
            {hasCast && (
              <PrefaceLayer visible={currentMobilePage === 'cast'}>
                <PaginatedFlow
                  pageIdx={currentMobilePage === 'cast' ? subPage : 0}
                  onPageCount={reportCastPages}
                  recalcKey={recalcKey}
                >
                  <CastPane items={data.cast || []} title={data.title} showHeader mobile />
                </PaginatedFlow>
              </PrefaceLayer>
            )}
            <PrefaceLayer visible={currentMobilePage === 'text'}>
              <TextEditionPane
                book={book}
                availableLanguages={availableLanguages}
                readingLanguages={readingLanguages}
                onToggleLanguage={toggleLanguage}
                noMatchingLanguage={noMatchingLanguage}
                sortedEditions={sortedEditions}
                editionKey={editionKey}
                onSelectEdition={setEditionKey}
                alignedEditions={alignedEditions}
                splitEditionKey={splitEditionKey}
                onSelectSplit={(k) => { setSplitEditionKey(k); setSplitManuallyPicked(true) }}
                openSplitByDefault={openSplitByDefault}
                onChangeOpenSplit={setOpenSplitByDefault}
                mobile
                mobileVariant="primary"
              />
            </PrefaceLayer>
            {mobileHasCompare && (
              <PrefaceLayer visible={currentMobilePage === 'compare'}>
                <TextEditionPane
                  book={book}
                  availableLanguages={availableLanguages}
                  readingLanguages={readingLanguages}
                  onToggleLanguage={toggleLanguage}
                  noMatchingLanguage={noMatchingLanguage}
                  sortedEditions={sortedEditions}
                  editionKey={editionKey}
                  onSelectEdition={setEditionKey}
                  alignedEditions={alignedEditions}
                  splitEditionKey={splitEditionKey}
                  onSelectSplit={(k) => { setSplitEditionKey(k); setSplitManuallyPicked(true) }}
                  openSplitByDefault={openSplitByDefault}
                  onChangeOpenSplit={setOpenSplitByDefault}
                  mobile
                  mobileVariant="compare"
                />
              </PrefaceLayer>
            )}
            <PrefaceLayer visible={currentMobilePage === 'audio'}>
              <AudioEditionPane
                audioEditions={audioEditions}
                audioEditionKey={audioEditionKey}
                onSelectAudio={setAudioEditionKey}
                isPremium={isPremium}
                mobile
              />
            </PrefaceLayer>
          </>
        )}
      </div>

      <div className="page-nav page-nav-preface" style={pageNav}>
        <button
          onClick={prev}
          disabled={isFirstPage}
          className="page-nav-tick"
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="page-nav-label">
          <em className="page-nav-chapter">A Preface</em>
          <span className="page-nav-sep"> · </span>
          <span style={{ fontStyle: 'italic' }}>
            {formatPrefaceCounter(page, displayTotal, frozenTotal != null)}
          </span>
        </span>
        {isLastPage ? (
          <button
            onClick={finish}
            className="page-nav-tick page-nav-begin"
          >
            Begin reading →
          </button>
        ) : (
          <button onClick={next} className="page-nav-tick" aria-label="Next page">
            ›
          </button>
        )}
      </div>
    </div>
  )
}

function PrefaceLanguageToggle({
  value,
  danishAvailable,
  onChange,
  mobile,
}: {
  value: OnboardingLanguage
  danishAvailable: boolean
  onChange: (language: OnboardingLanguage) => void
  mobile?: boolean
}) {
  return (
    <div style={mobile ? prefaceLanguageToggleMobile : prefaceLanguageToggle} aria-label="Preface language">
      <span style={prefaceLanguageLabel}>Preface language</span>
      <button
        type="button"
        style={prefaceLanguageButton(value === 'da', !danishAvailable)}
        onClick={() => onChange('da')}
        disabled={!danishAvailable}
      >
        Danish
      </button>
      <button
        type="button"
        style={prefaceLanguageButton(value === 'en', false)}
        onClick={() => onChange('en')}
      >
        English
      </button>
    </div>
  )
}

// ── PaginatedFlow ───────────────────────────────────────────────
// Wraps prose in a CSS multi-column flow whose column-width matches the
// wrapper width. Each column = one "page" in this pane. Measures
// scrollWidth → derives a page count, reports up via `onPageCount`, and
// translates horizontally to show the current page.
//
// `recalcKey` is an opaque string the parent bumps when reading-typography
// preferences change (font-size / font-family) so we re-measure after the
// reflow.

function PrefaceLayer({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div style={visible ? prefaceLayerVisible : prefaceLayerHidden}>
      {children}
    </div>
  )
}

function PaginatedFlow({
  pageIdx,
  onPageCount,
  recalcKey,
  columnGap = 60,
  displayColumns = 1,
  children,
}: {
  pageIdx: number
  onPageCount: (n: number) => void
  recalcKey?: string
  columnGap?: number
  /** How many columns are shown at once. 2 = facing-page spread layout. */
  displayColumns?: 1 | 2
  children: React.ReactNode
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [colW, setColW] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [effectiveColumns, setEffectiveColumns] = useState(displayColumns)

  const recalc = useCallback(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return
    const w = wrapper.clientWidth
    if (w <= 0) return
    const cols = prefaceDisplayColumns(w, displayColumns)
    const colWLocal = cols === 2 ? (w - columnGap) / 2 : w
    inner.style.columnWidth = `${colWLocal}px`
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const i = innerRef.current
        if (!i) return
        const prefaceBlocks = i.querySelectorAll('p, h2, h3, dt, dd, [data-preface-block]')
        let lastLeft: number | undefined
        for (let b = 0; b < prefaceBlocks.length; b++) {
          const left = (prefaceBlocks[b] as HTMLElement).offsetLeft
          if (lastLeft == null || left > lastLeft) lastLeft = left
        }
        const contentful = measureContentfulColumnPages({
          scrollWidth: i.scrollWidth,
          columnWidth: colWLocal,
          columnGap,
          containerHeight: wrapper.clientHeight,
          containerWidth: wrapper.clientWidth,
          lastContentOffsetLeft: lastLeft,
        })
        const pages = cols === 1 && contentful != null
          ? contentful
          : countColumnPages({
              scrollWidth: i.scrollWidth,
              columnWidth: colWLocal,
              columnGap,
              displayColumns: cols,
            })
        setEffectiveColumns(cols)
        setColW(colWLocal)
        setPageCount(pages)
        onPageCount(pages)
      })
    })
  }, [columnGap, displayColumns, onPageCount])

  useLayoutEffect(() => {
    recalc()
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(() => recalc())
    ro.observe(wrapper)
    const t1 = window.setTimeout(recalc, 100)
    const t2 = window.setTimeout(recalc, 500)
    return () => { ro.disconnect(); window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [recalc, recalcKey, children])

  const safePage = Math.min(Math.max(0, pageIdx), pageCount - 1)
  const stepW = effectiveColumns * (colW + columnGap)
  const tx = -safePage * stepW

  return (
    <div ref={wrapperRef} style={paginatedWrapper}>
      <div style={paginatedTopMask} />
      <div
        ref={innerRef}
        style={{
          ...paginatedInner,
          columnGap: `${columnGap}px`,
          transform: `translateX(${tx}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Spread frame ────────────────────────────────────────────────

function Spread({ divider, children }: { divider?: boolean; children: React.ReactNode[] | React.ReactNode }) {
  const [left, right] = Array.isArray(children) ? children : [children, null]
  return (
    <div style={spreadGrid}>
      <div style={spreadPaneLeft}>{left}</div>
      <div style={divider ? spreadPaneRightWithDivider : spreadPaneRight}>{right}</div>
    </div>
  )
}

// FullSpread — single full-width pane (containing a 2-column paginated
// flow). Optionally renders a vertical divider in the middle to visually
// echo the facing-page spread.
function FullSpread({ divider, children }: { divider?: boolean; children: React.ReactNode }) {
  return (
    <div style={fullSpreadWrap}>
      {divider && <div style={fullSpreadDivider} />}
      {children}
    </div>
  )
}

// ── Panes ───────────────────────────────────────────────────────

// CoverInColumn — renders the same hero+meta as CoverPane, but as the first
// column of a multi-column flow (break-after forces the next sibling to
// start in the next column).
function CoverInColumn({ data, book }: { data: OnboardingData; book: Book }) {
  const bg = book.coverColor || '#2c2417'
  const accent = book.coverAccent || '#c9a45c'
  const yearStr = formatYear(book.year)
  return (
    <div style={coverInColumn}>
      <div className="book-cover book-cover-large" style={{ background: bg, ...coverShadow(false) }}>
        <div className="book-cover-spine" style={{ background: accent }} />
        <div className="book-cover-inner">
          <div className="book-cover-rule" style={{ borderColor: accent }} />
          <h3 className="book-cover-title" style={{ color: accent }}>{data.title}</h3>
          <div className="book-cover-rule" style={{ borderColor: accent }} />
          <p className="book-cover-author" style={{ color: `${accent}cc` }}>{data.author}</p>
          {yearStr && (
            <p className="book-cover-year" style={{ color: `${accent}88` }}>
              {yearStr}
            </p>
          )}
        </div>
      </div>
      <div style={coverMetaRow}>
        {data.estimatedTime && (
          <span style={coverMetaItem}>
            <span style={coverMetaLabel}>Reading time</span>
            <span style={coverMetaValue}>{data.estimatedTime.replace(/^~/, '~ ')}</span>
          </span>
        )}
        {book.wordCount && book.wordCount > 0 && (
          <span style={coverMetaItem}>
            <span style={coverMetaLabel}>Length</span>
            <span style={coverMetaValue}>{formatLength(book.wordCount)}</span>
          </span>
        )}
      </div>
    </div>
  )
}

function CoverPane({ data, book, mobile }: { data: OnboardingData; book: Book; mobile?: boolean }) {
  const bg = book.coverColor || '#2c2417'
  const accent = book.coverAccent || '#c9a45c'
  const yearStr = formatYear(book.year)
  return (
    <div style={mobile ? coverWrapMobile : coverWrap}>
      <div className="book-cover book-cover-large" style={{ background: bg, ...coverShadow(mobile) }}>
        <div className="book-cover-spine" style={{ background: accent }} />
        <div className="book-cover-inner">
          <div className="book-cover-rule" style={{ borderColor: accent }} />
          <h3 className="book-cover-title" style={{ color: accent }}>{data.title}</h3>
          <div className="book-cover-rule" style={{ borderColor: accent }} />
          <p className="book-cover-author" style={{ color: `${accent}cc` }}>{data.author}</p>
          {yearStr && (
            <p className="book-cover-year" style={{ color: `${accent}88` }}>
              {yearStr}
            </p>
          )}
        </div>
      </div>
      <div style={mobile ? coverMetaRowMobile : coverMetaRow}>
        {data.estimatedTime && (
          <span style={coverMetaItem}>
            <span style={coverMetaLabel}>Reading time</span>
            <span style={coverMetaValue}>{data.estimatedTime.replace(/^~/, '~ ')}</span>
          </span>
        )}
        {book.wordCount && book.wordCount > 0 && (
          <span style={coverMetaItem}>
            <span style={coverMetaLabel}>Length</span>
            <span style={coverMetaValue}>{formatLength(book.wordCount)}</span>
          </span>
        )}
        {yearStr && (
          <span style={coverMetaItem}>
            <span style={coverMetaLabel}>Composed</span>
            <span style={coverMetaValue}>{yearStr}</span>
          </span>
        )}
      </div>
    </div>
  )
}

function AboutPane({ data, book, mobile }: { data: OnboardingData; book: Book; mobile?: boolean }) {
  const text = data.about || ''
  const paragraphs = text.split('\n\n').filter(p => p.trim())
  const yearStr = formatYear(book.year)
  return (
    <div style={mobile ? proseMobile : prose}>
      <header style={aboutHeader}>
        <p style={eyebrowSC}>preface</p>
        <h1 style={titleH1}>{data.title}</h1>
        <p style={byline}>
          {data.author}
          {yearStr && <> · <span style={{ fontStyle: 'italic' }}>{yearStr}</span></>}
          {data.estimatedTime && <> · {data.estimatedTime}</>}
        </p>
      </header>

      {data.acclaim && data.acclaim.length > 0 && (
        <div style={acclaimBlock}>
          {data.acclaim.map((q, i) => (
            <blockquote key={i} style={acclaim}>
              <p style={acclaimQuote}>&ldquo;{q.quote}&rdquo;</p>
              <footer style={acclaimSource}>— {q.source}{q.context && <>, {q.context}</>}</footer>
            </blockquote>
          ))}
        </div>
      )}

      {paragraphs.map((p, i) => (
        <p key={i} style={i === 0 ? bodyParaFirst : bodyPara}>
          {i === 0 && p.length > 0 ? (
            <><span style={dropCap}>{p[0]}</span>{p.slice(1)}</>
          ) : p}
        </p>
      ))}
    </div>
  )
}

// Why is rendered as flowing prose, not bullet items. Each item's title
// becomes an italic lead-in phrase ending with a period, followed inline by
// the body paragraph. Reads as a short essay rather than a slide deck.
function WhyPane({
  items,
  title,
  showHeader,
  mobile,
}: {
  items: WhyItMattersItem[]
  title: string
  showHeader?: boolean
  mobile?: boolean
}) {
  const [first, ...rest] = items
  return (
    <div style={mobile ? proseMobile : prose}>
      {first && (
        <div style={keepWithNext}>
          {showHeader && (
            <h2 style={sectionH2}>Why it matters</h2>
          )}
          <p style={whyParagraph}>
            <em style={whyLeadIn}>{stripTrailingPeriod(first.title)}.</em>{' '}
            {first.body}
          </p>
        </div>
      )}
      {rest.map((item, i) => (
        <p key={i} style={whyParagraph}>
          <em style={whyLeadIn}>{stripTrailingPeriod(item.title)}.</em>{' '}
          {item.body}
        </p>
      ))}
    </div>
  )
}

function stripTrailingPeriod(s: string) {
  return s.replace(/\.\s*$/, '')
}

function CastPane({
  items,
  title,
  showHeader,
  mobile,
}: {
  items: CastMember[]
  title: string
  showHeader?: boolean
  mobile?: boolean
}) {
  const [first, ...rest] = items
  return (
    <div style={mobile ? proseMobile : prose}>
      <dl style={castList}>
        {first && (
          <div style={keepWithNext}>
            {showHeader && (
              <h2 style={sectionH2}>Characters &amp; concepts</h2>
            )}
            <div style={mobile ? castEntryStacked : castEntry}>
              <dt style={castName}>{first.name}</dt>
              <dd style={castBody}>
                <em style={castRoleInline}>{stripTrailingPeriod(first.role)}.</em> {first.description}
              </dd>
            </div>
          </div>
        )}
        {rest.map((c, i) => (
          <div key={i} style={mobile ? castEntryStacked : castEntry}>
            <dt style={castName}>{c.name}</dt>
            <dd style={castBody}>
              <em style={castRoleInline}>{stripTrailingPeriod(c.role)}.</em> {c.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function TextEditionPane({
  book,
  availableLanguages,
  readingLanguages,
  onToggleLanguage,
  noMatchingLanguage,
  sortedEditions,
  editionKey,
  onSelectEdition,
  alignedEditions,
  splitEditionKey,
  onSelectSplit,
  openSplitByDefault,
  onChangeOpenSplit,
  mobile,
  mobileVariant,
}: {
  book: Book
  availableLanguages: Language[]
  readingLanguages: Language[]
  onToggleLanguage: (l: Language) => void
  noMatchingLanguage: boolean
  sortedEditions: Edition[]
  editionKey: EditionKey
  onSelectEdition: (k: EditionKey) => void
  alignedEditions: Edition[]
  splitEditionKey?: EditionKey
  onSelectSplit: (k: EditionKey | undefined) => void
  openSplitByDefault: boolean
  onChangeOpenSplit: (v: boolean) => void
  mobile?: boolean
  /** On mobile, split this pane across two pages: 'primary' shows the
   *  text edition picker, 'compare' shows the side-by-side picker.
   *  Desktop renders both sections together (mobileVariant ignored). */
  mobileVariant?: 'primary' | 'compare'
}) {
  const showAi = sortedEditions.find(e => e.key === editionKey)?.style === 'modern'
  const splitPicked = splitEditionKey !== undefined
  // On desktop, always show both sections.
  // On mobile, show only the section requested by mobileVariant.
  const showPrimary = !mobile || mobileVariant === 'primary'
  const showCompare = (!mobile || mobileVariant === 'compare') && alignedEditions.length > 0

  return (
    <div style={mobile ? editionPaneMobile : prose}>
      {showPrimary && (
        <>
          <p style={eyebrowSC}>{book.title}</p>
          <h2 style={sectionH2}>Pick your text edition</h2>
          <p style={editionIntro}>
            {mobile ? (
              <>The original is the human translator&rsquo;s work. Modern translations are AI-assisted — easier to follow, but may miss nuance. Switch any time.</>
            ) : (
              <>Tinct offers each book in the original text and in AI-assisted modern translations. The original is the human translator&rsquo;s work. Modern translations are AI-assisted versions that make older language easier to follow and unlock unfamiliar references — useful for unfamiliar territory, but they may miss nuance a professional translator would catch. Switch any time while reading.</>
            )}
          </p>

          {availableLanguages.length > 1 && (
            <div style={langChips}>
              <span style={langChipsLabel}>Reading in</span>
              {availableLanguages.map(lang => {
                const selected = readingLanguages.includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => onToggleLanguage(lang)}
                    style={langChip(selected)}
                  >
                    {LANG_LABELS[lang] || lang} {selected ? '✓' : '+'}
                  </button>
                )
              })}
            </div>
          )}

          {noMatchingLanguage && (
            <p style={noLangNote}>
              No {readingLanguages.map(l => LANG_LABELS[l] || l).join(' or ')} edition for this book yet. Here&rsquo;s what&rsquo;s available.
            </p>
          )}

          <ul style={editionRows}>
            {sortedEditions.map(ed => (
              <li key={ed.key}>
                <button
                  type="button"
                  onClick={() => onSelectEdition(ed.key)}
                  style={editionRow(editionKey === ed.key)}
                >
                  <span style={erMain}>
                    <span style={erLabel}>{ed.label}</span>
                    {ed.translator && <span style={erSub}>{ed.translator}</span>}
                  </span>
                  <span style={erMeta}>
                    {LANG_LABELS[ed.language] || ed.language}
                    {' · '}
                    {ed.style === 'modern' ? 'modern prose' : ed.style === 'original' ? 'original' : ed.style}
                    {ed.year ? ` · ${ed.year}` : ''}
                    {ed.style === 'modern' && <span style={aiMark}>ai</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {showAi && (
            <p style={aiDisclaimer}>
              Generated by AI. Good for following the plot and unlocking unfamiliar references — but may occasionally miss nuance a professional translator would catch.
            </p>
          )}
        </>
      )}

      {showCompare && (
        <div style={mobile && mobileVariant === 'compare' ? undefined : subSectionBlock}>
          {mobile && mobileVariant === 'compare' ? (
            <>
              <p style={eyebrowSC}>{book.title}</p>
              <h2 style={sectionH2}>Side-by-side companion</h2>
              <p style={editionIntro}>
                Open a second edition alongside while you read. When a paragraph gets dense — an archaic phrase, an unfamiliar simile, a line you want to slow down on — flip to the modern translation, then back. Switch on or off any time.
              </p>
            </>
          ) : (
            <>
              <h3 style={subSectionHeading}>Side-by-side companion <span style={subSectionHeadingNote}>(optional)</span></h3>
              <p style={subSectionHint}>
                Open a second edition alongside when the text gets dense. Switch on or off any time while reading.
              </p>
            </>
          )}
          <ul style={editionRows}>
            <li>
              <button
                type="button"
                onClick={() => onSelectSplit(undefined)}
                style={editionRow(splitEditionKey === undefined)}
              >
                <span style={erMain}>
                  <span style={{ ...erLabel, color: 'var(--text-tertiary)' }}>No side-by-side</span>
                </span>
                <span style={erMeta}>off</span>
              </button>
            </li>
            {alignedEditions.map(ed => (
              <li key={ed.key}>
                <button
                  type="button"
                  onClick={() => onSelectSplit(ed.key)}
                  style={editionRow(splitEditionKey === ed.key)}
                >
                  <span style={erMain}>
                    <span style={erLabel}>{ed.label}</span>
                    {ed.translator && <span style={erSub}>{ed.translator}</span>}
                  </span>
                  <span style={erMeta}>
                    {LANG_LABELS[ed.language] || ed.language}
                    {' · '}
                    {ed.style === 'modern' ? 'modern prose' : ed.style === 'original' ? 'original' : ed.style}
                    {ed.style === 'modern' && <span style={aiMark}>ai</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Default-open toggle is desktop-only — mobile reader doesn't have
              a split view to honor it, so showing it would be misleading. */}
          {splitPicked && !mobile && (
            <label style={toggleRow}>
              <input
                type="checkbox"
                checked={openSplitByDefault}
                onChange={(e) => onChangeOpenSplit(e.target.checked)}
                style={toggleCheckbox}
              />
              <span style={toggleLabel}>Open side-by-side by default</span>
            </label>
          )}
        </div>
      )}
    </div>
  )
}

function AudioEditionPane({
  audioEditions,
  audioEditionKey,
  onSelectAudio,
  isPremium,
  mobile,
}: {
  audioEditions: Edition[]
  audioEditionKey?: EditionKey
  onSelectAudio: (k: EditionKey | undefined) => void
  isPremium: boolean
  mobile?: boolean
}) {
  const locked = !isPremium
  return (
    <div style={mobile ? editionPaneMobile : prose}>
      <p style={eyebrowSC}>narration</p>
      <h2 style={sectionH2}>Pick your audiobook</h2>

      {audioEditions.length === 0 ? (
        <p style={bodyPara}>
          No audiobook is available for this book yet.
        </p>
      ) : (
        <>
          {locked && (
            <p style={premiumNote}>
              <span style={{ color: 'var(--accent)' }}>♫ </span>
              Audiobook narration is a Premium feature. You can browse what&rsquo;s available below.
            </p>
          )}
          <ul style={editionRows}>
            <li>
              <button
                type="button"
                onClick={() => onSelectAudio(undefined)}
                style={editionRow(audioEditionKey === undefined)}
                disabled={locked}
              >
                <span style={erMain}>
                  <span style={{ ...erLabel, color: 'var(--text-tertiary)' }}>No audiobook</span>
                </span>
                <span style={erMeta}>off</span>
              </button>
            </li>
            {audioEditions.map(ed => {
              const selected = audioEditionKey === ed.key
              return (
                <li key={ed.key} style={locked ? lockedItem : undefined}>
                  <button
                    type="button"
                    onClick={() => onSelectAudio(ed.key)}
                    style={editionRow(selected)}
                    disabled={locked}
                  >
                    <span style={erMain}>
                      <span style={erLabel}>
                        ♫ {ed.label}
                      </span>
                      {ed.translator && <span style={erSub}>{ed.translator} · narrated</span>}
                    </span>
                    <span style={erMeta}>
                      {LANG_LABELS[ed.language] || ed.language}
                      {ed.year ? ` · ${ed.year}` : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// ── Atoms ───────────────────────────────────────────────────────

function Ornament() { return <div style={ornament}>·   ·   ·</div> }
function DotOrnament() { return <div style={dotOrnament}>·</div> }

// ── Styles ──────────────────────────────────────────────────────

const frame: React.CSSProperties = {
  // Both `flex: 1` (when parent is flex, e.g. desktop main-layout) and
  // `height: 100%` (when parent is absolute-positioned, e.g. .mobile-view
  // on mobile, which is NOT a flex container). Without height: 100%, the
  // frame collapses to content height on mobile and the column-flow geometry
  // is wrong → about/why prose drops off the bottom mid-sentence.
  flex: 1,
  height: '100%',
  position: 'relative',
  background: 'var(--paper)',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
  outline: 'none',  // suppress focus ring on the programmatically-focused root
}

const prefaceChrome: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexShrink: 0,
  padding: '10px 28px 0',
  minHeight: 44,
  zIndex: 10,
}
const prefaceChromeMobile: React.CSSProperties = {
  ...prefaceChrome,
  padding: '8px 12px 0',
  minHeight: 40,
}
const skipLink: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-tertiary)',
  fontSize: '0.92rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  lineHeight: 1,
  padding: '8px 4px',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
}
const skipLinkMobile: React.CSSProperties = {
  ...skipLink,
  fontSize: '0.88rem',
}
const prefaceLanguageToggle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 7px',
  background: 'var(--paper)',
  border: '1px solid var(--border-color)',
  borderRadius: 6,
}
const prefaceLanguageToggleMobile: React.CSSProperties = {
  ...prefaceLanguageToggle,
  maxWidth: 'calc(100vw - 120px)',
  flexWrap: 'wrap',
}
const prefaceLayerVisible: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
}
const prefaceLayerHidden: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
}
const keepWithNext: React.CSSProperties = {
  breakInside: 'auto',
  breakAfter: 'avoid',
}
const prefaceLanguageLabel: React.CSSProperties = {
  padding: '0 7px 0 4px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  lineHeight: '24px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
}
const prefaceLanguageButton = (selected: boolean, disabled: boolean): React.CSSProperties => ({
  border: 'none',
  borderRadius: 5,
  padding: '5px 10px',
  minHeight: 26,
  background: selected ? 'var(--accent)' : 'transparent',
  color: disabled ? 'var(--text-tertiary)' : selected ? 'var(--text-inverse, #fff)' : 'var(--text-secondary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  opacity: disabled ? 0.55 : 1,
})

const surfaceBase: React.CSSProperties = {
  flex: 1, overflow: 'hidden',
  position: 'relative',
  display: 'flex', alignItems: 'stretch',
  color: 'var(--text-primary)',
  // Pick up the reader's font preferences (size + family) so the in-app
  // settings sheet drives the preface typography.
  fontFamily: 'var(--font-family-reader, var(--font-serif))',
  fontSize: 'var(--font-size-reader, 1.05rem)',
  lineHeight: 1.65,
}
// Desktop: comfortable margins around the spread.
const surface: React.CSSProperties = {
  ...surfaceBase,
  padding: '2rem 3rem 5rem',
}
// Mobile: tighter horizontal padding so the cover/prose isn't squeezed.
// Bottom padding is just enough to clear the running page-nav footer
// (≈25px tall, anchored at frame bottom) plus a small breathing buffer.
// We were over-reserving 8rem before — mobile-view sits above the
// mobile-nav already (inset:0 inside a parent with padding-bottom),
// so most of that space was wasted (visible at largest font sizes
// where every available row matters).
const surfaceMobile: React.CSSProperties = {
  ...surfaceBase,
  padding: '1rem 1rem 3rem',
}

// Paginated multi-column wrapper
const paginatedWrapper: React.CSSProperties = {
  width: '100%', height: '100%',
  overflow: 'hidden',
  position: 'relative',
  paddingTop: '0.35rem',
  boxSizing: 'border-box',
}
const paginatedTopMask: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '0.35rem',
  background: 'var(--paper)',
  zIndex: 2,
  pointerEvents: 'none',
}
const paginatedInner: React.CSSProperties = {
  height: '100%',
  columnFill: 'auto',
  transition: 'transform 0.3s ease',
}

const loading: React.CSSProperties = {
  margin: 'auto',
  fontFamily: 'var(--font-serif)',
  color: 'var(--text-tertiary)',
  fontStyle: 'italic',
}

const pageNav: React.CSSProperties = {
  // `bottom` is intentionally NOT set inline so the .page-nav CSS class
  // can control it: 10px on desktop, 4px on mobile (matches Reader).
  position: 'absolute', left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: 12,
  zIndex: 10,
  // Paper background occludes any prose / form content that overruns into
  // the bottom padding zone (rare, but happens when font scales up).
  background: 'var(--paper)',
  padding: '4px 10px',
  borderRadius: 4,
}

// ── Spread layout ──
const spreadGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '48px',
  width: '100%',
  maxWidth: '78em',
  height: '100%',
  margin: '0 auto',
  alignItems: 'stretch',
}
const spreadPaneLeft: React.CSSProperties = {
  paddingRight: '0.5rem',
  display: 'flex', flexDirection: 'column',
  textAlign: 'left',
  minHeight: 0,  // grid item: allow shrink so paginated children can size correctly
  overflow: 'hidden',
}
const spreadPaneRight: React.CSSProperties = {
  paddingLeft: '0.5rem',
  display: 'flex', flexDirection: 'column',
  textAlign: 'left',
  minHeight: 0,
  overflow: 'hidden',
}
const spreadPaneRightWithDivider: React.CSSProperties = {
  ...spreadPaneRight,
  borderLeft: '1px solid var(--border-color)',
  paddingLeft: '24px',
}

// ── Cover ──
const coverWrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: '1.5rem',
  flex: 1,
}
const coverWrapMobile: React.CSSProperties = {
  ...coverWrap, padding: '0.5rem 0', gap: '1rem',
}
const coverShadow = (mobile?: boolean): React.CSSProperties => ({
  width: mobile ? 200 : 420,
  boxShadow: '0 24px 72px rgba(0,0,0,0.42), 0 6px 18px rgba(0,0,0,0.22)',
})

// Cover when embedded as the first column of the cover-about flow.
// We claim the full column height (100%) so about content naturally
// overflows into column 1 — no `break-after: column` needed (which was
// pushing about past column 1 into column 2 in some browsers).
const coverInColumn: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5rem',
  breakInside: 'avoid',
}

// Cover meta strip — reading time, length, and date below the hero
const coverMetaRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  justifyContent: 'center',
  gap: '2.5rem',
  marginTop: '0.5rem',
  fontFamily: 'var(--font-serif)',
}
// Mobile: tighter gap so the meta strip fits comfortably under a smaller cover
const coverMetaRowMobile: React.CSSProperties = {
  ...coverMetaRow,
  gap: '1.5rem',
  marginTop: '0.25rem',
}
const coverMetaItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.2rem',
}
const coverMetaLabel: React.CSSProperties = {
  fontSize: '0.72em',
  fontStyle: 'italic',
  color: 'var(--text-tertiary)',
  letterSpacing: '0.18em',
  textTransform: 'lowercase',
  fontVariant: 'small-caps',
}
const coverMetaValue: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontStyle: 'italic',
  fontSize: '1.1em',
  color: 'var(--text-primary)',
}

// FullSpread layout (single pane, full width, optional center divider)
const fullSpreadWrap: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  maxWidth: '78em',
  margin: '0 auto',
}
const fullSpreadDivider: React.CSSProperties = {
  position: 'absolute',
  top: 0, bottom: 0,
  left: '50%',
  width: 1,
  background: 'var(--border-color)',
  pointerEvents: 'none',
}

// ── Prose pane ──
const prose: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
}
const proseMobile: React.CSSProperties = {
  width: '100%',
  maxWidth: '40em',
  margin: '0 auto',
  textAlign: 'left',
}
// Edition + audio panes on mobile are form-like (not paginated), so let
// them scroll internally rather than getting clipped by the surface
// `overflow: hidden`. The bottom padding gives the last row breathing
// room above the page-nav.
const editionPaneMobile: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  paddingBottom: '1.5rem',
  textAlign: 'left',
}

// Header block — keep eyebrow + title + byline together across column breaks.
const aboutHeader: React.CSSProperties = {
  textAlign: 'left',
  margin: '0 0 1.25rem',
  breakInside: 'avoid',
  breakAfter: 'avoid',
}

// ── Typography atoms ──
// All sizes em-relative so headings/labels stay proportional to the body
// font when the user adjusts size in the reader chrome.
const eyebrowSC: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '0.78em', color: 'var(--text-tertiary)',
  margin: '0 0 0.6rem', letterSpacing: '0.18em',
  textTransform: 'lowercase',
  fontVariant: 'small-caps',
}
// Section heads use em (relative to body fontSize) so they always stay
// proportionally larger than the body, even when the user scales font size
// in the reader chrome. 2.2em / 1.7em ≈ 35% / 70% larger than body.
const titleH1: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 400,
  fontSize: '2.2em',
  margin: '0 0 0.4rem', letterSpacing: '-0.005em',
  lineHeight: 1.1, color: 'var(--text-primary)',
  fontStyle: 'italic',
}
const sectionH2: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 400,
  fontSize: '1.7em',
  margin: '0 0 0.6rem', letterSpacing: '-0.005em',
  lineHeight: 1.15, color: 'var(--text-primary)',
  fontStyle: 'italic',
}
const sectionSub: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '1em', color: 'var(--text-secondary)',
  margin: '0.4rem 0 0', maxWidth: '24em',
}
const byline: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95em', color: 'var(--text-secondary)',
  margin: '0', letterSpacing: '0.02em',
}

const ornament: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.2rem', color: 'var(--accent)',
  margin: '1rem 0 1.25rem', letterSpacing: '0.2em',
  textAlign: 'left',
}
const dotOrnament: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.2rem', color: 'var(--text-tertiary)',
  margin: '1rem 0', textAlign: 'left',
}

const continuationLabel: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '0.85rem', color: 'var(--text-tertiary)',
  margin: '0 0 1.5rem', letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontVariant: 'small-caps',
}

const bodyPara: React.CSSProperties = {
  margin: '0 0 1rem',
  textIndent: '1.5em',
  fontSize: '1em',
  lineHeight: 1.65,
  textAlign: 'left',
}
const bodyParaFirst: React.CSSProperties = {
  margin: '0 0 1rem',
  fontSize: '1em',
  lineHeight: 1.65,
  textAlign: 'left',
}
const dropCap: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700,
  fontSize: '3.2rem', float: 'left',
  lineHeight: 0.9, paddingRight: '0.1em', paddingTop: '0.15em',
  color: 'var(--accent)',
  fontStyle: 'normal',
}

// Acclaim
const acclaimBlock: React.CSSProperties = { marginBottom: '1.5rem' }
const acclaim: React.CSSProperties = {
  margin: '1rem 0', padding: '0 1.25rem',
  borderLeft: '2px solid var(--accent)',
}
const acclaimQuote: React.CSSProperties = {
  fontStyle: 'italic', margin: '0 0 0.4rem', fontSize: '1rem',
}
const acclaimSource: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontSize: '0.9rem',
  color: 'var(--text-tertiary)',
}

// Why — prose paragraphs with italic lead-in phrase
const whyParagraph: React.CSSProperties = {
  margin: '0 0 1rem',
  fontSize: '1em',
  lineHeight: 1.65,
  textAlign: 'left',
  // Allow a Why item taller than the column to fragment. `avoid` skipped
  // the block and left an empty leftover page.
  breakInside: 'auto',
}
// Italic lead-in: serif italic at body size — book-prose tradition,
// not a heading. Sits closer to the prose than display italic would.
const whyLeadIn: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontWeight: 500,
  fontSize: '1em',
  color: 'var(--text-primary)',
}

// Cast — hanging indent: name on left, role + description as flowing text on right
const castList: React.CSSProperties = {
  margin: '0', padding: 0,
}
const castEntry: React.CSSProperties = {
  display: 'block',
  marginBottom: '1.2rem',
  paddingTop: '0.05rem',
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
  WebkitColumnBreakInside: 'avoid',
}
// Mobile: stack name above description so the description gets the full
// width of the narrow phone column instead of being squeezed into half.
const castEntryStacked: React.CSSProperties = {
  display: 'block',
  marginBottom: '1rem',
  breakInside: 'avoid',
}
const castName: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)', fontWeight: 500,
  fontStyle: 'italic',
  fontSize: '1.12em', color: 'var(--text-primary)',
  lineHeight: 1.15,
  letterSpacing: '0.01em',
  margin: '0 0 0.08rem',
  whiteSpace: 'normal',
}
const castBody: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95em', lineHeight: 1.55,
  color: 'var(--text-primary)',
  margin: 0,
  textAlign: 'left',
}
const castRoleInline: React.CSSProperties = {
  color: 'var(--text-tertiary)',
  fontStyle: 'italic',
  marginRight: '0.25em',
}

// Edition page
const langChips: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  margin: '0 0 1.25rem',
  flexWrap: 'wrap',
}
const langChipsLabel: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '0.9rem', color: 'var(--text-secondary)',
  marginRight: '0.25rem',
}
const langChip = (selected: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-serif)',
  fontSize: '0.85rem',
  padding: '0.2rem 0.7rem',
  border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-color)'}`,
  borderRadius: 999,
  background: selected ? 'var(--accent-subtle)' : 'transparent',
  color: selected ? 'var(--accent)' : 'var(--text-secondary)',
  cursor: 'pointer',
  letterSpacing: '0.02em',
})
const noLangNote: React.CSSProperties = {
  fontStyle: 'italic',
  color: 'var(--text-tertiary)', fontSize: '0.9rem',
  margin: '0 0 1rem',
  textAlign: 'left',
}
const editionRows: React.CSSProperties = {
  listStyle: 'none', padding: 0, margin: 0,
  display: 'flex', flexDirection: 'column', gap: '0.1rem',
}
const editionRow = (selected: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'baseline',
  gap: '1rem',
  width: '100%',
  textAlign: 'left',
  padding: '0.55rem 0.6rem 0.55rem 0.9rem',
  background: 'transparent',
  border: 'none',
  borderLeft: `2px solid ${selected ? 'var(--accent)' : 'transparent'}`,
  borderRadius: 0,
  fontFamily: 'var(--font-serif)',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  transition: 'border-color 0.15s, background 0.15s, color 0.15s',
  opacity: selected ? 1 : 0.92,
})
const erMain: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '0.1rem',
  textAlign: 'left',
}
const erLabel: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 500,
  fontSize: '1.02rem',
  color: 'var(--text-primary)',
}
const erSub: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
}
const erMeta: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
}
const aiMark: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: '0.78rem',
  letterSpacing: '0.08em',
  color: 'var(--accent)',
  marginLeft: '0.4rem',
  textTransform: 'lowercase',
  fontVariant: 'small-caps',
}
const aiDisclaimer: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '0.85rem', color: 'var(--text-secondary)',
  margin: '0.5rem 0 0', lineHeight: 1.55,
  paddingLeft: '0.9rem',
  textAlign: 'left',
}

const editionIntro: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95rem',
  color: 'var(--text-primary)',
  lineHeight: 1.55,
  margin: '0 0 1.25rem',
  textAlign: 'left',
}

// Compare sub-section + toggle
const subSectionBlock: React.CSSProperties = {
  marginTop: '1.75rem',
  paddingTop: '1.25rem',
  borderTop: '1px solid var(--border-color)',
}
const subSectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 500,
  fontSize: '1.05rem', margin: '0 0 0.25rem',
  color: 'var(--text-primary)',
}
const subSectionHeadingNote: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '0.85rem', color: 'var(--text-tertiary)',
  fontWeight: 400, marginLeft: '0.25rem',
}
const subSectionHint: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.9rem', color: 'var(--text-secondary)',
  margin: '0 0 0.65rem', lineHeight: 1.5,
}
const toggleRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  marginTop: '0.85rem', paddingLeft: '0.9rem',
  cursor: 'pointer',
}
const toggleCheckbox: React.CSSProperties = {
  cursor: 'pointer',
  accentColor: 'var(--accent)',
  width: 14, height: 14,
  margin: 0,
}
const toggleLabel: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95rem', color: 'var(--text-secondary)',
}

// Premium / locked
const premiumNote: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: '0.9rem', color: 'var(--text-secondary)',
  margin: '0 0 1rem', lineHeight: 1.55,
  textAlign: 'left',
}
const lockedItem: React.CSSProperties = {
  opacity: 0.5,
}
