import { createContext, useContext } from 'react'
import { FREE_MODE, FREE_MODE_LOCALE } from './freeMode'

export { FREE_MODE, FREE_MODE_LOCALE }

/**
 * Free reading mode's source line under the chapter heading ("Modern English made with AI from George Long's 1862
 * translation"), or null: outside free mode, and in Both, where the column labels already say it. A context, so the
 * measuring copies of the heading carry the same line as the painted ones and the pages are laid out with it.
 */
export const FreeModeSourceContext = createContext<string | null>(null)

export function useFreeModeSourceLine(): string | null {
  return useContext(FreeModeSourceContext)
}
