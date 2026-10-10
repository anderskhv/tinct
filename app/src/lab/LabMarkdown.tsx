import { Fragment, type ReactNode } from 'react'

const INLINE_MARKDOWN = /(\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_|\[[^\]\n]+\]\(https?:\/\/[^)\s]+(?: "[^"\n]*")?\))/g

/**
 * Text, or (while an answer arrives) one span per word, keyed by position:
 * a word already shown keeps its node, so only newly arrived words mount and
 * fade in (`.tc-w` in public/lab/chat-thread.css).
 */
function words(value: string, split: boolean): ReactNode {
  if (!split) return value
  let word = 0
  return value.split(/(\s+)/).map((part, i) => {
    if (!part) return null
    if (/^\s+$/.test(part)) return <Fragment key={`s${i}`}>{part}</Fragment>
    return <span key={`w${word++}`} className="tc-w">{part}</span>
  })
}

function inlineNodes(value: string, split = false): ReactNode[] {
  return value.split(INLINE_MARKDOWN).filter(Boolean).map((part, index) => {
    if (part.startsWith('***') && part.endsWith('***')) return <strong key={index}><em>{words(part.slice(3, -3), split)}</em></strong>
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index}>{words(part.slice(2, -2), split)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{words(part.slice(1, -1), split)}</code>
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={index}>{words(part.slice(1, -1), split)}</em>
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)(?: "([^"\n]*)")?\)$/)
    if (link) {
      return <a key={index} href={link[2]} title={link[3]} target="_blank" rel="noreferrer">{words(link[1], split)}</a>
    }
    return <Fragment key={index}>{words(part, split)}</Fragment>
  })
}

/**
 * A small, React-rendered Markdown vocabulary; raw model HTML stays text.
 * `words`: the answer is still arriving, so each word is its own span and
 * only the new ones fade in.
 */
export function LabMarkdown({ children, words: split = false }: { children: string; words?: boolean }) {
  const blocks = children.trim().split(/\n{2,}/).filter(Boolean)
  return (
    <div className="lab-markdown" data-testid="lab-markdown">
      {blocks.map((block, index) => {
        const lines = block.split('\n')
        const list = lines.length > 0 && lines.every(line => /^\s*[-*]\s+/.test(line))
        if (list) {
          return (
            <ul key={index}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{inlineNodes(line.replace(/^\s*[-*]\s+/, ''), split)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inlineNodes(line, split)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
