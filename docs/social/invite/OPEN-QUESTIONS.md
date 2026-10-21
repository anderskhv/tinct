# Invite a friend by email: decisions for Anders

Draft, 21 October 2026, checked against origin/main at 1668c3ac2 (after 2f3a20d5b "Findable profiles with follow requests", 19 Oct). Each item has a recommendation, so a one-word answer is enough. Numbers 1–6 block implementation; the rest can be settled during review.

## Blocking

### 1. Schema approval
The brief asks for two tables. MIGRATION-DRAFT.sql proposes `invites` and `invite_suppressions`, three functions (`reserve_invite`, `accept_invite`, `purge_invite_personal_data`), and one new Worker secret, `INVITE_HASH_SECRET`, that must never be rotated. **Approve as drafted?**

### 2. Lifecycle emails are off: does the invite depend on that switch?
On main, `LIFECYCLE_EMAILS` and `LIFECYCLE_TRIAL_NOTICES` are off, and `LIFECYCLE_TEST_GATE = true` (emails.ts) lets lifecycle mail reach only ahvelplund@fastmail.com and `tinct{n}@fastmail.com`. The invite is a different kind of email: one message to a third party, sent because a reader asked.
**Recommendation:** give it its own switch, `INVITE_EMAILS`, independent of `LIFECYCLE_EMAILS`. It still needs `SOCIAL_FRIENDS` and `SOCIAL_PROFILES`, and `EMAIL_LINK_SECRET` (for the opt-out link). While testing, keep a test gate of its own (`INVITE_TEST_GATE`) that lets invites go only to the test aliases, the same rule as `isLifecycleTestRecipient`. Real sending starts when you turn that gate off, and not when lifecycle mail does. The "X joined from your invite" email goes under the same switch.

### 3. Is a tell-a-friend email allowed?
Tinct writes and sends the email, so under Danish marketing law (markedsføringsloven §10) and the ePrivacy rules it can count as Tinct's own unsolicited marketing, even though a reader typed the address. Regulators tend to accept these emails when the reader starts each one, gets no reward for it, the email is personal and plain, there are no reminders, and opting out is easy. The brief already meets all of these. It also refuses suppressed addresses, and the 14-day rule allows one repeat per inviter at most.
**Decide:** accept this risk, or get advice first. Keep these points fixed: no reward for inviting, no reminder email, no Tinct promotion beyond one line. The draft has "Tinct is a place to read the classics… Reading is always free." Drop it if you want the email purely personal. This is not legal advice.

### 4. The new sign-up defaults are not on main
On main, `signUpSteps.ts` starts step 2 at `only_me`. Its header still says "Friends preselected", which is wrong. Skip saves Only me (`profiles.ts`: `skip` → `visibility = 'only_me'`). Step 2 has no leaderboard toggle. New rows default to `on_leaderboard = false` and `visibility = 'only_me'`. privacy.html says twice that a new profile is Only me, and it rests profile visibility and the leaderboard **on consent**. A preselected choice, or one that applies on Skip, is not valid consent under the GDPR (*Planet49*). PRIVACY-DRAFT.md §I sets out the options.
**Recommendation:** split this from invites and ship it on its own. If you want it, preselect Friends and change visibility's legal basis to "the service you asked for" (§I option 2). Keep the leaderboard off until the reader ticks it. Do not change the column defaults or backfill existing accounts.

### 5. Do the friend's account defaults apply to them?
An invited friend becomes a mutual follow at once. Under main's defaults their profile is Only me. Then the inviter sees only their name and link with the initial, and never their reading, even though they are "friends". So "Joined · follows you, with the reader's avatar" shows an initial. The friend sees the inviter in full only if the inviter's profile is Friends or Everyone.
**Recommendation:** when someone signs up from an invite, preselect Friends on step 2 and add the line "You and {name} will follow each other." That is a choice the friend can see and change, not a silent default. Leave the leaderboard as the general rule in item 4 decides. Existing accounts that sign in from an invite keep their settings.

### 6. Follow requests: confirm the mutual follow skips them
Since 19 Oct, a follow request is just a one-way row in `follows`. The other reader accepts by following back under You → Find readers → Following you, and a dot shows requests not yet seen (followRequests.ts). There is no request table and no request state. `accept_invite` inserts both rows in one transaction, so neither reader ever sees a request, a "Requested" button or a dot. It skips both rows if either reader blocked the other. It completes an existing one-way follow in either direction.
**Confirm:** accepting the invite counts as both readers' consent to friendship. For the inviter, sending the invite was that consent. For the friend, it is following the link and signing in.

## During review

### 7. Forwarded links: bind the auto-follow to the invited address?
The token is a bearer link. If the friend forwards the email, whoever signs up first becomes the inviter's mutual friend and sees their reading.
**Recommendation:** create both follows only when the joining account's email matches the invite's address hash, or when the account is created from the join page with the prefilled address unchanged. Otherwise create only the joiner → inviter follow, as an ordinary request the inviter can accept, and still put the book on the table. Google sign-ups with a different Gmail address then land in the request path. That is acceptable.

### 8. A blocked pair at send time
If the address belongs to a reader who blocked the inviter, refusing the invite would tell the inviter both that the account exists and that they are blocked.
**Recommendation:** answer exactly like a sent invite, send nothing (`delivery = 'withheld'`), show it as Sent, then let it expire. The alternative is to send it anyway. The block would still stop the follows, but the blocked reader gets an email from someone they blocked.

### 9. The footer promise and the 14-day rule disagree
The brief's footer says "We won’t email you again unless someone else invites you". Its limits let the same inviter invite again after 14 days.
**Recommendation:** keep the 14-day repeat and change the footer to "…unless someone invites you" (as drafted). Or make it one invite per inviter per address ever, and keep "someone else".

### 10. Who may invite
The brief says the inviter's profile must be set up. Skipping step 2 sets `set_up_at` too, so this lets nearly everyone through.
**Recommendation:** also require a confirmed email for email sign-ups (Google accounts count as confirmed). This is the cheapest guard against sign-up-and-spam scripts. Tell me if instead an inviter with an Only me profile should be told that their friend will see only their name.

### 11. The inviter's avatar in the email
Set and cover pictures are public assets, but they are crops of large paintings, and email clients ignore CSS crops. Uploaded and Google photos are private: the Worker serves them only to signed-in viewers.
**Recommendation:** generate 112 × 112 JPEG crops for the 5 sets and 18 covers, as `generate-email-art.mjs` does for book art. Uploaded and Google photos show as the initial (a styled cell, no image). The other option is a short-lived signed image URL for the photo. That works, but the email then leaks the reader's photo to whoever the address belongs to, and its URL to the mail provider's proxy.

### 12. Book cover in the email
The book card needs a small portrait cover. `app/public/email-art/` holds landscape 1200 × 600 crops. `/lab/library_2/assets/{id}.jpg` are full covers for some books only.
**Decide:** generate portrait covers for the whole catalogue, or show the card without an image when a book has none. The draft keeps `cover_url` on the cover line, so dropping the image needs a template tweak.

### 13. Two invite headings in Find readers
Find readers already has "Invite a reader" (`inviteReader`) over the profile link's Copy and Share rows. The brief puts "Invite a friend" above that link.
**Recommendation:** one heading, "Invite a friend", with the email button first and the link rows under it. Remove `inviteReader`.

### 14. "Followers" or "Friends"
The brief says "Friends ('Followers' in the copy, per Anders's rename)". On main the visibility label is still "Friends" (VISIBILITY_COPY, cardsCopy `friends`, privacy.html), and DECISIONS.md has no rename.
**Decide:** is the rename still wanted? If so it is its own change: copy, privacy notice and the findable notice. COPY.md uses the current words.

### 15. Where "Joined from your invite" shows
The brief puts it on "their Followers board". On main, Following you lists only readers you do not follow back, so a mutual friend never appears there. The Friends leaderboard shows a friend only if they are on the leaderboard with reading time on.
**Recommendation:** show it in Your invites (the Joined row, 7 days), and as a subtitle on the friend's row on the Friends board when they are there. No new list.

### 16. Expired, used and unknown links look alike
**Recommendation:** use one page, "This invite has expired", without the inviter's name for all three. Then a forwarded used link never shows who invited whom, or that the friend joined. The brief shows the inviter's avatar on an expired page. That is harmless for the real recipient but not for a forwardee.

### 17. The book "on their desk"
The 30 September rule says the desk shows books you are reading, derived from the same table as My shelf. To show the suggested book "as if they had started it", the book needs a reading-state entry without a reading position.
**Decide:** the server writes that entry at accept (and must never overwrite an existing place), or the client writes it on arrival from the accept response. Recommendation: the client, through the existing store, so the position invariants stay in one place. Uploaded books are never offered, so this never touches own books.

### 18. The "joined" email to the inviter
**Recommendation:** treat it as a service email about the inviter's own action, sent whatever the reading-email consent says. Send it at most once per invite, and with no unsubscribe link (the privacy draft lists it with service emails). If you would rather it follow the reading-email opt-out, say so.

### 19. Limits and quotas
Confirm 10 a day, 50 a month, 14 days per address, 30-day links, and 5 a minute (the per-minute limiter, not in the brief). Internal and test accounts are exempt from the daily and monthly limits only. Also check the Brevo plan's daily quota: lifecycle mail and invites share it.

### 20. Retention numbers
The draft keeps the note 7 days after acceptance, keeps the invite row (without address) 12 months, and keeps suppressions until removal is asked for. These go into the privacy notice, so confirm them.

### 21. Undoing "Never send me invites"
The draft gives only "write to contact@tinct.app". That person may later join Tinct under that address. Should signing up clear the suppression? **Recommendation:** no automatic clearing. Someone with an account can still be found and followed in Find readers, so a kept suppression costs them nothing.

### 22. Sender names that look official
Display names are word-filtered, but they are not checked against reserved words (that check is for handles only). "Tinct via Tinct" or "PayPal via Tinct" would pass.
**Recommendation:** for invites only, refuse a sender name that contains `tinct`, `admin`, `support` or `official`. Ask the inviter to change their name first.

### 23. Brevo tracking
Click tracking would send the token through Brevo's redirect, and link scanners would follow it.
**Recommendation:** turn click and open tracking off for invite mail, if the account allows it per message or per sender. Otherwise accept it: GET never consumes a token.

### 24. Entry point wording
The brief names the t menu as an entry point. The t menu was reorganised on 20 Oct: Chat · Talk, Summarize, Catch me up, Aa, Reading settings, Library, Profile. **Decide:** "Invite a friend" as a row under Profile, or inside the Profile card only.
