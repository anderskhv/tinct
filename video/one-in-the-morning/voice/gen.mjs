import fs from 'node:fs/promises';
const lines = JSON.parse(await fs.readFile(new URL('./lines.json', import.meta.url)));
const report = [];
for (const l of lines) {
  const r = await fetch('https://api.x.ai/v1/tts', { method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.XAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: l.text, voice_id: l.voice, language: 'en', text_normalization: true,
      output_format: { codec: 'mp3', sample_rate: 24000, bit_rate: 128000 }, speed: 1 }) });
  if (r.status !== 200) { console.log(l.id, 'HTTP', r.status, (await r.text()).slice(0, 200)); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.writeFile(new URL(`./${l.id}.mp3`, import.meta.url), buf);
  report.push({ id: l.id, voice: l.voice, bytes: buf.length });
}
console.log(JSON.stringify(report));
