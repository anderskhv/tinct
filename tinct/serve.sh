#!/bin/bash
# Tinct — Local Development Server
# Run this script, then open http://localhost:8080 in your browser
echo ""
echo "  ✦ Tinct — A New Way to Read"
echo "  Starting server at http://localhost:8080"
echo "  Press Ctrl+C to stop"
echo ""
cd "$(dirname "$0")"
python3 -m http.server 8080
