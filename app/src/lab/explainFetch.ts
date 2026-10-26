/** One bounded recovery before any answer has reached the reader. Keep the
 * original abort signal/deadline; never retry an allowance or auth rejection. */
export async function fetchExplainResponse(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    let response: Response
    try {
      response = await fetch(url, attempt ? { ...init, headers: { ...Object.fromEntries(new Headers(init.headers)), 'x-tinct-retry': '1' } } : init)
    } catch (error) {
      if (attempt === 0 && error instanceof TypeError && !init.signal?.aborted) continue
      throw error
    }
    if (attempt === 0 && (response.status === 502 || response.status === 504) && !init.signal?.aborted) {
      await response.body?.cancel().catch(() => {})
      continue
    }
    return response
  }
}
