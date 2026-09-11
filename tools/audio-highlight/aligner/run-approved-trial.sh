#!/usr/bin/env bash
# Only execute after paid-trial approval and external provider termination setup.
# Inputs: complete prepared cohort directory, fresh output directory.
set -euo pipefail
trial_inputs=$(cd "$1" && pwd)
trial_output=$2
trial_tools=$(cd "$(dirname "$0")" && pwd)
: "${TINCT_PAID_TRIAL_APPROVED:?Set only after Anders approves the bounded trial}"
: "${TINCT_PROVIDER_DEADLINE_CONFIRMED:?Confirm external pod termination within 60 paid minutes}"
python3 -m venv "$trial_output-venv"
source "$trial_output-venv/bin/activate"
python -m pip install 'faster-whisper==1.2.1' 'ctranslate2==4.6.0'
export TINCT_TRIAL_MODEL="$trial_output-model"
python - <<'PY'
import os
from huggingface_hub import snapshot_download
snapshot_download('Systran/faster-whisper-small.en',revision='d1d751a5f8271d482d14ca55d9e2deeebbae577f',local_dir=os.environ['TINCT_TRIAL_MODEL'],allow_patterns=['*.json','*.bin','vocabulary.*'])
PY
trial_model_hash=$(PYTHONPATH="$trial_tools" python -c 'import os,trial;print(trial.tree_hash(os.environ["TINCT_TRIAL_MODEL"]))')
python "$trial_tools/trial.py" --input "$trial_inputs/cohort.json" --output "$trial_output" --model-path "$TINCT_TRIAL_MODEL" --model-sha256 "$trial_model_hash" --max-seconds 2700 --run
