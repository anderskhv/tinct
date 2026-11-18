/**
 * Copy that depends on the AI allowance switch (src/aiAllowanceSwitch.ts).
 * Off (shipped): the wording on main, plus audiobooks and adding any book as
 * Premium (Anders, 2026-10-07). On: no message counts and no paid Cast or Feed;
 * audiobooks and adding any book are Premium, though narration is never
 * charged as AI use and only AI use is metered.
 */
import { describe, expect, it } from 'vitest'
import { AI_ALLOWANCE_ENFORCED } from './aiAllowanceSwitch'
import { threeDayEmail, trialEndedEmail, welcomeEmail } from './worker/routes/emails'
import { tinctPricingFact } from './voice/tinctTools'

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

describe('trial emails', () => {
  it('switch off: main wording and link, with audiobooks and adding any book as Premium', () => {
    expect(text(welcomeEmail(false).html)).toContain("You're in. For the next 30 days you have full Premium: AI companion, audiobook, adding any book, Cast, and Feed. No card on file, no charges.")
    expect(text(threeDayEmail(false).html)).toContain('Your free Premium trial ends in 3 days . To keep the AI companion, audiobook, adding any book, Cast, and Feed, subscribe for $5/month .')
    expect(text(trialEndedEmail(false).html)).toContain('Premium features (AI companion, audiobook, adding any book, Cast, Feed) have paused. $5/month brings them back whenever you want.')
    for (const email of [threeDayEmail(false), trialEndedEmail(false)]) expect(email.html).toContain('href="https://tinct.app?action=subscribe"')
  })

  it('switch on: Premium is AI chat, Talk, chapter recaps, audiobooks and adding any book, and the button opens the account page', () => {
    expect(text(welcomeEmail(true).html)).toContain('For the next 30 days you have full Premium: AI chat, Talk, chapter recaps, audiobooks and adding any book. No card on file, no charges.')
    expect(text(threeDayEmail(true).html)).toContain('To keep AI chat, Talk, chapter recaps, audiobooks and adding any book, subscribe for $5/month .')
    expect(text(trialEndedEmail(true).html)).toContain('Premium features (AI chat, Talk, chapter recaps, audiobooks and adding any book) have paused. $5/month brings them back whenever you want.')
    for (const email of [welcomeEmail(true), threeDayEmail(true), trialEndedEmail(true)]) {
      expect(email.html).not.toMatch(/Cast|Feed|messages|action=subscribe/)
    }
    for (const email of [threeDayEmail(true), trialEndedEmail(true)]) expect(email.html).toContain('href="https://tinct.app/sign-in?mode=account"')
  })

  it('follows the shipped switch by default', () => {
    expect(welcomeEmail().html).toBe(welcomeEmail(AI_ALLOWANCE_ENFORCED).html)
    expect(threeDayEmail().html).toBe(threeDayEmail(AI_ALLOWANCE_ENFORCED).html)
    expect(trialEndedEmail().html).toBe(trialEndedEmail(AI_ALLOWANCE_ENFORCED).html)
  })
})

describe('Talk pricing fact', () => {
  it('switch off: main wording, with adding any book as Premium', () => {
    expect(tinctPricingFact(false)).toBe('Reading without an account is free. A free account includes a 30-day Premium trial. Premium is $5 per month and includes 100 AI messages per month, audiobook, adding any book, Cast, offline mode, export, and the reading journal.')
  })

  it('switch on: a monthly amount of AI use, no message count', () => {
    const fact = tinctPricingFact(true)
    expect(fact).toContain('Premium is $5 per month and includes audiobooks, adding any book and a monthly amount of AI use, shown as a bar in the app.')
    expect(fact).toContain('When it runs out, you can still read and listen.')
    expect(fact).not.toMatch(/messages|\b100\b|\b200\b/)
  })

  it('follows the shipped switch by default', () => {
    expect(tinctPricingFact()).toBe(tinctPricingFact(AI_ALLOWANCE_ENFORCED))
  })
})
