import { useMemo, useState } from 'react'
import { LAB_COPY } from './labCopy'
import type { LabCastMember, LabChapter, LabMark } from './labSource'

type InTheBookTab = 'search' | 'marks' | 'contents' | 'cast'

interface LabInTheBookProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
  paragraphs: string[]
  chapters: LabChapter[]
  currentChapter: number
  marks: LabMark[]
  cast: LabCastMember[]
  online: boolean
  onAskAbout: (name: string) => void
  onJumpParagraph: (index: number) => void
}

export function LabInTheBook({
  open,
  onToggle,
  onClose,
  paragraphs,
  chapters,
  currentChapter,
  marks,
  cast,
  online,
  onAskAbout,
  onJumpParagraph,
}: LabInTheBookProps) {
  const [tab, setTab] = useState<InTheBookTab>('search')
  const [query, setQuery] = useState('')

  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return paragraphs.flatMap((text, index) => (
      text.toLowerCase().includes(needle) ? [{ index, text }] : []
    ))
  }, [paragraphs, query])

  return (
    <div className="lab-inbook">
      <button
        type="button"
        className={`lab-header-btn ${open ? 'is-open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="lab-inbook-panel"
        data-testid="lab-in-the-book"
      >
        {LAB_COPY.inTheBook}
      </button>
      {open && (
        <div id="lab-inbook-panel" className="lab-inbook-panel" data-testid="lab-in-the-book-panel">
          <p className="lab-inbook-hint">{LAB_COPY.inTheBookHint}</p>
          <div className="lab-inbook-tabs" role="tablist">
            {([
              ['search', LAB_COPY.search],
              ['marks', LAB_COPY.marks],
              ['contents', LAB_COPY.contents],
              ['cast', LAB_COPY.cast],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`lab-inbook-tab ${tab === key ? 'is-active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'search' && (
            <div role="tabpanel">
              <input
                className="lab-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={LAB_COPY.searchPlaceholder}
              />
              <ul className="lab-list">
                {hits.map(hit => (
                  <li key={hit.index}>
                    <button type="button" className="lab-list-btn" onClick={() => { onJumpParagraph(hit.index); onClose() }}>
                      {hit.text.slice(0, 160)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'marks' && (
            <div role="tabpanel">
              {marks.length === 0 ? (
                <p className="lab-empty">{LAB_COPY.marksEmpty}</p>
              ) : (
                <ul className="lab-list">
                  {marks.map(mark => (
                    <li key={mark.id}>
                      <button type="button" className="lab-list-btn" onClick={() => { onJumpParagraph(mark.paragraphIndex); onClose() }}>
                        {mark.text.slice(0, 160)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'contents' && (
            <div role="tabpanel">
              <ul className="lab-list">
                {chapters.map(chapter => (
                  <li key={chapter.number}>
                    <span className={`lab-contents-item ${chapter.number === currentChapter ? 'is-current' : ''}`}>
                      {chapter.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'cast' && (
            <div role="tabpanel">
              {cast.length === 0 ? (
                <p className="lab-empty">{LAB_COPY.castEmpty}</p>
              ) : (
                <ul className="lab-cast">
                  {cast.map(member => (
                    <li key={member.id} className="lab-cast-card">
                      <h3>{member.name}</h3>
                      {member.epithet && <p className="lab-cast-epithet">{member.epithet}</p>}
                      <p>{member.introduction}</p>
                      {online ? (
                        <button
                          type="button"
                          className="lab-text-btn"
                          onClick={() => onAskAbout(member.name)}
                        >
                          {LAB_COPY.askAbout}
                        </button>
                      ) : (
                        <p className="lab-empty">{LAB_COPY.offlineCast}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
