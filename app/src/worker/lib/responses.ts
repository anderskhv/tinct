export const ALLOWED_ORIGINS = ['https://tinct.app', 'https://tinct.ahvelplund.workers.dev', 'capacitor://localhost', 'https://localhost', 'http://localhost']

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  // Allow Capacitor origins (capacitor://, https://localhost, null, or empty)
  const isCapacitorOrigin = !origin || origin === 'null' || origin.startsWith('capacitor://') || origin.startsWith('https://localhost') || origin.startsWith('http://localhost')
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : isCapacitorOrigin ? '*' : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleOptions(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}

export function jsonResponse(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: corsHeaders(request) })
}

export function getAllowedOrigin(request: Request): string {
  const origin = request.headers.get('origin') || ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}
