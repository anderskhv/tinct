#!/bin/bash
# usage: ship.sh "commit subject"  -- regenerate shards, commit, push (with retry)
set -e
cd /home/user/tinct/.claude/worktrees/agent-ac96c872780d8f856
(cd app && node scripts/split-edition-chapters.cjs middlemarch-modern-en --write-registry | tail -1)
git add -A books/wip/middlemarch app/public/data app/src/data/editionShardRegistry.ts
git commit -q -m "$1

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QJk2tNx2G1hvPj8zSbRU8M"
for d in 0 4 10 20; do
  sleep $d
  if git push -u origin integration/editorial-fixes-middlemarch 2>&1 | tail -1; then break; fi
done
git log --oneline | head -3
