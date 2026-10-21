// Tinct's own AI companion, called from this static page with the reader's Tinct account.
//
// Signed in: POST /api/chat with the Supabase access token (metered to the account).
// Signed out: POST /api/lab-chat (guest allowance, Tinct's daily guest spend ceiling).
// Both take Tinct's structured `companion` request; the book text travels as context
// paragraphs, so nothing here needs a catalogue book. Pictures (`opts.images`: Blobs or
// data URLs) go to /api/chat only: each is redrawn as PNG or JPEG of at most 1568 px on
// its long side and sent as image blocks before the question text. Signed out, a call
// with pictures is refused here with `images_unavailable`, and callers fall back to
// captions and labels; the server answers `images_unavailable` / `image_rejected` the same way.
(function () {
  'use strict';
  const PARAGRAPH = 19000;      // server limit 20,000 per paragraph
  const CONTEXT = 190000;       // server limit 200,000 in total
  const MESSAGE = 9500;         // server limit 10,000 per message
  const MAX_MESSAGES = 40;      // server limit 50
  const IMAGE_SIDE = 1568;      // Anthropic's recommended long side
  const IMAGE_BYTES = 1200000;  // server limit 1.5 MB decoded per image; 4 of them stay under 8 MB as base64
  const MAX_IMAGES = 4;         // server limit 4 per request
  const DOCUMENT_CHARS = 560000; // the margin's whole document, about 150k tokens (server: MARGIN_DOCUMENT_CHARS)
  // A long file's search results, each the section a hit falls in (server: MARGIN_PASSAGES, MARGIN_PASSAGE_CHARS, MARGIN_PASSAGES_CHARS).
  const PASSAGES = 6, PASSAGE_CHARS = 16000, PASSAGES_BUDGET = 40000;

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

  // A user's PDF sends its text as pages with their printed labels (`book.pdf`: { pages: [{ n, text }],
  // at: the index of the reader's page among them }), so the companion can cite them ({p. 12}); the
  // Worker marks each page's boundary as <page n="12">. An EPUB in this reader sends its chapters the
  // same way with `kind: 'epub'` (no page citations, no pictures). -> the context's fields, or null.
  function pdfContext(pdf) {
    if (!pdf || !Array.isArray(pdf.pages) || !pdf.pages.length) return null;
    let total = 0;
    const pages = [];
    for (const page of pdf.pages.slice(0, 200)) {
      if (total >= CONTEXT) break;
      const text = String(page?.text || '').slice(0, Math.min(PARAGRAPH, CONTEXT - total));
      total += text.length;
      pages.push({ n: typeof page?.n === 'number' ? page.n : String(page?.n ?? pages.length + 1).slice(0, 16), text: text || ' ' });
    }
    const at = Number.isInteger(pdf.at) ? Math.max(0, Math.min(pages.length - 1, pdf.at)) : 0;
    return { kind: pdf.kind === 'epub' ? 'epub' : 'pdf', pages, paragraphIndex: at };
  }
  function bookContext(book) {
    return {
      bookTitle: (book?.title || 'Your book').slice(0, 300),
      bookAuthor: (book?.author || '').slice(0, 300),
      chapterLabel: (book?.chapter || book?.title || 'Your book').slice(0, 300),
      pageNumber: book?.page && book.page <= 100000 ? book.page : undefined,
      totalPages: book?.pages && book.pages <= 100000 ? book.pages : undefined,
    };
  }

  // The margin's whole file (docs/margin/FIXES-2026-10-15.md A1): { kind: 'pdf' | 'epub', units: [{ n, text }],
  // part?: { toc: [{ title, n }], total }, library?: true }, sent as it is with every margin request so the Worker's cached
  // prefix stays byte for byte the same. -> the request's `document`, or null.
  function documentContext(doc) {
    if (!doc || (doc.kind !== 'pdf' && doc.kind !== 'epub') || !Array.isArray(doc.units) || !doc.units.length) return null;
    let total = 0;
    const units = [];
    for (const unit of doc.units) {
      const text = String(unit?.text || '');
      if ((total += text.length) > DOCUMENT_CHARS) break;
      units.push({ n: typeof unit?.n === 'number' ? unit.n : String(unit?.n ?? units.length + 1).slice(0, 16), text });
    }
    if (!units.length) return null;
    const part = doc.part && Array.isArray(doc.part.toc)
      ? { toc: doc.part.toc.slice(0, 400).map(e => ({ title: String(e?.title || '').slice(0, 200), n: typeof e?.n === 'number' ? e.n : String(e?.n ?? '').slice(0, 16) })), total: Number(doc.part.total) || units.length }
      : null;
    // A book from Tinct's library (the margin preview), not a file of the reader's own: the Worker words its first line so.
    return { kind: doc.kind, units, ...(part ? { part } : {}), ...(doc.library === true ? { library: true } : {}) };
  }

  // A long file's passages found by searching it for the question (FIXES-2026-10-15, long books, item 8):
  // [{ n: printed page label, text }], at most 6 of at most 16,000 characters and 40,000 in all (server: MARGIN_PASSAGES).
  function passagesContext(list) {
    if (!Array.isArray(list)) return null;
    let used = 0;
    const out = list.slice(0, PASSAGES).flatMap(p => {
      const text = String(p?.text || '').replace(/\s+/g, ' ').trim().slice(0, Math.min(PASSAGE_CHARS, PASSAGES_BUDGET - used));
      used += text.length;
      return text ? [{ n: typeof p?.n === 'number' ? p.n : String(p?.n ?? '').slice(0, 16), text }] : [];
    });
    return out.length ? out : null;
  }

  // `input` is a prompt string, or turns [{role, content}] whose first turn carries the
  // instructions and book context (the shape the reader builds). For a PDF (`book.pdf`) the
  // book's text travels as its pages, so the first turn's instructions go before the question.
  // `o.whole`: a PDF question about the whole file (the margin's foot), sent as `scope: 'whole'`.
  function toRequest(input, book, o = {}) {
    let paragraphs, messages;
    const pdf = pdfContext(book?.pdf);
    if (pdf && typeof input !== 'string') {
      const [first, ...rest] = input;
      paragraphs = [];
      messages = [{ role: 'user', content: String(first?.content || '') }, ...(rest.length ? rest : [{ role: 'user', content: 'Please answer.' }])];
    } else if (typeof input === 'string') {
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
      companion: { intent: 'ask', context: pdf
        ? { ...bookContext(book), ...pdf, lookups: false }
        : { ...bookContext(book), paragraphs: paragraphs.length ? paragraphs : [' '], lookups: false }, ...(pdf && o.whole ? { scope: 'whole' } : {}) },
    };
  }
  const PASSAGE_INTENTS = new Set(['simplify', 'factcheck', 'counterpoint', 'quiz', 'related']);

  /**
   * One of the margin's actions as a structured request (docs/margin/PROMPTS.md): the Worker
   * builds the prompt from `intent`, the PDF's pages and the selection; the client never sends
   * one. o: { book, pdf: { pages, at }, selection, senses (define_sense), quiz: { question,
   * expected, why, answer, turns (a reply under the marking: the earlier turns on the question) } (quiz_check), chapter: { action: { kind: 'primer', unitKey, unitTitle } }
   * (Before you start), images (passage actions), document (the whole file; added in send()), stream }.
   * Quiz me on a whole unit is `quiz` without a selection.
   */
  function companionRequest(intent, o = {}) {
    const pdf = pdfContext(o.pdf) || { kind: 'pdf', pages: [{ n: 1, text: ' ' }], paragraphIndex: 0 };
    const companion = { intent, context: { ...bookContext(o.book), ...pdf, lookups: false } };
    if (o.selection != null) companion.selection = String(o.selection).slice(0, intent === 'define_sense' ? 200 : 6000);
    if (intent === 'define_sense') companion.senses = (o.senses || []).slice(0, 3).map(s => String(s).slice(0, 500));
    // Before you start (PROMPTS.md, chapter action `primer`): the unit's pages as context, its key and title as the action.
    if (intent === 'chapter' && o.chapter?.action?.kind === 'primer') companion.chapter = { action: { kind: 'primer', unitKey: String(o.chapter.action.unitKey || ''), unitTitle: String(o.chapter.action.unitTitle || '').slice(0, 300), ...(o.chapter.action.unitKind ? { unitKind: String(o.chapter.action.unitKind) } : {}) } };
    // Made ahead of the reader opening it (reader.js primerPrefetch): never charged to the reader's allowance.
    if (companion.chapter && o.speculative) companion.speculative = true;
    if (intent === 'quiz_check' && o.quiz) companion.quiz = { question: String(o.quiz.question || '').slice(0, 1000), expected: String(o.quiz.expected || '').slice(0, 1000), ...(o.quiz.why ? { why: String(o.quiz.why).slice(0, 1000) } : {}), answer: String(o.quiz.answer || '').slice(0, 2000), ...(o.quiz.thesis ? { thesis: String(o.quiz.thesis).slice(0, 300) } : {}), ...(Array.isArray(o.quiz.ideas) && o.quiz.ideas.length ? { ideas: o.quiz.ideas.slice(0, 8).map(i => String(i).slice(0, 200)) } : {}), ...(o.quiz.idea ? { idea: String(o.quiz.idea).slice(0, 300) } : {}), ...(o.quiz.passage ? { passage: String(o.quiz.passage).slice(0, 4000) } : {}), ...(Array.isArray(o.quiz.turns) && o.quiz.turns.length ? { turns: o.quiz.turns.slice(0, 6).map(t => ({ role: t.role === 'grader' ? 'grader' : 'reader', text: String(t.text || '').slice(0, 600), ...(t.verdict ? { verdict: String(t.verdict) } : {}) })) } : {}) };
    // "Try new questions": the questions asked before on this text, each with its key idea and whether it was missed (Anders, 20 Oct 2026).
    if (intent === 'quiz' && Array.isArray(o.asked) && o.asked.length) companion.asked = o.asked.slice(-24).map(a => ({ q: String(a.q || '').slice(0, 300), ...(a.idea ? { idea: String(a.idea).slice(0, 300) } : {}), ...(a.missed ? { missed: true } : {}) }));
    // The Worker writes the one user turn; a passage action's picture rides on it (withImages).
    return { stream: !!o.stream, max_tokens: 1600, messages: [{ role: 'user', content: PASSAGE_INTENTS.has(intent) ? 'The selected passage.' : 'Please answer.' }], companion };
  }

  // A stream that ends without its message_stop, or whose connection breaks, was dropped
  // (code 'dropped', with the words already shown as `text`): never taken for a whole answer.
  async function readStream(response, onText, signal, onStatus, onChunk) {
    const reader = response.body.getReader(), dec = new TextDecoder();
    let buf = '', text = '', stopped = false;
    for (;;) {
      if (signal?.aborted) { reader.cancel().catch(() => {}); throw err('cancelled', 'cancelled', text ? { text } : undefined) }
      let chunk;
      try { chunk = await reader.read() }
      catch (e) { if (signal?.aborted || e?.name === 'AbortError') throw err('cancelled', 'cancelled', text ? { text } : undefined); throw err('dropped', 'The answer stopped.', text ? { text } : undefined) }
      onChunk?.();
      const { done, value } = chunk;
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let cut;
      while ((cut = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, cut); buf = buf.slice(cut + 2);
        let event = 'message', data = '';
        for (const line of block.split('\n')) { if (line.startsWith('event:')) event = line.slice(6).trim(); else if (line.startsWith('data:')) data += line.slice(5).trim() }
        if (!data) continue;
        let msg; try { msg = JSON.parse(data) } catch { continue }
        // A refusal or a cut-off answer (the Worker's `refusal` and `cut_off` errors) is the card's error
        // state, without the words already shown: they are never kept as an answer.
        if (event === 'error' || msg.type === 'error') { const t = msg.error?.type, whole = t === 'refusal' || t === 'cut_off'; throw err(t === 'overloaded_error' ? 'busy' : t === 'refusal' ? 'refused' : t === 'cut_off' ? 'cut_off' : 'failed', msg.error?.message || 'The answer stopped.', text && !whole ? { text } : undefined) }
        // What the companion is looking up ("Checking sources…"), from the Worker's tinct_status event.
        if (event === 'tinct_status' || msg.type === 'tinct_status') { if (typeof msg.text === 'string') onStatus?.(msg.text); continue }
        if (msg.type === 'content_block_delta' && msg.delta?.type === 'text_delta') { text += msg.delta.text; onText?.({ text, delta: msg.delta.text }) }
        if (msg.type === 'message_stop') stopped = true;
      }
    }
    if (!stopped) throw err('dropped', 'The answer stopped.', text ? { text } : undefined);
    return text;
  }

  // ---- Pictures: any image the browser can decode, redrawn as PNG (JPEG for photos or
  // when PNG is too large), white behind transparency.
  function dataUrlBlob(url) {
    const m = /^data:(image\/[\w.+-]+)(;base64)?,(.*)$/s.exec(url);
    if (!m) throw err('image_rejected', 'That image could not be read.');
    const raw = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], { type: m[1] });
  }
  const canvasBlob = (c, type, quality) => new Promise(res => c.toBlob(res, type, quality));
  const blobBase64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob) });
  async function imageBlock(image) {
    const blob = typeof image === 'string' ? dataUrlBlob(image) : image;
    if (!(blob instanceof Blob)) throw err('image_rejected', 'That image could not be read.');
    let bmp;
    try { bmp = await createImageBitmap(blob) } catch { throw err('image_rejected', 'That image could not be read.') }
    const photo = blob.type === 'image/jpeg';
    let scale = Math.min(1, IMAGE_SIDE / Math.max(bmp.width, bmp.height));
    const tries = photo ? [['image/jpeg', 0.88], ['image/jpeg', 0.75]] : [['image/png'], ['image/jpeg', 0.9], ['image/jpeg', 0.75]];
    for (let round = 0; round < 3; round++, scale *= 0.7) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * scale)); c.height = Math.max(1, Math.round(bmp.height * scale));
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
      for (const [type, quality] of tries) {
        const out = await canvasBlob(c, type, quality);
        if (out && out.size <= IMAGE_BYTES) { bmp.close?.(); return { type: 'image', source: { type: 'base64', media_type: type, data: await blobBase64(out) } } }
      }
    }
    bmp.close?.();
    throw err('image_rejected', 'That image is too large.');
  }
  // The last turn becomes [images..., question]; earlier turns stay text.
  async function withImages(request, images) {
    const blocks = [];
    for (const image of images.slice(0, MAX_IMAGES)) blocks.push(await imageBlock(image));
    const last = request.messages.at(-1);
    last.content = [...blocks, { type: 'text', text: String(last.content || 'Please answer.') }];
    return request;
  }

  // Tinct's own testing (?internal=1, public/lab/internal-traffic.js) labels its AI calls so the
  // Worker's cost log stores them under its `check` key. Read here directly: this is a classic script.
  function internalHeaders() {
    try { return localStorage.getItem('tinct:internal') === '1' ? { 'x-tinct-check': '1' } : {} } catch { return {} }
  }

  const STATUS = { 400: 'bad_request', 401: 'session_expired', 402: 'quota', 403: 'not_granted', 413: 'prompt_too_large', 429: 'rate_limited', 503: 'busy' };

  // ask(input, { onText, onStatus, signal, images, book, whole }) -> { text }
  async function ask(input, opts = {}) {
    return send(toRequest(input, opts.book, opts), opts);
  }
  // companion(intent, { book, pdf, selection, senses, quiz, images, stream, onText, onStatus, signal }) -> { text }
  async function companion(intent, opts = {}) {
    return send(companionRequest(intent, opts), opts);
  }
  // One automatic retry (retest after train 2: 7 of about 70 actions showed "could not be loaded",
  // 502 /api/chat): on a 502, or a stream that failed or dropped, and only while nothing of the
  // answer has been shown. The retry carries x-tinct-retry so the Worker's failure log can tell.
  // A failed or cut-off answer is never charged, so a retry never charges twice; refusals, cut-offs,
  // limits, sign-in and bad requests are never retried. `opts.retry: false` turns it off (the primer
  // keeps its own retry).
  const RETRY_DELAY_MS = 400;
  const RETRY_STATUS = new Set([502]);
  const RETRY_STREAM = new Set(['failed', 'busy', 'dropped']);
  async function send(request, opts) {
    let shown = false;
    const onText = opts.onText ? (e => { if (e?.text) shown = true; opts.onText(e) }) : (e => { if (e?.text) shown = true });
    const once = retried => sendOnce(request, { ...opts, onText }, retried);
    try { return await once(false) }
    catch (e) {
      const again = opts.retry !== false && !shown && !opts.signal?.aborted && (e?.retryable || (e?.streamed && RETRY_STREAM.has(e.code)));
      if (!again) throw e;
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      if (opts.signal?.aborted) throw err('cancelled');
      return once(true);
    }
  }
  /**
   * No answer waits for ever (Anders, 16 Oct: cards kept the wait ring for minutes). A request whose reply
   * has sent nothing for IDLE_MS (its headers, or the next piece of a stream) is stopped and fails as
   * `timeout`, which the card shows with its error line; the reader's own cancel stays `cancelled`.
   */
  const IDLE_MS = 120000;
  async function sendOnce(request, outer, retried) {
    const link = new AbortController();
    let timedOut = false, idle = null;
    const kick = () => { clearTimeout(idle); idle = setTimeout(() => { timedOut = true; link.abort() }, api.IDLE_MS) };
    const stop = () => link.abort();
    if (outer.signal?.aborted) link.abort(); else outer.signal?.addEventListener('abort', stop, { once: true });
    kick();
    try { return await sendLinked(request, { ...outer, signal: link.signal, onChunk: kick }, retried) }
    catch (e) {
      if (timedOut && !outer.signal?.aborted) throw err('timeout', 'The answer took too long.', e?.text ? { text: e.text } : undefined);
      throw e;
    }
    finally { clearTimeout(idle); outer.signal?.removeEventListener('abort', stop) }
  }
  async function sendLinked(request, opts, retried) {
    const images = opts.images ? [].concat(opts.images).filter(Boolean) : [];
    const doc = request.companion ? documentContext(opts.document) : null;
    if (doc) request.companion.document = doc;
    // A long file's search results for the question (reader.js searchPassages): after the cached prefix, so never with a whole file.
    const found = doc?.part ? passagesContext(opts.passages) : null;
    if (found) request.companion.passages = found;
    let s = session();
    if (images.length && !s.token) throw err('images_unavailable', 'Sign in to send pictures to the companion.');
    const body = JSON.stringify(images.length ? await withImages(request, images) : request);
    const attempt = async token => fetch(token ? '/api/chat' : '/api/lab-chat', {
      method: 'POST', signal: opts.signal, credentials: 'same-origin',
      headers: Object.assign({ 'Content-Type': 'application/json' }, internalHeaders(), token ? { Authorization: 'Bearer ' + token } : {}, retried ? { 'x-tinct-retry': '1' } : {}),
      body,
    });
    let response;
    try { response = await attempt(s.token) } catch (e) { if (e?.name === 'AbortError') throw err('cancelled'); throw err('offline', 'No connection.') }
    // An expired sign-in falls back to the guest allowance rather than failing outright.
    if (response.status === 401 && s.token) {
      // A request made ahead (speculative) never falls back to the guest allowance: it simply is not made.
      if (request.companion?.speculative) throw err('session_expired', 'HTTP 401');
      api.onSignedOut?.();
      if (images.length) throw err('images_unavailable', 'Sign in to send pictures to the companion.');
      try { response = await attempt(null) } catch (e) { if (e?.name === 'AbortError') throw err('cancelled'); throw err('offline') }
    }
    if (!response.ok) {
      let detail = ''; try { detail = (await response.json())?.error || '' } catch {}
      if (detail?.type === 'refusal') throw err('refused', 'refused');
      if (detail?.type === 'cut_off') throw err('cut_off', 'cut_off');
      if (response.status === 400 && (detail === 'images_unavailable' || detail === 'image_rejected')) throw err(detail, detail);
      throw err(STATUS[response.status] || 'failed', detail || 'HTTP ' + response.status, RETRY_STATUS.has(response.status) ? { retryable: true } : undefined);
    }
    const type = response.headers.get('content-type') || '';
    if (type.includes('text/event-stream')) {
      opts.onChunk?.();
      try { return { text: await readStream(response, opts.onText, opts.signal, opts.onStatus, opts.onChunk) } }
      catch (e) { if (e?.name === 'AbortError') throw err('cancelled'); if (e && typeof e === 'object') e.streamed = true; throw e }
    }
    let json;
    try { json = await response.json() } catch { throw err('dropped', 'The answer stopped.', { retryable: true }) }
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

  // ---- Your own books in your Tinct account (signed in only): /api/user-books.
  // A private copy per account, so a book opens on the reader's other devices. The
  // server checks the file type from its bytes and caps size, count and upload rate.
  const BOOK_BYTES = 50 * 1024 * 1024; // server limit per file
  async function booksFetch(path, init = {}) {
    const s = session();
    if (!s.token) throw err('signed_out');
    let r;
    try { r = await fetch('/api/user-books' + path, Object.assign({}, init, { credentials: 'same-origin', cache: 'no-store', headers: Object.assign({ Authorization: 'Bearer ' + s.token }, init.headers || {}) })) }
    catch { throw err('offline') }
    if (r.ok) return r;
    let detail = ''; try { detail = (await r.json())?.error || '' } catch {}
    throw err(r.status === 404 ? 'not_found' : detail || STATUS[r.status] || 'failed', detail || 'HTTP ' + r.status, { status: r.status });
  }
  const books = {
    maxBytes: BOOK_BYTES,
    // -> [{ id, name, title, author, type: 'pdf'|'epub', size, sha256, createdAt, cover: URL of its stored cover | null }]
    async list() { return (await (await booksFetch('')).json()).books || [] },
    // `file`: a Blob or File. -> the stored record (the same one when this account already has the file).
    async upload(file, meta = {}) {
      if (file.size > BOOK_BYTES) throw err('file_too_large');
      const enc = v => encodeURIComponent(String(v || '').slice(0, 300));
      const r = await booksFetch('', { method: 'POST', body: file, headers: {
        'Content-Type': meta.kind === 'epub' ? 'application/epub+zip' : 'application/pdf',
        'X-Book-Name': enc(meta.name), 'X-Book-Title': enc(meta.title), 'X-Book-Author': enc(meta.author),
        // The rights confirmation this account gave ({ at, v }), kept with the file.
        ...(meta.rights?.v ? { 'X-Rights-Version': enc(meta.rights.v), 'X-Rights-At': enc(meta.rights.at) } : {}),
      } });
      return (await r.json()).book;
    },
    async download(id) { return new Uint8Array(await (await booksFetch('/' + encodeURIComponent(id))).arrayBuffer()) },
    // The small copy of a book's cover (a JPEG or WebP Blob under 64 KB), kept with its account copy.
    // `hex`: the first 24 hex digits of the file's SHA-256. -> the stored cover's URL.
    async putCover(hex, image) {
      if (!/^[0-9a-f]{24}$/.test(String(hex)) || !(image instanceof Blob) || image.size > 64 * 1024) throw err('bad_request');
      return (await (await booksFetch('/covers/' + hex, { method: 'PUT', body: image, headers: { 'Content-Type': image.type || 'image/jpeg' } })).json()).cover || null;
    },
    async remove(id) {
      try { await booksFetch('/' + encodeURIComponent(id), { method: 'DELETE' }) }
      catch (e) { if (e.code !== 'not_found') throw e }
    },
  };

  // What the reader may attach: anything the browser decodes; it is redrawn before sending.
  const imageLimits = { maxCount: MAX_IMAGES, maxInputBytes: 40 * 1024 * 1024, mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp', 'image/avif'] };
  const api = { session, ask, askJson, companion, toRequest, companionRequest, documentContext, passagesContext, DOCUMENT_CHARS, PASSAGE_CHARS, PASSAGES_BUDGET, imageLimits, books, onSignedOut: null, IDLE_MS };
  window.TinctAI = api;
})();
