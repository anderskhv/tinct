import { featuredPreviewHtml } from '../featuredPreviewHtml'
export async function handleFeaturedPreview<E>(request: Request, env: E, verify: (env: E, request: Request) => Promise<boolean>): Promise<Response> {
 const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Content-Type': 'text/html; charset=utf-8', 'Vary': 'Authorization' }
 if (request.method !== 'GET') return new Response('Method not allowed', {status:405,headers:{...headers,Allow:'GET'}})
 try {
  if (!await verify(env,request)) return new Response('Forbidden',{status:403,headers})
 } catch { return new Response('Access verification unavailable',{status:503,headers}) }
 return new Response(featuredPreviewHtml,{headers})
}
