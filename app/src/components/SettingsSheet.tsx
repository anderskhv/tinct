import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type {
  Edition, EditionKey, Language, Style,
  FontSize, FontFamily,
  ProgressDisplay, ProgressMetric, ProgressScope,
} from '../types'

type SectionKey =
  | 'reading'
  | 'editions'
  | 'progress'
  | 'angle'
  | 'audio'
  | 'offline'
  | 'account'
  | 'library'

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
  { k: 'reading',  label: 'Reading',       sub: 'Theme · font · size' },
  { k: 'editions', label: 'Editions',      sub: 'Primary · compare · audio' },
  { k: 'progress', label: 'Progress',      sub: "How it's shown" },
  { k: 'angle',    label: 'Reading angle', sub: 'Lens for your AI companion' },
  { k: 'audio',    label: 'Audio',         sub: 'Audiobook narration' },
  { k: 'offline',  label: 'Offline',       sub: 'Downloaded books' },
  { k: 'account',  label: 'Account',       sub: 'Email · subscription' },
  { k: 'library',  label: 'Library',       sub: 'Browse all books' },
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
    allEditions, primaryEditionKey, onLanguageChange, onStyleChange,
    alignedEditions, splitEditionKey, onSplitEditionChange,
    splitView, onToggleSplitView,
    audioEditions, audioEditionKey, onAudioEditionChange,
    progressDisplay, onProgressDisplayChange, hasSections,
    readingObjective, onSaveObjective,
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

  if (!isOpen) return null

  const sectionMeta = SECTIONS.find(s => s.k === active) ?? SECTIONS[0]

  const ReadingSection = () => (
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
        hint="Serif for the book, mono for the chrome."
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
        hint="Tap to step through."
        control={
          <Seg
            options={[
              { value: 'small',  label: 'S' },
              { value: 'medium', label: 'M' },
              { value: 'large',  label: 'L' },
              { value: 'xlarge', label: 'XL' },
            ]}
            active={fontSize}
            onChange={(v) => onFontSizeChange(v as FontSize)}
          />
        }
      />
    </>
  )

  const EditionsSection = () => {
    return (
      <>
        <Row
          label="Primary edition"
          hint="What you see in Read."
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
            <Row
              label="Split-view by default"
              hint="Show both editions side by side when opening a book."
              control={<Toggle on={splitView} onClick={onToggleSplitView} />}
            />
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
      </>
    )
  }

  const ProgressSection = () => (
    <>
      <Row
        label="Show"
        hint="What's printed in the bottom strip."
        control={
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
        }
      />
      <Row
        label="Of"
        hint="Book vs chapter vs section."
        control={
          <Seg
            options={[
              { value: 'book', label: 'Book' },
              ...(hasSections ? [{ value: 'section', label: 'Section' }] : []),
              { value: 'chapter', label: 'Chapter' },
            ]}
            active={progressDisplay.scope}
            onChange={(v) => onProgressDisplayChange({ ...progressDisplay, scope: v as ProgressScope })}
          />
        }
      />
    </>
  )

  const AngleSection = () => (
    <div className="ss-angle">
      <div className="ss-row-label">The lens your companion reads through.</div>
      <div className="ss-row-hint" style={{ marginBottom: 14 }}>
        Told in the first person. Used when you ask T. about a passage.
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
        rows={6}
        maxLength={2000}
      />
      <div className="ss-angle-counter">
        {localObjective.length} / 2,000 characters
      </div>
    </div>
  )

  const AudioSection = () => (
    <>
      {audioEditions.length === 0 ? (
        <div className="ss-empty">No audiobook is available for this book yet.</div>
      ) : (
        <>
          <div className="ss-row-hint" style={{ padding: '14px 0 18px' }}>
            Tap the headphones icon in the top bar to open the player. Audio
            plays paragraph by paragraph; the one being read is highlighted
            in the reader so you can switch between listening and reading
            without losing your place. The narrator edition is set under
            <strong> Editions</strong>.
          </div>
          <Row
            label="Auto-advance to next chapter"
            hint="When a chapter ends, the next one starts automatically."
            control={<span className="ss-text-value" style={{ color: 'var(--accent)' }}>On</span>}
          />
          <Row
            label="Highlight currently-playing paragraph"
            hint="Soft accent background under the paragraph the narrator is on."
            control={<span className="ss-text-value" style={{ color: 'var(--accent)' }}>On</span>}
          />
        </>
      )}
    </>
  )

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
      <div className="ss-row-hint" style={{ padding: '18px 0 0' }}>
        For audio, downloaded chapters, or to manage all of your offline
        books at once, open the <button className="ss-link-btn" style={{ display: 'inline' }} onClick={() => onOpenDownloads()}>full download manager &rarr;</button>
      </div>
    </>
  )

  const AccountSection = () => (
    <>
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

  const LibrarySection = () => (
    <div className="ss-offline">
      <div className="ss-row-hint" style={{ padding: '14px 0 16px' }}>
        Browse the full library of public-domain classics.
      </div>
      <button className="ss-action-btn" onClick={() => { onOpenStore(); onClose() }}>
        Open the library
      </button>
    </div>
  )

  const renderSection = () => {
    switch (active) {
      case 'reading':  return <ReadingSection />
      case 'editions': return <EditionsSection />
      case 'progress': return <ProgressSection />
      case 'angle':    return <AngleSection />
      case 'audio':    return <AudioSection />
      case 'offline':  return <OfflineSection />
      case 'account':  return <AccountSection />
      case 'library':  return <LibrarySection />
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
