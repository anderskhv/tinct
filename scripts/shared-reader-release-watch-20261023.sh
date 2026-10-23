#!/usr/bin/env bash
# Run on Anders's authenticated Mac. This invokes only the already approved
# workflow_dispatch phases; all production checks and rollback stay in Actions.
# Requires Bash 3+, gh, and network. No token is read, copied, or printed.
set -euo pipefail

REPO=anderskhv/tinct
FLOOR_SHA=b70c495e6bcd756e64aa43cc2e7858ab77d9fccd
FLOOR_FIX_PR=606
FLOOR_FIX_BRANCH=codex/shared-reader-floor-dispatch-test-fix
READER_SOURCE=d6a79665e0a45c6cd8df8d36d778eedd2bc3e163
READER_PR=604
READER_BRANCH=codex/shared-reader-cloud-previews-20261023
POLL_SECONDS=30
MAX_SECONDS=21600

die() { printf '%s\n' "Stopped: $*" >&2; exit 1; }
log() { printf '%s %s\n' "$(date '+%H:%M:%S')" "$*" >&2; }
api() { gh api "repos/$REPO/$1" --jq "$2"; }
pause() {
  test "$(date +%s)" -lt "$WATCH_DEADLINE" || die 'Six-hour limit reached; no further workflow will be launched.'
  sleep "$POLL_SECONDS"
}
main_sha() { api git/ref/heads/main '.object.sha'; }
assert_main() { test "$(main_sha)" = "$1" || die 'main changed; refusing to launch a different commit.'; }
assert_ancestor() {
  test "$(api "compare/$1...$2" '.merge_base_commit.sha')" = "$1" || die "Reader does not retain required ancestor $1."
}
content_field() {
  api "contents/$1?ref=$2" ".content | @base64d | fromjson | $3"
}

wait_floor_fix_merge() {
  local initial=$FLOOR_SHA meta merged sha base branch
  log 'Waiting for the reviewed dispatch-test correction to merge.'
  while :; do
    meta=$(api "pulls/$FLOOR_FIX_PR" '[.merged, (.merge_commit_sha // ""), .base.ref, .head.ref] | map(tostring) | join("|")') || die 'Could not read the floor correction.'
    IFS='|' read -r merged sha base branch <<< "$meta"
    if test "$merged" = true; then
      test "$base" = main && test "$branch" = "$FLOOR_FIX_BRANCH" || die 'Floor correction has an unexpected branch.'
      case "$sha" in ''|*[!0-9a-f]*) die 'Invalid floor merge SHA.' ;; esac
      test "${#sha}" -eq 40 || die 'Invalid floor merge SHA length.'
      assert_main "$sha"
      assert_ancestor "$initial" "$sha"
      printf '%s' "$sha"
      return
    fi
    assert_main "$initial"
    pause
  done
}

# Exactly one matching manual run may be adopted. A failed voice run is never
# retried. Checking the whole commit prevents a restart from buying a new call.
find_run() {
  local ids
  ids=$(api "actions/workflows/$1/runs?head_sha=$2&event=workflow_dispatch&per_page=100" '.workflow_runs[].id') || die 'Could not inspect existing runs; refusing a possible duplicate.'
  case "$ids" in *$'\n'*) die "Multiple $1 runs exist for $2; review before continuing." ;; esac
  printf '%s' "$ids"
}
launch_once() {
  local workflow=$1 sha=$2 phase=$3 run attempt
  assert_main "$sha"
  run=$(find_run "$workflow" "$sha") || die 'Could not determine whether a run already exists.'
  if test -z "$run"; then
    log "Launching $workflow for $sha once."
    # If submission is uncertain, stop instead of repeating the mutation.
    if test "$workflow" = deploy.yml; then
      case "$phase" in floor|reader) ;; *) die 'Unapproved release phase.' ;; esac
      gh workflow run "$workflow" --repo "$REPO" --ref main \
        -f mode=direct -f "release_phase=$phase" -f approved_reader_release=true >&2 || die 'Dispatch returned an error; inspect Actions rather than retrying.'
    elif test "$workflow" = voice-lab-acceptance.yml && test "$phase" = voice; then
      gh workflow run "$workflow" --repo "$REPO" --ref main \
        -f approved_paid_voice_qa=true >&2 || die 'Voice submission returned an error; inspect Actions rather than retrying.'
    else
      die 'Unapproved workflow.'
    fi
    for attempt in 1 2 3 4 5 6; do
      run=$(find_run "$workflow" "$sha") || die 'Submitted workflow could not be inspected; no retry.'
      test -z "$run" || break
      pause
    done
    test -n "$run" || die 'Submitted run was not visible; inspect Actions rather than retrying.'
  else
    log "Using existing $workflow run $run; no duplicate launch."
  fi
  printf '%s' "$run"
}
wait_run() {
  local run=$1 sha=$2 workflow=$3 label=$4 meta status conclusion actual event file
  log "Waiting for $label: https://github.com/$REPO/actions/runs/$run"
  while :; do
    meta=$(api "actions/runs/$run" '[.status, (.conclusion // ""), .head_sha, .event, .path] | join("|")') || die 'Could not inspect the running workflow.'
    IFS='|' read -r status conclusion actual event file <<< "$meta"
    test "$actual" = "$sha" && test "$event" = workflow_dispatch && test "$file" = ".github/workflows/$workflow" || die "Run $run has an unexpected source or workflow."
    if test "$status" = completed; then
      test "$conclusion" = success || die "$label finished as $conclusion. Review its logs and any automatic rollback; no next step was launched."
      log "$label passed."
      return
    fi
    pause
  done
}
wait_reader_merge() {
  local meta merged sha base branch current phase floor_commit proof version
  log 'Waiting for the reviewed reader PR to merge after floor acceptance.'
  while :; do
    meta=$(api "pulls/$READER_PR" '[.merged, (.merge_commit_sha // ""), .base.ref, .head.ref] | map(tostring) | join("|")') || die 'Could not read the reviewed reader PR.'
    IFS='|' read -r merged sha base branch <<< "$meta"
    if test "$merged" = true; then
      test "$base" = main && test "$branch" = "$READER_BRANCH" || die 'Reader PR targets an unexpected branch.'
      case "$sha" in ''|*[!0-9a-f]*) die 'Invalid reader merge SHA.' ;; esac
      test "${#sha}" -eq 40 || die 'Invalid reader merge SHA length.'
      assert_main "$sha"
      assert_ancestor "$FLOOR_SHA" "$sha"
      assert_ancestor "$READER_SOURCE" "$sha"
      phase=$(content_field app/release/shared-reader-rollout.json "$sha" '.phase')
      test "$phase" = pending || die 'Reader rollout is not in the reviewed pending state.'
      floor_commit=$(content_field app/release/shared-reader-floor.json "$sha" '.floorCommit')
      proof=$(content_field app/release/shared-reader-floor.json "$sha" '.proof')
      version=$(content_field app/release/shared-reader-floor.json "$sha" '.floorVersionId')
      test "$floor_commit" = "$FLOOR_SHA" && test "$proof" = src/worker.rollbackFloor.test.ts || die 'Reader pins a different floor or proof.'
      [[ "$version" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] || die 'Reader has no actual floor version UUID.'
      printf '%s' "$sha"
      return
    fi
    current=$(main_sha)
    test "$current" = "$FLOOR_SHA" || die 'main changed before the reviewed reader PR merged.'
    pause
  done
}

watch_main() {
  command -v gh >/dev/null || die 'GitHub CLI is required.'
  gh auth status --hostname github.com >/dev/null 2>&1 || die 'GitHub CLI is not authenticated.'
  WATCH_LOCK_DIR=${TMPDIR:-/tmp}/tinct-shared-reader-watch-20261023.lock
  mkdir "$WATCH_LOCK_DIR" 2>/dev/null || die "Another helper may already be running ($WATCH_LOCK_DIR)."
  trap 'rmdir "$WATCH_LOCK_DIR" 2>/dev/null || true' EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  WATCH_DEADLINE=$(( $(date +%s) + MAX_SECONDS ))
  export WATCH_DEADLINE
  local floor_run reader_sha reader_run voice_run
  FLOOR_SHA=$(wait_floor_fix_merge)
  assert_main "$FLOOR_SHA"
  test "$(content_field app/release/shared-reader-rollout.json "$FLOOR_SHA" '.phase')" = floor-pending || die 'Floor is not in its reviewed pending state.'
  floor_run=$(launch_once deploy.yml "$FLOOR_SHA" floor)
  wait_run "$floor_run" "$FLOOR_SHA" deploy.yml 'Compatible old-reader release'
  reader_sha=$(wait_reader_merge)
  assert_main "$reader_sha"
  # All reader build/source/floor guards remain enforced by deploy.yml.
  reader_run=$(launch_once deploy.yml "$reader_sha" reader)
  wait_run "$reader_run" "$reader_sha" deploy.yml 'Shared reader release'
  assert_main "$reader_sha"
  # Explicitly approved: one guest Talk call, server-limited to 120 seconds,
  # no retry, budget $0.25, no new narration generation.
  voice_run=$(launch_once voice-lab-acceptance.yml "$reader_sha" voice)
  wait_run "$voice_run" "$reader_sha" voice-lab-acceptance.yml 'Single approved muted voice check'
  log 'Approved release sequence and voice check passed. Helper finished.'
}

if test "${BASH_SOURCE[0]}" = "$0"; then
  watch_main
fi
