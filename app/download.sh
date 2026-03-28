#!/bin/bash
# Tinct — Download Odyssey texts (run once)
# This downloads both translations from Project Gutenberg
# and saves them as local JS files so the app never needs to fetch again.

set -e
cd "$(dirname "$0")"
mkdir -p data

echo ""
echo "  Tinct — Downloading Odyssey texts"
echo ""

# Download Butler (Prose, 1900)
echo "  Downloading Butler translation..."
curl -s -o data/butler-raw.txt "https://www.gutenberg.org/cache/epub/1727/pg1727.txt"
BUTLER_SIZE=$(wc -c < data/butler-raw.txt | tr -d ' ')
echo "  Butler: ${BUTLER_SIZE} bytes"

# Download Pope (Verse, 1726)
echo "  Downloading Pope translation..."
curl -s -o data/pope-raw.txt "https://www.gutenberg.org/cache/epub/3160/pg3160.txt"
POPE_SIZE=$(wc -c < data/pope-raw.txt | tr -d ' ')
echo "  Pope: ${POPE_SIZE} bytes"

# Convert to JS modules that set window globals
echo "  Processing Butler..."
node -e "
const fs = require('fs');
const raw = fs.readFileSync('data/butler-raw.txt', 'utf8');
const escaped = JSON.stringify(raw);
fs.writeFileSync('data/butler.js', 'window.BUTLER_TEXT = ' + escaped + ';\\n');
console.log('  butler.js written');
"

echo "  Processing Pope..."
node -e "
const fs = require('fs');
const raw = fs.readFileSync('data/pope-raw.txt', 'utf8');
const escaped = JSON.stringify(raw);
fs.writeFileSync('data/pope.js', 'window.POPE_TEXT = ' + escaped + ';\\n');
console.log('  pope.js written');
"

# Clean up raw files
rm -f data/butler-raw.txt data/pope-raw.txt

echo ""
echo "  Done! Both texts saved to data/"
echo "  You can now run: ./serve.sh"
echo ""
