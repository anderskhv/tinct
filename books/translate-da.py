"""3-pass EN→DA translation pipeline for Tinct books.

Based on Andrew Ng's translation-agent pattern. Designed to run through Claude CLI
conversations, not Anthropic API. Zero API spend.

Usage:
  python3 translate-da.py prepare <book-id> [--chapter N]
    → Chunks the book and writes prompt files for each chunk

  python3 translate-da.py status <book-id>
    → Shows which chunks are done / pending

  python3 translate-da.py assemble <book-id> [--chapter N]
    → Assembles completed chunks into the final modern-da.json

  python3 translate-da.py correct <book-id> "<ai text>" "<human text>"
    → Adds a correction to the few-shot examples

Workflow:
  1. Run `prepare` to generate chunk files
  2. In a Claude conversation, read each chunk's prompt, translate, write response back
  3. Run `assemble` to build the final Danish edition

Files:
  books/pipeline/<book-id>/glossary.json         — per-book glossary (grows over time)
  books/pipeline/<book-id>/few-shot.json          — correction examples
  books/pipeline/<book-id>/progress.json          — tracks completed chunks
  books/pipeline/<book-id>/prompts/ch<N>_chunk<M>_pass<P>.md  — prompt files
  books/pipeline/<book-id>/responses/ch<N>_chunk<M>_pass<P>.md — response files
"""

import json
import os
import sys


EDITIONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'app', 'public', 'data', 'editions')
PIPELINE_BASE = os.path.join(os.path.dirname(__file__), 'pipeline')


TRANSLATE_SYSTEM = "You are a native Danish author and philosopher. You are NOT translating — you are rewriting this text as if it were originally written in Danish. Think in Danish. Write in Danish. If a sentence sounds like it was translated from English, rewrite it until it doesn't."

REFLECT_SYSTEM = "You are an expert Danish literary editor reviewing a translation from English. Your goal is to identify every place where the Danish sounds translated rather than native. Be specific and thorough."

REFINE_SYSTEM = "You are a native Danish author. You have written a draft and received editorial feedback. Incorporate all valid suggestions to produce the final text. The result should read as if originally written in Danish."


def load_json(path, default=None):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return default if default is not None else {}


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def read_file(path):
    if os.path.exists(path):
        with open(path) as f:
            return f.read()
    return None


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)


def estimate_tokens(text):
    return len(text) // 4


def chunk_paragraphs(paragraphs, max_tokens=900):
    """Split paragraphs into chunks of ~max_tokens. Never splits mid-paragraph."""
    chunks = []
    current = []
    current_tokens = 0

    for i, para in enumerate(paragraphs):
        para_tokens = estimate_tokens(para)
        if current and current_tokens + para_tokens > max_tokens:
            chunks.append(current)
            current = []
            current_tokens = 0
        current.append((i, para))
        current_tokens += para_tokens

    if current:
        chunks.append(current)
    return chunks


def load_translation_rules():
    path = os.path.join(os.path.dirname(__file__), 'DA-translation-instructions.md')
    return read_file(path) or "(No translation rules file found)"


def format_glossary(glossary):
    if not glossary:
        return "(No glossary terms yet — this will grow as translation proceeds)"
    return '\n'.join(f'- "{en}" → "{da}"' for en, da in sorted(glossary.items()))


def format_few_shot(examples):
    if not examples:
        return "(No correction examples yet — these accumulate over time)"
    return '\n'.join(f'AI: "{ex["ai"]}" → Human: "{ex["human"]}"' for ex in examples)


def format_prev_terms(terms):
    if not terms:
        return "(First chunk — no previous terms)"
    return '\n'.join(f'- "{en}" → "{da}"' for en, da in terms.items())


# ── Prompt builders ──────────────────────────────────────────────────

def build_pass1_prompt(chunk_text, full_source, glossary, few_shot, prev_terms, para_count):
    return f"""**System:** {TRANSLATE_SYSTEM}

---

Here is the full English text for context:
<FULL_SOURCE>
{full_source}
</FULL_SOURCE>

Translate ONLY the section between the tags below into Danish:
<TRANSLATE_THIS>
{chunk_text}
</TRANSLATE_THIS>

## Glossary (use these terms consistently)
{format_glossary(glossary)}

## Style examples (learn the desired Danish voice from these corrections)
{format_few_shot(few_shot)}

## Terms from previous chunk (maintain consistency)
{format_prev_terms(prev_terms)}

Output EXACTLY {para_count} paragraphs of Danish text, separated by blank lines. No explanations."""


def build_pass2_prompt(chunk_en, chunk_da, rules):
    return f"""**System:** {REFLECT_SYSTEM}

---

## Source (English)
{chunk_en}

## Translation (Danish)
{chunk_da}

## Translation Rules
{rules}

Review the translation and provide specific suggestions for improvement. For each issue, state:
1. The problematic Danish phrase
2. What's wrong (which rule it violates, or why it sounds translated)
3. Your proposed fix

Check specifically for:
- Words translated by dictionary lookup rather than by function
- Noun constructions where Danish wants a verb
- English-calqued phrases
- Unnecessary commas before "at"-clauses
- English nesting patterns
- Adjective vs. adverb agreement
- Overly formal register
- Missing explicit nouns
- "Det at [verb]" gerund calques
- Any phrase that sounds "translated"

Output only your list of suggestions."""


def build_pass3_prompt(chunk_en, chunk_da, suggestions, para_count):
    return f"""**System:** {REFINE_SYSTEM}

---

## Source (English)
{chunk_en}

## Your draft (Danish)
{chunk_da}

## Editorial suggestions
{suggestions}

Rewrite the Danish text incorporating the editorial suggestions. Where you disagree with a suggestion, keep your original if it genuinely reads better.

Output EXACTLY {para_count} paragraphs of final Danish text, separated by blank lines. No explanations."""


# ── Commands ─────────────────────────────────────────────────────────

def cmd_prepare(book_id, chapter=None):
    """Chunk the book and write prompt files for pass 1."""
    source = load_json(os.path.join(EDITIONS_DIR, f'{book_id}-modern-en.json'))
    if not source:
        print(f"ERROR: {book_id}-modern-en.json not found")
        return

    pipeline_dir = os.path.join(PIPELINE_BASE, book_id)
    glossary = load_json(os.path.join(pipeline_dir, 'glossary.json'), {})
    few_shot = load_json(os.path.join(pipeline_dir, 'few-shot.json'), [])

    chapters = source['chapters']
    if chapter is not None:
        chapters = [ch for ch in chapters if ch['number'] == chapter]

    total_chunks = 0

    for ch in chapters:
        full_source = '\n\n'.join(ch['paragraphs'])
        chunks = chunk_paragraphs(ch['paragraphs'])
        prev_terms = {}

        for ci, chunk in enumerate(chunks):
            chunk_key = f"ch{ch['number']}_chunk{ci}"
            chunk_text = '\n\n'.join(para for _, para in chunk)
            para_count = len(chunk)

            # Write pass 1 prompt
            prompt = build_pass1_prompt(chunk_text, full_source, glossary, few_shot, prev_terms, para_count)
            write_file(os.path.join(pipeline_dir, 'prompts', f'{chunk_key}_pass1.md'), prompt)

            # Write chunk metadata
            save_json(os.path.join(pipeline_dir, 'chunks', f'{chunk_key}.json'), {
                'chapter': ch['number'],
                'chunk_index': ci,
                'para_indices': [i for i, _ in chunk],
                'para_count': para_count,
                'en_text': chunk_text,
            })

            total_chunks += 1

        print(f"  Ch {ch['number']}: {len(ch['paragraphs'])} paras → {len(chunks)} chunks")

    print(f"\nPrepared {total_chunks} chunks in pipeline/{book_id}/prompts/")
    print(f"\nWorkflow for each chunk:")
    print(f"  1. Read prompts/ch<N>_chunk<M>_pass1.md")
    print(f"  2. Translate → write to responses/ch<N>_chunk<M>_pass1.md")
    print(f"  3. Run: python3 translate-da.py gen-pass2 {book_id} ch<N>_chunk<M>")
    print(f"  4. Read prompts/ch<N>_chunk<M>_pass2.md")
    print(f"  5. Reflect → write to responses/ch<N>_chunk<M>_pass2.md")
    print(f"  6. Run: python3 translate-da.py gen-pass3 {book_id} ch<N>_chunk<M>")
    print(f"  7. Read prompts/ch<N>_chunk<M>_pass3.md")
    print(f"  8. Refine → write to responses/ch<N>_chunk<M>_pass3.md")
    print(f"  9. Repeat for next chunk")
    print(f"  10. Run: python3 translate-da.py assemble {book_id}")


def cmd_gen_pass2(book_id, chunk_key):
    """Generate pass 2 (reflect) prompt using pass 1 response."""
    pipeline_dir = os.path.join(PIPELINE_BASE, book_id)
    chunk_data = load_json(os.path.join(pipeline_dir, 'chunks', f'{chunk_key}.json'))
    pass1_response = read_file(os.path.join(pipeline_dir, 'responses', f'{chunk_key}_pass1.md'))

    if not pass1_response:
        print(f"ERROR: No pass 1 response found for {chunk_key}")
        return

    rules = load_translation_rules()
    prompt = build_pass2_prompt(chunk_data['en_text'], pass1_response, rules)
    write_file(os.path.join(pipeline_dir, 'prompts', f'{chunk_key}_pass2.md'), prompt)
    print(f"Generated prompts/{chunk_key}_pass2.md")


def cmd_gen_pass3(book_id, chunk_key):
    """Generate pass 3 (refine) prompt using pass 1 response and pass 2 suggestions."""
    pipeline_dir = os.path.join(PIPELINE_BASE, book_id)
    chunk_data = load_json(os.path.join(pipeline_dir, 'chunks', f'{chunk_key}.json'))
    pass1_response = read_file(os.path.join(pipeline_dir, 'responses', f'{chunk_key}_pass1.md'))
    pass2_response = read_file(os.path.join(pipeline_dir, 'responses', f'{chunk_key}_pass2.md'))

    if not pass1_response or not pass2_response:
        print(f"ERROR: Missing pass 1 or pass 2 response for {chunk_key}")
        return

    prompt = build_pass3_prompt(chunk_data['en_text'], pass1_response, pass2_response, chunk_data['para_count'])
    write_file(os.path.join(pipeline_dir, 'prompts', f'{chunk_key}_pass3.md'), prompt)
    print(f"Generated prompts/{chunk_key}_pass3.md")


def cmd_status(book_id):
    """Show translation progress."""
    pipeline_dir = os.path.join(PIPELINE_BASE, book_id)
    source = load_json(os.path.join(EDITIONS_DIR, f'{book_id}-modern-en.json'))
    if not source:
        print(f"ERROR: {book_id}-modern-en.json not found")
        return

    prompts_dir = os.path.join(pipeline_dir, 'prompts')
    responses_dir = os.path.join(pipeline_dir, 'responses')

    for ch in source['chapters']:
        chunks = chunk_paragraphs(ch['paragraphs'])
        done = 0
        partial = 0
        for ci in range(len(chunks)):
            chunk_key = f"ch{ch['number']}_chunk{ci}"
            p3 = os.path.exists(os.path.join(responses_dir, f'{chunk_key}_pass3.md'))
            p2 = os.path.exists(os.path.join(responses_dir, f'{chunk_key}_pass2.md'))
            p1 = os.path.exists(os.path.join(responses_dir, f'{chunk_key}_pass1.md'))
            if p3:
                done += 1
            elif p1 or p2:
                partial += 1

        status = "complete" if done == len(chunks) else f"{done}/{len(chunks)} done" + (f", {partial} partial" if partial else "")
        print(f"  Ch {ch['number']:>2}: {len(chunks)} chunks — {status}")


def cmd_assemble(book_id, chapter=None):
    """Assemble completed pass 3 responses into modern-da.json."""
    pipeline_dir = os.path.join(PIPELINE_BASE, book_id)
    source = load_json(os.path.join(EDITIONS_DIR, f'{book_id}-modern-en.json'))
    if not source:
        print(f"ERROR: {book_id}-modern-en.json not found")
        return

    output_path = os.path.join(EDITIONS_DIR, f'{book_id}-modern-da.json')
    existing = load_json(output_path, {'chapters': []})
    existing_map = {ch['number']: ch for ch in existing.get('chapters', [])}

    chapters = source['chapters']
    if chapter is not None:
        chapters = [ch for ch in chapters if ch['number'] == chapter]

    assembled = 0
    for ch in chapters:
        chunks = chunk_paragraphs(ch['paragraphs'])
        all_paras = []
        complete = True

        for ci in range(len(chunks)):
            chunk_key = f"ch{ch['number']}_chunk{ci}"
            response_path = os.path.join(pipeline_dir, 'responses', f'{chunk_key}_pass3.md')
            response = read_file(response_path)

            if not response:
                print(f"  Ch {ch['number']}: missing pass 3 for chunk {ci}, skipping chapter")
                complete = False
                break

            paras = [p.strip() for p in response.split('\n\n') if p.strip()]
            expected = len(chunks[ci])
            if len(paras) != expected:
                print(f"  WARNING: Ch {ch['number']} chunk {ci}: expected {expected} paras, got {len(paras)}")

            all_paras.extend(paras)

        if complete:
            if len(all_paras) != len(ch['paragraphs']):
                print(f"  WARNING: Ch {ch['number']}: expected {len(ch['paragraphs'])} paras, got {len(all_paras)}")

            existing_map[ch['number']] = {
                'number': ch['number'],
                'title': ch['title'],
                'paragraphs': all_paras,
            }
            if 'section' in ch:
                existing_map[ch['number']]['section'] = ch['section']
            assembled += 1

    output = {
        'chapters': sorted(existing_map.values(), key=lambda c: c['number'])
    }
    if source.get('sections'):
        output['sections'] = source['sections']

    save_json(output_path, output)
    print(f"\nAssembled {assembled} chapter(s) → {output_path}")


def cmd_correct(book_id, ai_text, human_text):
    """Add a correction to few-shot examples."""
    pipeline_dir = os.path.join(PIPELINE_BASE, book_id)
    few_shot = load_json(os.path.join(pipeline_dir, 'few-shot.json'), [])
    few_shot.append({"ai": ai_text, "human": human_text})
    save_json(os.path.join(pipeline_dir, 'few-shot.json'), few_shot)
    print(f"Added correction: '{ai_text}' → '{human_text}' ({len(few_shot)} total)")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 translate-da.py prepare <book-id> [--chapter N]")
        print("  python3 translate-da.py gen-pass2 <book-id> <chunk-key>")
        print("  python3 translate-da.py gen-pass3 <book-id> <chunk-key>")
        print("  python3 translate-da.py status <book-id>")
        print("  python3 translate-da.py assemble <book-id> [--chapter N]")
        print('  python3 translate-da.py correct <book-id> "ai text" "human text"')
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd == 'prepare':
        book_id = args[0]
        chapter = int(args[args.index('--chapter') + 1]) if '--chapter' in args else None
        cmd_prepare(book_id, chapter)

    elif cmd == 'gen-pass2':
        cmd_gen_pass2(args[0], args[1])

    elif cmd == 'gen-pass3':
        cmd_gen_pass3(args[0], args[1])

    elif cmd == 'status':
        cmd_status(args[0])

    elif cmd == 'assemble':
        book_id = args[0]
        chapter = int(args[args.index('--chapter') + 1]) if '--chapter' in args else None
        cmd_assemble(book_id, chapter)

    elif cmd == 'correct':
        cmd_correct(args[0], args[1], args[2])

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


if __name__ == '__main__':
    main()
