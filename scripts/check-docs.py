#!/usr/bin/env python3
"""Check relative Markdown links in documentation changed from main.

Historical design folders contain intentionally incomplete handoff packages,
so this gate is incremental: new or edited documentation may not add a broken
relative link, while unchanged archives are left alone.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")


def git_lines(*args: str) -> list[str]:
    result = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, capture_output=True, check=False
    )
    return result.stdout.splitlines() if result.returncode == 0 else []


def changed_markdown() -> list[Path]:
    names = set(git_lines("diff", "--name-only", "--diff-filter=ACMR", "origin/main...HEAD"))
    names.update(git_lines("diff", "--name-only", "--diff-filter=ACMR"))
    names.update(git_lines("ls-files", "--others", "--exclude-standard"))
    return sorted(
        ROOT / name for name in names
        if name.endswith(".md") and (name.startswith("docs/") or name in {"AGENTS.md", "PIPELINES.md"})
    )


def main() -> int:
    files = [ROOT / value for value in sys.argv[1:]] if len(sys.argv) > 1 else changed_markdown()
    failures: list[str] = []
    for path in files:
        if not path.is_file():
            failures.append(f"missing documentation file: {path.relative_to(ROOT)}")
            continue
        for match in LINK.finditer(path.read_text(encoding="utf-8")):
            raw = match.group(1).strip().split()[0].strip("<>")
            if raw.startswith(("http://", "https://", "mailto:", "#", "data:")):
                continue
            target = unquote(raw.split("#", 1)[0])
            if target and not (path.parent / target).exists():
                failures.append(f"{path.relative_to(ROOT)}: broken link {raw}")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print(f"checked {len(files)} changed documentation file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
