#!/bin/bash
# Post-deploy smoke test for Tinct
# Run after every npm run deploy to verify nothing is broken.
# Usage: ./scripts/smoke-test.sh [url]
# Default URL: https://tinct.ahvelplund.workers.dev

set -e

URL="${1:-https://tinct.ahvelplund.workers.dev}"
FAILURES=0
TESTS=0

pass() { TESTS=$((TESTS + 1)); echo "  ✓ $1"; }
fail() { TESTS=$((TESTS + 1)); FAILURES=$((FAILURES + 1)); echo "  ✗ $1"; }

bundle_is_javascript() {
  printf '%s' "$1" | head -c 200 | grep -qE 'var |const |function |Object\.|import '
}

# Cloudflare can serve SPA HTML for a freshly deployed asset for a short window.
fetch_bundle_with_retry() {
  local bundle_url="$1"
  local max_attempts="${2:-12}"
  local wait_secs="${3:-5}"
  local attempt content
  for attempt in $(seq 1 "$max_attempts"); do
    content=$(curl -sf "$bundle_url" 2>/dev/null || echo "")
    if bundle_is_javascript "$content"; then
      printf '%s' "$content"
      return 0
    fi
    if [ "$attempt" -lt "$max_attempts" ]; then
      sleep "$wait_secs"
    fi
  done
  return 1
}

echo "Smoke testing: $URL"
echo ""

# 1. Landing page loads
echo "1. Landing page"
LANDING=$(curl -sf "$URL/" 2>/dev/null || echo "FAIL")
if printf '%s\n' "$LANDING" | grep -q 'Tinct — A New Way to Read'; then
  pass "Landing page loads"
else
  fail "Landing page did not load"
fi

# 1b. Static library hub loads at /read
echo "1b. Library hub"
LIBRARY=$(curl -sLf "$URL/read" 2>/dev/null || echo "FAIL")
if printf '%s\n' "$LIBRARY" | grep -q 'The Tinct Library'; then
  pass "Static library hub loads at /read"
else
  fail "Static library hub did not load at /read"
fi

# 1c. SPA loads at /reader
echo "1c. App"
HTML=$(curl -sf "$URL/reader" 2>/dev/null || echo "FAIL")
if printf '%s\n' "$HTML" | grep -q '<div id="root"'; then
  pass "SPA loads at /reader with root div"
else
  fail "SPA did not load at /reader"
fi

# 2. JS bundle exists and loads
echo "2. JS Bundle"
JS_FILE="${TINCT_EXPECTED_BUNDLE:-}"
if [ -z "$JS_FILE" ]; then
  JS_FILE=$(printf '%s\n' "$HTML" | sed -n 's/.*src="\(\/assets\/index-[^"]*\.js\)".*/\1/p' | head -1)
fi
if [ -n "$JS_FILE" ]; then
  pass "JS bundle found: $JS_FILE"
  if ! JS_CONTENT=$(fetch_bundle_with_retry "$URL$JS_FILE"); then
    JS_CONTENT=""
  fi

  # 2b. JS file contains actual JavaScript (not HTML fallback)
  if bundle_is_javascript "$JS_CONTENT"; then
    pass "JS bundle contains JavaScript code"
  else
    fail "JS bundle returns HTML instead of JavaScript — CRITICAL: app will not render"
    JS_CONTENT=""
  fi

  # Shared configuration can be factored into a statically imported chunk.
  if [ -n "$JS_CONTENT" ]; then
    CONFIG_MARKERS=$(node "$(dirname "$0")/check-deployed-config.cjs" "$URL$JS_FILE")
  else
    CONFIG_MARKERS=""
  fi
  # 3. Supabase URL baked in
  echo "3. Supabase"
  if grep -q "supabase-url" <<<"$CONFIG_MARKERS"; then
    pass "Supabase URL is in bundle"
  else
    fail "Supabase URL MISSING from bundle — auth will be broken"
  fi

  # 3b. Supabase anon key (JWT — always starts with eyJhbGciOi)
  # Catches the 2026-04-22/23 outage mode: URL present but anon key empty.
  if grep -q "supabase-key" <<<"$CONFIG_MARKERS"; then
    pass "Supabase anon key is in bundle"
  else
    fail "Supabase anon key MISSING from bundle — auth will return \"Auth not configured\""
  fi

  # 4. Worker audio route baked in
  echo "4. Audio (Worker)"
  if grep -q "/api/audio-file" <<<"$JS_CONTENT"; then
    pass "Worker audio route is in bundle"
  else
    fail "Worker audio route MISSING from bundle — audio will be broken"
  fi

  # 4b. AI-narration disclaimer MP3s accessible (both languages)
  for lang in en da; do
    D_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/audio-file?path=disclaimer-${lang}.mp3")
    if [ "$D_STATUS" = "200" ]; then
      pass "Disclaimer audio disclaimer-${lang}.mp3 reachable"
    else
      fail "Disclaimer audio disclaimer-${lang}.mp3 unreachable (HTTP $D_STATUS) — first-play UX will skip the AI notice"
    fi
  done
else
  fail "JS bundle not found in HTML"
fi

# 5. Chat API endpoint responds (expects 401 for unauthenticated, which proves the endpoint is alive)
echo "5. Chat API"
CHAT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ping"}]}' 2>/dev/null || echo "000")
if [ "$CHAT_STATUS" = "401" ] || [ "$CHAT_STATUS" = "200" ] || [ "$CHAT_STATUS" = "429" ]; then
  pass "Chat API responds (HTTP $CHAT_STATUS)"
else
  fail "Chat API returned unexpected HTTP $CHAT_STATUS"
fi

# 6. Audio manifest accessible through Worker
echo "6. Audio files (Worker)"
MANIFEST=$(curl -sf "$URL/api/audio-manifest?path=odyssey/original-en/ch1/manifest.json" 2>/dev/null || echo "FAIL")
if printf '%s\n' "$MANIFEST" | grep -q '"paragraphs"'; then
  pass "Audio manifest loads through Worker"
else
  fail "Audio manifest not accessible through Worker"
fi

# 7. Sample audio file accessible
AUDIO_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$URL/api/audio-file?path=odyssey/original-en/ch1/p0.mp3" 2>/dev/null || echo "000")
if [ "$AUDIO_STATUS" = "200" ]; then
  pass "Sample audio file loads (200)"
else
  fail "Sample audio file returned $AUDIO_STATUS"
fi

# 8. CSP allows same-origin media playback (regression guard: without
#    `media-src`, audio falls back to default-src and browser policy changes
#    causing audio play to silently cascade through the chapter.)
echo "8. CSP audio allowlist"
CSP_HEADER=$(curl -sI "$URL/reader" 2>/dev/null | tr -d '\r' | awk -F': ' 'tolower($1)=="content-security-policy" { $1=""; sub(/^ /, ""); print }')
if [ -z "$CSP_HEADER" ]; then
  fail "CSP header missing from /reader"
elif printf '%s\n' "$CSP_HEADER" | grep -q "media-src 'self'"; then
  pass "CSP media-src allows same-origin audio"
else
  fail "CSP does not permit same-origin media — audio playback may fail"
fi

# 9. CSS loads
echo "9. CSS"
CSS_FILE=$(printf '%s\n' "$HTML" | sed -n 's/.*href="\(\/assets\/index-[^"]*\.css\)".*/\1/p' | head -1)
if [ -n "$CSS_FILE" ]; then
  CSS_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$URL$CSS_FILE" 2>/dev/null || echo "000")
  if [ "$CSS_STATUS" = "200" ]; then
    pass "CSS loads (200)"
  else
    fail "CSS returned $CSS_STATUS"
  fi
else
  fail "CSS file not found in HTML"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILURES -eq 0 ]; then
  echo "  All $TESTS tests passed ✓"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "  $FAILURES of $TESTS tests FAILED ✗"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
