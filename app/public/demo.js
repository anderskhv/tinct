(function () {
  var STEP_ORDER = ['read', 'compare', 'cast', 'audio'];
  var STEP_INTERVAL_MS = 7000;

  var features = document.querySelectorAll('.demo-feature');
  var stage = document.getElementById('demo-feature-stage');
  var dotButtons = document.querySelectorAll('.demo-progress-button');
  var controls = document.getElementById('demo-controls');
  var iframe = document.querySelector('.demo-phone-screen iframe');
  if (!stage || !features.length) return;

  var currentStepId = 'read';
  var isPaused = false;
  var timerId = null;

  function updateIframeScale() {
    if (!iframe) return;
    var screen = iframe.parentElement;
    if (!screen) return;
    var w = screen.clientWidth;
    if (w > 0) iframe.style.transform = 'scale(' + (w / 390) + ')';
  }
  updateIframeScale();
  window.addEventListener('resize', updateIframeScale);
  window.addEventListener('load', updateIframeScale);

  function send(msg) {
    if (!iframe || !iframe.contentWindow) return;
    try { iframe.contentWindow.postMessage(msg, '*'); } catch (e) {}
  }

  function setActive(stepId) {
    if (!stepId) return;
    currentStepId = stepId;
    stage.setAttribute('data-active', stepId);
    features.forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-step') === stepId);
    });
    dotButtons.forEach(function (btn) {
      var dot = btn.querySelector('.demo-progress-dot');
      if (dot) dot.classList.toggle('is-active', btn.getAttribute('data-jump') === stepId);
    });
    send({ type: 'tinct:tour-jump', stepId: stepId });
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(advance, STEP_INTERVAL_MS);
  }
  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }
  function advance() {
    var idx = STEP_ORDER.indexOf(currentStepId);
    if (idx < 0) idx = 0;
    setActive(STEP_ORDER[(idx + 1) % STEP_ORDER.length]);
  }

  function setPausedUI(paused) {
    isPaused = paused;
    var iconPause = document.getElementById('demo-icon-pause');
    var iconPlay = document.getElementById('demo-icon-play');
    if (iconPause && iconPlay) {
      iconPause.style.display = paused ? 'none' : 'block';
      iconPlay.style.display = paused ? 'block' : 'none';
    }
    var btn = document.querySelector('[data-control="playpause"]');
    if (btn) btn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  }

  function jumpTo(stepId) {
    if (!stepId) return;
    setActive(stepId);
    if (!isPaused) startTimer();
  }

  setActive('read');
  startTimer();

  window.addEventListener('message', function (e) {
    var data = e && e.data;
    if (!data || data.type !== 'tinct:tour-ready') return;
    send({ type: 'tinct:tour-jump', stepId: currentStepId });
  });

  dotButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      jumpTo(btn.getAttribute('data-jump'));
    });
  });

  if (controls) {
    controls.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-control]');
      if (!btn) return;
      var control = btn.getAttribute('data-control');
      if (control === 'playpause') {
        if (isPaused) { setPausedUI(false); startTimer(); }
        else { setPausedUI(true); stopTimer(); }
        return;
      }
      var idx = STEP_ORDER.indexOf(currentStepId);
      if (idx < 0) idx = 0;
      var nextIdx;
      if (control === 'prev') nextIdx = (idx - 1 + STEP_ORDER.length) % STEP_ORDER.length;
      else if (control === 'next') nextIdx = (idx + 1) % STEP_ORDER.length;
      else return;
      jumpTo(STEP_ORDER[nextIdx]);
    });
  }
})();
