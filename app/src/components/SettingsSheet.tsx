import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type {
  Edition, EditionKey, Language, Style,
  FontSize, FontFamily,
  ProgressDisplay, ProgressMetric, ProgressScope,
} from '../types'
import { isFullyLoaded as isDictFullyLoaded, preloadAll as preloadDictionary } from '../services/dictionary'
import { isAndroidNative, isHomeApp, requestHomeApp, openHomeAppSettings } from '../utils/homeRole'

type SectionKey =
  | 'reading'
  | 'layout'
  | 'offline'
  | 'account'

interface SettingsSheetProps {
  isOpen: boolean
  onClose: () => void
  initialSection?: SectionKey

  // Reading
  darkMode: boolean
  onToggleDarkMode: () => void
  fontSize: FontSize
  onFontSizeChange: (size: FontSize) => void
  fontFamily: FontFamily
  onFontFamilyChange: (family: FontFamily) => void

  // Per-tab visibility (Premium features)
  chatHidden: boolean
  onToggleChatHidden: () => void
  feedHidden: boolean
  onToggleFeedHidden: () => void
  castHidden: boolean
  onToggleCastHidden: () => void

  // Editions
  allEditions: Edition[]
  primaryEditionKey: EditionKey
  language: Language
  style: Style
  onLanguageChange: (lang: Language) => void
  onStyleChange: (style: Style) => void
  alignedEditions: Edition[]
  splitEditionKey?: EditionKey
  onSplitEditionChange: (key: EditionKey) => void
  splitView: boolean
  onToggleSplitView: () => void
  audioEditions: Edition[]
  audioEditionKey?: EditionKey
  onAudioEditionChange: (key: EditionKey) => void

  // Progress
  progressDisplay: ProgressDisplay
  onProgressDisplayChange: (pd: ProgressDisplay) => void
  hasSections: boolean

  // Reading angle
  readingObjective: string
  onSaveObjective: (obj: string) => void
  onRedoOnboarding?: () => void

  // Offline
  isBookDownloaded: boolean
  onOpenDownloads: () => void

  // Account
  user: User | null
  messagesRemaining: number
  hasBalance: boolean
  isAnonymous: boolean
  onSignIn: () => void
  onSignOut: () => void
  onOpenUsage: () => void
  onResetPassword?: (email: string) => Promise<{ error?: string }>
  onDeleteAccount?: () => void

  // Library
  onOpenStore: () => void
}

const SECTIONS: { k: SectionKey; label: string; sub: string }[] = [
  { k: 'reading', label: 'Reading', sub: 'Editions · angle · library' },
  { k: 'layout',  label: 'Layout',  sub: 'Theme · font · progress · tabs' },
  { k: 'offline', label: 'Offline', sub: 'Downloads · dictionary' },
  { k: 'account', label: 'Account', sub: 'Email · subscription' },
]

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`ss-toggle ${on ? 'ss-toggle-on' : ''}`}
      onClick={onClick}
      aria-pressed={on}
    >
      <span className="ss-toggle-knob" />
    </button>
  )
}

function Seg({ options, active, onChange }: {
  options: { value: string; label: string }[]
  active: string
  onChange: (v: string) => void
}) {
  return (
    <div className="ss-seg">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          className={`ss-seg-item ${o.value === active ? 'ss-seg-item-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Row({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) {
  return (
    <div className="ss-row">
      <div className="ss-row-text">
        <div className="ss-row-label">{label}</div>
        {hint && <div className="ss-row-hint">{hint}</div>}
      </div>
      <div className="ss-row-control">{control}</div>
    </div>
  )
}

export function SettingsSheet(props: SettingsSheetProps) {
  const {
    isOpen, onClose, initialSection,
    darkMode, onToggleDarkMode,
    fontSize, onFontSizeChange,
    fontFamily, onFontFamilyChange,
    chatHidden, onToggleChatHidden,
    feedHidden, onToggleFeedHidden,
    castHidden, onToggleCastHidden,
    allEditions, primaryEditionKey, onLanguageChange, onStyleChange,
    alignedEditions, splitEditionKey, onSplitEditionChange,
    splitView, onToggleSplitView,
    audioEditions, audioEditionKey, onAudioEditionChange,
    progressDisplay, onProgressDisplayChange, hasSections,
    readingObjective, onSaveObjective, onRedoOnboarding,
    isBookDownloaded, onOpenDownloads,
    user, messagesRemaining, hasBalance, isAnonymous,
    onSignIn, onSignOut, onOpenUsage, onResetPassword, onDeleteAccount,
    onOpenStore,
  } = props

  const [active, setActive] = useState<SectionKey>(initialSection ?? 'reading')
  const [localObjective, setLocalObjective] = useState(readingObjective)
  const [resetSent, setResetSent] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setLocalObjective(readingObjective)
  }, [readingObjective, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Dictionary preload state. MUST be declared before the early-return below
  // — hooks must run in the same order on every render, otherwise React
  // blanks the whole tree with a hook-order mismatch.
  const [dictDownloading, setDictDownloading] = useState(false)
  const [dictProgress, setDictProgress] = useState<{ done: number; total: number } | null>(null)
  const [dictReady, setDictReady] = useState(() => isDictFullyLoaded())

  // Home-app role (Android Capacitor only). State so the row can flip between
  // "Make Tinct home" and "Release as default home" without a sheet reopen.
  // Hooks must run unconditionally — kept above the early return.
  const [isHome, setIsHome] = useState(false)
  const [homeBusy, setHomeBusy] = useState(false)
  const [showHomeRow, setShowHomeRow] = useState(false)
  useEffect(() => {
    if (!isOpen) return
    if (!isAndroidNative()) { setShowHomeRow(false); return }
    setShowHomeRow(true)
    void isHomeApp().then(setIsHome)
  }, [isOpen])

  if (!isOpen) return null

  const sectionMeta = SECTIONS.find(s => s.k === active) ?? SECTIONS[0]

  // === Reading (was Editions + Angle + Library link) ===
  const ReadingSection = () => {
    return (
      <div className="ss-reading">
        <Row
          label="Primary edition"
          hint="The text you read."
          control={
            <select
              className="ss-select"
              value={primaryEditionKey}
              onChange={(e) => {
                const ed = allEditions.find(x => x.key === e.target.value)
                if (ed) {
                  if (ed.language !== props.language) onLanguageChange(ed.language)
                  if (ed.style !== props.style) onStyleChange(ed.style)
                }
              }}
            >
              {allEditions.map(ed => (
                <option key={ed.key} value={ed.key}>{ed.label}</option>
              ))}
            </select>
          }
        />
        {alignedEditions.length > 0 && (
          <>
            <Row
              label="Compare edition"
              hint="What the Compare tab shows."
              control={
                <select
                  className="ss-select"
                  value={splitEditionKey ?? ''}
                  onChange={(e) => onSplitEditionChange(e.target.value as EditionKey)}
                >
                  {alignedEditions.map(ed => (
                    <option key={ed.key} value={ed.key}>{ed.label}</option>
                  ))}
                </select>
              }
            />
            {/* Split-view toggle is hidden on mobile — the side-by-side layout
                isn't usable at phone widths; use the Compare tab instead. */}
            {typeof window !== 'undefined' && !window.matchMedia('(max-width: 1024px)').matches && (
              <Row
                label="Split-view by default"
                hint="Open both editions side by side."
                control={<Toggle on={splitView} onClick={onToggleSplitView} />}
              />
            )}
          </>
        )}
        {audioEditions.length > 0 && (
          <Row
            label="Audiobook"
            hint="Edition used for narration."
            control={
              <select
                className="ss-select"
                value={audioEditionKey ?? 'none'}
                onChange={(e) => onAudioEditionChange(e.target.value as EditionKey)}
              >
                <option value="none">No audiobook</option>
                {audioEditions.map(ed => (
                  <option key={ed.key} value={ed.key}>{ed.label}</option>
                ))}
              </select>
            }
          />
        )}

        <div className="ss-reading-angle">
          <div className="ss-row-label">Reading angle</div>
          <div className="ss-row-hint" style={{ marginBottom: 10 }}>
            Told in the first person. The lens your AI companion reads through.
          </div>
          <textarea
            className="ss-angle-textarea"
            value={localObjective}
            onChange={(e) => setLocalObjective(e.target.value)}
            onBlur={() => {
              if (localObjective.trim() !== readingObjective) {
                onSaveObjective(localObjective.trim())
              }
            }}
            placeholder="e.g. Leadership lessons, mythology connections, close-reading the prosody…"
            rows={5}
            maxLength={2000}
          />
          <div className="ss-angle-counter">
            {localObjective.length} / 2,000 characters
          </div>
        </div>

        <div className="ss-reading-footer">
          <button className="ss-link-btn" onClick={() => { onOpenStore(); onClose() }}>
            Open the library →
          </button>
        </div>
      </div>
    )
  }

  // === Layout (was Reading visual + Progress + tab toggles) ===
  // Mobile gets a single master toggle for Chat/Feed/Cast (one bottom nav bar
  // is binary: show tabs, or don't). Desktop keeps the three individual
  // toggles since they map to separate rails on the right.
  const allTabsHidden = chatHidden && feedHidden && castHidden
  const anyTabVisible = !allTabsHidden
  const toggleAllTabs = () => {
    // If any tab is currently visible → hide all. Else → show all.
    if (anyTabVisible) {
      if (!chatHidden) onToggleChatHidden()
      if (!feedHidden) onToggleFeedHidden()
      if (!castHidden) onToggleCastHidden()
    } else {
      if (chatHidden) onToggleChatHidden()
      if (feedHidden) onToggleFeedHidden()
      if (castHidden) onToggleCastHidden()
    }
  }

  const LayoutSection = () => (
    <>
      <Row
        label="Theme"
        hint="The colour of paper + ink."
        control={
          <Seg
            options={[{ value: 'light', label: 'Paper' }, { value: 'dark', label: 'Night' }]}
            active={darkMode ? 'dark' : 'light'}
            onChange={(v) => { if ((v === 'dark') !== darkMode) onToggleDarkMode() }}
          />
        }
      />
      <Row
        label="Font"
        hint="Serif for the book."
        control={
          <Seg
            options={[
              { value: 'garamond', label: 'Garamond' },
              { value: 'baskerville', label: 'Baskerville' },
              { value: 'sourceserif', label: 'Source' },
            ]}
            active={fontFamily}
            onChange={(v) => onFontFamilyChange(v as FontFamily)}
          />
        }
      />
      <Row
        label="Size"
        hint="Five sizes, from compact to extra large."
        control={
          <div className="font-size-steps">
            {[
              { v: 1.0, label: 'A', px: '0.8em' },
              { v: 1.2, label: 'A', px: '0.95em' },
              { v: 1.5, label: 'A', px: '1.15em' },
              { v: 1.8, label: 'A', px: '1.35em' },
              { v: 2.2, label: 'A', px: '1.6em' },
            ].map(step => {
              const active = Math.abs(fontSize - step.v) < 0.0001
              return (
                <button
                  key={step.v}
                  type="button"
                  className={`font-size-step ${active ? 'font-size-step-active' : ''}`}
                  onClick={() => onFontSizeChange(step.v)}
                  aria-label={`Font size ${step.v}`}
                >
                  <span style={{ fontSize: step.px, fontFamily: 'var(--font-serif)' }}>{step.label}</span>
                </button>
              )
            })}
          </div>
        }
      />
      <div className="ss-row-group">
        <div className="ss-row-group-head">
          <div className="ss-row-label">Progress</div>
          <div className="ss-row-hint">What the bottom strip shows.</div>
        </div>
        <div className="ss-row-group-inline">
          <span className="ss-row-group-sublabel">Show</span>
          <Seg
            options={[
              { value: 'percent',  label: '%' },
              { value: 'time',     label: 'Time' },
              { value: 'page',     label: 'Page' },
              { value: 'location', label: 'Loc' },
            ]}
            active={progressDisplay.metric}
            onChange={(v) => onProgressDisplayChange({ ...progressDisplay, metric: v as ProgressMetric })}
          />
        </div>
        <div className="ss-row-group-inline">
          <span className="ss-row-group-sublabel">Of</span>
          <Seg
            options={[
              { value: 'book', label: 'Book' },
              ...(hasSections ? [{ value: 'section', label: 'Section' }] : []),
              { value: 'chapter', label: 'Chapter' },
            ]}
            active={progressDisplay.scope}
            onChange={(v) => onProgressDisplayChange({ ...progressDisplay, scope: v as ProgressScope })}
          />
        </div>
      </div>
      {/* Desktop: individual rail toggles. Mobile: one master switch. */}
      <div className="ss-layout-tabs-desktop">
        <Row
          label="Chat tab"
          hint="The AI companion panel."
          control={
            <Seg
              options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
              active={chatHidden ? 'off' : 'on'}
              onChange={(v) => { if ((v === 'off') !== chatHidden) onToggleChatHidden() }}
            />
          }
        />
        <Row
          label="Feed tab"
          hint="Your reading journal."
          control={
            <Seg
              options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
              active={feedHidden ? 'off' : 'on'}
              onChange={(v) => { if ((v === 'off') !== feedHidden) onToggleFeedHidden() }}
            />
          }
        />
        <Row
          label="Cast tab"
          hint="Spoiler-safe character tracker."
          control={
            <Seg
              options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
              active={castHidden ? 'off' : 'on'}
              onChange={(v) => { if ((v === 'off') !== castHidden) onToggleCastHidden() }}
            />
          }
        />
      </div>
      <div className="ss-layout-tabs-mobile">
        <Row
          label="Chat / Feed / Cast"
          hint="Show the AI companion, journal, and character tracker in the nav."
          control={<Toggle on={anyTabVisible} onClick={toggleAllTabs} />}
        />
      </div>
    </>
  )

  // === Offline (was Offline + new dictionary row) ===
  const startDictDownload = async () => {
    if (dictDownloading) return
    setDictDownloading(true)
    setDictProgress({ done: 0, total: 27 })
    await preloadDictionary((done, total) => setDictProgress({ done, total }))
    setDictDownloading(false)
    setDictReady(true)
  }

  const OfflineSection = () => (
    <>
      <div className="ss-row-hint" style={{ padding: '14px 0 16px' }}>
        Keep this book on your device for trains and cabins. Text and
        audio download separately so you only carry what you need.
      </div>
      <Row
        label="This book"
        hint={isBookDownloaded
          ? 'Saved to this device for offline reading.'
          : 'Not yet downloaded.'}
        control={
          <Toggle
            on={isBookDownloaded}
            onClick={() => onOpenDownloads()}
          />
        }
      />
      <Row
        label="Dictionary — English"
        hint={
          dictReady
            ? 'Ready offline.'
            : dictDownloading
              ? `Downloading… ${dictProgress ? `${dictProgress.done}/${dictProgress.total}` : ''}`
              : 'Cache the full dictionary so lookups work without a connection.'
        }
        control={
          dictReady ? (
            <span className="ss-text-value" style={{ color: 'var(--accent)' }}>Ready ✓</span>
          ) : dictDownloading ? (
            <span className="ss-text-value">{dictProgress ? `${Math.round((dictProgress.done / dictProgress.total) * 100)}%` : '…'}</span>
          ) : (
            <button className="ss-link-btn" onClick={startDictDownload}>Download →</button>
          )
        }
      />
      <div className="ss-row-hint" style={{ padding: '18px 0 0' }}>
        For audio, downloaded chapters, or to manage all of your offline
        books at once, open the <button className="ss-link-btn" style={{ display: 'inline' }} onClick={() => onOpenDownloads()}>full download manager &rarr;</button>
      </div>
    </>
  )

  // Android Capacitor: row to set/release Tinct as the device's home app.
  // Renders above the user-block so it appears for both signed-in and
  // anonymous installs.
  const handleSetHome = async () => {
    setHomeBusy(true)
    const granted = await requestHomeApp()
    setHomeBusy(false)
    if (granted) setIsHome(true)
  }
  const handleReleaseHome = async () => {
    setHomeBusy(true)
    await openHomeAppSettings()
    setHomeBusy(false)
    // Re-poll a moment later — user may have just changed the role.
    setTimeout(() => { void isHomeApp().then(setIsHome) }, 1500)
  }
  const HomeRoleRow = () => showHomeRow ? (
    <Row
      label={isHome ? 'Default home app' : 'Make Tinct home'}
      hint={isHome
        ? 'Tinct opens when you press the Home button. Tap to release and pick a different launcher.'
        : 'Set Tinct as your device\'s home app so power-on lands in your last book. You can always exit normally.'}
      control={
        isHome ? (
          <button className="ss-link-btn" onClick={handleReleaseHome} disabled={homeBusy}>
            {homeBusy ? 'Opening…' : 'Release →'}
          </button>
        ) : (
          <button className="ss-link-btn" onClick={handleSetHome} disabled={homeBusy}>
            {homeBusy ? 'Opening…' : 'Set →'}
          </button>
        )
      }
    />
  ) : null

  const AccountSection = () => (
    <>
      <HomeRoleRow />
      {user ? (
        <>
          <Row label="Email" control={<span className="ss-text-value">{user.email}</span>} />
          <div className="ss-account-block">
            <div className="ss-row-label">Subscription</div>
            <div className="ss-balance-row">
              <div className="ss-balance-text">
                <strong>{messagesRemaining}</strong> messages remaining
                {!hasBalance && <span className="ss-balance-warn"> · top up to keep chatting</span>}
              </div>
              <button className="ss-action-btn" onClick={onOpenUsage}>
                {hasBalance ? 'Manage' : 'Top up'}
              </button>
            </div>
          </div>
          {onResetPassword && user.email && (
            <Row
              label="Change password"
              control={
                resetSent ? (
                  <span className="ss-text-value" style={{ color: 'var(--accent)' }}>
                    Reset email sent
                  </span>
                ) : (
                  <button className="ss-link-btn" onClick={async () => {
                    await onResetPassword(user.email!)
                    setResetSent(true)
                    setTimeout(() => setResetSent(false), 5000)
                  }}>Send reset email →</button>
                )
              }
            />
          )}
          <Row
            label="Sign out"
            control={
              <button className="ss-link-btn" onClick={onSignOut}>Sign out →</button>
            }
          />
          {onDeleteAccount && (
            <div className="ss-danger-row">
              {confirmDelete ? (
                <>
                  <div className="ss-row-hint" style={{ marginBottom: 8 }}>
                    Permanently delete your account and all data?
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="ss-link-btn" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </button>
                    <button className="ss-link-btn ss-link-danger" onClick={() => { onDeleteAccount(); setConfirmDelete(false) }}>
                      Delete account
                    </button>
                  </div>
                </>
              ) : (
                <button className="ss-link-btn ss-link-danger" onClick={() => setConfirmDelete(true)}>
                  Delete account
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="ss-empty">
          <div className="ss-row-hint" style={{ marginBottom: 12 }}>
            You're reading without an account. Sign in to sync progress across devices.
          </div>
          <button className="ss-action-btn" onClick={onSignIn}>Sign in</button>
        </div>
      )}
    </>
  )

  const renderSection = () => {
    switch (active) {
      case 'reading': return <ReadingSection />
      case 'layout':  return <LayoutSection />
      case 'offline': return <OfflineSection />
      case 'account': return <AccountSection />
    }
  }

  return (
    <div className="ss-overlay" onClick={onClose}>
      <div className="ss-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Left nav */}
        <aside className="ss-nav">
          <div className="ss-nav-head">
            <span className="ss-nav-eyebrow">&sect; Settings</span>
            <div className="ss-nav-title">
              Tune your read<span className="ss-nav-title-dot">.</span>
            </div>
          </div>
          <div className="ss-nav-list">
            {SECTIONS.map(s => (
              <button
                key={s.k}
                type="button"
                className={`ss-nav-item ${active === s.k ? 'ss-nav-item-active' : ''}`}
                onClick={() => setActive(s.k)}
              >
                <div className="ss-nav-item-label">{s.label}</div>
                <div className="ss-nav-item-sub">{s.sub}</div>
              </button>
            ))}
          </div>
          <div className="ss-nav-foot">Tinct &middot; 2026</div>
        </aside>

        {/* Right content */}
        <main className="ss-main">
          <div className="ss-main-head">
            <div>
              <span className="ss-nav-eyebrow">{sectionMeta.sub}</span>
              <h2 className="ss-main-title">{sectionMeta.label}</h2>
            </div>
            <button className="ss-close" onClick={onClose} aria-label="Close settings">&times;</button>
          </div>
          <div className="ss-main-body">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}
