// Back from Google through the Worker (/sign-in?callback=google#code=…): the page says "Signing you in…"
// from its first paint while the code is exchanged, never the sign-in form (Anders, 9 Nov 2026: the form
// flashed before the profile step). A classic script in the head, so it runs before the body paints; the
// production CSP allows no inline script. labSignIn.ts takes the mark off when it shows the next screen
// (the profile step, the welcome, or the form with a notice); a page that goes on to the reader keeps it.
(function () {
  var html = document.documentElement;
  if (!/[?&]callback=google(?:&|$)/.test(location.search)) return;
  html.setAttribute('data-sign-in-busy', 'google');
  // Never stuck: if the runtime has not taken over by then, the form comes back (still busy while it works).
  setTimeout(function () {
    var root = document.getElementById('tinct-lab-sign-in');
    if (html.getAttribute('data-sign-in-busy') === 'google' && !(root && root.getAttribute('data-ready') === 'true')) html.removeAttribute('data-sign-in-busy');
  }, 30000);
})();
