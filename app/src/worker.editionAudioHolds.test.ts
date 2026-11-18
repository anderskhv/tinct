import { describe, expect, it, vi } from 'vitest'
import { handleAudioFile, handleAudioManifest } from './worker/routes/audio'
import { handleNarration } from './worker/routes/narration'
import manifest from './data/editionAvailability.json'

describe('temporary edition holds protect direct audio access', () => {
  it.each(Object.keys(manifest.editions))('%s blocks legacy files and manifests before storage access', async key => {
    const get = vi.fn(), head = vi.fn()
    for (const handler of [handleAudioFile, handleAudioManifest]) {
      const response = await handler(new Request('https://tinct.app/api/audio-file?path=' + key + '/ch1/manifest.json', {headers:{Range:'bytes=0-10'}}), {AUDIO_BUCKET:{get,head}} as never)
      expect(response.status).toBe(503)
      expect(response.headers.get('Cache-Control')).toBe('no-store')
    }
    expect(get).not.toHaveBeenCalled()
    expect(head).not.toHaveBeenCalled()
  })
  it('does not block sound sibling editions', async () => {
    const get = vi.fn(async () => ({body:'{}',size:2}))
    const response = await handleAudioManifest(new Request('https://tinct.app/api/audio-manifest?path=faust-part-1/original-de/ch1/manifest.json'), {AUDIO_BUCKET:{get}} as never)
    expect(response.status).toBe(200)
    expect(get).toHaveBeenCalledOnce()
  })
  it('blocks public narration chapter discovery before bucket access', async () => {
    const list = vi.fn()
    const response = await handleNarration(new Request('https://tinct.app/api/narration/chapter?bookId=macbeth&editionKey=modern-da&chapter=1&voice=f'), {AUDIO_BUCKET:{list}} as never, {} as never, {} as never)
    expect(response.status).toBe(503)
    expect(list).not.toHaveBeenCalled()
  })
})

describe('held editions cannot synthesize through ensure or authorised warm', () => {
  it.each(['ensure','warm'])('%s refuses before provider, storage or account writes', async route => {
    const get=vi.fn(), put=vi.fn(), fetchImpl=vi.fn()
    const response=await handleNarration(new Request('https://tinct.app/api/narration/'+route,{
      method:'POST',headers:{'Content-Type':'application/json','x-narration-admin':'test-admin-token-long-enough'},
      body:JSON.stringify({bookId:'macbeth',editionKey:'modern-da',chapter:1,voice:'a',paragraphs:[{index:0}]})
    }),{
      NARRATION_PILOT:'1',NARRATION_PROVIDER:'fish',FISH_AUDIO_API_KEY:'test',
      NARRATION_VOICE_A_ID:'test-voice',NARRATION_ADMIN_TOKEN:'test-admin-token-long-enough',AUDIO_BUCKET:{get,put}
    } as never,{} as never,{
      verifyUser:async()=>({id:'test',email:'test@example.com'}),fetchImpl
    } as never)
    expect(response.status).toBe(503)
    expect(get).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('To the Lighthouse in Danish is offered as text only', () => {
  it('other Danish editions stay held; the offered edition is an ordinary, unrecorded lookup', async () => {
    for (const key of ['jane-eyre/modern-da', 'odyssey/modern-da']) {
      const get = vi.fn()
      const response = await handleAudioManifest(new Request('https://tinct.app/api/audio-manifest?path=' + key + '/ch1/manifest.json'), {AUDIO_BUCKET:{get}} as never)
      expect(response.status, key).toBe(503)
      expect(get).not.toHaveBeenCalled()
    }
    const get = vi.fn(async () => null)
    const response = await handleAudioManifest(new Request('https://tinct.app/api/audio-manifest?path=to-the-lighthouse/modern-da/ch1/manifest.json'), {AUDIO_BUCKET:{get}} as never)
    expect(response.status).toBe(404)
    expect(get).toHaveBeenCalledOnce()
  })
  it('chapter listing refuses Danish narration (English-only scope) before bucket access', async () => {
    const list = vi.fn()
    const response = await handleNarration(new Request('https://tinct.app/api/narration/chapter?bookId=to-the-lighthouse&editionKey=modern-da&chapter=1&voice=f'), {
      NARRATION_PILOT:'1',NARRATION_PROVIDER:'fish',FISH_AUDIO_API_KEY:'test',NARRATION_VOICE_A_ID:'test-voice',AUDIO_BUCKET:{list},
    } as never, {} as never, {checkRateLimit:async()=>true} as never)
    expect(response.status).toBe(403)
    expect((await response.json()).error).toMatch(/scope/)
    expect(list).not.toHaveBeenCalled()
  })
  it.each(['ensure','warm'])('%s refuses Danish narration before provider, storage or account writes', async route => {
    const get=vi.fn(), put=vi.fn(), fetchImpl=vi.fn()
    const response=await handleNarration(new Request('https://tinct.app/api/narration/'+route,{
      method:'POST',headers:{'Content-Type':'application/json','x-narration-admin':'test-admin-token-long-enough'},
      body:JSON.stringify({bookId:'to-the-lighthouse',editionKey:'modern-da',chapter:1,voice:'a',paragraphs:[{index:0}]})
    }),{
      NARRATION_PILOT:'1',NARRATION_PROVIDER:'fish',FISH_AUDIO_API_KEY:'test',
      NARRATION_VOICE_A_ID:'test-voice',NARRATION_ADMIN_TOKEN:'test-admin-token-long-enough',AUDIO_BUCKET:{get,put}
    } as never,{} as never,{
      verifyUser:async()=>({id:'test',email:'test@example.com'}),fetchImpl,checkRateLimit:async()=>true
    } as never)
    expect(response.status).toBe(403)
    expect((await response.json()).error).toMatch(/scope/)
    expect(get).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
