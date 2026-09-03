import { Fragment, type ReactNode } from 'react'

const INLINE_MARKDOWN = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g

function inlineNodes(value: string): ReactNode[] {
  return value.split(INLINE_MARKDOWN).filter(Boolean).map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

/** A small, React-rendered Markdown vocabulary; raw model HTML stays text. */
export function LabMarkdown({ children }: { children: string }) {
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
                <li key={lineIndex}>{inlineNodes(line.replace(/^\s*[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inlineNodes(line)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
