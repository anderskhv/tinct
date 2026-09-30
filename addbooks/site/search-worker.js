import {createSearch} from './search.js';
let search;
self.onmessage = async ({data}) => {
  try {
    if (data.type === 'load') {
      const response = await fetch('./data/index.json.gz');
      if (!response.ok) throw new Error('Build the catalog with addbooks/scripts/build-index, then reload.');
      let catalog;
      if ('DecompressionStream' in self) {
        catalog = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json();
      } else {
        const raw = await fetch('./data/index.json');
        if (!raw.ok) throw new Error('This browser needs the uncompressed catalog.');
        catalog = await raw.json();
      }
      search = createSearch(catalog.works);
      const languages = new Map(), subjects = new Map();
      for (const w of catalog.works) {
        for (const lang of w.language) languages.set(lang, (languages.get(lang) || 0) + 1);
        for (const subject of new Set([...w.bookshelves, ...w.subjects])) subjects.set(subject, (subjects.get(subject) || 0) + 1);
      }
      self.postMessage({type: 'ready', total: catalog.works.length, coverage: catalog.coverage,
        languages: [...languages].sort((a,b) => b[1] - a[1]),
        // Bookshelves provide concise browse categories; all LCSH terms remain searchable.
        subjects: [...subjects].filter(([s,n]) => s.startsWith('Category: ') || n >= 150).sort((a,b) => a[0].localeCompare(b[0]))});
    } else if (search && data.type === 'search') {
      self.postMessage({type: 'results', request: data.request, ...search(data.query, data.filters, data.limit)});
    }
  } catch (error) {
    self.postMessage({type: 'error', message: error.message});
  }
};
