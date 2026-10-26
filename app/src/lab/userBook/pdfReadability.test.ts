import {it,expect,vi} from 'vitest'
import {assessPdfReadability} from './pdfReadability'
function engine({text=true,scan=false,small=false}={}){
 const getPage=vi.fn(async(_page:number)=>({view:[0,0,600,800],getTextContent:async()=>({items:text?[{str:'Readable source words. '.repeat(50),transform:[10,0,0,small?8:14,0,0]}]:[]}),getOperatorList:async()=>({fnArray:scan?[1,2]:[],argsArray:scan?[[600,0,0,800,0,0],[]]:[]})}))
 const destroy=vi.fn(async()=>{})
 return {load:async()=>({pdfjs:{OPS:{transform:1,paintImageXObject:2},getDocument:()=>({promise:Promise.resolve({numPages:400,getPage,destroy})})}}),getPage,destroy}
}
it('samples at most three pages and suggests conversion for scanned text',async()=>{
 const e=engine({scan:true});expect(await assessPdfReadability(new ArrayBuffer(2),e.load)).toEqual({recommend:true,reason:'scan'})
 expect(e.getPage.mock.calls.map(c=>c[0])).toEqual([1,8,200]);expect(e.destroy).toHaveBeenCalledOnce()
})
it('suggests reflow for small text without claiming image-only scans can convert',async()=>{
 expect(await assessPdfReadability(new ArrayBuffer(2),engine({small:true}).load)).toEqual({recommend:true,reason:'small-text'})
 expect(await assessPdfReadability(new ArrayBuffer(2),engine({text:false,scan:true}).load)).toEqual({recommend:false,reason:'no-text'})
 expect(await assessPdfReadability(new ArrayBuffer(2),engine().load)).toEqual({recommend:false,reason:'none'})
})
