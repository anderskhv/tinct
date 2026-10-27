import { loadPdfEngine } from './pdfEdition'
type Item = { str?: string; transform?: number[] }
type Page = { view:number[]; getTextContent():Promise<{items:Item[]}>; getOperatorList():Promise<{fnArray:number[];argsArray:unknown[][]}> }
type Document = {numPages:number;getPage(n:number):Promise<Page>;destroy():Promise<void>}
type Engine = {pdfjs:{OPS?:Record<string,number>;getDocument(options:unknown):{promise:Promise<Document>}}}
export type PdfReadability = {recommend:boolean;reason:'scan'|'small-text'|'no-text'|'none'}
/** Reading discomfort is not conversion fidelity. Until reading order and object
 * preservation are validated, retain Original PDF as the default. The reader
 * still offers explicit conversion; scans and small type alone cannot endorse it. */
export async function assessPdfReadability(bytes:ArrayBuffer, load:()=>Promise<Engine>=loadPdfEngine as unknown as ()=>Promise<Engine>):Promise<PdfReadability> {
 const engine=await load()
 const pdf=await engine.pdfjs.getDocument({data:new Uint8Array(bytes.slice(0)),isEvalSupported:false,verbosity:0}).promise
 try {
  const sample=[...new Set([1,Math.min(8,pdf.numPages),Math.ceil(pdf.numPages/2)])]
  let textPages=0,small=0,scanned=0
  for(const n of sample){
   const page=await pdf.getPage(n),items=(await page.getTextContent()).items.filter(i=>i.str?.trim())
   const characters=items.reduce((sum,i)=>sum+(i.str?.length||0),0)
   if(characters<100)continue
   textPages++
   const width=Math.abs(page.view[2]-page.view[0])||1
   const sizes=items.flatMap(i=>i.transform?.length===6?[Math.hypot(i.transform[2],i.transform[3])/width]:[]).sort((a,b)=>a-b)
   if(characters>700&&sizes.length&&sizes[Math.floor(sizes.length/2)]<.017)small++
   const OPS=engine.pdfjs.OPS
   if(OPS){
    const ops=await page.getOperatorList()
    // A full-page image with overlaid readable words is a scanned/OCR page.
    let scale=1;const stack:number[]=[];const area=Math.abs((page.view[2]-page.view[0])*(page.view[3]-page.view[1]))||1
    for(let i=0;i<ops.fnArray.length;i++){
     const fn=ops.fnArray[i],args=ops.argsArray[i] as number[]
     if(fn===OPS.save)stack.push(scale)
     else if(fn===OPS.restore)scale=stack.pop()??1
     else if(fn===OPS.transform&&args?.length>=6)scale*=Math.abs(args[0]*args[3]-args[1]*args[2])
     else if((fn===OPS.paintImageXObject||fn===OPS.paintInlineImageXObject)&&scale/area>=.85){scanned++;break}
    }
   }
  }
  return scanned?{recommend:false,reason:'scan'}:small?{recommend:false,reason:'small-text'}:!textPages?{recommend:false,reason:'no-text'}:{recommend:false,reason:'none'}
 } finally {await pdf.destroy()}
}
