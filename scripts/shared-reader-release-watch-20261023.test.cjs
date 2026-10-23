const { test } = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { join } = require('node:path')
const watcher = join(__dirname, 'shared-reader-release-watch-20261023.sh')
function run(body) {
  return spawnSync('bash', ['-c', 'source "$1"; ' + body, 'watch-test', watcher], { encoding: 'utf8', timeout: 3000 })
}

test('rejects main drift before dispatch', () => {
  const r = run('main_sha() { printf wrong; }; gh() { echo MUTATION >&2; }; launch_once deploy.yml expected reader')
  assert.equal(r.status, 1); assert.match(r.stderr, /main changed/); assert.doesNotMatch(r.stderr, /MUTATION/)
})
test('rejects duplicate runs', () => {
  const r = run("api() { printf '123\\n456\\n'; }; find_run deploy.yml abc")
  assert.equal(r.status, 1); assert.match(r.stderr, /Multiple deploy.yml runs/)
})
test('adopts an existing failed or successful run instead of launching another', () => {
  const r = run('main_sha() { printf expected; }; find_run() { printf 123; }; gh() { echo MUTATION >&2; }; launch_once voice-lab-acceptance.yml expected voice')
  assert.equal(r.status, 0); assert.equal(r.stdout, '123'); assert.doesNotMatch(r.stderr, /MUTATION/)
})
test('reader dispatch carries the explicit phase, approval and direct-mode inputs', () => {
  const r = run('main_sha() { printf expected; }; find_run() { if test "${sent:-}" = yes; then printf 123; fi; }; gh() { printf "ARG:%s\\n" "$@" >&2; sent=yes; }; launch_once deploy.yml expected reader')
  assert.equal(r.status, 0); assert.equal(r.stdout, '123')
  for (const input of ['mode=direct', 'release_phase=reader', 'approved_reader_release=true']) assert.ok(r.stderr.includes('ARG:' + input))
  assert.equal((r.stderr.match(/ARG:workflow/g) || []).length, 1)
})
test('paid dispatch is once and carries only the approved voice opt-in', () => {
  const r = run('main_sha() { printf expected; }; find_run() { if test "${sent:-}" = yes; then printf 789; fi; }; gh() { printf "ARG:%s\\n" "$@" >&2; sent=yes; }; launch_once voice-lab-acceptance.yml expected voice')
  assert.equal(r.status, 0); assert.equal(r.stdout, '789'); assert.match(r.stderr, /ARG:approved_paid_voice_qa=true/)
  assert.equal((r.stderr.match(/ARG:workflow/g) || []).length, 1)
})
test('uncertain dispatch stops without retry', () => {
  const r = run('main_sha() { printf expected; }; find_run() { :; }; gh() { echo ATTEMPT >&2; return 1; }; launch_once deploy.yml expected reader')
  assert.equal(r.status, 1); assert.equal((r.stderr.match(/ATTEMPT/g) || []).length, 1); assert.match(r.stderr, /rather than retrying/)
})
test('unknown workflow or phase never reaches gh', () => {
  for (const args of ['unknown.yml expected reader', 'deploy.yml expected normal', 'voice-lab-acceptance.yml expected retry']) {
    const r = run('main_sha() { printf expected; }; find_run() { :; }; gh() { echo MUTATION >&2; }; launch_once ' + args)
    assert.equal(r.status, 1); assert.doesNotMatch(r.stderr, /MUTATION/)
  }
})
test('a failed release prevents the next stage', () => {
  const r = run("api() { printf 'completed|failure|expected|workflow_dispatch|.github/workflows/deploy.yml'; }; wait_run 123 expected deploy.yml floor; echo NEXT")
  assert.equal(r.status, 1); assert.match(r.stderr, /floor finished as failure/); assert.doesNotMatch(r.stdout, /NEXT/)
})
test('source, event or workflow mismatch prevents acceptance', () => {
  for (const meta of ['completed|success|wrong|workflow_dispatch|.github/workflows/deploy.yml', 'completed|success|expected|push|.github/workflows/deploy.yml', 'completed|success|expected|workflow_dispatch|.github/workflows/other.yml']) {
    const r = run(`api() { printf '%s' '${meta}'; }; wait_run 123 expected deploy.yml floor`)
    assert.equal(r.status, 1); assert.match(r.stderr, /unexpected source or workflow/)
  }
})
test('successful exact-source release can advance', () => {
  const r = run("api() { printf 'completed|success|expected|workflow_dispatch|.github/workflows/deploy.yml'; }; wait_run 123 expected deploy.yml floor; echo NEXT")
  assert.equal(r.status, 0); assert.match(r.stdout, /NEXT/)
})
test('reader must retain the reviewed source and floor ancestors', () => {
  const r = run('api() { printf wrong; }; assert_ancestor expected reader')
  assert.equal(r.status, 1); assert.match(r.stderr, /required ancestor/)
})
test('polling deadline stops instead of waiting indefinitely', () => {
  const r = run('WATCH_DEADLINE=0; pause')
  assert.equal(r.status, 1); assert.match(r.stderr, /Six-hour limit reached/)
})

function readerFixture(override = '') {
  return `
    fixture_reader_sha=${'e'.repeat(40)};
    api() {
      case "$1" in
        pulls/604) printf 'true|%s|main|%s' "$fixture_reader_sha" "$READER_BRANCH" ;;
        git/ref/heads/main) printf '%s' "$fixture_reader_sha" ;;
        compare/*) local base=\${1#compare/}; printf '%s' "\${base%%...*}" ;;
        *) return 1 ;;
      esac
    };
    content_field() {
      if test "$3" = "\${fixture_break_field:-}"; then printf wrong; return; fi
      case "$3" in
        .phase) printf pending ;;
        .floorCommit) printf '%s' "$FLOOR_SHA" ;;
        .proof) printf src/worker.rollbackFloor.test.ts ;;
        .floorVersionId) printf aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa ;;
      esac
    };
    ${override || ':'};
    wait_reader_merge
  `
}
test('only a merged reader retaining both ancestors and exact floor metadata advances', () => {
  const r = run(readerFixture())
  assert.equal(r.status, 0, r.stderr); assert.equal(r.stdout, 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
})
test('wrong rollout phase, floor commit, proof or UUID refuses dispatch readiness', () => {
  for (const field of ['.phase', '.floorCommit', '.proof', '.floorVersionId']) {
    const r = run(readerFixture(`fixture_break_field='${field}'`))
    assert.equal(r.status, 1); assert.match(r.stderr, /Stopped:/)
  }
})
test('GitHub read errors inside substitutions never become an empty run list and a duplicate launch', () => {
  const r = run('main_sha() { printf expected; }; api() { return 1; }; gh() { echo MUTATION >&2; }; result=$(launch_once deploy.yml expected reader)')
  assert.equal(r.status, 1); assert.doesNotMatch(r.stderr, /MUTATION/); assert.match(r.stderr, /Could not inspect existing runs/)
})
