import './primerContent.css'
import { usablePrimerResource } from './resources'
import { visiblePrimerSections, type SavedPrimer } from './model'

/** Shared content presentation for the book opening and reader companion. */
export function PrimerContentView({ primer, onPassage, onDiscuss }: {
  primer: SavedPrimer
  onPassage?: (passageId: string) => void
  onDiscuss?: () => void
}) {
  const resources = primer.resources.filter(usablePrimerResource)
  return <div className="book-primer-content">
    <p>{primer.content.opening}</p>
    {visiblePrimerSections(primer.content, primer.identity.type).map(([label, topics]) =>
      <details key={label}><summary>{label}</summary>{topics.map((topic, index) =>
        <details key={`${topic.title}:${index}`}><summary>{topic.title}</summary>
          {topic.depth && <p>{({ essential: 'Essential context', recommended: 'Recommended context', optional: 'Optional depth' })[topic.depth]}</p>}
          <p>{topic.explanation}</p>{topic.takeaway && <p>{topic.takeaway}</p>}
          {topic.quotes?.map((quote, i) => <blockquote key={`${quote.passageId}:${i}`}><p>{quote.text}</p>
            {onPassage && <button type="button" onClick={() => onPassage(quote.passageId)}>Read passage</button>}
          </blockquote>)}
        </details>)}</details>)}
    {resources.length > 0 && <details><summary>Watch &amp; explore</summary>{resources.map(resource =>
      <article key={resource.url}><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
        <p>{resource.creator} · {resource.format}</p><p>{resource.relevance}</p><p>{resource.spoilerNote}</p>
        {resource.durationSeconds !== undefined && <p>{Math.floor(resource.durationSeconds / 60)}:{String(resource.durationSeconds % 60).padStart(2, '0')}</p>}
      </article>)}</details>}
    {onDiscuss && <button type="button" onClick={onDiscuss}>Discuss this</button>}
  </div>
}
