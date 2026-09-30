// Filmed loops of the wide paintings (desktop only). Each loop was composited
// onto its exact painting, so frame and poster share one pixel grid; the hero
// canvas draws the frames through the painting's own crop. That keeps the
// table shadows, scene cross-fades and colour grade painted over the film, and
// the still painting remains underneath until the first frame is playing.
// The <video> element sits beneath the opaque canvas purely as the decoder.
export const SCENE_VIDEO_FADE = 1200;
const FILMED = new Set(['frankenstein', 'meditations', 'the-prince', 'crime-and-punishment', 'odyssey', 'pride-and-prejudice', 'table-morning', 'table-afternoon', 'table-evening', 'table-night']);

// Named after the wide poster JPG it animates.
export function sceneVideoSrc(id) {
  if (!FILMED.has(id)) return null;
  const poster = id === 'frankenstein' ? 'room-wide-v2' : id.startsWith('table-') ? `${id}-wide` : `scene-${id}-wide`;
  return `assets/scenes/${poster}.mp4`;
}

// `wide` is the same test the canvas and scene-life use (hero w/h > 1.2 with
// the wide painting loaded). Phones, tablets, reduced motion, e-ink and
// Save-Data keep the still painting and never download a byte of film.
// Browsers without H.264 (some Linux Chromium/Firefox builds) keep the still.
export function sceneVideoAllowed({ wide, width, finePointer, reducedMotion, eink, saveData, h264 = true }) {
  return !!wide && width >= 900 && !!finePointer && !reducedMotion && !eink && !saveData && !!h264;
}

export function sceneVideoAlpha(startedAt, now) {
  if (!startedAt) return 0;
  const t = Math.min(1, Math.max(0, (now - startedAt) / SCENE_VIDEO_FADE));
  return t * t * (3 - 2 * t);
}

export function mountSceneVideo(host, before) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const idle = fn => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 250));
  const h264 = !!document.createElement('video').canPlayType?.('video/mp4; codecs="avc1.640028"');
  const failed = new Set();
  let video = null, id = null, startedAt = 0, want = null, timer = 0, onScreen = true;
  let loaded = document.readyState === 'complete';
  if (!loaded) addEventListener('load', () => { loaded = true; }, { once: true });

  const allowed = wide => sceneVideoAllowed({
    wide, width: innerWidth, finePointer: fine.matches, reducedMotion: motion.matches,
    eink: document.documentElement.dataset.eink === 'true', saveData: !!navigator.connection?.saveData, h264,
  });
  const pause = () => { if (video && !video.paused) video.pause(); };
  const cancel = () => { clearTimeout(timer); timer = 0; want = null; };
  // Release the element and its buffered bytes; the painting is untouched.
  const drop = () => {
    cancel();
    if (!video) return;
    video.pause(); video.removeAttribute('src'); video.load(); video.remove();
    video = null; id = null; startedAt = 0;
  };
  const element = () => {
    if (video) return video;
    const v = document.createElement('video');
    v.className = 'scene-video';
    v.muted = v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.disablePictureInPicture = true;
    for (const name of ['muted', 'loop', 'playsinline', 'disablepictureinpicture']) v.setAttribute(name, '');
    v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    v.addEventListener('playing', () => { if (!startedAt) startedAt = performance.now(); v.dataset.state = 'playing'; });
    v.addEventListener('error', () => { if (id) failed.add(id); drop(); });
    host.insertBefore(v, before || null);
    return video = v;
  };
  const load = target => {
    const v = element();
    id = target; startedAt = 0; delete v.dataset.state;
    v.dataset.scene = target; v.src = sceneVideoSrc(target);
    v.play().catch(() => {});
  };
  // Nothing is requested until the page has loaded and the browser is idle;
  // a scene change also waits for the painting cross-fade to finish.
  const schedule = target => {
    if (want === target) return;
    cancel(); want = target;
    const go = () => idle(() => { if (want === target) { want = null; load(target); } });
    timer = setTimeout(() => { timer = 0; if (loaded) go(); else addEventListener('load', go, { once: true }); }, id ? 800 : 0);
  };

  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(entries => {
      onScreen = entries.at(-1).isIntersecting;
      if (!onScreen) pause();
    }).observe(host);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  return {
    // Called with the scene currently on screen, every time the canvas paints.
    sync(target, wide) {
      if (!allowed(wide)) return drop();
      if (!sceneVideoSrc(target) || failed.has(target)) { cancel(); return pause(); }
      if (document.hidden || !onScreen) return pause();
      if (id !== target) { pause(); return schedule(target); }
      cancel();
      if (video.paused) video.play().catch(() => {});
    },
    // The film for this scene, once it has a playing frame, with its fade-in.
    // A paused film keeps its last frame, so a cross-fade away stays seamless.
    frame(target, now = performance.now()) {
      if (!video || id !== target || !startedAt || video.readyState < 2) return null;
      return { video, alpha: sceneVideoAlpha(startedAt, now) };
    },
  };
}
