export function htmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title} — Tinct</title>
<style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f5f0;color:#2a2a2a}
.card{background:#fff;padding:40px 48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;max-width:400px}
h1{font-size:1.3rem;margin:0 0 12px}p{font-size:0.95rem;color:#666;line-height:1.5;margin:0}</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`
}
