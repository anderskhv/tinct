# RunPod Cloud GPU Setup for Kokoro Audio Generation

Step-by-step guide to rent an RTX 4090, run Kokoro TTS at ~10x your laptop's speed, and ship MP3s straight to R2. End-to-end first run: ~30 min setup + actual generation time.

## Why RunPod over alternatives
- **RunPod**: managed UI, persistent volumes, predictable pricing (~$0.40-0.80/hr RTX 4090)
- Vast.ai is cheaper but flakier (preemptions, less reliable)
- Lambda Labs is fine but ~2x more expensive
- AWS/GCP are 3-5x more expensive for the same GPU

## Step 1 — Account + funding (one-time, ~5 min)

1. Sign up at https://runpod.io with your fastmail email
2. Click "Billing" → "Add Funds" → start with **$20** (covers ~25 hours of RTX 4090 time, plenty for the full audio backlog with margin)
3. Enable email notifications for low balance

## Step 2 — Deploy a Pod (~5 min)

1. Click **"Pods"** → **"Deploy"**
2. **GPU**: Select **RTX 4090** (24 GB VRAM — Kokoro fits easily). If unavailable, RTX 4090 Ti or A100 PCIe also work; A100 SXM is overkill.
3. **Template**: Choose **"RunPod PyTorch 2.4"** (or any "PyTorch 2.x" template — comes with CUDA, Python, ffmpeg pre-installed)
4. **Storage**:
   - Container Disk: 20 GB (for OS + Python deps)
   - Volume Disk: **50 GB** (mounted at `/workspace`, persists across stops, holds audio output)
5. **Pricing tier**: Pick **"Spot"** (~$0.30/hr) — cheapest, can be preempted. Or **"Secure Cloud On-Demand"** (~$0.45/hr) — never preempted. For our idempotent script either works; spot is fine.
6. Click **"Deploy On-Demand"** (or "Deploy Spot")

The pod will spin up in 1-2 min.

## Step 3 — Connect (web terminal, easiest)

1. In RunPod console, find your running pod → click **"Connect"**
2. Choose **"Start Web Terminal"** — opens a shell in the browser, no SSH key setup needed

(Optional: if you prefer terminal, the same panel shows the SSH command. Add your local SSH pubkey under Account → SSH Public Keys first.)

## Step 4 — Install dependencies (~3 min)

In the web terminal:

```bash
# Update + install ffmpeg (for WAV→MP3) and curl
apt-get update -qq && apt-get install -y ffmpeg curl

# Install Kokoro + Python deps
pip install --quiet kokoro soundfile numpy

# Install Cloudflare wrangler via npm (for R2 uploads)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g wrangler
```

Verify GPU is visible to PyTorch:
```bash
python3 -c "import torch; print('CUDA:', torch.cuda.is_available(), '|', torch.cuda.get_device_name(0))"
```
Should print `CUDA: True | NVIDIA GeForce RTX 4090`.

## Step 5 — Configure secrets

You need two things on the pod:

**a) Cloudflare API Token** (for uploading to R2):
```bash
export CLOUDFLARE_API_TOKEN="<paste-your-token>"
```
Same token you have in `app/.env` locally. To make it persist across reboots:
```bash
echo 'export CLOUDFLARE_API_TOKEN="<paste-your-token>"' >> ~/.bashrc
```

**b) Wrangler config**: Wrangler needs to know your R2 bucket. Create a minimal config:
```bash
mkdir -p /workspace/tinct
cat > /workspace/tinct/wrangler.toml << 'EOF'
name = "tinct-r2-uploader"
EOF
```

## Step 6 — Pull edition JSON + the cloud-ready Kokoro script

The edition source files are public on tinct.app. The `run-kokoro-cloud.py` script (next section) fetches them on demand.

```bash
mkdir -p /workspace/tinct/scripts && cd /workspace/tinct/scripts
curl -O https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/run-kokoro-cloud.py
chmod +x run-kokoro-cloud.py
```

(I'll commit `run-kokoro-cloud.py` to the repo in the next step locally — it's adapted from `run-bible-audio.py` to write to `/workspace/audio` and pull edition JSON from `https://tinct.app/data/editions/`.)

## Step 7 — Run a generation job

For Bible KJV + WEB + modern-en regen all in one pass:

```bash
cd /workspace/tinct/scripts
python3 run-kokoro-cloud.py bible kjv-en bible web-en bible modern-en
```

Output goes to `/workspace/audio/bible/{kjv-en,web-en,modern-en}/...`, then uploads to R2 chapter by chapter (so you can stop early without losing work).

For the entire stale backlog (17 books):
```bash
python3 run-kokoro-cloud.py \
  ulysses original-en ulysses modern-en \
  moby-dick original-en moby-dick modern-en \
  meditations modern-en \
  great-expectations original-en great-expectations modern-en \
  imitation-of-christ original-en imitation-of-christ modern-en \
  phaedo original-en phaedo modern-en \
  crime-and-punishment modern-en \
  jane-eyre modern-en \
  pride-and-prejudice modern-en \
  war-and-peace original-en war-and-peace modern-en \
  jerusalem original-en jerusalem modern-en \
  the-republic modern-en \
  confessions original-en
```

At ~2,500 paragraphs/hour on RTX 4090 (guesstimate, will measure on first run), the full backlog (~80,000 paragraphs) takes ~32 hours = **~$10-15 total at $0.40/hr**.

## Step 8 — Stop the pod when done

After the script reports `ALL DONE.`, **stop the pod** to stop being billed:
1. Pods → your pod → **"Stop"**
2. The volume (50GB at /workspace) persists; you only pay storage (~$0.05/GB/month)
3. To resume later: **"Resume"** the same pod, env vars in `~/.bashrc` are preserved

If you want to fully delete: **"Terminate"**. Volume is wiped, $20 minus usage refunds.

## Common issues

| Issue | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'kokoro'` | Re-run `pip install kokoro` |
| `wrangler: command not found` | Re-run the `npm install -g wrangler` step |
| `401 Unauthorized` from R2 upload | Token expired/wrong; regenerate at Cloudflare dash → R2 → "Create API token" with R2 read+write |
| Pod preempted (spot pricing) | Just resume the pod — script is idempotent, picks up where it left off |
| GPU underutilized | Check `nvidia-smi` while running; should see >80% GPU usage. If not, batch size in Kokoro pipeline may need tuning |

## What this costs in practice

- **First-time setup**: ~30 min, ~$0.20 in pod time
- **Bible KJV regen** (6,704 paragraphs): ~2.5 hours, ~$1
- **Bible all 3 editions** (20,000 paragraphs): ~8 hours, ~$3
- **Full English backlog** (80,000 paragraphs): ~32 hours, ~$13
- **All future English audio for 200-book library**: ~$50 total over months

vs Cloud Chirp HD TTS: ~$700 for the same backlog. Vs hardware purchase: $2,000-2,500. Vs your MBA: 4 days of locked GPU.

---

**Decision rule:** if you're generating <100 hours of audio per month, RunPod is the right answer indefinitely. If you cross 200 hours/month sustained, hardware purchase becomes worth it.
