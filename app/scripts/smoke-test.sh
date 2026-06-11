#!/bin/bash
# Post-deploy smoke test for Tinct
# Run after every wrangler deploy to verify nothing is broken.
# Usage: ./scripts/smoke-test.sh [url]
# Default URL: https://tinct.ahvelplund.workers.dev

set -e

URL="${1:-https://tinct.ahvelplund.workers.dev}"
FAILURES=0
TESTS=0

pass() { TESTS=$((TESTS + 1)); echo "  ✓ $1"; }
fail() { TESTS=$((TESTS + 1)); FAILURES=$((FAILURES + 1)); echo "  ✗ $1"; }

echo "Smoke testing: $URL"
echo ""

# 1. Landing page loads
echo "1. Landing page"
LANDING=$(curl -sf "$URL/" 2>/dev/null || echo "FAIL")
if echo "$LANDING" | grep -q 'Tinct — Read Classic Books'; then
  pass "Landing page loads"
else
  fail "Landing page did not load"
fi

# 1b. SPA loads at /read
echo "1b. App"
HTML=$(curl -sf "$URL/read" 2>/dev/null || echo "FAIL")
if echo "$HTML" | grep -q '<div id="root"'; then
  pass "SPA loads at /read with root div"
else
  fail "SPA did not load at /read"
fi

# 2. JS bundle exists and loads
echo "2. JS Bundle"
JS_FILE=$(echo "$HTML" | sed -n 's/.*src="\(\/assets\/index-[^"]*\.js\)".*/\1/p' | head -1)
if [ -n "$JS_FILE" ]; then
  pass "JS bundle found: $JS_FILE"
  JS_CONTENT=$(curl -sf "$URL$JS_FILE" 2>/dev/null || echo "")

  # 2b. JS file contains actual JavaScript (not HTML fallback)
  if echo "$JS_CONTENT" | head -c 100 | grep -q "var \|function \|Object\.\|import "; then
    pass "JS bundle contains JavaScript code"
  else
    fail "JS bundle returns HTML instead of JavaScript — CRITICAL: app will not render"
  fi

  # 3. Supabase URL baked in
  echo "3. Supabase"
  if echo "$JS_CONTENT" | grep -q "supabase.co"; then
    pass "Supabase URL is in bundle"
  else
    fail "Supabase URL MISSING from bundle — auth will be broken"
  fi

  # 3b. Supabase anon key (JWT — always starts with eyJhbGciOi)
  # Catches the 2026-04-22/23 outage mode: URL present but anon key empty.
  if echo "$JS_CONTENT" | grep -q "eyJhbGciOi"; then
    pass "Supabase anon key is in bundle"
  else
    fail "Supabase anon key MISSING from bundle — auth will return \"Auth not configured\""
  fi

  # 4. Worker audio route baked in
  echo "4. Audio (Worker)"
  if echo "$JS_CONTENT" | grep -q "/api/audio-file"; then
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
if echo "$MANIFEST" | grep -q '"paragraphs"'; then
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
CSP_HEADER=$(curl -sI "$URL/read" 2>/dev/null | tr -d '\r' | awk -F': ' 'tolower($1)=="content-security-policy" { $1=""; sub(/^ /, ""); print }')
if [ -z "$CSP_HEADER" ]; then
  fail "CSP header missing from /read"
elif echo "$CSP_HEADER" | grep -q "media-src 'self'"; then
  pass "CSP media-src allows same-origin audio"
else
  fail "CSP does not permit same-origin media — audio playback may fail"
fi

# 9. CSS loads
echo "9. CSS"
CSS_FILE=$(echo "$HTML" | sed -n 's/.*href="\(\/assets\/index-[^"]*\.css\)".*/\1/p' | head -1)
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
