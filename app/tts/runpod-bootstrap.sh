#!/bin/bash
# RunPod bootstrap — one-shot setup for Tinct audio generation pods.
#
# Usage on a fresh RunPod (PyTorch template) web terminal:
#   curl -fsSL https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/runpod-bootstrap.sh | bash
#
# Then export your token and run a job:
#   export CLOUDFLARE_API_TOKEN="cfut_..."
#   tmux new -s kokoro
#   cd /workspace/tinct/scripts
#   python3 run-kokoro-cloud.py BOOK EDITION [BOOK EDITION ...]
#
set -e

echo "═══ Tinct RunPod bootstrap ═══"
date

# 1. System packages (ffmpeg + curl + tmux)
echo "[1/5] Installing apt packages…"
apt-get update -qq
apt-get install -y -qq ffmpeg curl tmux

# 2. Kokoro Python deps
echo "[2/5] Installing Kokoro + Python deps…"
pip install --quiet kokoro soundfile numpy

# 3. Node.js (binary tarball — apt is broken on Ubuntu 22.04 RunPod images)
echo "[3/5] Installing Node.js 20…"
if [ ! -f /usr/local/node/bin/node ]; then
  cd /tmp
  curl -fsSL https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz -o node.tar.xz
  tar -xf node.tar.xz
  mv node-v20.18.0-linux-x64 /usr/local/node
  ln -sf /usr/local/node/bin/node /usr/local/bin/node
  ln -sf /usr/local/node/bin/npm  /usr/local/bin/npm
  ln -sf /usr/local/node/bin/npx  /usr/local/bin/npx
  rm -f node.tar.xz
fi
node --version

# 4. Wrangler (R2 uploads)
echo "[4/5] Installing wrangler…"
if [ ! -e /usr/local/bin/wrangler ]; then
  npm install -g wrangler 2>&1 | tail -1
  ln -sf /usr/local/node/bin/wrangler /usr/local/bin/wrangler
fi
wrangler --version

# 5. Tinct cloud script + wrangler config
echo "[5/5] Pulling Tinct cloud script…"
mkdir -p /workspace/tinct /workspace/tinct/scripts
cd /workspace/tinct/scripts
curl -fsSL https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/run-kokoro-cloud.py -o run-kokoro-cloud.py
chmod +x run-kokoro-cloud.py
echo 'name = "tinct-r2-uploader"' > /workspace/tinct/wrangler.toml

# Verify GPU
echo
echo "═══ GPU check ═══"
python3 -c "import torch; print('CUDA:', torch.cuda.is_available(), '|', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'NO GPU')"

cat <<'EOF'

═══ Bootstrap complete ═══

Next: export your Cloudflare token and start the job. Example:

  export CLOUDFLARE_API_TOKEN="cfut_..."
  tmux new -s kokoro
  cd /workspace/tinct/scripts
  python3 run-kokoro-cloud.py ulysses original-en moby-dick modern-en

To detach tmux (script keeps running): Ctrl+B then D
To reattach later:                     tmux attach -t kokoro

EOF
