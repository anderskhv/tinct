# Invite a friend by email: copy

Draft, 21 October 2026. Every string the feature needs, ready to paste into `app/src/cards/cardsCopy.ts` (`CARDS_COPY`) under a comment `// Invite a friend by email (INVITE-BY-EMAIL.md, boards 1–8)`. Style follows cardsCopy.ts: sentence case, curly apostrophes, no exclamation marks, "did not" in errors, functions for values.

The eight keys the brief names come first; the rest are new. Marked **(new)** where the brief or the mockups have no wording and this draft supplies it. Anders: check those.

## Entry points (board 1)

| Key | Text | Where |
|---|---|---|
| `inviteFriend` | Invite a friend | You page button below the first card; top of Find readers; t menu row; sheet title |

Note: Find readers already has a heading `inviteReader: 'Invite a reader'` over the profile-link copy/share rows. See OPEN-QUESTIONS.md, "Two invite headings".

## The sheet (board 2)

| Key | Text |
|---|---|
| `theirEmail` | Their email |
| `theirEmailPlaceholder` **(new)** | name@example.com |
| `suggestBook` | Suggest a book |
| `optional` **(new)** | Optional |
| `changeBook` | Change |
| `noBook` **(new)** | No book |
| `chooseBookTitle` **(new)** | Choose a book |
| `aNote` | A note |
| `notePlaceholder` **(new)** | Say why you’d like to read together |
| `noteLeft` **(new)** | `(n: number) => \`${n} left\`` (shown from 40 characters left) |
| `noteLinksRemoved` **(new)** | Links are left out of the note. |
| `sendInvite` | Send invite |
| `sending` **(new)** | Sending… |
| `senderLine` | `(name: string) => \`Tinct sends one email from “${name} via Tinct”. Your email address is not shown.\`` |

## Refusals and errors (sheet)

All shown under the email field (or the note field where stated), in the existing error tone.

| Key | Text | When |
|---|---|---|
| `inviteBadEmail` **(new)** | Please check the email address. | Not a valid address |
| `inviteOwnEmail` **(new)** | That’s your own address. | The inviter's own account email (only their own, so nothing leaks) |
| `inviteAlreadyInvited` | `(date: string) => \`Already invited on ${date}\`` | Same inviter, same address, within 14 days. Date like "18 October" |
| `inviteRefused` | We can’t send an invite to that address. | Address on the suppression list. Also any other refusal that must not say why (see OPEN-QUESTIONS.md, blocked pair) |
| `inviteNoteFiltered` **(new)** | Please change the note. | Note fails the profile word filter (field: note). Mirrors "Please choose another name." |
| `inviteNoteTooLong` **(new)** | Keep the note to 280 characters. | Server-side guard; the field stops at 280 anyway |
| `inviteDailyLimit` **(new)** | You’ve sent 10 invites today. You can send more tomorrow. | 10 a day |
| `inviteMonthlyLimit` **(new)** | `(date: string) => \`You’ve sent 50 invites this month. You can send more from ${date}.\`` | 50 a month; date = first day the rolling count drops under 50 |
| `inviteTooFast` **(new)** | That was a lot of invites in a short time. Please wait a minute. | Per-minute rate limiter (429 `rate_limited`). Wording echoes the chat limit message |
| `inviteProfileNeeded` **(new)** | Set up your profile first, so your friend knows who the invite is from. | Profile not set up (`set_up_at` null) |
| `inviteSetUpProfile` **(new)** | Set up profile | Button beside the line above |
| `inviteConfirmEmailNeeded` **(new)** | Confirm your email first. We sent you a link when you joined. | Only if Anders requires a confirmed address to invite (OPEN-QUESTIONS.md) |
| `inviteSendFailed` **(new)** | The invite did not send. Please try again. | Brevo refused or network failure; nothing was counted |
| `inviteUnavailable` **(new)** | Invites are not available just now. | Switch off, table missing, 503 |

## Sent (board 3)

| Key | Text |
|---|---|
| `inviteSent` | Invite sent |
| `inviteSentLine` | `(email: string, book: string \| null, note: boolean) => …` producing one of: |
| | We emailed {email} with {book} and your note. |
| | We emailed {email} with {book}. |
| | We emailed {email} with your note. |
| | We emailed {email}. |
| `inviteAnother` **(new)** | Invite someone else |
| `done` **(new, or reuse `close`)** | Done |

Book titles are shown in italics in the UI (title from the catalogue, never from the client).

## Your invites (board 3, lower half)

| Key | Text |
|---|---|
| `yourInvites` | Your invites |
| `inviteStateSent` | `(when: string) => \`Sent ${when}\`` (when: "today", "yesterday", "3 days ago", "18 October") |
| `inviteStateJoined` | Joined · follows you |
| `inviteStateExpired` | Expired |
| `yourInvitesEmpty` **(new)** | No invites yet. |
| `yourInvitesUnavailable` **(new)** | Your invites can’t be shown just now. |

Each row shows the address while it is still stored (until accepted or expired). After that, a Joined row shows the reader's avatar and name, and an Expired row has no address any more (it is deleted at expiry), so it reads "An invite" with its date (see OPEN-QUESTIONS.md, "Expired rows"):

| Key | Text |
|---|---|
| `inviteExpiredRowLabel` **(new)** | An invite |

## Followers mark (brief §4)

| Key | Text |
|---|---|
| `joinedFromYourInvite` | Joined from your invite |

On main a mutual follow never appears under Following you (that list leaves out readers you follow back), so this line needs a home; see OPEN-QUESTIONS.md, "Where 'Joined from your invite' shows".

## Join page, `tinct.app/join/<token>` (board 5)

| Key | Text |
|---|---|
| `joinTitle` | `(name: string) => \`Join ${name} on Tinct\`` |
| `joinBookLine` | Opens right after you join |
| `joinWithGoogle` | Continue with Google (existing sign-in copy; reuse) |
| `joinEmailLabel` | Email (existing `email`) |
| `joinCreate` **(new)** | Create account (existing step-1 button copy; reuse) |
| `joinAlready` | Already on Tinct? Sign in, and you’ll follow each other. |
| `joinSignIn` **(new)** | Sign in |
| `joinSignedInAs` **(new)** | `(email: string) => \`Signed in as ${email}\`` |
| `joinAccept` **(new)** | `(name: string) => \`Follow each other with ${name}\`` (already signed in on this device: one tap) |
| `joinNotYou` **(new)** | Not you? Sign out |
| `joinFreeLine` **(new)** | Reading is always free. |

## Expired, used or unknown link (brief §7)

One page for all three, so a forwarded link never tells whether the friend joined.

| Key | Text |
|---|---|
| `inviteExpired` | This invite has expired |
| `inviteExpiredLine` **(new)** | You can still join Tinct and read any book in the library for free. |
| `inviteExpiredJoin` **(new)** | Join Tinct |

## Self-invite and blocked pair after sign-in

| Key | Text |
|---|---|
| `inviteOwn` **(new)** | This invite came from your own account. |

Blocked pair: no copy. The friend lands in the library as after any sign-in: no card, no follow, nothing that says why.

## Sign-up step 2 line (board 6)

| Key | Text |
|---|---|
| `followEachOther` | `(name: string) => \`You and ${name} will follow each other.\`` |

## Arrival card (board 7)

| Key | Text |
|---|---|
| `arrivalTitle` | `(name: string) => \`You and ${name} follow each other\`` |
| `arrivalNote` | The note, in italics, in curly quotes: `“${note}”` |
| `arrivalLater` | Later |
| `arrivalStart` | Start reading |
| `bookFromTag` | `(name: string) => \`From ${name}\`` |
| `arrivalDismiss` **(new)** | Close (aria-label of the card's ×; reuse `close`) |

With no book: the same title and note, and only the Later button (no Start reading).

## Opt-out page, `tinct.app/invites/stop?t=…` (link in the email footer)

A GET shows this page and its button posts (as `/unsubscribe` does), so link scanners cannot suppress anyone.

| Key | Text |
|---|---|
| `optOutTitle` **(new)** | Stop invites to this address |
| `optOutLine` **(new)** | Tinct won’t send this address any more invites, from anyone. |
| `optOutButton` | Never send me invites |
| `optOutDone` **(new)** | Done. Tinct won’t send invites to this address. |
| `optOutUndo` **(new)** | Changed your mind? Write to contact@tinct.app. |
| `optOutBadLink` **(new)** | This link does not work. Write to contact@tinct.app and we’ll stop invites to your address. |

## Emails

Subjects and preheaders (the bodies are in email.html / email.txt).

| Template | Subject | Preheader |
|---|---|---|
| `invite` | `{inviter_name} invited you to read {book_title}` | You’ll follow each other, so you can see each other’s reading. |
| `invite-no-book` | `{inviter_name} invited you to read with them on Tinct` | same |
| `invite-joined` | `{friend_name} joined Tinct from your invite` | You now follow each other. |

Sender name: `{inviter_name} via Tinct` (`sendEmail(..., { senderName })`), address contact@tinct.app, **no `replyTo`**. Sender name is the profile's display name (already 1–40 characters, word-filtered); strip `"`, `<`, `>`, `@` and line breaks before it goes into the header, and fall back to "A reader via Tinct" when nothing is left.

Body lines, for reference:

| Key | Text |
|---|---|
| `emailInvitedYou` | {inviter_name} invited you to read with them on Tinct. |
| `emailBookFree` **(new)** | Free to read on Tinct |
| `emailJoinButton` | Join {inviter_name} on Tinct |
| `emailFollowLine` | You’ll follow each other, so you can see each other’s reading. |
| `emailAboutTinct` **(new)** | Tinct is a place to read the classics, in the original or in modern English. Reading is always free. The link works for 30 days. |
| `emailFooter` | {inviter_name} entered your address on Tinct. We won’t email you again unless someone invites you. |
| `emailOptOut` | Never send me invites |
| `emailPrivacy` **(new)** | How Tinct uses your address |
| `emailJoinedTitle` | {friend_name} joined Tinct from your invite. |
| `emailJoinedLine` | You now follow each other. |
| `emailJoinedButton` **(new)** | Open Tinct |
| `emailJoinedFooter` **(new)** | You’re getting this because you invited {friend_name} to Tinct. |

Footer wording changed from the brief's "unless someone else invites you": the brief also lets the same inviter send again after 14 days, so "someone else" would be untrue. See OPEN-QUESTIONS.md.
