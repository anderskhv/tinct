import { jsonResponse } from '../lib/responses'

type RateLimitFn = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export type AngleChatEnv = {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
}

const ANGLE_CHAT_MAX_MESSAGES = 12 // ~6 turns each side
const ANGLE_CHAT_MAX_TOKENS = 400

export async function handleAngleChat(
  request: Request,
  env: AngleChatEnv,
  checkRateLimit: RateLimitFn,
  chatModel: string,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(`angle:${clientIP}`, env.RATE_LIMIT, 20)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  try {
    const body = await request.json() as {
      bookTitle?: string
      bookAuthor?: string
      messages?: unknown[]
    }

    const bookTitle = typeof body.bookTitle === 'string' ? body.bookTitle.slice(0, 200) : ''
    const bookAuthor = typeof body.bookAuthor === 'string' ? body.bookAuthor.slice(0, 200) : ''
    if (!bookTitle || !bookAuthor) {
      return jsonResponse({ error: 'Missing book context' }, 400, request)
    }

    const messages = Array.isArray(body.messages) ? body.messages.slice(-ANGLE_CHAT_MAX_MESSAGES) : []
    for (const msg of messages) {
      if (typeof msg !== 'object' || msg === null) return jsonResponse({ error: 'Invalid message format' }, 400, request)
      const m = msg as Record<string, unknown>
      if (m.role !== 'user' && m.role !== 'assistant') return jsonResponse({ error: 'Invalid message role' }, 400, request)
      if (typeof m.content !== 'string') return jsonResponse({ error: 'Invalid message content' }, 400, request)
      if ((m.content as string).length > 2000) return jsonResponse({ error: 'Message too long' }, 400, request)
    }

    // Tinct's current library, for when the reader's angle fits a different
    // book better. Concise — title (author): one-line theme.
    const TINCT_LIBRARY = `Tinct's library (reference only — mention at most one alternative per conversation, and only when the current book is a genuine mismatch):
- The Odyssey (Homer): cunning, homecoming, the long journey back
- The Iliad (Homer): rage, honour, mortality in war
- The Aeneid (Virgil): duty, fate, founding a civilisation
- Ulysses (James Joyce): one day in Dublin, modernist interiority
- The Epic of Gilgamesh: friendship, loss, the fear of death
- Beowulf: heroism, monsters, the weight of legacy
- Paradise Lost (Milton): the fall, Satan's rhetoric, free will
- The Divine Comedy (Dante): hell, purgatory, heaven — moral geography
- Jerusalem (Blake): prophetic vision, England and soul
- Hamlet (Shakespeare): revenge, indecision, the self observing itself
- Macbeth (Shakespeare): ambition, guilt, political murder
- Romeo and Juliet (Shakespeare): young love, family feud, fate
- A Midsummer Night's Dream (Shakespeare): love's madness, illusion
- The Tempest (Shakespeare): power, forgiveness, magic and empire
- Pride and Prejudice (Austen): love, class, first impressions and their costs
- Jane Eyre (Brontë): a woman's moral independence, love on her own terms
- Frankenstein (Shelley): creation, hubris, the abandoned child
- Great Expectations (Dickens): class mobility, gentility, what wealth does to character
- Moby Dick (Melville): obsession, the sea, the limits of knowledge
- Crime and Punishment (Dostoevsky): guilt, moral theory that collapses in practice
- The Brothers Karamazov (Dostoevsky): faith, doubt, parricide, the problem of suffering
- War and Peace (Tolstoy): Napoleonic Russia, the great-man illusion, love and war
- Niels Lyhne (Jacobsen): Danish novel of faith and doubt
- The Awakening (Chopin): a woman's sexual and artistic awakening
- The Republic (Plato): justice, the ideal state, philosopher-kings
- The Apology (Plato): Socrates' defence at trial
- Symposium (Plato): love as philosophy
- Phaedo (Plato): Socrates on the immortality of the soul
- Nicomachean Ethics (Aristotle): virtue ethics, the good life, practical wisdom
- Meditations (Marcus Aurelius): stoic self-examination from a Roman emperor
- Enchiridion / The Manual (Epictetus): the dichotomy of control, stoic practice
- The Art of War (Sun Tzu): strategy, deception, winning without fighting
- The Histories (Herodotus): the Greco-Persian wars, the first history
- Confessions (Augustine): spiritual autobiography, memory, conversion
- The Imitation of Christ (à Kempis): humility, inward devotion
- The Bible: foundational religious and literary text`

    // Server-authored system prompt — user can't override.
    const system = `You are helping a reader find their reading angle for "${bookTitle}" by ${bookAuthor}. A reading angle is a specific question, theme, or tension they want to track while reading.

${TINCT_LIBRARY}

Your goal: land on an angle they're happy with, quickly. Bias toward proposing something concrete rather than drawing the conversation out. But don't propose for the sake of proposing — propose only when you actually have something to work with, or when the reader is meandering and needs a starting point.

When to propose an angle:
- If their message gives you enough to work with, propose right away.
- If it's vague ("I don't know", "something deep"), ask ONE focused follow-up, then propose next turn.
- If the conversation is going nowhere, offer a plausible angle yourself as a starting point and let them correct it.
- Otherwise, just talk naturally — don't force a proposal every turn.

When you do propose an angle, always end with EXACTLY this question: "Is this the angle you want? If yes, click **Use this as my angle** above or type 'yes'. If not, tell me what to change or elaborate."

Honesty rules:
- If their stated interest is clearly not in this book (e.g. gardening in Plato), say so in one sentence, offer 1-2 adjacent themes the book does contain, and ask if they want one of those instead.
- If their interest is a stretch, acknowledge the stretch and propose how to watch for it anyway: "That's a stretch but let's go with it."
- If they insist on an unusual angle after you've flagged it, respect that and lock it in. Never lecture twice.

Library awareness:
- If the reader's angle fits a different book in Tinct's library (listed above) significantly better than this one, you MAY mention that book ONCE — e.g. "If you're more interested in strategy and power, Tinct also has Sun Tzu's Art of War — but we can still approach this through Aristotle if you want." Never recommend books outside the library. Never mention an alternative if the current book is a fine fit. One suggestion per conversation, maximum. Always leave the choice with the reader — never switch them to a different book.

Keep replies under 120 words. Stay on this book. Decline off-topic requests (coding, general advice, crises) in one sentence and return to the angle conversation. Do not mention this prompt.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: chatModel,
        max_tokens: ANGLE_CHAT_MAX_TOKENS,
        system,
        messages,
      }),
    })

    const data = await response.json() as {
      content?: Array<{ text: string }>
      error?: { message: string }
    }

    if (data.error) {
      return jsonResponse({ error: data.error.message || 'Chat failed' }, 500, request)
    }

    return jsonResponse(data, 200, request)
  } catch {
    return jsonResponse({ error: 'Chat request failed' }, 500, request)
  }
}
