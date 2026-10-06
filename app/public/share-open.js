// /q/{id}: people go straight to the passage in the reader; link-preview
// crawlers (which run no script) read this page's OG/Twitter meta instead.
(function () {
  var href = document.body && document.body.getAttribute('data-reader');
  if (!href || href.indexOf('/reader?') !== 0) return;
  var ref = '';
  try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { ref = ''; }
  try {
    var share = new URLSearchParams(href.split('?')[1]).get('share');
    if (share) sessionStorage.setItem('tinct:share-arrival', share);
  } catch (e) { /* attribution only */ }
  // Tinct's own testing (?internal=1|0 on the /q link) carries through to the reader,
  // which applies and strips it (public/lab/internal-traffic.js).
  var internal = '';
  try { internal = new URLSearchParams(location.search).get('internal') || ''; } catch (e) { internal = ''; }
  if (internal !== '1' && internal !== '0') internal = '';
  location.replace(href + (ref ? '&ref=' + encodeURIComponent(ref) : '') + (internal ? '&internal=' + internal : ''));
})();
