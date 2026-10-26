// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import { savePendingOwnedPdf } from './userBookStore'
const session=vi.hoisted(()=>({owner:'owner-a'}))
vi.mock('../labLibraryBoot',()=>({readCachedSupabaseUser:()=>({id:session.owner})}))
let records:Map<string,Record<string,unknown>>, hex:string, sha:string
beforeEach(async()=>{
 session.owner='owner-a';records=new Map();vi.stubGlobal('indexedDB',fakeIndexedDb(records));vi.stubGlobal('crypto',webcrypto)
 const bytes=new ArrayBuffer(14);new Uint8Array(bytes).set([37,80,68,70,45,115,121,110,116,104,101,116,105,99])
 sha=Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');hex=sha.slice(0,24)
 records.set('pdf:'+hex,{key:'pdf:'+hex,kind:'pdf',owner:session.owner,bytes,title:'Private PDF',personal:'keep me'})
})
afterEach(()=>{vi.unstubAllGlobals();localStorage.clear()})
it('saves a fresh owned PDF and retains all local fields',async()=>{
 const request=vi.fn(async()=>Response.json({book:{id:'a'.repeat(32),type:'pdf',sha256:sha}}))
 expect(await savePendingOwnedPdf(hex,session.owner,'synthetic-token',request)).toBe('a'.repeat(32))
 expect(records.get('pdf:'+hex)).toMatchObject({cloudId:'a'.repeat(32),personal:'keep me'})
 expect(request).toHaveBeenCalledOnce()
})
it('never reuploads a previously assigned cloud generation',async()=>{
 records.get('pdf:'+hex)!.cloudId='b'.repeat(32)
 const request=vi.fn()
 expect(await savePendingOwnedPdf(hex,session.owner,'synthetic-token',request)).toBeNull()
 expect(request).not.toHaveBeenCalled()
})
it('does not attach an upload result after the active account changes',async()=>{
 const request=vi.fn(async()=>{session.owner='owner-b';return Response.json({book:{id:'a'.repeat(32),type:'pdf',sha256:sha}})})
 expect(await savePendingOwnedPdf(hex,'owner-a','synthetic-token',request)).toBeNull()
 expect(records.get('pdf:'+hex)!.cloudId).toBeUndefined()
})
it('leaves the original unchanged on an account upload failure',async()=>{
 await expect(savePendingOwnedPdf(hex,session.owner,'synthetic-token',async()=>new Response('',{status:503}))).rejects.toThrow('original file is safe')
 expect(records.get('pdf:'+hex)).toMatchObject({personal:'keep me'})
 expect(records.get('pdf:'+hex)!.cloudId).toBeUndefined()
})
