(function () {
  const paths = {
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-left-right': '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-up': '<path d="m18 15-6-6-6 6"/>',
    'audio-lines': '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>',
    'check': '<path d="m20 6-11 11-5-5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'glasses': '<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M10 15h4"/><path d="m2 15 2-8h3"/><path d="m22 15-2-8h-3"/>',
    'headphones': '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v6a2 2 0 0 0 2 2h2v-8H4Z"/><path d="M20 13v6a2 2 0 0 1-2 2h-2v-8h4Z"/>',
    'message-circle': '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 21 15Z"/>',
    'mic': '<rect width="6" height="12" x="9" y="2" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/>',
    'mic-off': '<path d="m2 2 20 20"/><path d="M9 9v1a3 3 0 0 0 5.1 2.1"/><path d="M15 5v5"/><path d="M5 10a7 7 0 0 0 12 4.9"/><path d="M19 10a7 7 0 0 1-.1 1.2"/><path d="M12 19v3"/>',
    'phone-off': '<path d="M10.7 13.3a16 16 0 0 0 3 2l2-2a2 2 0 0 1 2-.5l3.2 1a2 2 0 0 1 1.4 1.9v3.2a2 2 0 0 1-2.2 2A19 19 0 0 1 3.2 4a2 2 0 0 1 2-2.2h3.1a2 2 0 0 1 2 1.4l1 3.2a2 2 0 0 1-.5 2L9 10.2"/><path d="m2 2 20 20"/>',
    'scan-search': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="11" cy="11" r="3"/><path d="m16 16-2.2-2.2"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    'sparkles': '<path d="m12 3-1.8 4.2L6 9l4.2 1.8L12 15l1.8-4.2L18 9l-4.2-1.8Z"/><path d="m19 15-.9 2.1L16 18l2.1.9L19 21l.9-2.1L22 18l-2.1-.9Z"/><path d="m5 2-.9 2.1L2 5l2.1.9L5 8l.9-2.1L8 5l-2.1-.9Z"/>',
    'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };

  function createIcons() {
    document.querySelectorAll('i[data-lucide]').forEach(function (icon) {
      const name = icon.getAttribute('data-lucide');
      const body = paths[name];
      if (!body) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = body;
      icon.replaceWith(svg);
    });
  }

  window.lucide = { createIcons: createIcons };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createIcons, { once: true });
  } else {
    createIcons();
  }
})();
