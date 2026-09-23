/** Short-lived, body-bound authorization for cloud release prepopulation.
 * The existing xAI secret is never transmitted; a separate HMAC context binds
 * the signature to this method, path, body and a five-minute timestamp.
 */
export async function releaseWarmSignature(key: string, method: string, path: string, timestamp: string, body: string): Promise<string> {
  const bytes = new TextEncoder()
  const secret = await crypto.subtle.importKey('raw', bytes.encode(key), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])
  const digest = await crypto.subtle.digest('SHA-256', bytes.encode(body))
  const hash = Array.from(new Uint8Array(digest), byte=>byte.toString(16).padStart(2,'0')).join('')
  const message = ['tinct-narration-release-v1',method,path,timestamp,hash].join('\n')
  const signature = await crypto.subtle.sign('HMAC',secret,bytes.encode(message))
  return Array.from(new Uint8Array(signature),byte=>byte.toString(16).padStart(2,'0')).join('')
}
export async function verifyReleaseWarmRequest(request: Request, key: string | undefined, now = Date.now()): Promise<boolean> {
  const timestamp = request.headers.get('x-narration-release-time') || ''
  const provided = request.headers.get('x-narration-release-signature') || ''
  if (!key || !/^\d{13}$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(provided) || Math.abs(now-Number(timestamp))>300000) return false
  const url = new URL(request.url)
  if (!['/api/narration/warm','/api/narration/chapter','/api/narration/voices','/api/narration/usage'].includes(url.pathname)) return false
  const body = request.method === 'GET' ? '' : await request.clone().text()
  if (body.length > 16000) return false
  const expected = await releaseWarmSignature(key,request.method,url.pathname+url.search,timestamp,body)
  let mismatch=0
  for(let i=0;i<expected.length;i++)mismatch|=expected.charCodeAt(i)^provided.charCodeAt(i)
  return mismatch===0
}
