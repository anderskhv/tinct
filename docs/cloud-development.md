# Tinct cloud development

Prepared: 2026-09-11

The goal is to edit, test and release from remote checkouts so the Mac is an
optional interface. This setup does not migrate existing local-only changes,
audio jobs or desktop automations. Preserve those before removing local files.

## Set up a cloud coding environment

Connect the existing anderskhv/tinct GitHub repository to the selected cloud
coding service. Configure Node **24.13.0**, then use this setup command from the
repository root:

```bash
bash scripts/cloud-setup.sh
```

The script checks Node 24 and installs locked app dependencies. It does not
deploy, download audio, generate editions or request production secrets.
Configure setup-time network access for the package registry. Additional tools
or agent-time network access depend on the task and environment policy.

For Codex, configure the environment through its settings; consult the
[official environment guide](https://learn.chatgpt.com/docs/environments/cloud-environment).
Account access and a successful cloud task must be verified before calling the
coding environment operational. A local desktop task is still local even when
the model itself is hosted remotely.

## Work from any device

Open the cloud coding service in a browser, select this repository and the
intended remote branch, and submit the task there. Save work as remote commits
and reviewable pull requests. Another computer can then continue from those
commits. Local uncommitted edits and local task history are not automatically
transferred to the cloud.

Read AGENTS.md; use the checkout root instead of the Mac-specific example paths.
Keep app, content and audio changes separate. Do not run Anthropic development
API calls or generate-editions.cjs. Use the existing dependency lockfile.

From app/, validate:

```bash
npm test
CI=true npm run build
npm run verify-bundle
```

Use the GitHub verify check on the PR. A reviewed merge to main runs the deploy
workflow. It installs dependencies, runs tests, then calls npm run deploy, which
builds and verifies before uploading. Production smoke tests must pass and the
served bundle must match the recorded release. See [deployment](cloud-deploy.md).

## Storage and ongoing jobs

Keep dependency folders, builds and temporary audio on remote runners. Do not
download whole working copies into iCloud-synced Documents/Desktop. A browser
cache or explicitly downloaded artifact may still use local space.

The GitHub repository is public. Never upload private recovery inventories,
credentials, signing keys or unscreened local backups here. Source and reviewed
public content belong in Git; private recovery assets need verified private
storage. Ephemeral cloud-agent disks and CI caches are not backups.

Audio generation, checkpoints, upload validation, remote scheduling and GPU
shutdown retain their separate execution and budget gates. Local desktop
automations do not keep running when the Mac is off. Full cutover requires
proof of remote supervision and recovery plus preservation of local-only work.

## Validation record

Runtime/setup changes are prepared for cloud CI validation. Record the successful
run and deployment evidence after execution; configuration alone is not proof
that every Tinct workflow is independent of the Mac.
