#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != Linux ]]; then
  echo 'Run this installer in the terminal inside Omarchy.' >&2
  exit 1
fi
if [[ "${1:-}" == --uninstall ]]; then
  systemctl --user disable --now tinct-omarchy-theme.service || true
  rm -f "$HOME/.config/systemd/user/tinct-omarchy-theme.service" "$HOME/.local/bin/tinct" "$HOME/.local/share/applications/tinct.desktop"
  # Only the three files owned by this installer; browser/account data stays in place.
  rm -f "$HOME/.local/share/tinct-omarchy/bridge.py" "$HOME/.local/share/tinct-omarchy/icon.svg" "$HOME/.local/share/tinct-omarchy/install.sh"
  systemctl --user daemon-reload
  echo 'Tinct launcher and theme connection removed. Your books and browser data are preserved.'
  exit 0
fi
command -v omarchy-launch-webapp >/dev/null || { echo 'Omarchy web-app launcher was not found.' >&2; exit 1; }
command -v systemctl >/dev/null
python3 -c 'import tomllib' 2>/dev/null || { echo 'Python 3.11 or newer is required.' >&2; exit 1; }

staging=$(mktemp -d)
trap 'rm -rf "$staging"' EXIT
if [[ "${1:-}" == --from && -d "${2:-}" ]]; then
  for file in bridge.py icon.svg install.sh; do cp "$2/$file" "$staging/$file"; done
elif [[ $# == 0 ]]; then
  for file in bridge.py icon.svg install.sh; do
    curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 "https://tinct.app/omarchy/$file" -o "$staging/$file"
  done
else
  echo 'Usage: bash install.sh [--from package-directory | --uninstall]' >&2; exit 1
fi
python3 -c 'import ast,sys; ast.parse(open(sys.argv[1]).read())' "$staging/bridge.py"
target="$HOME/.local/share/tinct-omarchy"
mkdir -p "$target" "$HOME/.local/bin" "$HOME/.local/share/applications" "$HOME/.config/systemd/user"
install -m 644 "$staging/bridge.py" "$staging/icon.svg" "$staging/install.sh" "$target/"
cat > "$HOME/.local/bin/tinct" <<'LAUNCHER'
#!/usr/bin/env bash
set -euo pipefail
systemctl --user start tinct-omarchy-theme.service
exec omarchy-launch-webapp 'https://tinct.app/library?omarchy=1'
LAUNCHER
chmod 755 "$HOME/.local/bin/tinct"
cat > "$HOME/.config/systemd/user/tinct-omarchy-theme.service" <<'SERVICE'
[Unit]
Description=Tinct Omarchy colour palette
[Service]
ExecStart=/usr/bin/python3 "%h/.local/share/tinct-omarchy/bridge.py"
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
[Install]
WantedBy=default.target
SERVICE
python3 - "$HOME" <<'DESKTOP'
from pathlib import Path
import sys
home = Path(sys.argv[1])
def quoted(path):
    return '"' + str(path).replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('$', '\\$').replace('%', '%%') + '"'
entry = '[Desktop Entry]\nVersion=1.0\nType=Application\nName=Tinct\nComment=Read, listen and talk with the classics\n'
entry += 'Exec=' + quoted(home / '.local/bin/tinct') + '\n'
entry += 'Icon=' + str(home / '.local/share/tinct-omarchy/icon.svg') + '\nTerminal=false\nCategories=Education;Literature;\n'
(home / '.local/share/applications/tinct.desktop').write_text(entry)
DESKTOP
systemctl --user daemon-reload
systemctl --user enable --now tinct-omarchy-theme.service
systemctl --user is-active --quiet tinct-omarchy-theme.service
command -v update-desktop-database >/dev/null && update-desktop-database "$HOME/.local/share/applications" || true
echo 'Tinct is installed. Open the Omarchy launcher and type Tinct.'
echo 'Press ? or Ctrl+K for commands and themes. Allow the local theme connection when the browser asks.'
echo 'Talk uses your normal Tinct account and browser microphone permission.'
