import { expect, it } from 'vitest'
import { placePdfHeadingActions } from './pdfHeadingGeometry'
const heading = { page: 1, text: 'A heading', rects: [[1, .1, .2, .25, .04] as [number,number,number,number,number]] }
it('keeps a toolbar beside a heading only when that space is empty', () => {
  expect(placePdfHeadingActions(heading, 1000, 1000, { width: 300, height: 40 }, [])).toEqual({left:362,top:200})
})
it('does not put left-column heading controls on right-column text', () => {
  const position = placePdfHeadingActions(heading, 1000, 1000, {width:300,height:40}, [{left:500,top:180,right:900,bottom:300}])
  expect(position).toEqual({left:100,top:154})
})
it('keeps the fallback inside the page even for headings at the top edge', () => {
  expect(placePdfHeadingActions({...heading,rects:[[1,.7,.01,.25,.04]]},1000,1000,{width:400,height:40},[{left:0,top:0,right:1000,bottom:1000}])).toEqual({left:592,top:0})
})
