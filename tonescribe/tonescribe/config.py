import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("TONESCRIBE_DATA", Path(__file__).resolve().parent.parent / "data"))
MODEL_DIR = Path(os.environ.get("TONESCRIBE_MODELS", Path.home() / ".cache" / "tonescribe"))
PIANO_CHECKPOINT_URL = (
    "https://zenodo.org/record/4034264/files/"
    "CRNN_note_F1%3D0.9677_pedal_F1%3D0.9186.pth?download=1"
)


def device() -> str:
    forced = os.environ.get("TONESCRIBE_DEVICE")
    if forced:
        return forced
    import torch

    return "cuda" if torch.cuda.is_available() else "cpu"
