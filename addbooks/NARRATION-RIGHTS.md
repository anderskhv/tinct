# Generated narration of Add imports

Engineering policy, checked 2026-10-01. Like [the Danish text policy](DANISH-RIGHTS.md),
this is a conservative admission rule, not legal advice or a lawyer's clearance.

## Why a separate record

The Danish text review clears an exact edition's **text** (`scope: original-text-only`).
It never permits audio. Narration of an Add import is permitted only by its own record in
`app/src/addbooks/narrationRights.json`, checked by `importNarrationCleared()` in the reader
(`LabApp`) **and** in the Worker (`/api/narration/ensure` and `/chapter`). Any `pd-<n>` book,
or any book with an Add rights record, without a cleared narration record is refused with
403 before text is loaded, a spend reservation is made or a provider is called.

A cleared record must name: the exact book/edition; the provider (`grok`), model and the
permitted stock voices; territories; the provider's output terms; a disclosure; evidence; and
the **same edition SHA-256** as a still-eligible text review. Changing or revoking the text
review, the provider, a voice or the edition hash disables narration on the next build.

## The Time Machine, original English (`pd-35/original-en`) — cleared under policy

| Question | Finding |
| --- | --- |
| Underlying work | Recording a work and making the recording available are the author's economic rights (Danish Copyright Act §2). They expired with the text term: Wells died 1946, so the ordinary term ended 2016-12-31. The narrator speaks only the reviewed, hash-pinned converted text (no introduction, notes, translation or illustrations). |
| Source edition | The Gutenberg licence, header and trademark text are removed during conversion. Gutenberg's licence states that stripped text is a public-domain ebook. The audio contains no Gutenberg material and does not use the trademark. |
| Performers | No human performance is recorded. Synthetic stock voices (Ara, Helios, Orion, Eve) are used under the provider agreement; no custom or cloned voice. |
| Provider terms | [xAI Terms of Service – Enterprise](https://x.ai/legal/terms-of-service-enterprise): Output is assigned to the customer. Restrictions: do not use Output to train AI models; do not misrepresent Output as human-generated. Checked via a search-index excerpt of the published terms; a direct fetch was refused (HTTP 403). These are the terms already relied on for all production Grok narration. |
| Disclosure | The Add card says Listen uses computer-generated narration prepared only when you press play. |
| Territory | DK, matching the text review. Not a worldwide determination. (The 1895 US publication and the UK life+70 term point the same way, but they are not recorded here as reviewed.) |
| Excluded | Other editions, translations or added material; human or third-party audiobooks; custom/cloned voices; downloadable/exported audio; training use; other territories. |

## Spend

Generation follows the existing narration contract unchanged: only after explicit Play by a
**signed-in** reader; guests play cached audio only; a rolling buffer during playback; pause,
leave and voice/edition changes stop scheduling; content-addressed cache shared by everyone;
per-identity Durable Object lease; and the global Durable Object byte reservation against the
configured daily (2,000,000 bytes ≈ $30) and monthly (10,000,000 bytes ≈ $150) ceilings.

Full-book cost estimate at $15 per million characters: 178,101 narration characters
(179,873 UTF-8 bytes) ≈ **$2.67 per voice**, ≈ $10.70 if all four voices were narrated
end to end. Nothing is prepared in advance. Rapid forward seeks through uncached text
prepare each seek target, as for catalogue books.

No paid provider call was made for this pilot. Verification used a local Worker against a
mock xAI endpoint (`addbooks/scripts/narration-mock-server.mjs`).

## Expansion checklist

1. A new Add import needs both a text review and its own narration record.
2. Re-check the provider's current terms (directly, not via an excerpt) before adding a provider,
   voice or territory, and record the date and method.
3. Translations, added material or human recordings need separate rights records.
4. Have counsel review both policies before a broad commercial catalogue.
