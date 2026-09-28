import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.request
import urllib.error

spec = importlib.util.spec_from_file_location('bridge', Path(__file__).parents[1] / 'public/omarchy/bridge.py')
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)


class ThemeBridgeTests(unittest.TestCase):
    def test_reads_current_and_legacy_palettes_and_rejects_css(self):
        with tempfile.TemporaryDirectory() as temp:
            home = Path(temp)
            theme = home / '.config/omarchy/current/theme'
            theme.mkdir(parents=True)
            (theme / 'alacritty.toml').write_text('[colors.primary]\nbackground="#101020"\nforeground="#eeeeee"\n[colors.normal]\nblue="#7777ff"\n')
            self.assertEqual(bridge.read_theme(home)['accent'], '#7777ff')
            current = home / '.local/state/omarchy/current/theme'
            current.mkdir(parents=True)
            (current / 'colors.toml').write_text('background="#202030"\nforeground="#f0f0f0"\naccent="#d6ad62"\n')
            (current.parent / 'theme.name').write_text('My theme')
            self.assertEqual(bridge.read_theme(home)['name'], 'My theme')
            self.assertEqual(bridge.read_theme(home)['background'], '#202030')
        with self.assertRaises(ValueError):
            bridge.palette_from(dict(background='url(https://example.com)', foreground='#ffffff', accent='#ffffff'), 'bad')

    def test_loopback_http_host_origin_and_methods(self):
        server = bridge.ThreadingHTTPServer(('127.0.0.1', 0), bridge.Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f'http://127.0.0.1:{server.server_port}'
        try:
            with urllib.request.urlopen(base + '/health') as response:
                self.assertEqual(json.load(response)['service'], 'tinct-omarchy-theme')
            request = urllib.request.Request(base + '/theme', method='OPTIONS', headers={'Origin': bridge.ORIGIN, 'Access-Control-Request-Method': 'GET'})
            with urllib.request.urlopen(request) as response:
                self.assertEqual(response.headers['Access-Control-Allow-Origin'], bridge.ORIGIN)
                self.assertEqual(response.headers['Access-Control-Allow-Private-Network'], 'true')
            for headers in ({'Origin':'https://unrelated.example'}, {'Origin':'null'}, {'Host':'rebinding.example'}):
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(urllib.request.Request(base + '/health', headers=headers))
                self.assertEqual(error.exception.code, 403)
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(urllib.request.Request(base + '/theme', method='POST', data=b'{}'))
            self.assertEqual(error.exception.code, 405)
        finally:
            server.shutdown()
            server.server_close()


if __name__ == '__main__':
    unittest.main()
