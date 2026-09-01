(function () {
  function signedInRedirectCheck() {
    try {
      var cookies = (document.cookie || '').split(';')
      for (var c = 0; c < cookies.length; c++) {
        if (cookies[c].trim() === 'tinct_auth=1') {
          window.location.replace('/app')
          return true
        }
      }
    } catch (error) { /* Cookies unavailable. Continue with local storage. */ }

    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i)
        if (!key || key.indexOf('sb-') !== 0 || !/-auth-token(\.\d+)?$/.test(key)) continue
        var raw = localStorage.getItem(key)
        if (!raw || raw === 'null' || raw === '""') continue
        window.location.replace('/app')
        return true
      }
    } catch (error) { /* Storage unavailable. Show the signed-out landing. */ }

    document.documentElement.style.visibility = ''
    return false
  }

  signedInRedirectCheck()

  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return
    document.documentElement.style.visibility = 'hidden'
    signedInRedirectCheck()
  })

  window.addEventListener('DOMContentLoaded', function () {
    var panels = document.querySelectorAll('[data-demo-panel]')
    var dots = document.querySelectorAll('[data-demo-dot]')
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = dot.getAttribute('data-demo-dot')
        panels.forEach(function (panel) {
          panel.classList.toggle('is-current', panel.getAttribute('data-demo-panel') === target)
        })
        dots.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === dot))
        })
      })
    })
  })
})()
