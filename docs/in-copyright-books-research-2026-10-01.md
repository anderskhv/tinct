# Expanding Tinct to in-copyright books: research summary (2026-10-01)

Research supplied by Anders on 2026-10-01 as input to the [strategy rewrite](../STRATEGY.md). It is input to decisions, not a decision. Every distributor keeps retailer terms confidential, so margins come from public stand-ins (Bookshop.org's published shares, older OverDrive terms, Draft2Digital's royalty split) plus marked estimates. The original four write-ups hold the source links; re-check any figure before relying on it.

**Bottom line:** the books can be obtained. Making money on them is hard, and most of Tinct's AI features are not covered by a normal ebook licence.

## 1. ElevenReader (ElevenLabs)

No single distributor; a mixed catalogue:

- **Opt-in distributor channels:** Bookwire (March 2026; ~3,500 publishers, 1.5M ebooks), PublishDrive (October 2025), StreetLib and De Marque (September 2026). Publishers switch the channel on per title; ElevenReader narrates with AI.
- **Direct publisher deals:** HarperCollins (only Big Five), Blackstone, Vinci — 200,000+ titles in May 2026.
- **Self-publishing program:** $0.20 per hour listened, capped at $2.50 per book.
- **Standard Ebooks** for public domain.
- **Price:** $11/month including 20 hours of the premium catalogue.

The model is an **AI-rights channel publishers opt into** inside a distributor. Google's "Expert Intelligence" (AI Q&A on purchased ebooks, August 2026, with Penguin Random House and Macmillan) works the same way.

## 2. Routes and margins

Big-publisher ebooks use **agency pricing**: the publisher sets one price every store charges. The retailer keeps **30%** and cannot discount.

| Route | Retailer keeps | Reading screen | AI possible? | Effort |
|---|---|---|---|---|
| A. Affiliate links (Bookshop.org 10%, Kobo 5%) | 5–10% | Bookshop / Kobo | No | Very low |
| B. White-label store (Hummingbird) | ~10–23% (reported) | Hummingbird | No | Low |
| C. Distributor feed into own reader (Ingram CoreSource; De Marque; Bookwire with minimum turnover) | ~30% minus distributor cut | Tinct | Only where publisher grants AI rights | High: feeds, hosting, DRM |
| D. Indie aggregators (Draft2Digital, PublishDrive) | ~30% | Tinct | Easier; mostly DRM-free | Medium |
| E. Direct Big Five deals | 30% | Tinct | Negotiable | Very high |

Ingram CoreSource is the proven entry for small apps (Fable, Speechify, Legible); each publisher still enables a new retailer individually. Cheapest acceptable DRM: Readium LCP, ~€1,500/year under €300K revenue; Adobe DRM ~10× to set up. Fees: Stripe 2.9% + $0.30; Google Play billing ~15% — so purchases belong on the web.

## 3. Per-book economics (prices as of 2026-10-01)

| Book | Pricing | Amazon | Retailer cost | Keep (web) | Keep (Android in-app) |
|---|---|---|---|---|---|
| *Fury in Death* | agency | $14.99 | $10.49 | $3.76 | $2.25 |
| *The Counterrevolution* | agency | $19.99 | $13.99 | $5.12 | $3.00 |
| *Gone Girl* | agency | $10.99 | $7.69 | $2.68 | $1.65 |
| *Atomic Habits* | agency | $12.99 | $9.09 | $3.22 | $1.95 |
| *The Old Man and the Sea* | agency | $10.99 | $7.69 | $2.68 | $1.65 |
| *Of Mice and Men* | agency | $7.99 | $5.59 | $1.87 | $1.20 |
| Piketty, *Capital* | wholesale | $11.59 (list $24) | ~$14.40 (est.) | −$3.45 if matching Amazon | — |
| Indie, sold everywhere | aggregator | $4.99 | ~$3.49 | $1.05 | $0.75 |
| Kindle Unlimited exclusives / Amazon imprints | — | — | not available | — | — |
| Audiobook (*Atomic Habits*) | ~50% margin (est.) | Audible $18 / 1 credit | ~$9 | ~$5 | — |

## 4. Subscriptions

- Pay-per-read (Everand-style): 55% of price, capped at $5 per book — one new-release read ≈ 1.7 months of a $3 subscriber.
- Revenue pool (Kobo Plus, Perlego): 60–65% to rightsholders, leaving ~$0.70 per $3 subscriber before AI costs.
- Big Five subscription access has needed credit-based plans at $12–17/month. ElevenReader's $11 is the realistic level for a licensed catalogue.

## 5. Catalogue reach vs Amazon (estimates)

- By titles: ~35–50% of Kindle (≈5M Kindle titles are KU or Amazon-only).
- By spend (excluding KU): ~60–70%.
- Literary fiction, bestsellers, nonfiction: ~85–95%.
- Romance and indie series: ~20–35% (≈77% of the Kindle romance top 100 is in KU).
- Outside the US: 5–15% title gaps even with US and UK feeds.
- At launch: low single-digit millions of titles.

## 6. Which AI features a licence covers

| Feature | Status |
|---|---|
| Reading, highlights, notes, journal | Fine under a normal retail licence |
| On-demand page translation | Likely fine if temporary and private (Kindle, Google Play Books, Apple Books offer selection translation — not checked in this research). Needs a licence once stored, shared or a full translated edition |
| AI chat, recaps, character tracker | Needs publisher permission; since April 2026 grantable via an ONIX flag (code 14). Amazon shipped "Ask this Book" without it and is disputing with the Authors Guild |
| Modern English rewrites | Separate derivative licence; no retailer does this |
| AI narration | Needs audiobook rights, often held separately |

Tinct's signature features — Modern English and narration — work freely only on public-domain books.

## 7. Research recommendation

1. Keep public domain as the flagship.
2. Lowest-risk step: affiliate links, or a read-only tier via a distributor feed with web checkout and AI off.
3. A "Tinct-enhanced" tier title by title with publishers granting AI rights; independents first, then PRH and Macmillan citing Google's precedent. Public deals use a 50/50 revenue share per use or a per-title fee.
4. Any licensed catalogue needs a separate price (~$10–15), outside Premium.

To verify before acting: actual adoption of the ONIX AI flag, CoreSource terms for a small reader, and a legal view on live simplification of in-copyright text.
