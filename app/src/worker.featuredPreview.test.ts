import { describe, it, expect } from 'vitest'
import { handleFeaturedPreview } from './worker/routes/featuredPreview'
describe('private featured preview',()=>{
 it('denies guests and ordinary accounts without returning preview markup',async()=>{
  const r=await handleFeaturedPreview(new Request('https://tinct.app/api/featured-preview'),{},async()=>false)
  expect(r.status).toBe(403);expect(await r.text()).not.toContain('class="reel"')
  expect(r.headers.get('cache-control')).toContain('no-store')
 })
 it('serves the preview only after admin verification',async()=>{
  const r=await handleFeaturedPreview(new Request('https://tinct.app/api/featured-preview'),{},async()=>true)
  expect(r.status).toBe(200);expect(await r.text()).toContain('class="reel"')
  expect(r.headers.get('x-robots-tag')).toContain('noindex')
 })
 it('fails closed on verification errors and rejects writes',async()=>{
  const r=await handleFeaturedPreview(new Request('https://tinct.app/api/featured-preview'),{},async()=>{throw Error('offline')})
  expect(r.status).toBe(503)
  const post=await handleFeaturedPreview(new Request('https://tinct.app/api/featured-preview',{method:'POST'}),{},async()=>true)
  expect(post.status).toBe(405)
 })
})
