# RunPod Cloud GPU — Standard Audio Generation Path

**This is now the default way Tinct generates English audio.** Local Kokoro on the MacBook is reserved for emergency/single-paragraph fixes; everything bigger goes here.

## Why RunPod
- ~10x faster than MacBook Air M4 for Kokoro (RTX 4090 vs Apple Silicon GPU)
- ~$0.40/hr — full English audio backlog (~80k paragraphs) costs ~$10
- Doesn't lock up your laptop for coding
- Persistent volume — pause/resume any time, audio output preserved

vs cloud TTS APIs (Chirp HD): RunPod is **~70x cheaper** at the same scope, and keeps Bella voice consistency across the library.

vs hardware purchase ($2-4k): only worth it past 200+ hours of audio generation per month, sustained.

## First-time setup (~5 min, one time only)

1. Sign up at https://runpod.io with your fastmail email
2. Billing → Add Funds → **$20** (covers ~50 hours of RTX 4090, plenty)
3. Save your RunPod API key to macOS Keychain for future automation:
   ```bash
   security add-generic-password -a "$USER" -s RUNPOD_API_KEY -w "<paste-key>"
   ```

## Per-job workflow (~3 min setup, then unattended)

### Spin up a pod
1. RunPod console → **Pods** → **Deploy**
2. Pick **RTX 4090** + **PyTorch 2.x** template + **50 GB Volume**
3. Choose **On-Demand** ($0.45/hr, no preemption) or **Spot** ($0.30/hr, can be preempted — script is idempotent so spot is fine for non-urgent jobs)
4. Deploy → wait 1-2 min for boot → click **Connect** → **Start Web Terminal**

### Bootstrap the pod (one command)
In the web terminal, paste:

```bash
curl -fsSL https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/runpod-bootstrap.sh | bash
```

This installs ffmpeg, Kokoro, Node.js, wrangler, and downloads `run-kokoro-cloud.py`. Takes ~3 min. Final line should print `CUDA: True | NVIDIA GeForce RTX 4090`.

### Run a job
Set the token, start tmux, run the script:

```bash
export CLOUDFLARE_API_TOKEN="cfut_..."   # paste from app/.env
tmux new -s kokoro
cd /workspace/tinct/scripts
python3 run-kokoro-cloud.py BOOK EDITION [BOOK EDITION ...]
```

Job command examples:

```bash
# Single book
python3 run-kokoro-cloud.py the-republic modern-en

# Both editions of one book
python3 run-kokoro-cloud.py ulysses original-en ulysses modern-en

# Many books in one go (idempotent — skips chapters already on R2)
python3 run-kokoro-cloud.py \
  ulysses original-en ulysses modern-en \
  moby-dick original-en moby-dick modern-en \
  meditations modern-en
```

### Detach + leave it running
Once the first chapter completes successfully (output: `ch1: Np → R2 N/N (XXs)`), detach tmux:

- Press **Ctrl+B** then **D**
- Close the browser tab
- Pod keeps running, script keeps grinding

### Reattach later
- New web terminal → `tmux attach -t kokoro`
- See live progress, detach again the same way

### When done
- Pods → your pod → **Stop** (preserves volume, stops billing)
- Volume costs ~$0.05/GB/month while stopped — or click **Terminate** to wipe

## Pace expectations (RTX 4090 + Kokoro)

| Workload | Local MBA | RTX 4090 | Cost |
|---|---|---|---|
| Single chapter (~30 paragraphs) | ~3-5 min | ~10-30 sec | ~$0.005 |
| Bible KJV (6,704 paragraphs) | ~13 hours | ~1-2 hours | ~$0.50-1 |
| Full English backlog (~80k paragraphs) | ~100 hours | ~10-15 hours | ~$5-10 |

## Common issues

| Issue | Fix |
|---|---|
| `403 Forbidden` fetching edition JSON | Already fixed — script uses GitHub raw URLs, not tinct.app |
| `wrangler: command not found` after bootstrap | The bootstrap creates symlinks at `/usr/local/bin/wrangler` and `/usr/local/bin/wrangler`. If still missing: `ln -sf /usr/local/node/bin/wrangler /usr/local/bin/wrangler` |
| Pod preempted (spot) | Reattach: pod resumes automatically. Re-run the same command — script skips chapters already on R2. |
| Job stuck mid-chapter | `Ctrl+C`, re-run. Idempotent. |
| Token expired | Cloudflare dashboard → R2 → Manage R2 API Tokens → regenerate. Update `app/.env` locally and re-export on the pod. |

## Future: full automation

Planned next iteration — local CLI script that:
1. Reads RUNPOD_API_KEY from macOS Keychain
2. Spins up a pod via RunPod API
3. SSHes in, runs the bootstrap + job
4. Watches for completion
5. Stops the pod

Then audio jobs become one local command: `./run-cloud-audio.sh ulysses original-en`.

For now: the manual flow above is ~3 min of clicking + paste, then unattended for hours.
