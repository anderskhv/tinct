# Privacy notice changes for invites: draft

Draft, 21 October 2026, against `app/public/privacy.html` on origin/main (last updated 20 October 2026, after 2f3a20d5b "Findable profiles with follow requests"). Not applied. `termsPage.test.ts` asserts privacy wording, so Coder updates those assertions in the same change.

Changes A–H are needed for invites whatever else is decided. Change I applies only if Anders keeps the brief's new sign-up defaults, and it has a legal problem; see the note under it.

Not legal advice. The tell-a-friend email and the legal basis for it are flagged in OPEN-QUESTIONS.md.

---

## A. Date

```diff
-    <p class="updated">Last updated: 20 October 2026</p>
+    <p class="updated">Last updated: <!-- release date --> 2026</p>
```

## B. New subsection "Invites" under "What we collect", after the two "Your profile" paragraphs

The `id` lets the email footer link straight to it (`https://tinct.app/privacy#invites`).

```diff
       <p>We store who you follow, who follows you and who you have blocked; … Your profile is deleted with your account.</p>
+      <h3 id="invites">Invites</h3>
+      <p>If you invite a friend by email, we store their email address, the book you suggested and your note, and send them one email from "your name via Tinct" through Brevo. The email shows your name, your picture, the book and your note. Your own email address is not shown to them. We never tell you whether an address already has a Tinct account. You can send at most 10 invites a day and 50 a month, and invite the same address once every 14 days.</p>
+      <p>If someone invited you, we got your email address from them. We use it only to send that one email and to recognise the invite if you join. We delete your address when you join or when the invite expires after 30 days, whichever comes first. We keep a coded form of it (a keyed hash, which cannot be turned back into the address) with the invite for 12 months, so the same reader cannot invite you more than once every 14 days. If you choose "Never send me invites" in the email, we keep only that coded form, so that nobody can invite you again; write to <a href="mailto:contact@tinct.app">contact@tinct.app</a> if you want it removed. We send no other email to an address we got from an invite.</p>
+      <p>When you join or sign in from an invite, you and the reader who invited you follow each other, so you are friends on Tinct: each of you sees the other's reading as your profile settings allow. This does not happen if either of you has blocked the other. You can unfollow, remove or block them at any time. The reader who invited you sees that you joined, and gets one email saying so. The note is kept for 7 days after you join, so Tinct can show it to you, and then deleted. The suggested book is placed in your library, where it stays until you remove it.</p>
       <h3>Your own books and pictures</h3>
```

## C. "How we use it": a new item, after "To show your profile"

```diff
         <li><strong>To show your profile</strong> to the readers you choose. It stays Only me until you change it.</li>
+        <li><strong>To send the invites you ask for</strong>: one email to the address you enter, and one email to you when that person joins.</li>
         <li><strong>To email you, if you agreed</strong>: …</li>
```

## D. "How we use it": legal basis

```diff
-        <li><strong>Legal basis</strong>: we process account and reading data to provide the service you asked for; analytics and issue reports on our legitimate interest in running and improving Tinct; and reading emails, profile visibility and the leaderboard on your consent, which you can withdraw at any time.</li>
+        <li><strong>Legal basis</strong>: we process account and reading data to provide the service you asked for; analytics and issue reports on our legitimate interest in running and improving Tinct; an invite on the legitimate interest of the reader who sends it, and ours in delivering it, limited to one email that the person can stop for good with one click; and reading emails, profile visibility and the leaderboard on your consent, which you can withdraw at any time.</li>
```

## E. "To email you, if you agreed": service emails

```diff
-… Account and service emails, such as the welcome email, notices about your free month, password resets and issue-report replies, are sent regardless.</li>
+… Account and service emails, such as the welcome email, notices about your free month, password resets, issue-report replies and the note that a friend you invited has joined, are sent regardless.</li>
```

## F. Third-party services: Brevo

```diff
-        <li><strong>Brevo</strong>: sending Tinct's own email: account emails, issue-report notices and replies, and the emails you agreed to.</li>
+        <li><strong>Brevo</strong>: sending Tinct's own email: account emails, issue-report notices and replies, the emails you agreed to, and the invites readers ask Tinct to send to their friends. For an invite, Brevo receives the invited address, the inviter's name and picture, the book and the note.</li>
```

## G. Retention

```diff
-      <p>Account and reading data are kept for as long as your account exists. Analytics events, usage records, the record of the emails we have sent you and the history of changes to your reading data are kept for 24 months and then deleted automatically. Data stored in your browser remains on your device until you sign out or clear your browser storage.</p>
+      <p>Account and reading data are kept for as long as your account exists. Analytics events, usage records, the record of the emails we have sent you and the history of changes to your reading data are kept for 24 months and then deleted automatically. An invited email address is deleted when the person joins or when the invite expires after 30 days; the record of the invite, without the address, is deleted after 12 months, and an address's "Never send me invites" choice is kept until that person asks us to remove it. Data stored in your browser remains on your device until you sign out or clear your browser storage.</p>
```

## H. Deletion list

```diff
-… Deletion happens immediately and covers your account, your profile, its pictures, follows and blocks, reading data, …
+… Deletion happens immediately and covers your account, your profile, its pictures, follows and blocks, the invites you sent, reading data, …
```

(An invite someone else sent you stays with their account, without your address or any link to your account.)

---

## I. Only if the brief's new defaults ship (Friends preselected, leaderboard on)

On main today a new profile is Only me, and the notice says so twice and rests profile visibility and the leaderboard **on consent**. The brief would make sign-up step 2 open with Friends and "Show me on the leaderboard" already on, and make Skip keep them on.

**Problem:** under the GDPR as the CJEU read it in *Planet49* (C-673/17), a pre-ticked box or a choice that applies when the person skips is not valid consent. So the notice cannot both say "on your consent" and describe pre-selected sharing. Anders has to pick one:

1. **Keep consent as the basis, and keep the defaults off** (Only me, leaderboard off; the reader ticks Friends). No notice change. The invite still works: the two follow each other, and each sees the other's reading once they choose Friends.
2. **Move visibility to Friends to "the service you asked for" (contract) or legitimate interest**, and keep the leaderboard on consent (off by default). Friends-only visibility shows reading only to mutual follows the reader has accepted, which is arguably part of the service a reader signs up for. Wording if chosen:

```diff
-A new profile is Only me. You choose whether Friends or Everyone can see it, …
+A new profile is seen by Friends: only readers you follow who follow you back see what you read and your reading time. You can change this to Only me or Everyone at sign-up or at any time in Settings. You choose whether Friends or Everyone can see it, …
```
```diff
-        <li><strong>To show your profile</strong> to the readers you choose. It stays Only me until you change it.</li>
+        <li><strong>To show your profile</strong> to the readers you choose. A new profile is seen by Friends until you change it.</li>
```
```diff
-… and reading emails, profile visibility and the leaderboard on your consent, …
+… showing your profile to your friends as part of the service you asked for; and reading emails, Everyone visibility and the leaderboard on your consent, …
```

3. **Pre-select the leaderboard as well** (the brief's full ask). The leaderboard then needs a basis other than consent, and the notice must say a new profile appears on friends' boards by default. This draft does not recommend it.

The email consent wording does not change, so `EMAIL_CONSENT_VERSION` stays. Record the change in DECISIONS.md and keep the notice's "Changes to this policy" promise (notify by email if significant). Changing what a new profile shares by default is arguably significant for new readers only, so no email to existing readers is needed if they are not backfilled.
