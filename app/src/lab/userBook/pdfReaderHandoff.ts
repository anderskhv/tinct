import { ownBookOpenUrl } from './userBookId'
import type { OriginalPagePlace } from './pdfOriginalPlace'
/** Both views share one private-book route and one page/fraction place. */
export function pdfReaderViewUrl(hex:string, view:'text'|'pages', place:OriginalPagePlace, search=''):string {
  const params=new URLSearchParams(ownBookOpenUrl(hex).split('?')[1])
  const previous=new URLSearchParams(search)
  for (const key of ['sharedReader','layout','view','margin']) if (previous.has(key)) params.set(key,previous.get(key)!)
  params.set('page',String(Math.max(1,Math.floor(place.page))))
  params.set('frac',String(Math.max(0,Math.min(1,place.frac))))
  if (view==='pages') params.set('pages','1')
  return `${ownBookOpenUrl(hex).split('?')[0]}?${params}`
}
