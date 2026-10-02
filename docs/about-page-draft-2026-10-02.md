# /about page — content draft (2026-10-02)

Status: **draft for Anders's review.** Nothing here has shipped. The pricing section is a proposal: changing pricing needs Anders's sign-off (AGENTS.md). The Terms and the Privacy update should be read by a lawyer before they go live, mainly for Danish and EU consumer law.

Open placeholders are marked `[[…]]`.

---

## 1. Mission

**Eyebrow:** About Tinct

# The world's best reading experience.

Tinct's mission is simple: to give the world the best reading experience there is.

Great books have always asked a lot of their readers. The language is old, the references are far away, and the questions they raise don't fit in a summary. Most tools try to make the book shorter. Tinct helps you meet it as it is.

- **The text, done properly.** Authoritative originals next to clear modern editions, lined up paragraph by paragraph, so you can switch between them without losing your place.
- **A companion who has read it too.** Ask about a line, a character or an argument, and get an answer grounded in the passage in front of you. You can type or talk.
- **Listen when your eyes are tired.** Narrated chapters that pick up where you stopped reading.
- **Your reading, kept.** Highlights, notes, a reading journal and your place in every book, synced across your devices.

We don't run ads, we don't sell your data, and we won't fill your library with summaries. Tinct is for reading books, not skimming them.

---

## 2. Pricing

**Eyebrow:** Pricing

# One plan. Every book.

| | Monthly | Yearly |
|---|---|---|
| Price | **$5 / month** | **$50 / year** (2 months free) |
| Every book in the library | ✓ | ✓ |
| Original + modern editions, side by side | ✓ | ✓ |
| Narrated audio | ✓ | ✓ |
| Highlights, notes, journal, sync across devices | ✓ | ✓ |
| AI credit included | **$5 every month** | **$5 every month** |

### What your AI credit covers

Every plan includes $5 of AI use each month, for the reading companion (chat) and Talk (voice conversation). As a rough guide, $5 covers about:

- **[[xxx]] chat messages**, or
- **[[yy]] hours of Talk**,

or any mix of the two. Longer questions and longer conversations use more credit than short ones. You can see your remaining credit in Settings at any time.

### If you run out

Reading never stops. If you use up your monthly AI credit, every book, edition, audio chapter and note stays available. To keep chatting or talking before your credit resets, buy extra credit:

- **[[$5]] top-up**, which adds $5 of AI credit to your account.

Top-ups do not expire while your subscription is active, and they are only used after your monthly credit runs out.

### Small print

- Monthly credit resets on your billing date and doesn't roll over. Top-up credit carries over.
- Prices are in US dollars. Local taxes may apply.
- Cancel any time from Settings. You keep access until the end of the period you've paid for.
- Yearly plans include the same $5 of AI credit each month, not $60 up front.

> **Notes for Anders (delete before publishing):**
> - `xxx` and `yy` need the per-message and per-minute costs from the cost ledger (DECISIONS.md 2026-09-30 mentions one; I couldn't find it in the repo). Typed chat runs on OpenAI and Claude, and Talk on xAI Grok. Talk will almost certainly cost much more per hour than chat costs per message, so publish both numbers.
> - Should "$5 of value" mean $5 at our cost or at a marked-up price? This draft says "$5 of AI use," which reads as at-cost. If you add a margin, describe credit in messages and minutes instead of dollars, so readers don't compare it with API list prices.
> - Free trial: the current strategy has a 30-day free trial and STRATEGY.md says $3/mo. Decide whether the trial stays and update STRATEGY.md and DECISIONS.md along with this page.
> - Yearly credit is $5 a month (not $60 up front), so a heavy month can't drain a whole year's credit.
> - Is there still a free tier (signed-out reading of some books)? If so, add a "Free" column.

---

## 3. Terms of Service

**Eyebrow:** Tinct · tinct.app

# Terms of Service

Last updated: [[date]]

These terms are an agreement between you and Tinct, an independent service operated by [[legal entity name, CVR number]], [[address]], Copenhagen, Denmark ("Tinct", "we", "us"). By using tinct.app or the Tinct app, you agree to them. If you don't agree, please don't use the service.

### 1. The service

Tinct is a reading platform for classic and public-domain literature. It offers editions of texts, audio narration, reading tools such as highlights, notes and a journal, and AI features: a reading companion you can chat with and a voice conversation feature ("Talk"). We may add, change or remove features over time. If a change materially reduces what you've paid for, we'll tell you in advance, and you may cancel.

### 2. Your account

You need to be at least 16 years old to create an account, or have permission from a parent or guardian. You're responsible for keeping your login details safe and for everything that happens under your account. Tell us at contact@tinct.app if you think someone else has accessed it.

### 3. Subscriptions, credit and payment

- Subscriptions are billed monthly or yearly in advance through Stripe and renew automatically until you cancel.
- Each subscription includes a monthly allowance of AI credit. Unused monthly credit expires when the next period starts. Purchased top-up credit stays in your account while your subscription is active.
- AI credit has no cash value. It cannot be exchanged, transferred or refunded, except where the law requires it.
- You can cancel at any time in Settings. Cancellation takes effect at the end of the current billing period.
- We may change prices. We'll give you at least 30 days' notice by email, and the new price applies from your next renewal after the notice period.
- **Right of withdrawal (EU/EEA consumers):** you normally have 14 days to withdraw from a purchase of digital content or services. When you start using a subscription or AI credit, you ask us to begin providing it straight away. You acknowledge that you lose your right of withdrawal for digital content that has been fully delivered, and that a withdrawal from a service already in progress may be reduced in proportion to what you have used.

### 4. Your content and your responsibility for it

"Your content" means anything you put into Tinct: notes, highlights, journal entries, messages and voice input to the AI features, issue reports, and any text, file or other material you upload or import.

- **You own your content.** You give Tinct a limited licence to store, process and display it, and to send it to our service providers, only as needed to run the service for you. We don't use your content to train AI models.
- **You are solely responsible for your content.** You confirm that you have every right needed to upload, import or otherwise submit it, including copyright and any other intellectual property or privacy rights, and that using it in Tinct doesn't break any law or anyone else's rights.
- **Don't upload or submit content that:**
  - infringes someone else's copyright, trademark or other rights, including books or texts you aren't entitled to copy;
  - is unlawful, defamatory, harassing, hateful or sexually exploits minors;
  - contains other people's personal data without a lawful basis;
  - contains malware, or tries to attack, overload or reverse-engineer the service or its AI features (for example, prompt-injection attacks or attempts to extract other users' data).
- **Indemnity.** You agree to compensate Tinct for losses, claims and reasonable costs, including legal fees, that arise from content you submit or from your breach of these terms, to the extent permitted by law.
- We don't review content before it's stored, but we may remove content or suspend accounts that break these terms, or when the law requires it. If you think content on Tinct infringes your rights, write to contact@tinct.app.

### 5. AI features: no guarantee of accuracy

Tinct's reading companion and Talk generate answers with third-party AI models (currently from Anthropic, OpenAI and xAI). Please read this section carefully.

- **AI answers can be wrong.** They may be inaccurate, incomplete, out of date, or invented while sounding confident. This includes quotations, dates, translations, interpretations, historical facts and references to the text.
- **Tinct is not responsible for the content or accuracy of AI answers.** We don't check, endorse or guarantee any answer. AI answers are not Tinct's statements and don't represent our views.
- **They aren't professional advice.** Nothing an AI feature says is medical, legal, financial, psychological, religious or other professional advice. Don't rely on it for decisions in those areas.
- **Check what matters.** If accuracy matters, for example in schoolwork, research, citations or publications, check the answer against the text and reliable sources. You are responsible for how you use AI answers.
- **Academic integrity.** You are responsible for following the rules of your school or institution about using AI.
- AI features depend on outside providers and may sometimes be slow, limited or unavailable. Reading itself never depends on them.

### 6. Texts and Tinct's materials

The original texts in the library are, to the best of our knowledge, in the public domain. Tinct's modern editions, translations, introductions, summaries, audio narration, design and software are owned by Tinct or used under licence. You may use them for your own personal reading. You may not copy, scrape, redistribute or resell them, or use them to train AI models, without our written permission.

Modern editions and narration are prepared with the help of AI and editorial review. They aim to be faithful, but they may contain errors. Please report any you find with the in-app report tool.

### 7. Acceptable use

Don't misuse the service. In particular, don't:

- share your account or resell access;
- use bots, scrapers or automated tools to access the service or the AI features;
- get around usage limits, credit or payment;
- use the AI features to produce unlawful or harmful content.

### 8. Suspension and termination

You can stop using Tinct and delete your account at any time. We may suspend or close an account that seriously or repeatedly breaks these terms. Where it's reasonable, we'll warn you first. If we close your account without a breach on your part, we'll refund any prepaid, unused subscription period.

### 9. Disclaimers

The service is provided "as is" and "as available". To the extent the law allows, we make no promises that it will be uninterrupted or error-free, or that texts, editions, audio or AI answers will be accurate or complete.

### 10. Limitation of liability

To the extent the law allows:

- Tinct is not liable for indirect or consequential losses, lost data, lost profits, or losses that result from relying on AI answers or on your own content.
- Tinct's total liability to you for any claim is limited to the amount you paid Tinct in the 12 months before the claim.

Nothing in these terms limits liability that the law doesn't allow us to limit, such as liability for gross negligence or intent, or your mandatory rights as a consumer.

### 11. Changes to these terms

We may update these terms. We'll email you about material changes at least 30 days before they take effect. If you keep using Tinct after that, you accept the new terms. If you don't accept them, you can cancel before they apply.

### 12. Law and disputes

These terms are governed by Danish law. Disputes go to the Danish courts. If you're a consumer living in the EU, you also keep the protection of the mandatory laws of your country, and you can bring a complaint to the Danish Consumer Complaints Board (Nævnenes Hus) or through the EU Online Dispute Resolution platform.

### 13. Contact

contact@tinct.app

---

## 4. Privacy & legal

The existing **`app/public/privacy.html`** (last updated 11 September 2026) is solid. The /about page should link to it rather than repeat it. It does need these corrections before the new pricing ships:

1. **Third-party services → AI providers.** It currently names only Anthropic. The Worker also calls **OpenAI** (typed chat and research), **xAI** (Talk voice and Grok narration) and **Fish Audio** (narration), and **Brevo** (email) is missing too. Proposed replacement for the Anthropic bullet:

   > **AI providers** — Tinct's AI features use models from Anthropic (Claude), OpenAI and xAI (Grok), and narration is generated with xAI and Fish Audio. When you use chat or Talk, your messages or voice audio, and the relevant passage, are sent to the provider handling that request so it can generate a response. Each provider processes this data under its API terms, does not use it to train its models, and may keep it for a limited period for abuse monitoring. See each provider's privacy policy for details.
   >
   > **Brevo** — sends account and service emails.

   *(Please check each provider's current API data-retention terms before publishing. The "30 days" figure for Anthropic should either be checked for all of them or removed.)*

2. **Voice data.** Add a "Voice" line under *What we collect*: when you use Talk, your microphone audio is streamed to the voice provider in real time to produce a reply. Say whether Tinct stores recordings or transcripts. **[[Anders/Codex: confirm. My reading is that audio isn't stored, but transcripts may be saved to chat history.]]**

3. **Uploaded content.** If uploading or importing your own texts ships, add it to *Reading data*: uploaded files are stored privately under your account and are processed only to provide the service to you.

4. **Payment data.** Add AI credit balances and top-up purchases to what Stripe and Tinct record.

5. **Legal notice / imprint.** Add a short block (on /about or in the footer):

   > Tinct is operated by [[legal entity]], CVR [[number]], [[address]], Copenhagen, Denmark. Contact: contact@tinct.app.

---

## 5. Suggested page structure

`/about` as one long page with anchors, in the same paper/teal system as `privacy.html`:

1. Mission (`#mission`)
2. Pricing (`#pricing`)
3. Terms (`#terms`). This could also go on its own `/terms` page and be linked from here; that's the usual approach and easier to version.
4. Privacy & legal (`#legal`): a short summary, a link to `/privacy`, and the imprint.

Note: `app/public/about.html` already exists as the "age of slop" story page. Decide whether that page *becomes* /about with these sections added below, or whether this content gets its own route.
