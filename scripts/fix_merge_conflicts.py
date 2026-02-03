#!/usr/bin/env python3
"""Résout les conflits Git en gardant la version HEAD (locale)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER_HEAD = "<<<<<<< HEAD"
MARKER_SEP = "======="
MARKER_END = re.compile(r">>>>>>> .+")

def fix_file(filepath: Path) -> bool:
    content = filepath.read_text(encoding="utf-8", errors="replace")
    if MARKER_HEAD not in content:
        return False

    lines = content.splitlines(keepends=True)
    result = []
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]
        if line.strip() == MARKER_HEAD:
            changed = True
            i += 1
            while i < len(lines) and lines[i].strip() != MARKER_SEP:
                result.append(lines[i])
                i += 1
            if i < len(lines) and lines[i].strip() == MARKER_SEP:
                i += 1
            while i < len(lines) and not MARKER_END.match(lines[i].strip()):
                i += 1
            if i < len(lines):
                i += 1
            continue
        result.append(line)
        i += 1

    if changed:
        filepath.write_text("".join(result), encoding="utf-8")
        return True
    return False

def main():
    fixed = []
    for f in ROOT.rglob("*"):
        if f.is_file() and ".git" not in str(f) and "fix_merge_conflicts" not in str(f):
            try:
                if fix_file(f):
                    fixed.append(str(f.relative_to(ROOT)))
            except Exception as e:
                print(f"Erreur {f}: {e}", file=sys.stderr)
    for p in fixed:
        print(f"  ✓ {p}")
    print(f"\n{len(fixed)} fichier(s) corrigé(s).")

if __name__ == "__main__":
    main()
