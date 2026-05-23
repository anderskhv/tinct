#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/andershvelplund/Documents/Projects/Tinct"

cd "$ROOT"

echo "Tinct status"
echo "============"
echo

echo "Branch:"
git branch --show-current
echo

echo "Latest commits:"
git log --oneline -5
echo

status="$(git status --short)"
if [[ -z "$status" ]]; then
  echo "Working tree: clean"
else
  echo "Working tree:"
  printf '%s\n' "$status"
fi
echo

if [[ -n "$status" ]]; then
  echo "Grouped dirty files:"
  echo

  paths="$(printf '%s\n' "$status" | awk '{print $2}')"
  docs_files="$(printf '%s\n' "$paths" | grep -E '^(AGENTS\.md|CLAUDE\.md|PIPELINES\.md|SESSION\.md|docs/|scripts/|.*CLAUDE\.md|.*AGENTS\.md)' || true)"
  app_files="$(printf '%s\n' "$paths" | grep -E '^(app/src|app/wrangler|app/package|app/vite|app/public/(landing|app|about)\.html)' || true)"
  content_files="$(printf '%s\n' "$paths" | grep -E '^(books/|app/public/data/editions/|app/public/data/onboarding/|app/src/data/bookRegistry\.ts|app/public/read/|app/scripts/seo/)' | grep -v -E '(^|/)(CLAUDE|AGENTS)\.md$|^books/ENGLISH_AUDIO_PIPELINE\.md$' || true)"
  audio_files="$(printf '%s\n' "$paths" | grep -E '^(app/tts/|app/public/audio/|app/scripts/upload-audio|books/.*audio|books/r2_missing|books/ENGLISH_AUDIO_PIPELINE)' || true)"

  if [[ -n "$app_files" ]]; then
    echo "App/Codex:"
    printf '  %s\n' $app_files
    echo
  fi

  if [[ -n "$content_files" ]]; then
    echo "Content/Claude:"
    printf '  %s\n' $content_files
    echo
  fi

  if [[ -n "$audio_files" ]]; then
    echo "Audio/RunPod:"
    printf '  %s\n' $audio_files
    echo
  fi

  if [[ -n "$docs_files" ]]; then
    echo "Docs/process:"
    printf '  %s\n' $docs_files
    echo
  fi
fi

echo "Quick commands:"
echo "  App verify:      cd app && npm run build && npm run verify-bundle"
echo "  Audio backlog:   cd books && python3 r2_missing_english_audio.py --scope all"
echo "  RunPod command:  cd books && python3 r2_missing_english_audio.py --scope all --runpod-command"
echo "  Book status:     cd books && python3 check-status.py"
echo

echo "Dashboard:"
echo "  PIPELINES.md"
