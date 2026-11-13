import { Fragment, useMemo, type ReactNode } from 'react'
import { noteTree, parseNote, type NoteNode, type NoteRun } from './noteMarkdown'
import './notes.css'

function runs(list: NoteRun[]): ReactNode {
  return list.map((run, index) => {
    let node: ReactNode = run.text
    if (run.i) node = <em>{node}</em>
    if (run.b) node = <strong>{node}</strong>
    return <Fragment key={index}>{node}</Fragment>
  })
}

function node(item: NoteNode, key: number): ReactNode {
  if (item.type === 'p') return <p key={key}>{item.runs.length ? runs(item.runs) : <br />}</p>
  return <ul key={key}>{item.items.map((li, index) => <li key={index}>{runs(li.runs)}{li.children ? node(li.children, 0) : null}</li>)}</ul>
}

/**
 * A note as the reader wrote it (noteMarkdown.ts): paragraph lines, nested bullets, bold and italic; every
 * character is text, never markup. `lines`: a folded card shows at most this many lines (6, Anders 13 Nov 2026).
 */
export function NoteView({ children, className = '', lines, testId = 'note-markdown' }: { children: string; className?: string; lines?: number; testId?: string }) {
  const tree = useMemo(() => noteTree(parseNote(children || '')), [children])
  return <div className={`tn-md${lines ? ' is-clamped' : ''}${className ? ' ' + className : ''}`} data-testid={testId}
    style={lines ? { maxHeight: `calc(${lines} * var(--tn-line, 1.5em))` } : undefined}>{tree.map(node)}</div>
}
