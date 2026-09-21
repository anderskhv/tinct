import { expect, it } from 'vitest'
import { preparationEditionLabel } from './preparationEditionLabel'
it('labels AI, translators and authorial originals without changing edition identities', () => {
  expect(preparationEditionLabel({key:'modern-en',language:'en',style:'modern',label:'Modern English',aligned:true})).toBe('Modern English, Tinct (AI-generated)')
  expect(preparationEditionLabel({key:'original-en',language:'en',style:'original',label:'Howard (1915)',translator:'B. Howard',year:1915,aligned:true})).toBe('Howard, English translation (1915)')
  expect(preparationEditionLabel({key:'original-da',language:'da',style:'original',label:'Original (1880)',year:1880,aligned:true})).toBe('Original Danish (1880)')
})
