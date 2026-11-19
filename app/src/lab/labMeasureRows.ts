/**
 * Measuring a page tries hundreds of nearly identical trials: the same rows
 * with only the last one growing or shrinking a word at a time. Rebuilding
 * every row for each trial made the browser restyle the whole page each time;
 * a 1,119-paragraph chapter (Gorgias, 2,300 trials of about 4,000 elements)
 * froze the reader for 20–45 s (production QA, 9 Oct 2026).
 *
 * `paintRows` keeps the rows a trial shares with the one on the stage and
 * builds only the rest, so the stage holds exactly the DOM a fresh build
 * would. Rows are matched by key, a description of what the row holds.
 */
export interface MeasureRow {
  key: string
  build: () => Element
}

export interface MeasureRowsState {
  keys: string[]
  elements: Element[]
}

export function measureRowsState(): MeasureRowsState {
  return { keys: [], elements: [] }
}

export function paintRows(container: Element, state: MeasureRowsState, rows: MeasureRow[]): Element[] {
  // Anything else that changed the stage (replaceChildren, a probe) starts afresh.
  const intact = container.childElementCount === state.elements.length
    && state.elements.every((element, index) => container.children[index] === element)
  let shared = 0
  if (intact) while (shared < rows.length && shared < state.keys.length && rows[shared].key === state.keys[shared]) shared += 1
  else container.replaceChildren()
  const kept = intact ? state.elements.slice(0, shared) : []
  for (const element of (intact ? state.elements.slice(shared) : [])) element.remove()
  const built = rows.slice(kept.length).map(row => row.build())
  for (const element of built) container.appendChild(element)
  state.keys = rows.map(row => row.key)
  state.elements = [...kept, ...built]
  return state.elements
}
