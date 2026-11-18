/*
 * The Try page's first script (before anything renders): a signed-in reader never sees it and goes to the app,
 * as landing.html sends them (`/app`, the library). The Worker already redirects the `tinct_auth=1` cookie; this
 * covers a session kept only in the browser. Same permissive test as landing.html: any non-empty Supabase
 * auth-token key counts.
 */
(function () {
  var root = document.documentElement
  root.style.visibility = 'hidden'
  function check() {
    try {
      var cookies = (document.cookie || '').split(';')
      for (var c = 0; c < cookies.length; c++) {
        if (cookies[c].trim() === 'tinct_auth=1') { location.replace('/app'); return }
      }
    } catch (e) { /* no cookies */ }
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i)
        if (!key || key.indexOf('sb-') !== 0 || !/-auth-token(\.\d+)?$/.test(key)) continue
        var raw = localStorage.getItem(key)
        if (!raw || raw === 'null' || raw === '""') continue
        location.replace('/app')
        return
      }
    } catch (e) { /* storage unavailable */ }
    root.style.visibility = ''
  }
  check()
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) { root.style.visibility = 'hidden'; check() }
  })
})()
