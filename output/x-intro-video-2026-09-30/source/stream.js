(() => {
  const of = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.includes('/api/lab-chat')) {
      let ctl; const enc = new TextEncoder();
      const stream = new ReadableStream({ start(c) { ctl = c; } });
      window.__stream = {
        push(t) { ctl.enqueue(enc.encode('data: ' + JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: t } }) + '\n\n')); },
        end() { ctl.enqueue(enc.encode('data: ' + JSON.stringify({ type: 'message_delta', delta: { stop_reason: 'end_turn' } }) + '\n\n')); ctl.enqueue(enc.encode('data: {"type":"message_stop"}\n\n')); ctl.close(); },
      };
      window.__streamOpened = (window.__streamOpened || 0) + 1;
      return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
    }
    return of(input, init);
  };
})();
