// Keep the first HTML cover in the same position as the interactive cover; a first visit shows the featured
// painting (its 960 px copy) at once; a returning reader's remembered desk (boot.js deskPlaceholder) is drawn
// into the hero as soon as the hero and the book overlay are parsed, before the rest of the page.
window.__library2Layout();if(window.__library2Boot&&!window.__library2Boot.hint&&!window.__library2Boot.book)document.getElementById("hero-cover-preview").src="assets/covers/frankenstein-960.webp";
try{window.__library2Boot?.desk?.paint(document.getElementById("hero"));}catch{}
