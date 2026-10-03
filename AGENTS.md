# Repository guidelines

## Source and scope

This repository is an autonomous, deliberately divergent Impeccable fork. The installable skill consists only of root `SKILL.md`, `references/`, `LICENSE`, and `NOTICE.md`. The root skill name is `impeccable`, matching the installation directory. `SKILLS_SPEC.md` is the retained specification reference; `scripts/check.py` and `tests/` are maintenance tools, not part of the installed payload.

Edit these authored sources directly. There are no generators, runtime builds, provider replicas, adapters, command menus, or release packages to refresh. Do not restore them or introduce hidden project state, mandatory initialization, external service dependencies, or required product/design documents.

Keep entry-point and reference links inside the installable payload. `SKILL.md` links directly to each focused reference and says when to read it; references must not create reference-to-reference loading chains. Keep guidance plain Markdown, practical, concise, and provider-neutral.

## Behavioral contract

Infer context from the assignment, repository, existing documentation, interface, and ongoing user direction. Make routine design decisions independently within that scope. Ask only when a material intent, fact, or authority gap remains unresolved by available evidence.

Respect planning-only requests, coherent existing identity, and explicit constraints. Autonomy never authorizes deployment, destructive data changes, scope expansion, or invented product facts. Integrate accessibility, responsiveness, functionality, and performance into the work. Stop iteration on acceptance criteria and evidence, not arbitrary pass counts or endless polishing.

## Contributions

Prefer small edits to the canonical sources over new layers of abstraction. Preserve relevant craft while adapting obsolete orchestration; do not replace context-sensitive judgment with universal aesthetic bans. Update affected links, installation instructions, notices, and the `Unreleased` changelog when behavior or the payload changes. Do not invent a release or bump a version to document work that has not shipped.

Preserve the root `LICENSE` and `SKILLS_SPEC.md` unchanged. Retain upstream and third-party attribution in `NOTICE.md`, including applicable license text. Do not silently overwrite an existing installed skill directory.

## Verification requirements

After all changes have landed, the integration owner runs the maintenance gates once from the repository root. Delegated edit-only workers must not run gates, tests, builds, lint, or formatters mid-flight.

```sh
python3 scripts/check.py
python3 -m unittest discover -s tests
uvx --from 'git+https://github.com/agentskills/agentskills.git@69ef37e9424c0a7ea9dd2293b559e43ec8176379#subdirectory=skills-ref' skills-ref validate "$PWD"
```

- `scripts/check.py` checks portable resource integrity, not YAML or specification conformance. Its default directory is the repository root derived from `__file__`; an optional directory argument checks an installed payload.
- The standard-library regression suite covers checker boundary behavior without requiring the removed runtime or integrations. Add focused cases when checker behavior changes.
- Official `skills-ref`, pinned to the revision above, owns frontmatter and Agent Skills specification validation. Do not duplicate that validator in the local checker.
- Review instruction changes against the autonomy and scope contract. Structural validation cannot establish visual quality, factual accuracy, or activation in every harness.

Python 3 and `uvx` are needed only for these maintenance gates. No build or generation step is required. Report only checks actually run, with results and any unavailable evidence; do not describe a skipped gate as passing. If the assignment explicitly requires edit-only work, hand off the required checks to the integration owner instead.
