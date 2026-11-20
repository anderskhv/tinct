#!/usr/bin/env bash
# Run a post-deploy check, and once more if it fails (Anders, 20 Nov 2026; release review of 14-19 Nov).
# Nine of eighteen rollbacks that week were a single dropped connection, timeout or slow edge: the same check
# passed when run again. A check that fails twice still fails the job and rolls production back. A pass on
# the second try is never silent: it is a warning on the run and a line in the job summary.
set -u
"$@" && exit 0
first=$?
echo "::warning title=Check passed only on retry::'$*' failed (exit $first); running it once more in 20 s"
sleep 20
"$@"
second=$?
if [ "$second" -eq 0 ]; then
  echo "- Passed only on retry: \`$*\` (first try exit $first)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
else
  echo "- Failed twice: \`$*\` (exits $first, $second)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
fi
exit "$second"
