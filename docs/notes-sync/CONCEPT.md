# Your notes: Tinct and Obsidian, read and write (concept, 20 October 2026)

Asked for by Anders: connect Obsidian and similar tools both ways, so the companion knows what the reader already knows and what interests them. Mockups: https://claude.ai/artifact/Q8SPLYDsXaY2oTQGL65xqs (boards 1–6).

Status: a concept for Anders to approve. Nothing is built. It needs a schema change, a privacy-policy update and new AI spend, so all three are escalations.

## The idea in one line

Tinct writes your reading into your notes, and reads the notes you choose, so the companion can say "you wrote about this in March" and build on what you know instead of explaining it from zero.

## Write: from Tinct into your vault

- **One note per book** in a folder Tinct owns (default `Tinct/Books/`), plus a `Reading log`.
- **Each book note holds:**
  - front matter (book, author as a [[link]], status, progress, dates, tags);
  - Where I am (the recap);
  - your highlights, each with a block id and an "Open in Tinct" link to the exact paragraph;
  - your notes under each highlight;
  - the journal;
  - optionally, summaries of your chats with the companion.
- **Links:** people, places and ideas the recap mentions become `[[links]]`, so the book connects into the reader's graph. The plugin only links to notes that exist, unless the reader allows new ones.
- **Tinct never edits a note outside its folder.**
  - Inside its own notes, it only rewrites the part between `%% tinct:start %%` and `%% tinct:end %%`.
  - Anything the reader writes outside those markers stays.
  - If the reader edits inside the markers, those lines are kept as "Your edits" and not overwritten.
- **Download everything as Markdown** (a zip) is the same output for anyone who uses no plugin. It delivers the journal export already promised in STRATEGY.md.

## Read: from your vault into Tinct

- **Nothing is read until the reader chooses.** They allow folders and tags (`Philosophy/`, `#for-tinct`) and can block some (`Private/`, `Daily/`). The default is nothing.
- **The plugin sends allowed notes to Tinct:** path, title, headings, tags, links and text. They are capped at 5,000 notes and 20 MB, and deletions are sent too.
- **What Tinct knows about you** (board 5): interests, things you already know well, and questions you keep coming back to, built from those notes and your Tinct reading.
  - The reader can edit or remove any line, switch the companion's use of their notes off, or delete everything with "Forget my notes".
  - The profile works like the reading angle: a short block in the companion's system prompt.
- **At question time** (board 6), Tinct finds the 2–3 most relevant notes, matching on words and links first, and adds short excerpts to the companion's prompt.
  - The companion may quote them and names the note.
  - The card shows the note with "Open note in Obsidian" (an `obsidian://` link).
  - Excerpts are wrapped as untrusted data, because a note could contain text that tries to steer the model.
- **Save to my vault** on a margin card writes the card into the book note.

## Ways to connect (board 1)

| Way | Read | Write | Works on |
|---|---|---|---|
| **Obsidian plugin** (first) | yes | yes | Obsidian on desktop and mobile; the vault syncs however the reader already syncs it |
| Logseq plugin (later) | yes | yes | Logseq desktop |
| A folder on this computer | yes | yes | Chrome and Edge on desktop only (File System Access API), and only while Tinct is open |
| Readwise (send highlights) | no | yes | Pushes highlights to the reader's Readwise, which forwards to Notion, Roam, Logseq and Obsidian |
| Download as Markdown | no | yes | everywhere |

Why a plugin: a web app cannot reach a local vault on phones, and Obsidian has no cloud API. The plugin runs inside Obsidian on every device and talks to Tinct with a token.

Pairing (board 2):
1. Tinct shows a 6-character code, valid for 10 minutes. On the same device, the reader can tap Open in Obsidian (`obsidian://tinct?code=…`) instead.
2. The plugin exchanges the code for a token that can be revoked, scoped to `notes:read-write`.
3. Disconnecting revokes the token and deletes the stored notes.

## What Coder would build (when approved)

1. **Worker:**
   - pairing and tokens (`/api/notes/pair`, `/api/notes/token`, revoke);
   - `GET /api/notes/export?since=` returns a per-book Markdown model: highlights, notes, journal, recap, position and optional chat summaries;
   - `POST /api/notes/vault` takes a batch upsert of allowed notes, keyed by path with a body hash so unchanged notes are skipped;
   - `DELETE /api/notes/vault` handles deletions;
   - `GET` and `PUT /api/notes/profile`.
2. **Database** (schema change, needs Anders): `vault_notes` (user, path, title, tags, links, body, hash, updated), `vault_profile` and `vault_tokens`, with row-level security per user. Notes are never shown to anyone else and never used to train.
3. **Retrieval:** Postgres full-text search plus link and tag matches to start. Embeddings come later, if search proves too weak.
4. **Companion:**
   - the profile block plus the top-3 excerpts, behind "Let the companion use my notes";
   - a "From your notes" source on margin cards and in chat;
   - Save to my vault.
5. **Tinct app:** Settings › Your notes (board 1), pairing (board 2), What Tinct knows (board 5), the zip download.
6. **Obsidian plugin** (a new repo, TypeScript, Obsidian API):
   - the settings shown on board 3;
   - sync every 10 minutes and on demand, with a status line;
   - writing the managed sections;
   - sending allowed notes.
   - Beta through BRAT, then a submission to the Obsidian community list, whose review takes weeks.
7. **Readwise:** the reader pastes their Readwise access token; Tinct pushes each highlight with its book, author, note and a link back to the paragraph.

## Phases

1. **Write only:** the Markdown download plus the Obsidian plugin's pull. No reading, no schema for notes, little risk. It gives power users the export at once.
2. **Read:**
   - allowed folders and tags;
   - What Tinct knows;
   - the companion using notes with sources;
   - Save to my vault.
3. **Wider:** Readwise push, the Logseq plugin, and a folder on this computer.

## Cost and plan

- **Premium,** next to the journal export already listed.
- **Profile:** building it is one AI call per sync that changes the notes (small, Tinct's spend).
- **Excerpts** add about 600 tokens to a companion request when the notes are relevant.

## Open questions for Anders

1. Should phase 1 (write only) ship before reading is built?
2. Should chat summaries be written to the vault, off by default as mocked?
3. Should the companion be allowed to suggest new notes ("Save as a new note: Praemeditatio"), or only add to Tinct's own book notes?
4. Is Premium only right, or should the Markdown download be free?
