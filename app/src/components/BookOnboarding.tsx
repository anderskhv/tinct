import { useState, useEffect, useMemo } from 'react'
import type { Book, Edition, EditionKey, Language } from '../types'
import { inferOnboardingLanguage, loadOnboardingData, type OnboardingLanguage } from '../utils/onboardingData'

interface CastMember {
  name: string
  role: string
  description: string
}

interface AcclaimEntry {
  quote: string
  source: string
  context?: string
}

interface WhyItMattersItem {
  title: string
  body: string
}

interface OnboardingData {
  bookId: string
  title: string
  author: string
  era?: string
  length?: string
  estimatedTime?: string
  openingChapterLabel?: string
  openingText?: string
  about?: string
  acclaim?: AcclaimEntry[]
  whyItMatters?: WhyItMattersItem[]
  cast?: CastMember[]
}

export interface BookOnboardingResult {
  editionKey: EditionKey
  splitEditionKey?: EditionKey
  /** Preface flow only — explicit toggle for whether to open split-by-default. */
  openSplitByDefault?: boolean
  /** Preface flow only — chosen audiobook narration edition. */
  audioEditionKey?: EditionKey
  angle: string
}

interface BookOnboardingProps {
  book: Book
  editions: Edition[]
  mode?: 'full' | 'edition-only'
  defaultEditionKey?: EditionKey
  showAccountStep?: boolean
  onComplete: (result: BookOnboardingResult) => void
  onClose: () => void
  onCreateAccount?: () => void
  /** If provided, step 1 shows a "Back to library" link for re-picking a book. */
  onBackToLibrary?: () => void
  /** Languages the user reads. Drives which editions show in the picker. */
  readingLanguages: Language[]
  onReadingLanguagesChange: (langs: Language[]) => void
}

const LANG_LABELS: Record<string, string> = { en: 'English', da: 'Danish' }

function PrefaceLanguageToggle({
  value,
  danishAvailable,
  onChange,
}: {
  value: OnboardingLanguage
  danishAvailable: boolean
  onChange: (language: OnboardingLanguage) => void
}) {
  return (
    <div className="book-onboarding-preface-language" aria-label="Preface language">
      <span className="book-onboarding-preface-language-label">Preface</span>
      <button
        type="button"
        className={`book-onboarding-preface-language-btn ${value === 'da' ? 'selected' : ''}`}
        onClick={() => onChange('da')}
        disabled={!danishAvailable}
      >
        Dansk
      </button>
      <button
        type="button"
        className={`book-onboarding-preface-language-btn ${value === 'en' ? 'selected' : ''}`}
        onClick={() => onChange('en')}
      >
        English
      </button>
    </div>
  )
}

// Book cover — same shape and styling as in the library, just smaller. Shares
// the .book-cover / .book-cover-inner CSS with BookStore for visual parity.
function BookCover({ book }: { book: Book }) {
  const bg = book.coverColor || '#2c2417'
  const accent = book.coverAccent || '#c9a45c'
  return (
    <div className="book-cover book-cover-onboarding" style={{ background: bg }}>
      <div className="book-cover-spine" style={{ background: accent }} />
      <div className="book-cover-inner">
        <div className="book-cover-rule" style={{ borderColor: accent }} />
        <h3 className="book-cover-title" style={{ color: accent }}>{book.title}</h3>
        <div className="book-cover-rule" style={{ borderColor: accent }} />
        <p className="book-cover-author" style={{ color: `${accent}cc` }}>{book.author}</p>
        {book.year != null && (
          <p className="book-cover-year" style={{ color: `${accent}88` }}>
            {book.year < 0 ? `c. ${Math.abs(book.year)} BC` : book.year}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main onboarding component ───────────────────────────────
// Step ordering changed 2026-04-29 (Book Onboarding v2). New flow:
//   1. about         — book description + acclaim quotes (was bundled into edition step)
//   2. why-matters   — three "Why it still matters" items
//   3. edition       — pick primary + Compare default = inverse-of-primary (not empty)
//   4. cast          — meet the key figures
//   5. account       — anonymous-only sign-up CTA
type StepKey = 'about' | 'why-matters' | 'edition' | 'cast' | 'account'

export function BookOnboarding({
  book,
  editions,
  mode = 'full',
  defaultEditionKey,
  showAccountStep = false,
  onComplete,
  onClose,
  onCreateAccount,
  onBackToLibrary,
  readingLanguages,
  onReadingLanguagesChange,
}: BookOnboardingProps) {
  const bookId = book.id
  const [data, setData] = useState<OnboardingData | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  // Primary edition default order:
  //   1. The user's most-recent edition choice (`defaultEditionKey`), IF this
  //      book has that edition. Carries forward the user's preference across
  //      books — if they read Modern English on the last book, default to
  //      Modern English here too. Anders explicitly asked for this consistency.
  //   2. Original English if available — the authoritative text for new users
  //      who don't yet have a previous choice on file.
  //   3. First available edition as final fallback.
  const [editionKey, setEditionKey] = useState<EditionKey>(() => {
    if (defaultEditionKey && editions.some(e => e.key === defaultEditionKey)) return defaultEditionKey
    const origEn = editions.find(e => e.style === 'original' && e.language === 'en')
    if (origEn) return origEn.key
    return editions[0]?.key || ''
  })
  const [splitEditionKey, setSplitEditionKey] = useState<EditionKey | undefined>(undefined)
  // Track whether the user manually picked a split edition. If false, the
  // Compare default reactively follows the inverse of the primary edition
  // (Anders, 2026-04-29 — better than empty default).
  const [splitManuallyPicked, setSplitManuallyPicked] = useState(false)
  const [angle, setAngle] = useState('')

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

  // Load per-book onboarding data.
  // The `v=` query param busts the previous 30-day immutable CDN cache
  // (worker.ts cache header was misconfigured before 2026-04-29 evening).
  // Bump this when the schema changes in a way old cached blobs would
  // confuse the UI. The worker now uses a 5-minute cache for onboarding
  // JSONs so future content updates don't need a bump.
  useEffect(() => {
    let cancelled = false
    setDataLoaded(false)
    loadOnboardingData<OnboardingData>(bookId, onboardingLanguage)
      .then(result => {
        if (cancelled) return
        setData(result.data)
        setDataLoaded(true)
        setDanishOnboardingAvailable(result.danishAvailable)
        if (onboardingLanguage === 'da' && result.language === 'en') setOnboardingLanguage('en')
      })
    return () => { cancelled = true }
  }, [bookId, onboardingLanguage])

  // Dynamic step list: only include steps that have meaningful content.
  // Cast is skipped when there's no cast data for this book (avoids the
  // "Meet the key figures" page with nothing on it).
  // About + WhyItMatters are skipped if data hasn't loaded yet OR if the book
  // has no content for them — those edge cases shouldn't ship but the guards
  // prevent empty pages if a JSON is incomplete.
  const activeSteps: StepKey[] = useMemo(() => {
    if (mode === 'edition-only') return ['edition']
    if (!dataLoaded) return []
    const steps: StepKey[] = []
    if (data?.about) steps.push('about')
    if (data?.whyItMatters && data.whyItMatters.length > 0) steps.push('why-matters')
    steps.push('edition')
    if (data?.cast && data.cast.length > 0) steps.push('cast')
    if (showAccountStep) steps.push('account')
    return steps
  }, [mode, data?.about, data?.whyItMatters, data?.cast, showAccountStep, dataLoaded])

  const currentStep: StepKey | undefined = activeSteps[stepIdx]
  const totalSteps = activeSteps.length
  const isLastStep = stepIdx === totalSteps - 1

  // If the active step list shrinks beneath our current index (e.g., data
  // loads and there's no cast so totalSteps drops), clamp to the end.
  useEffect(() => {
    if (stepIdx >= totalSteps) setStepIdx(Math.max(0, totalSteps - 1))
  }, [stepIdx, totalSteps])

  // Editions matching the reader's language preferences. If the intersection
  // is empty (e.g. Danish-only reader opens a book with no Danish translation),
  // fall back to showing all editions with a note.
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

  const alignedEditions = useMemo(
    () => effectiveEditions.filter(e => e.aligned && e.key !== editionKey),
    [effectiveEditions, editionKey]
  )

  // Compare default: pick the most useful "other" edition relative to primary,
  // unless the user has manually chosen something else.
  // Rule: prefer different style first (original vs modern), then same language.
  // For modern-da primary, default to original-en (English original).
  function inverseEdition(primaryKey: EditionKey, candidates: Edition[]): EditionKey | undefined {
    const primary = effectiveEditions.find(e => e.key === primaryKey)
    if (!primary || candidates.length === 0) return undefined
    // 1. Different style, same language (original-en ↔ modern-en)
    const sameLangDifferentStyle = candidates.find(
      e => e.language === primary.language && e.style !== primary.style
    )
    if (sameLangDifferentStyle) return sameLangDifferentStyle.key
    // 2. Original English (the canonical authoritative text)
    const originalEn = candidates.find(e => e.style === 'original' && e.language === 'en')
    if (originalEn) return originalEn.key
    // 3. Anything else
    return candidates[0]?.key
  }

  // Sync split default to inverse-of-primary whenever primary changes,
  // unless the user has manually overridden.
  useEffect(() => {
    if (splitManuallyPicked) return
    setSplitEditionKey(inverseEdition(editionKey, alignedEditions))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editionKey, alignedEditions, splitManuallyPicked])

  function toggleLanguage(lang: Language) {
    if (readingLanguages.includes(lang)) {
      // Don't let the reader disable their last remaining language.
      if (readingLanguages.length === 1) return
      onReadingLanguagesChange(readingLanguages.filter(l => l !== lang))
    } else {
      onReadingLanguagesChange([...readingLanguages, lang])
    }
  }

  function pickOnboardingLanguage(language: OnboardingLanguage) {
    setOnboardingLanguagePicked(true)
    setOnboardingLanguage(language)
  }

  // If the currently-selected edition disappears from the filtered list
  // (because the user deselected its language), auto-pick the first remaining.
  useEffect(() => {
    if (!sortedEditions.some(e => e.key === editionKey) && sortedEditions.length > 0) {
      setEditionKey(sortedEditions[0].key)
    }
  }, [sortedEditions, editionKey])

  function next() {
    if (stepIdx < totalSteps - 1) setStepIdx(stepIdx + 1)
    else finish()
  }

  function back() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1)
  }

  function finish() {
    onComplete({ editionKey, splitEditionKey, angle: angle.trim() })
  }

  const displayTitle = data?.title || book.title
  const displayAuthor = data?.author || book.author

  return (
    <div className="book-onboarding-overlay" role="dialog" aria-labelledby="book-onboarding-title">
      <div className="book-onboarding-modal" onClick={e => e.stopPropagation()}>
        <div className="book-onboarding-modal-accent" />

        <div className="book-onboarding-head">
          <div className="book-onboarding-step-dots">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`book-onboarding-step-dot ${
                  i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''
                }`}
              />
            ))}
          </div>
          {(availableLanguages.includes('da') || readingLanguages.includes('da')) && (
            <PrefaceLanguageToggle
              value={onboardingLanguage}
              danishAvailable={danishOnboardingAvailable}
              onChange={pickOnboardingLanguage}
            />
          )}
        </div>

        <div className="book-onboarding-body">

          {/* Loading state: show skeleton until onboarding JSON arrives.
              Prevents the edition-picker flash (step 0 = 'edition' until
              data loads and 'about' becomes step 0). */}
          {mode !== 'edition-only' && !dataLoaded && (
            <div className="book-onboarding-step" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, opacity: 0.4 }}>
              <p>Loading…</p>
            </div>
          )}

          {/* Step: about — book description + acclaim quotes */}
          {currentStep === 'about' && (
            <div className="book-onboarding-step book-onboarding-step-intro">
              <div className="book-onboarding-hero">
                <BookCover book={book} />
                <div className="book-onboarding-hero-text">
                  <h1 className="book-onboarding-book-title" id="book-onboarding-title">{displayTitle}</h1>
                  <p className="book-onboarding-book-byline">
                    {displayAuthor}
                    {data?.era && `, ${data.era}`}
                    {data?.estimatedTime && `, ${data.estimatedTime}`}
                  </p>
                </div>
              </div>

              {data?.acclaim && data.acclaim.length > 0 && (
                <div className="book-onboarding-acclaim">
                  {data.acclaim.map((q, i) => (
                    <blockquote key={i} className="book-onboarding-acclaim-quote">
                      <p className="book-onboarding-acclaim-text">&ldquo;{q.quote}&rdquo;</p>
                      <footer className="book-onboarding-acclaim-source">
                        — {q.source}
                        {q.context && <span className="book-onboarding-acclaim-context">, {q.context}</span>}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              )}

              {(data?.about || book.description) && (
                <div className="book-onboarding-about-block">
                  {(data?.about || book.description || '').split('\n\n').map((para, i) => (
                    <p key={i} className="book-onboarding-about-text">{para}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: why-matters — three "Why it still matters" items */}
          {currentStep === 'why-matters' && data?.whyItMatters && (
            <div className="book-onboarding-step">
              <div className="book-onboarding-eyebrow">{displayTitle}</div>
              <h2 className="book-onboarding-step-title">Why it still matters</h2>
              <div className="book-onboarding-why-list">
                {data.whyItMatters.map((item, i) => (
                  <div key={i} className="book-onboarding-why-item">
                    <h3 className="book-onboarding-why-title">{item.title}</h3>
                    <p className="book-onboarding-why-body">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: edition */}
          {currentStep === 'edition' && (
            <div className="book-onboarding-step book-onboarding-step-intro">
              <div className="book-onboarding-hero">
                <BookCover book={book} />
                <div className="book-onboarding-hero-text">
                  <h1 className="book-onboarding-book-title" id="book-onboarding-title">{displayTitle}</h1>
                  <p className="book-onboarding-book-byline">
                    {displayAuthor}
                    {data?.era && `, ${data.era}`}
                    {data?.estimatedTime && `, ${data.estimatedTime}`}
                  </p>
                  {/* About paragraph intentionally omitted here — already shown
                      in step 1. Repeating it on the edition step felt
                      redundant (Anders, 2026-04-30). */}
                </div>
              </div>

              {/* Language chips — only show when the book has more than one
                  language so English-only books don't render an empty row. */}
              {availableLanguages.length > 1 && (
                <div className="book-onboarding-lang-chips">
                  <span className="book-onboarding-lang-chips-label">Reading in</span>
                  {availableLanguages.map(lang => {
                    const selected = readingLanguages.includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        className={`book-onboarding-lang-chip ${selected ? 'selected' : ''}`}
                        onClick={() => toggleLanguage(lang)}
                      >
                        {LANG_LABELS[lang] || lang} {selected ? '✓' : '+'}
                      </button>
                    )
                  })}
                </div>
              )}

              {noMatchingLanguage && (
                <div className="book-onboarding-no-lang-note">
                  No {readingLanguages.map(l => LANG_LABELS[l] || l).join(' or ')} edition for this book yet. Here's what's available.
                </div>
              )}

              <div className="book-onboarding-edition-block">
                <h3 className="book-onboarding-edition-heading">Pick the version you want to read</h3>
                <div className="book-onboarding-edition-rows">
                  {sortedEditions.map(ed => (
                    <button
                      key={ed.key}
                      type="button"
                      className={`book-onboarding-edition-row ${editionKey === ed.key ? 'selected' : ''}`}
                      onClick={() => setEditionKey(ed.key)}
                    >
                      <span className="book-onboarding-er-lang">{LANG_LABELS[ed.language] || ed.language}</span>
                      <span className="book-onboarding-er-name">
                        {ed.label}
                        {ed.style === 'modern' && <span className="book-onboarding-er-ai-badge">AI</span>}
                        {ed.translator && <span className="book-onboarding-er-name-sub">{ed.translator}</span>}
                      </span>
                      <span className="book-onboarding-er-desc">
                        {ed.style === 'modern' ? 'Modern prose' : ed.style === 'original' ? 'Original text' : ed.style}
                        {ed.year ? ` · ${ed.year}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
                {sortedEditions.find(e => e.key === editionKey)?.style === 'modern' && (
                  <p className="book-onboarding-ai-disclaimer">
                    Generated by AI. Good for following the plot and unlocking unfamiliar references — but may occasionally miss nuance a professional translator would catch.
                  </p>
                )}
              </div>

              {alignedEditions.length > 0 && (
                <div className="book-onboarding-edition-block">
                  <h3 className="book-onboarding-edition-heading">
                    Pick your secondary version for side-by-side reading <span className="book-onboarding-edition-heading-sub">(optional)</span>
                  </h3>
                  <p className="book-onboarding-edition-heading-note">Open it when the text gets dense — close it when you don't need it.</p>
                  <div className="book-onboarding-edition-rows">
                    <button
                      type="button"
                      className={`book-onboarding-edition-row ${splitEditionKey === undefined ? 'selected' : ''}`}
                      onClick={() => { setSplitEditionKey(undefined); setSplitManuallyPicked(true) }}
                    >
                      <span className="book-onboarding-er-lang dim">off</span>
                      <span className="book-onboarding-er-name dim">No side by side</span>
                      <span className="book-onboarding-er-desc" />
                    </button>
                    {alignedEditions.map(ed => (
                      <button
                        key={ed.key}
                        type="button"
                        className={`book-onboarding-edition-row ${splitEditionKey === ed.key ? 'selected' : ''}`}
                        onClick={() => { setSplitEditionKey(ed.key); setSplitManuallyPicked(true) }}
                      >
                        <span className="book-onboarding-er-lang">{LANG_LABELS[ed.language] || ed.language}</span>
                        <span className="book-onboarding-er-name">
                          {ed.label}
                          {ed.style === 'modern' && <span className="book-onboarding-er-ai-badge">AI</span>}
                        </span>
                        <span className="book-onboarding-er-desc">
                          {ed.style === 'modern' ? 'Modern prose' : ed.style === 'original' ? 'Original text' : ed.style}
                        </span>
                      </button>
                    ))}
                  </div>
                  {alignedEditions.find(e => e.key === splitEditionKey)?.style === 'modern' && (
                    <p className="book-onboarding-ai-disclaimer">
                      Generated by AI. Good for following the plot and unlocking unfamiliar references — but may occasionally miss nuance a professional translator would catch.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step: cast */}
          {currentStep === 'cast' && (
            <div className="book-onboarding-step">
              <div className="book-onboarding-eyebrow">{displayTitle}</div>
              <h2 className="book-onboarding-step-title">Characters &amp; concepts</h2>
              <p className="book-onboarding-step-sub">Let them land. You'll meet them properly in the text.</p>

              <div className="book-onboarding-cast-grid">
                {(data?.cast || []).map((c, i) => (
                  <div key={i} className="book-onboarding-cast-card">
                    <div className="book-onboarding-cast-name">{c.name}</div>
                    <div className="book-onboarding-cast-role">{c.role}</div>
                    <div className="book-onboarding-cast-desc">{c.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: account — primary CTA dominant, skip as discreet link */}
          {currentStep === 'account' && (
            <div className="book-onboarding-step book-onboarding-step-account">
              <div className="book-onboarding-eyebrow">One last thing</div>
              <h2 className="book-onboarding-step-title">Save your reading</h2>
              <p className="book-onboarding-step-sub">
                Your place, highlights, notes, and angle on every device. Read on your phone, tablet, e-reader, or desktop. Open the full library from anywhere.
              </p>

              <div className="book-onboarding-premium-card">
                <div className="book-onboarding-premium-title">
                  Your first 30 days include Premium.
                </div>
                <div className="book-onboarding-premium-body">
                  AI companion, audiobook, Cast, and Feed. No card. No hooks. After 30 days you roll into the free tier automatically. Reading stays free, forever.
                </div>
              </div>

              {onCreateAccount && (
                <button
                  type="button"
                  className="book-onboarding-account-primary"
                  onClick={() => { onCreateAccount(); onComplete({ editionKey, splitEditionKey, angle: angle.trim() }) }}
                >
                  Create a free account
                </button>
              )}
              <button
                type="button"
                className="book-onboarding-account-skip"
                onClick={() => onComplete({ editionKey, splitEditionKey, angle: angle.trim() })}
              >
                Skip for now
              </button>
            </div>
          )}
        </div>

        {/* Footer: hidden on the account step because it has its own primary + skip actions. */}
        {currentStep && currentStep !== 'account' && (
          <div className="book-onboarding-foot">
            {currentStep === 'edition' && onBackToLibrary && (
              <button className="book-onboarding-foot-ghost" onClick={onBackToLibrary}>
                ← Library
              </button>
            )}
            {stepIdx > 0 && currentStep !== 'edition' && (
              <button className="book-onboarding-foot-ghost" onClick={back}>← Back</button>
            )}
            <button className="book-onboarding-foot-primary" onClick={next}>
              {isLastStep ? 'Begin reading' : 'Continue'} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
