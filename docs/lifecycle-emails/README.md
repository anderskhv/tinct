# Lifecycle emails: approved copy, ready to wire

**Approved by Anders, 30 September 2026.** This folder is content only: templates, sample data and rules. The Worker does the sending (Brevo, `app/src/worker/routes/emails.ts`), and that code change belongs to the coding agent.

- `templates/*.html`: email-client-safe HTML (table layout, inline styles, 600px, Georgia fallback, hidden preheader, light colour scheme).
- `templates/*.txt`: the plain-text part. Send both (`htmlContent` + `textContent`).
- `sample-data.json`: example values for every variable. All templates fill with no leftover `{{…}}`.
- "Your next book" content (quotes, pairings, reasons) lives in `books/wip/reader-acclaim/`.

## The emails

| Template | Subject | Preheader (hidden text in the template) | Trigger | Suppression |
|---|---|---|---|---|
| `welcome` | Welcome to Tinct | Your reading companion comes with every book. | On sign-up (event-driven, not the daily cron) | Real accounts only, not anonymous ones |
| `keep-reading` / `keep-reading-with-question` | `{{book_title}}` | Here's where the story stood. | 3 days without reading a started book | At most weekly; **stop after 2 ignored**; then one stalled `next-book` for that book, then nothing |
| `next-book` / `next-book-classic-lead` | From `pairings.json` (`subject`), matched to the lead actually used | Target book hook | Finished a book, or 2 ignored `keep-reading` emails | Eligibility rules in `books/wip/reader-acclaim/pairings.json` |
| `keep-companion` | Would you like to keep your companion and audiobooks? | `{{hours_reading}} reading, {{hours_listening}} listening.` | Trial day 25, reader used the companion or audiobooks | **Only once checkout works** |
| `keep-companion-light` | Your first month in Tinct | Your first month ends on `{{trial_end_date}}`. | Trial day 25, little or no use | Only once checkout works |
| `companion-ready` | Your companion is ready when you are | Everything you've read is still here. | Trial day 30, not subscribed | Only once checkout works |

The automated day-7 check-in is **dropped**. Anders writes those notes by hand from the reader dashboard.

## Global rules
- **From:** "Anders at Tinct" `<contact@tinct.app>`, with Reply-To set to Anders's own inbox. Replies are read.
- **Quiet readers only:** send nothing but `welcome` and the trial emails to someone who read in the last 48 hours.
- **Frequency:** at most one lifecycle email every 3 days per reader, and none between 21:00 and 08:00 in the reader's time zone (default Europe/Copenhagen).
- **Trial clock:** starts at real sign-up, not at anonymous-account creation.
- **Idempotency:** log every send (user, template, book, sent_at) and never send the same template/book pair twice.
- **Test gate:** keep the existing `isLifecycleTestRecipient` pause until Anders switches real sending on; test with the `tinct{n}@fastmail.com` aliases.

## Variables
Escape every variable as HTML, except `opening_line` and `books_phrase`, which carry `<em>` for book titles. The `.txt` versions get the same values with tags stripped.

| Variable | Used in | Meaning |
|---|---|---|
| `subject` | all | The subject line (also used as the HTML `<title>`) |
| `sender_address` | all | Postal/sender line required for marketing email, e.g. "Tinct, Copenhagen, Denmark" (Anders to confirm) |
| `unsubscribe_url` | all | Per-reader signed link that switches off reading emails with one click |
| `book_title`, `continue_url` | welcome, keep-reading | The last-read book, and a reader link that resumes it (the app restores the place; the email never states it) |
| `art_url`, `art_alt` | keep-reading, next-book | The book's library painting as a hosted JPEG, 1200px wide, ≤150 KB |
| `recap` | keep-reading | Existing recap text, cut off at the reader's place (spoiler-safe) |
| `next_chapter_label`, `question` | keep-reading-with-question | Optional; only where a reviewed per-chapter question exists |
| `opening_line` | next-book | "You finished <em>X</em>." or the stalled line: "Not every book suits every moment. If <em>X</em> has stalled, this one may be the better fit for now." |
| `target_title`, `target_author`, `hook`, `start_url` | next-book | From the library introduction for the target book |
| `lead_quote`, `lead_label`, `lead_person`, `lead_context` | next-book | From `cards.json`. If a card has `display`, put that text in `lead_quote` and leave `lead_label` empty |
| `reason` | next-book | `pairings.json` |
| `classic_quote`, `classic_source`, `classic_context` | next-book | From the onboarding `acclaim` entry named in `pairings.json` |
| `hours_total`, `hours_reading`, `hours_listening`, `chapters`, `questions`, `talk_minutes`, `books_phrase` | keep-companion | First-month totals, pre-formatted ("6 hours", "40 minutes"). Round to the nearest half hour; use minutes below 1 hour |
| `trial_end_date`, `checkout_url` | trial emails | Local date ("30 October"); a link that opens the working $3 checkout |

## Sending checklist (for the coding agent)
1. Headers: `List-Unsubscribe: <{{unsubscribe_url}}>, <mailto:…>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (Gmail and Yahoo requirements for bulk senders). Brevo accepts these as custom headers.
2. Add an unsubscribe endpoint plus an opt-out flag on the profile. That is a schema change, so it needs Anders's approval.
3. Host book art as JPEG. Email clients don't reliably render WebP.
4. Pass `textContent` alongside `htmlContent`.
5. SPF/DKIM: Brevo DKIM (`brevo1`/`brevo2._domainkey`) is live and DMARC is `p=none`. The SPF record does not list Brevo; that is harmless because DKIM covers alignment, but tidy it later.

## Needs Anders
- **Consent:** under EU and Danish marketing rules, promotional email generally needs consent. The trial and next-book emails count as promotional; the welcome is closer to service mail. Add a clear line at sign-up ("We'll send you a few reading emails; unsubscribe any time"), and confirm the approach. This is not legal advice.
- **The `sender_address` text** to show in the footer.
