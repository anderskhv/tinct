"""Exercise the installer in the disposable Linux CI account, without starting services."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


class InstallerTests(unittest.TestCase):
    def test_install_launch_reinstall_and_uninstall(self):
        home = Path.home()
        package = Path(__file__).resolve().parents[1] / 'public/omarchy'
        owned = [home / '.local/share/tinct-omarchy', home / '.local/bin/tinct',
                 home / '.local/share/applications/tinct.desktop',
                 home / '.config/systemd/user/tinct-omarchy-theme.service']
        self.assertFalse(any(p.exists() for p in owned), 'Use a clean CI account; do not overwrite a real installation')
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            for name, body in {
                'systemctl': '#!/bin/sh\nexit 0\n',
                'omarchy-launch-webapp': '#!/bin/sh\nprintf "%s" "$1" > "$TINCT_TEST_LAUNCH"\n',
                'update-desktop-database': '#!/bin/sh\nexit 0\n',
            }.items():
                file = temp / name
                file.write_text(body)
                file.chmod(0o755)
            env = dict(os.environ, PATH=str(temp) + os.pathsep + os.environ['PATH'], TINCT_TEST_LAUNCH=str(temp / 'launched'))
            try:
                for _ in range(2):
                    subprocess.run(['bash', str(package / 'install.sh'), '--from', str(package)], check=True, env=env)
                self.assertTrue(all(p.exists() for p in owned))
                self.assertIn('ProtectHome=read-only', owned[3].read_text())
                self.assertIn('Name=Tinct', owned[2].read_text())
                subprocess.run([str(owned[1])], check=True, env=env)
                self.assertEqual((temp / 'launched').read_text(), 'https://tinct.app/library?omarchy=1')
                (owned[0] / 'keep.txt').write_text('unrelated data')
            finally:
                subprocess.run(['bash', str(package / 'install.sh'), '--uninstall'], check=True, env=env)
            self.assertFalse(any(p.exists() for p in owned[1:]))
            self.assertEqual((owned[0] / 'keep.txt').read_text(), 'unrelated data')
            self.assertFalse((owned[0] / 'bridge.py').exists())
            (owned[0] / 'keep.txt').unlink()
            owned[0].rmdir()


if __name__ == '__main__':
    unittest.main()
