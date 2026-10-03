"""Resource-boundary tests use disposable installations, never repository copy."""

import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


CHECKER = Path(__file__).resolve().parents[1] / "scripts" / "check.py"
SPEC = importlib.util.spec_from_file_location("skill_check", CHECKER)
checker = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(checker)


class ResourceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / "installed" / "a-different-name"
        self.root.mkdir(parents=True)
        self.put("SKILL.md", "# A skill\n\n[Guide](references/guide.md)\n")
        self.put("references/guide.md", "# Guide\n\n[License](../LICENSE)\n")
        self.put("LICENSE", "License terms\n")
        self.put("NOTICE.md", "Notices\n")

    def put(self, relative, content):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def assert_error(self, fragment):
        errors = checker.check(self.root)
        self.assertTrue(any(fragment in error for error in errors), errors)

    def test_installed_directory_without_repository_files(self):
        self.assertEqual(checker.check(self.root), [])

    def test_missing_entrypoint(self):
        (self.root / "SKILL.md").unlink()
        self.assert_error("SKILL.md: missing resource")

    def test_required_notices(self):
        for name in ("LICENSE", "NOTICE.md"):
            with self.subTest(name=name):
                path = self.root / name
                path.unlink()
                self.assert_error(f"{name}: missing resource")
                self.put(name, "Restored\n")

    def test_missing_references_directory(self):
        (self.root / "references" / "guide.md").unlink()
        (self.root / "references").rmdir()
        self.assert_error("references: missing resource directory")

    def test_missing_direct_resource(self):
        self.put("SKILL.md", "[Missing](references/missing.md)\n")
        self.assert_error("references/missing.md: missing resource")

    def test_missing_resource_in_direct_reference(self):
        self.put("references/guide.md", "![Example](images/example.png)\n")
        self.assert_error("references/images/example.png: missing resource")

    def test_parent_link_is_relative_to_reference(self):
        self.put("references/guide.md", "[Notice](../NOTICE.md#terms)\n")
        self.assertEqual(checker.check(self.root), [])

    def test_relative_directory_argument(self):
        result = subprocess.run(
            [sys.executable, str(CHECKER), "installed/a-different-name"],
            cwd=self.base, text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_default_directory_is_independent_of_working_directory(self):
        # Copy just the maintainer script beside a temporary payload.
        copied = self.root / "scripts" / "check.py"
        copied.parent.mkdir()
        copied.write_bytes(CHECKER.read_bytes())
        result = subprocess.run(
            [sys.executable, str(copied)], cwd=self.base,
            text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_cli_failure_is_useful_and_nonzero(self):
        (self.root / "LICENSE").unlink()
        result = subprocess.run(
            [sys.executable, str(CHECKER), str(self.root)],
            cwd=self.base, text=True, capture_output=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("LICENSE", result.stderr)
        self.assertIn("missing resource", result.stderr)

    def test_cli_argument_error(self):
        result = subprocess.run(
            [sys.executable, str(CHECKER), str(self.root), "extra"],
            text=True, capture_output=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("usage:", result.stderr)

    def test_missing_or_file_directory_argument(self):
        for path in (self.base / "absent", self.root / "LICENSE"):
            with self.subTest(path=path):
                errors = checker.check(path)
                self.assertTrue(any("not a directory" in error for error in errors), errors)

    def test_empty_and_invalid_utf8_entrypoint(self):
        self.put("SKILL.md", " \n\t\n")
        self.assert_error("entrypoint is empty")
        (self.root / "SKILL.md").write_bytes(b"\xff\xfe")
        self.assert_error("UTF-8")

    def test_entrypoint_line_boundary(self):
        self.put("SKILL.md", "Line\n" * 499)
        self.assertEqual(checker.check(self.root), [])
        self.put("SKILL.md", "Line\n" * 500)
        self.assert_error("fewer than 500 lines")

    def test_invalid_utf8_direct_reference(self):
        (self.root / "references" / "guide.md").write_bytes(b"\xff")
        self.assert_error("UTF-8")

    def test_existing_file_outside_root_is_rejected(self):
        (self.root.parent / "outside.md").write_text("Outside\n", encoding="utf-8")
        self.put("SKILL.md", "[Outside](../outside.md)\n")
        self.assert_error("escapes the skill directory")

    def test_percent_encoded_escape_is_rejected(self):
        self.put("SKILL.md", "[Outside](%2e%2e/outside.md)\n")
        self.assert_error("escapes the skill directory")

    def test_reference_escape_is_rejected(self):
        self.put("references/guide.md", "[Outside](../../outside.md)\n")
        self.assert_error("escapes the skill directory")

    def test_absolute_and_windows_paths_are_rejected(self):
        for target in ("/tmp/example.md", "C:/example.md", "references\\guide.md", "%2Ftmp/example.md"):
            with self.subTest(target=target):
                self.put("SKILL.md", f"[Unsafe]({target})\n")
                self.assert_error("relative path")

    def test_symlink_escape_and_dangling_resource(self):
        outside = self.base / "external.md"
        outside.write_text("External\n", encoding="utf-8")
        link = self.root / "references" / "linked.md"
        try:
            link.symlink_to(outside)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks unavailable on this platform")
        self.assert_error("resource escapes")
        link.unlink()
        link.symlink_to(self.root / "references" / "absent.md")
        self.assert_error("linked.md: missing resource")

    def test_reference_directory_symlink_escape(self):
        directory = self.root / "references"
        (directory / "guide.md").unlink()
        directory.rmdir()
        outside = self.base / "outside"
        outside.mkdir()
        try:
            directory.symlink_to(outside, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks unavailable on this platform")
        self.assert_error("references: resource escapes")

    def test_fragment_external_links_and_code_are_not_resources(self):
        self.put("SKILL.md", """# Skill
[Heading](#heading)
[Web](https://example.com/absent.md#heading)
[CDN](//example.com/absent.md)
[Email](mailto:person@example.com)
`[Example](missing-inline.md)`
````markdown
[Example](missing-fenced.md)
```
[Still an example](still-missing.md)
````
~~~
[Example](missing-tilde.md)
~~~
[Guide](references/guide.md#heading)
""")
        self.assertEqual(checker.check(self.root), [])

    def test_matching_inline_code_runs_can_span_lines(self):
        examples = (
            "`[Missing](references/missing.md)\nexample`\n",
            "``[Missing](references/missing.md)\nexample ` and ``` runs``\n",
            "```[Missing](references/missing.md)```\n",
        )
        for text in examples:
            with self.subTest(text=text):
                self.put("SKILL.md", text)
                self.assertEqual(checker.check(self.root), [])

    def test_backticks_in_fence_info_leave_following_links_visible(self):
        for opening in ("```example```", "```language`info"):
            with self.subTest(opening=opening):
                self.put("SKILL.md", opening + "\n[Missing](references/missing.md)\n")
                self.assert_error("references/missing.md: missing resource")

    def test_unequal_or_unmatched_inline_runs_leave_links_visible(self):
        examples = (
            "`[Missing](references/missing.md)``\n",
            "``[Missing](references/missing.md)`\n",
            "`[Missing](references/missing.md)\n",
            "[Missing](references/missing.md)`\n",
            "``[Missing](references/missing.md)\nexample`\n",
        )
        for text in examples:
            with self.subTest(text=text):
                self.put("SKILL.md", text)
                self.assert_error("references/missing.md: missing resource")

    def test_inline_code_does_not_span_fenced_blocks(self):
        self.put("SKILL.md", """`example
~~~
[Example](references/example.md)
~~~
[Missing](references/missing.md)`
""")
        self.assert_error("references/missing.md: missing resource")

    def test_reference_style_links_and_spaced_paths(self):
        self.put("references/a guide.md", "A guide\n")
        self.put("SKILL.md", "[Guide][guide]\n\n[guide]: <references/a guide.md> \"Guide\"\n")
        self.assertEqual(checker.check(self.root), [])
        (self.root / "references" / "a guide.md").unlink()
        self.assert_error("a guide.md: missing resource")

    def test_encoded_spaces_query_and_balanced_parentheses(self):
        self.put("references/a guide.md", "Guide\n")
        self.put("references/example(v2).md", "Example\n")
        self.put("SKILL.md", '[Guide](references/a%20guide.md?view=plain#heading "Title")\n[Example](references/example(v2).md)\n')
        self.assertEqual(checker.check(self.root), [])

    def test_directory_is_not_a_file_resource(self):
        self.put("SKILL.md", "[Directory](references/)\n")
        self.assert_error("not a file")


if __name__ == "__main__":
    unittest.main()
