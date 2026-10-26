import { wordInCardPassage, type PhoneCardRange } from './phoneCardPassage'

/** A temporary source cue after explicit Notebook navigation; never scrolls or changes stored highlights. */
export function flashNotebookPassage(root: Element | null, passage: PhoneCardRange, chapter: number): () => void {
  if (!root) return () => {}
  const paint = () => {
    for (const word of root.querySelectorAll('[data-testid="lab-word"], [data-testid="lab-opening-word"]')) {
      const selected = wordInCardPassage(word, [passage], chapter, false)
      if (selected !== word.classList.contains('is-notebook-passage')) word.classList.toggle('is-notebook-passage', selected)
    }
  }
  paint()
  // Destination windows may mount after the position update commits.
  const observer = new MutationObserver(paint)
  observer.observe(root, { childList: true, subtree: true })
  return () => {
    observer.disconnect()
    root.querySelectorAll('.is-notebook-passage').forEach(word => word.classList.remove('is-notebook-passage'))
  }
}
