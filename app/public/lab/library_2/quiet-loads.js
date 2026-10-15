// Optional downloads that make way for a book being opened (phone QA, 2026-10-15).
// After the landing page settles, the library warms the other featured books' scenes,
// sketches and hero covers (~2 MB). On a slow phone those were still downloading when a
// guest tapped the hero book, and the book's own cover, introduction and author flap
// waited behind them (9.5 s to the overlay at 3 Mbps). While a book opens, `hold()`
// stops the optional loads in flight and keeps new ones waiting; releasing the hold
// starts them again from where the page needs them (the browser's cache keeps whatever
// had arrived).
//
// run(key, task): task(signal) starts a download and returns a promise of it; it must
// stop the download when `signal` aborts. Called while held, it waits for the release.
// hold(): returns its own release; holds nest, and the last release resumes the loads.
export function createQuietLoads() {
  let holds = 0;
  const waiting = new Map(), running = new Map();
  const start = (key, task) => {
    const controller = new AbortController();
    running.set(key, { controller, task });
    let done;
    try { done = Promise.resolve(task(controller.signal)); } catch (error) { done = Promise.reject(error); }
    done.catch(() => {}).finally(() => { if (running.get(key)?.controller === controller) running.delete(key); });
  };
  return {
    run(key, task) {
      if (running.has(key) || waiting.has(key)) return;
      if (holds) waiting.set(key, task); else start(key, task);
    },
    hold() {
      holds++;
      if (holds === 1) for (const [key, { controller, task }] of [...running]) { running.delete(key); waiting.set(key, task); controller.abort(); }
      let released = false;
      return () => {
        if (released) return;
        released = true;
        if (--holds) return;
        const resumed = [...waiting];
        waiting.clear();
        for (const [key, task] of resumed) start(key, task);
      };
    },
    get held() { return holds > 0; },
    get pending() { return [...waiting.keys()]; },
    get active() { return [...running.keys()]; },
  };
}

/**
 * Stops an image's download when `signal` aborts, unless `kept()` says something on
 * screen has come to need it meanwhile. No signal: the image is needed, never stopped.
 * Returns a promise that rejects when the image was stopped (a stopped image's decode()
 * may never settle), else never settles: race it with the image's own load.
 */
export function stopOnAbort(image, signal, kept = () => false) {
  return new Promise((_, reject) => {
    if (!signal) return;
    const stop = () => { if (kept()) return; image.removeAttribute('src'); reject(new DOMException('Stopped for an opening book', 'AbortError')); };
    if (signal.aborted) stop(); else signal.addEventListener('abort', stop, { once: true });
  });
}
