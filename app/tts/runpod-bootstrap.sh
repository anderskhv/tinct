#!/bin/bash
# RunPod bootstrap — one-shot setup for Tinct audio generation pods.
#
# Usage on a fresh RunPod (PyTorch template) web terminal:
#   curl -fsSL https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/runpod-bootstrap.sh | bash
#
# Then export your token and run a job:
#   export CLOUDFLARE_API_TOKEN="cfut_..."
#   tmux new -s kokoro
#   cd /workspace/tinct/repo
#   python3 app/tts/run-kokoro-cloud.py BOOK EDITION [BOOK EDITION ...]
#
set -e

echo "═══ Tinct RunPod bootstrap ═══"
date

# 1. System packages
echo "[1/6] Installing apt packages…"
apt-get update -qq
apt-get install -y -qq ffmpeg curl git tmux

# 2. Audio generation + word-alignment Python deps
echo "[2/6] Installing Kokoro, faster-whisper + Python deps…"
pip install --quiet kokoro soundfile numpy faster-whisper

# 3. Node.js (binary tarball — apt is broken on Ubuntu 22.04 RunPod images)
echo "[3/6] Installing Node.js 24…"
if [ ! -f /usr/local/node/bin/node ]; then
  cd /tmp
  curl -fsSL https://nodejs.org/dist/v24.13.0/node-v24.13.0-linux-x64.tar.xz -o node.tar.xz
  tar -xf node.tar.xz
  mv node-v24.13.0-linux-x64 /usr/local/node
  ln -sf /usr/local/node/bin/node /usr/local/bin/node
  ln -sf /usr/local/node/bin/npm  /usr/local/bin/npm
  ln -sf /usr/local/node/bin/npx  /usr/local/bin/npx
  rm -f node.tar.xz
fi
node --version

# 4. Wrangler (R2 uploads)
echo "[4/6] Installing wrangler…"
if [ ! -e /usr/local/bin/wrangler ]; then
  npm install -g wrangler 2>&1 | tail -1
  ln -sf /usr/local/node/bin/wrangler /usr/local/bin/wrangler
fi
wrangler --version

# 5. Current Tinct repository (edition data + both cloud pipelines)
echo "[5/6] Pulling the Tinct repository…"
mkdir -p /workspace/tinct
if [ -d /workspace/tinct/repo/.git ]; then
  git -C /workspace/tinct/repo pull --ff-only
else
  git clone --depth 1 https://github.com/anderskhv/tinct.git /workspace/tinct/repo
fi

# 6. Preserve the short legacy path used by existing audio commands.
echo "[6/6] Preparing cloud scripts…"
mkdir -p /workspace/tinct/scripts
cp /workspace/tinct/repo/app/tts/run-kokoro-cloud.py /workspace/tinct/scripts/run-kokoro-cloud.py
chmod +x /workspace/tinct/scripts/run-kokoro-cloud.py
echo 'name = "tinct-r2-uploader"' > /workspace/tinct/wrangler.toml

# Verify GPU
echo
echo "═══ GPU check ═══"
python3 -c "import torch; print('CUDA:', torch.cuda.is_available(), '|', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'NO GPU')"

cat <<'EOF'

═══ Bootstrap complete ═══

Next: export your Cloudflare token and start the job. Example:

  export CLOUDFLARE_API_TOKEN="cfut_..."
  export CLOUDFLARE_ACCOUNT_ID="58f26c4a077e8c66e0b017d2399ae1b3"
  tmux new -s kokoro
  cd /workspace/tinct/repo
  python3 app/tts/run-kokoro-cloud.py ulysses original-en moby-dick modern-en

To audit and generate accurate word highlighting for every audio-enabled
English and Danish edition:

  cd /workspace/tinct/repo
  python3 books/r2_words_sidecar_coverage.py --scope public --runpod-command

Copy and run the generated command. It skips completed chapters and cleans up
downloaded MP3s after each paragraph.

To detach tmux (script keeps running): Ctrl+B then D
To reattach later:                     tmux attach -t kokoro

EOF
