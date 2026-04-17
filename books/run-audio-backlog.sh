#!/bin/bash
# Audio backlog runner — Kokoro (EN) + Chirp (DA Chopin only).
# Sequential: one book at a time. Resumable (skips existing files
# except where --overwrite passed for regen of changed chapters).
#
# Logs to audio-backlog.log in this directory.

set -u

TINCT=/Users/andershvelplund/Documents/Projects/Tinct
TTS_DIR=$TINCT/app/tts
LOG=$TINCT/books/audio-backlog.log

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG"; }

# Run Kokoro over a chapter range with --overwrite (for regen of changed text)
regen_en_range() {
  local book=$1 start=$2 end=$3 desc=$4
  log "=== $book modern-en ch$start-$end ($desc) [overwrite] ==="
  python3 "$TTS_DIR/generate-audio-kokoro.py" "$book" modern-en "$start" "$end" --overwrite 2>&1 | tee -a "$LOG"
  log "--- $book ch$start-$end done ---"
}

# Run Kokoro for a new book (no overwrite; skips existing files)
new_en_book() {
  local book=$1 desc=$2
  log "=== $book modern-en NEW ($desc) ==="
  python3 "$TTS_DIR/generate-audio-kokoro.py" "$book" modern-en 2>&1 | tee -a "$LOG"
  log "--- $book new done ---"
}

# Delete specific paragraph files then regen chapter (paragraph-level fix)
regen_paragraphs() {
  local book=$1 ch=$2; shift 2
  local paras="$@"
  log "=== $book modern-en ch$ch paragraphs: $paras ==="
  for p in $paras; do
    rm -f "$TTS_DIR/audio/$book/modern-en/ch$ch/p$p.wav"
    rm -f "$TTS_DIR/audio/$book/modern-en/ch$ch/p$p.mp3"
  done
  python3 "$TTS_DIR/generate-audio-kokoro.py" "$book" modern-en "$ch" "$ch" 2>&1 | tee -a "$LOG"
  log "--- $book ch$ch paragraph regen done ---"
}

# New DA book — Google Chirp premium
new_da_book() {
  local book=$1 desc=$2
  log "=== $book modern-da NEW ($desc) ==="
  python3 "$TTS_DIR/generate-audio-chirp.py" "$book" modern-da 2>&1 | tee -a "$LOG"
  log "--- $book DA done ---"
}

# ============================================================
# START
# ============================================================
log "######## AUDIO BACKLOG RUN START ########"

# -------- TIER 1: Full-book EN regens (text fully replaced) --------
regen_en_range meditations    1 12 "full regen, 84% truncation fixed"
regen_en_range the-republic   1 10 "full regen, 642 flags fixed"
regen_en_range paradise-lost  1 12 "full regen, 207 flags fixed"
regen_en_range the-aeneid     1 12 "full regen, 89% truncation fixed"

# -------- TIER 2: Targeted chapter regens --------
regen_en_range jane-eyre 34 34 "fabrication fix"
regen_en_range crime-and-punishment 36 36 "fabrication fix"

# Moby-dick: 23 specific chapters rewrote
for CH in 1 3 10 45 46 48 50 54 71 73 74 78 82 83 84 85 110 126 127 128 129 130 131 132 133; do
  regen_en_range moby-dick $CH $CH "targeted ch$CH"
done

# -------- TIER 3: Paragraph-level fixes --------
regen_paragraphs apology      1  61 63
regen_paragraphs frankenstein 25 41
regen_paragraphs gilgamesh    11 13

# -------- TIER 4: New book audio --------
new_en_book niels-lyhne        "new audio, 14 chapters"
new_en_book great-expectations "new audio, 59 chapters"

# -------- TIER 5: Danish Chirp (Chopin only) --------
new_da_book the-awakening "The Awakening Danish audio, Chirp premium"

# -------- POST-PROCESSING --------
log "######## Post-processing: convert-and-manifest ########"
cd "$TTS_DIR" && python3 convert-and-manifest.py 2>&1 | tee -a "$LOG"

log "######## AUDIO BACKLOG RUN COMPLETE ########"
