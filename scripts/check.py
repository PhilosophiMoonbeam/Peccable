#!/usr/bin/env python3
"""Check an installed skill's resources; skills-ref owns format validation."""

import argparse
from pathlib import Path, PureWindowsPath
import re
import sys
from urllib.parse import unquote, urlsplit


DEFAULT_ROOT = Path(__file__).resolve().parent.parent
FENCE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
# Deliberately limited to ordinary Markdown links, images and link definitions.
# Destinations may be angle-wrapped or contain one level of balanced parentheses.
DESTINATION = r"(<[^>\n]*>|(?:\\.|[^\s()\\]|\([^()\n]*\))+)"
INLINE_LINK = re.compile(r"!?\[[^\]\n]*\]\(\s*" + DESTINATION + r"(?:\s+[\"'][^\n]*?[\"'])?\s*\)")
DEFINITION = re.compile(r"^ {0,3}\[[^\]\n]+\]:\s*" + DESTINATION, re.MULTILINE)
INLINE_CODE = re.compile(r"(?<!`)(`+)(?!`).*?(?<!`)\1(?!`)", re.DOTALL)


def prose(text):
    """Exclude fenced examples and inline code before looking for links."""
    chunks = []
    lines = []
    fence = None
    for line in text.splitlines():
        match = FENCE.match(line)
        if fence:
            if match and match[1][0] == fence[0] and len(match[1]) >= len(fence) and not match[2].strip():
                fence = None
            continue
        if match and (match[1][0] != "`" or "`" not in match[2]):
            # Fenced blocks separate prose: inline spans cannot cross them.
            chunks.append(INLINE_CODE.sub("", "\n".join(lines)))
            lines = []
            fence = match[1]
            continue
        lines.append(line)
    chunks.append(INLINE_CODE.sub("", "\n".join(lines)))
    return "\n".join(chunks)


def targets(text):
    text = prose(text)
    for pattern in (INLINE_LINK, DEFINITION):
        for match in pattern.finditer(text):
            target = match[1]
            if target.startswith("<"):
                target = target[1:-1]
            yield re.sub(r"\\([!\"#$%&'()*+,\-./:;<=>?@\[\]^_`{|}~])", r"\1", target)


def contained(path, root):
    return path.is_relative_to(root)


def local_target(target, source, root):
    """Return a resolved local file, None for URLs/fragments, or raise ValueError."""
    parts = urlsplit(target)
    if parts.scheme.lower() == "file" or re.match(r"^[A-Za-z]:", target):
        raise ValueError("target must be a portable relative path")
    if parts.scheme or parts.netloc:
        return None
    path = unquote(parts.path)
    if not path:
        return None
    if "\x00" in path or "\\" in path or PureWindowsPath(path).drive or Path(path).is_absolute():
        raise ValueError("target must be a portable relative path")
    resolved = (source.parent / path).resolve()
    if not contained(resolved, root):
        raise ValueError("target escapes the skill directory")
    return resolved


def check(root):
    """Return actionable errors without depending on the repository layout."""
    errors = []
    try:
        root = Path(root).resolve()
    except (OSError, RuntimeError) as exc:
        return [f"cannot resolve skill directory: {exc}"]
    if not root.is_dir():
        return [f"skill directory does not exist or is not a directory: {root}"]

    def resource(path):
        try:
            if not contained(path.resolve(), root):
                errors.append(f"{path.relative_to(root)}: resource escapes the skill directory")
                return False
            if not path.is_file():
                errors.append(f"{path.relative_to(root)}: missing resource or not a file")
                return False
            # Open even binary resources so unreadable files produce a useful failure.
            with path.open("rb") as stream:
                stream.read(1)
            return True
        except (OSError, RuntimeError) as exc:
            errors.append(f"{path.relative_to(root)}: cannot read resource: {exc}")
            return False

    entry = root / "SKILL.md"
    entry_ok = resource(entry)
    for name in ("LICENSE", "NOTICE.md"):
        resource(root / name)

    references = root / "references"
    try:
        if not contained(references.resolve(), root):
            errors.append("references: resource escapes the skill directory")
        elif not references.is_dir():
            errors.append("references: missing resource directory")
        else:
            for path in sorted(references.rglob("*")):
                if path.is_symlink() or not path.is_dir():
                    resource(path)
    except (OSError, RuntimeError) as exc:
        errors.append(f"references: cannot inspect resources: {exc}")

    def markdown(path):
        try:
            return path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            errors.append(f"{path.relative_to(root)}: cannot read UTF-8 Markdown: {exc}")
            return None

    def links(source, text):
        documents = set()
        for target in targets(text):
            try:
                path = local_target(target, source, root)
                if path is not None and resource(path) and path.suffix.lower() == ".md":
                    documents.add(path)
            except (ValueError, OSError, RuntimeError) as exc:
                errors.append(f"{source.relative_to(root)}: invalid target {target!r}: {exc}")
        return documents

    if entry_ok:
        text = markdown(entry)
        if text is not None:
            if not text.strip():
                errors.append("SKILL.md: entrypoint is empty")
            if len(text.splitlines()) >= 500:
                errors.append("SKILL.md: entrypoint must have fewer than 500 lines")
            for document in sorted(links(entry, text) - {entry.resolve()}):
                reference_text = markdown(document)
                if reference_text is not None:
                    links(document, reference_text)
    return errors


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_directory", nargs="?", type=Path, default=DEFAULT_ROOT)
    args = parser.parse_args(argv)
    errors = check(args.skill_directory)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1
    print(f"Resource integrity OK: {args.skill_directory.resolve()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
