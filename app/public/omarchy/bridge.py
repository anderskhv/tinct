#!/usr/bin/env python3
"""Read-only Omarchy palette bridge. No accounts, book text or write endpoints."""
import argparse
import json
import re
import tomllib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 47653
ORIGIN = 'https://tinct.app'
HEX = re.compile(r'^#[0-9a-fA-F]{6}$')


def palette_from(data, name):
    primary = data.get('colors', {}).get('primary', {})
    normal = data.get('colors', {}).get('normal', {})
    background = data.get('background', primary.get('background'))
    foreground = data.get('foreground', primary.get('foreground'))
    accent = data.get('accent', data.get('color4', normal.get('blue', foreground)))
    if not all(isinstance(v, str) and HEX.fullmatch(v) for v in (background, foreground, accent)):
        raise ValueError('Theme must contain hexadecimal background, foreground and accent colours')
    return dict(name=name[:80], background=background, foreground=foreground, accent=accent)


def read_theme(home=None):
    home = Path(home) if home else Path.home()
    roots = [home / '.local/state/omarchy/current', home / '.config/omarchy/current']
    for root in roots:
        theme = root / 'theme'
        name = theme.resolve().name.replace('-', ' ').title()
        for name_file in (root / 'theme.name', root / 'theme-name'):
            if name_file.is_file():
                name = name_file.read_text()[:80].strip()
                break
        for filename in ('colors.toml', 'alacritty.toml'):
            path = theme / filename
            try:
                if path.stat().st_size > 65536:
                    continue
                return palette_from(tomllib.loads(path.read_text()), name or 'Omarchy')
            except (OSError, ValueError, TypeError, AttributeError):
                continue
    raise FileNotFoundError('No readable Omarchy palette. Select an Omarchy theme and try again.')


class Handler(BaseHTTPRequestHandler):
    server_version = 'TinctTheme/1'

    def log_message(self, *_):
        pass

    def allowed(self):
        # Exact Host + Origin checks prevent DNS rebinding and access from other sites.
        if self.headers.get('Host') != f'127.0.0.1:{self.server.server_port}':
            return False
        return self.headers.get('Origin') in (None, ORIGIN)

    def reply(self, status, payload=None):
        body = json.dumps(payload or {}).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if self.headers.get('Origin') == ORIGIN and self.allowed():
            self.send_header('Access-Control-Allow-Origin', ORIGIN)
            self.send_header('Vary', 'Origin')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        if not self.allowed() or self.path != '/theme' or self.headers.get('Access-Control-Request-Method') != 'GET':
            self.reply(403)
            return
        self.reply(200)

    def do_GET(self):
        if not self.allowed():
            self.reply(403)
        elif self.path == '/health':
            self.reply(200, {'service': 'tinct-omarchy-theme', 'version': 1})
        elif self.path == '/theme':
            try:
                self.reply(200, read_theme())
            except FileNotFoundError:
                self.reply(503, {'error': 'Choose an Omarchy theme to connect its palette.'})
        else:
            self.reply(404)

    def do_POST(self):
        self.reply(405)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--print', action='store_true', dest='print_palette')
    args = parser.parse_args()
    if args.print_palette:
        print(json.dumps(read_theme()))
        return
    # Bound only to this computer; the local service cannot change a theme or execute commands.
    with ThreadingHTTPServer(('127.0.0.1', PORT), Handler) as server:
        server.serve_forever()


if __name__ == '__main__':
    main()
