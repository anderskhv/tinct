// Tinct's own AI companion, called from this static page with the reader's Tinct account.
//
// Signed in: POST /api/chat with the Supabase access token (metered to the account).
// Signed out: POST /api/lab-chat (guest allowance, Tinct's daily guest spend ceiling).
// Both take Tinct's structured `companion` request; the book text travels as context
// paragraphs, so nothing here needs a catalogue book. The endpoints accept text only:
// a call with pictures is refused up front with `images_unavailable`, and callers fall
// back to captions and labels.
(function () {
  'use strict';
  const PARAGRAPH = 19000;      // server limit 20,000 per paragraph
  const CONTEXT = 190000;       // server limit 200,000 in total
  const MESSAGE = 9500;         // server limit 10,000 per message
  const MAX_MESSAGES = 40;      // server limit 50

  // The session tinct.app keeps in this browser (supabase-js, localStorage).
  function session() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!/^sb-.*-auth-token$/.test(k)) continue;
        const v = JSON.parse(localStorage.getItem(k) || 'null');
        const s = v && (v.currentSession || v);
        if (!s || !s.access_token) continue;
        const expired = s.expires_at && s.expires_at * 1000 < Date.now() + 30000;
        return { token: expired ? null : s.access_token, expired: !!expired, userId: s.user?.id || null, email: s.user?.email || null, name: s.user?.user_metadata?.full_name || s.user?.user_metadata?.name || null };
      }
    } catch {}
    return { token: null, expired: false, userId: null, email: null, name: null };
  }

  const chunks = (text, size) => { const out = []; for (let i = 0; i < text.length && out.join('').length < CONTEXT; i += size) out.push(text.slice(i, i + size)); return out };
  const err = (code, message, extra) => Object.assign(new Error(message || code), { code }, extra || {});

  // `input` is a prompt string, or turns [{role, content}] whose first turn carries the
  // instructions and book context (the shape the reader builds).
  function toRequest(input, book) {
    let paragraphs, messages;
    if (typeof input === 'string') {
      paragraphs = input.length > MESSAGE ? chunks(input, PARAGRAPH) : [];
      messages = [{ role: 'user', content: input.length > MESSAGE ? input.slice(0, MESSAGE - 200) + '\n\n[The full text continues in the reading context above.]' : input }];
    } else {
      const [first, ...rest] = input;
      paragraphs = chunks(String(first?.content || ''), PARAGRAPH);
      messages = rest.length ? rest : [{ role: 'user', content: 'Please answer.' }];
    }
    // Alternate roles, start and end with the reader, keep within the server's bounds.
    const clean = [];
    for (const m of messages) {
      const role = m.role === 'assistant' ? 'assistant' : 'user', content = String(m.content || '').slice(0, MESSAGE);
      if (!content) continue;
      if (clean.length && clean.at(-1).role === role) clean.at(-1).content = (clean.at(-1).content + '\n\n' + content).slice(0, MESSAGE);
      else clean.push({ role, content });
    }
    while (clean.length && clean[0].role !== 'user') clean.shift();
    while (clean.length && clean.at(-1).role !== 'user') clean.pop();
    const trimmed = clean.slice(-MAX_MESSAGES);
    if (trimmed[0]?.role === 'assistant') trimmed.shift();
    return {
      stream: true, max_tokens: 1600,
      messages: trimmed.length ? trimmed : [{ role: 'user', content: 'Please answer.' }],
      companion: { intent: 'ask', context: {
        bookTitle: (book?.title || 'Your book').slice(0, 300),
        bookAuthor: (book?.author || '').slice(0, 300),
        chapterLabel: (book?.chapter || book?.title || 'Your book').slice(0, 300),
        pageNumber: book?.page && book.page <= 100000 ? book.page : undefined,
        totalPages: book?.pages && book.pages <= 100000 ? book.pages : undefined,
        paragraphs: paragraphs.length ? paragraphs : [' '],
        lookups: false,
      } },
    };
  }

  async function readStream(response, onText, signal) {
    const reader = response.body.getReader(), dec = new TextDecoder();
    let buf = '', text = '';
    for (;;) {
      if (signal?.aborted) { reader.cancel().catch(() => {}); throw err('cancelled') }
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let cut;
      while ((cut = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, cut); buf = buf.slice(cut + 2);
        let event = 'message', data = '';
        for (const line of block.split('\n')) { if (line.startsWith('event:')) event = line.slice(6).trim(); else if (line.startsWith('data:')) data += line.slice(5).trim() }
        if (!data) continue;
        let msg; try { msg = JSON.parse(data) } catch { continue }
        if (event === 'error' || msg.type === 'error') throw err(msg.error?.type === 'overloaded_error' ? 'busy' : 'failed', msg.error?.message || 'The answer stopped.', text ? { text } : undefined);
        if (msg.type === 'content_block_delta' && msg.delta?.type === 'text_delta') { text += msg.delta.text; onText?.({ text, delta: msg.delta.text }) }
      }
    }
    return text;
  }

  const STATUS = { 400: 'bad_request', 401: 'session_expired', 402: 'quota', 403: 'not_granted', 413: 'prompt_too_large', 429: 'rate_limited', 503: 'busy' };

  // ask(input, { onText, signal, images, book }) -> { text }
  async function ask(input, opts = {}) {
    if (opts.images && [].concat(opts.images).length) throw err('images_unavailable', 'Pictures cannot be sent to the companion yet.');
    const body = JSON.stringify(toRequest(input, opts.book));
    let s = session();
    const attempt = async token => fetch(token ? '/api/chat' : '/api/lab-chat', {
      method: 'POST', signal: opts.signal, credentials: 'same-origin',
      headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
      body,
    });
    let response;
    try { response = await attempt(s.token) } catch (e) { if (e?.name === 'AbortError') throw err('cancelled'); throw err('offline', 'No connection.') }
    // An expired sign-in falls back to the guest allowance rather than failing outright.
    if (response.status === 401 && s.token) { api.onSignedOut?.(); try { response = await attempt(null) } catch (e) { if (e?.name === 'AbortError') throw err('cancelled'); throw err('offline') } }
    if (!response.ok) {
      let detail = ''; try { detail = (await response.json())?.error || '' } catch {}
      throw err(STATUS[response.status] || 'failed', detail || 'HTTP ' + response.status);
    }
    const type = response.headers.get('content-type') || '';
    if (type.includes('text/event-stream')) {
      try { return { text: await readStream(response, opts.onText, opts.signal) } }
      catch (e) { if (e?.name === 'AbortError') throw err('cancelled'); throw e }
    }
    const json = await response.json();
    const text = (json.content || []).map(c => c.text || '').join('');
    opts.onText?.({ text, delta: text });
    return { text };
  }

  // The answer as JSON: the first {...} or [...] in the reply.
  async function askJson(input, opts) {
    const { text } = await ask(input, opts);
    const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (m) { try { return JSON.parse(m[0]) } catch {} }
    return { title: '', summary: text.trim() };
  }

  const api = { session, ask, askJson, toRequest, onSignedOut: null };
  window.TinctAI = api;
})();
