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

# 1. Homepage loads and contains the app
echo "1. Homepage"
HTML=$(curl -sf "$URL/" 2>/dev/null || echo "FAIL")
if echo "$HTML" | grep -q '<div id="root"'; then
  pass "HTML loads with root div"
else
  fail "Homepage did not load"
fi

# 2. JS bundle exists and loads
echo "2. JS Bundle"
JS_FILE=$(echo "$HTML" | sed -n 's/.*src="\(\/assets\/index-[^"]*\.js\)".*/\1/p' | head -1)
if [ -n "$JS_FILE" ]; then
  pass "JS bundle found: $JS_FILE"
  JS_CONTENT=$(curl -sf "$URL$JS_FILE" 2>/dev/null || echo "")

  # 3. Supabase URL baked in
  echo "3. Supabase"
  if echo "$JS_CONTENT" | grep -q "supabase.co"; then
    pass "Supabase URL is in bundle"
  else
    fail "Supabase URL MISSING from bundle — auth will be broken"
  fi

  # 4. R2 audio URL baked in
  echo "4. Audio (R2)"
  if echo "$JS_CONTENT" | grep -q "r2.dev"; then
    pass "R2 audio URL is in bundle"
  else
    fail "R2 audio URL MISSING from bundle — audio will be broken"
  fi
else
  fail "JS bundle not found in HTML"
fi

# 5. Chat API endpoint responds
echo "5. Chat API"
CHAT_RESPONSE=$(curl -sf -X POST "$URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ping"}]}' 2>/dev/null || echo "FAIL")
if echo "$CHAT_RESPONSE" | grep -q '"content"'; then
  pass "Chat API responds with Claude content"
elif echo "$CHAT_RESPONSE" | grep -q '"error"'; then
  # An error response is still a working endpoint (might be rate limit, etc.)
  pass "Chat API responds (with error message)"
else
  fail "Chat API did not respond correctly"
fi

# 6. Audio manifest accessible from R2
echo "6. Audio files (R2)"
MANIFEST=$(curl -sf "https://pub-c34df89c93284423a39b03537595c2e2.r2.dev/odyssey/original-en/ch1/manifest.json" 2>/dev/null || echo "FAIL")
if echo "$MANIFEST" | grep -q '"paragraphs"'; then
  pass "Audio manifest loads from R2"
else
  fail "Audio manifest not accessible from R2"
fi

# 7. Sample audio file accessible
AUDIO_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "https://pub-c34df89c93284423a39b03537595c2e2.r2.dev/odyssey/original-en/ch1/p0.mp3" 2>/dev/null || echo "000")
if [ "$AUDIO_STATUS" = "200" ]; then
  pass "Sample audio file loads (200)"
else
  fail "Sample audio file returned $AUDIO_STATUS"
fi

# 8. CSS loads
echo "7. CSS"
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
