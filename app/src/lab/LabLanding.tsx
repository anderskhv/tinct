import { readLabPositionLocal } from './labPositionStore'
import { resumePlace } from './labPosition'
import './labRoutes.css'

export function LabLanding() {
  const resume = resumePlace(readLabPositionLocal())
  const resumeLabel = resume ? `${resume.headerBook} ${resume.chapterNumber}` : 'Genesis 1'

  return (
    <main className="lab-entry lab-entry-landing" data-testid="lab-landing">
      <div className="lab-entry-world" aria-hidden="true" />
      <header className="lab-entry-brand">
        <strong>Tinct.</strong>
        <a href="/lab/library">Sign in</a>
      </header>
      <section className="lab-entry-hero">
        <h1>Fall in love with the books that fight back.</h1>
        <p className="lab-entry-deck">Immerse yourself in the world's greatest books. Read, listen and talk with them at will - in a language and style that speaks to you.</p>
        <div className="lab-entry-actions">
          <a className="lab-entry-primary" href="/lab/phone">Begin reading</a>
          <a className="lab-entry-secondary" href="/lab/library">Browse the library</a>
        </div>
      </section>
      <a className="lab-entry-book" href="/lab/phone" aria-label={`Continue reading ${resumeLabel}`}>
        <span className="lab-entry-cover" aria-hidden="true"><i>THE</i><b>BIBLE</b><small>KING JAMES</small></span>
        <span className="lab-entry-book-copy">
          <small>Continue where you left off</small>
          <strong>{resumeLabel}</strong>
          <span>Open the reader <b aria-hidden="true">→</b></span>
        </span>
      </a>
    </main>
  )
}
