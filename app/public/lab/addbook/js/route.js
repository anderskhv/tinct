'use strict';
// Add a book is no longer a page of its own (owner, 2026-10-08): your own books live on the
// library's My shelf ("My private uploads"), and its + adds one in place. This page stays only
// as the PDF reader: /lab/addbook/?userBook=<hex> (or an older ?open=<key>) opens one kept
// book, and an older ?mode=file&handoff=1 link still takes its handed-over file. Everything
// else goes to My shelf before the page draws.
(function () {
  const params = new URLSearchParams(location.search);
  if (params.has('userBook') || params.has('open') || params.has('handoff')) { document.documentElement.dataset.route = 'reader'; return }
  location.replace('/library#my-shelf');
})();
