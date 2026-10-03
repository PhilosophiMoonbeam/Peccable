# Repository guidelines

## Source and scope

Peccable is an autonomous, deliberately divergent fork of upstream Impeccable. The canonical installable source is `skills/peccable/`, containing `SKILL.md`, eleven focused files in `references/`, `LICENSE`, and `NOTICE.md`. The frontmatter name is `peccable`, matching the source and installation directory. `scripts/check.py`, `tests/`, `.github/`, and root documentation are maintenance resources, not part of the installed payload. The current skill calls no scripts.

Edit the canonical payload sources directly, keeping every shipped resource inside `skills/peccable/`. This authored distribution directory is intentionally separate from repository-level `agents/skills/` and `.agents/skills/` discovery paths so maintenance does not intentionally auto-load our frontend skill; neither the standard nor this layout guarantees discovery behavior in every harness. There are no generators, runtime builds, provider replicas, adapters, command menus, aliases, root skill compatibility copies, or release packages to refresh. Do not restore them or introduce hidden project state, mandatory initialization, external service dependencies, or required product/design documents.

Keep entry-point and reference links relative to the installable skill root. `skills/peccable/SKILL.md` links directly to each focused reference and says when to read it; references must not create reference-to-reference loading chains. Keep guidance plain Markdown, practical, concise, and provider-neutral.

## Behavioral contract

Infer context from the assignment, repository, existing documentation, interface, and ongoing user direction. Make routine design decisions independently within that scope. Ask only when a material intent, fact, or authority gap remains unresolved by available evidence.

Respect planning-only requests, coherent existing identity, and explicit constraints. Autonomy never authorizes deployment, destructive data changes, scope expansion, or invented product facts. Integrate accessibility, responsiveness, functionality, and performance into the work. Stop iteration on acceptance criteria and evidence, not arbitrary pass counts or endless polishing.

## Contributions

Prefer small edits to the canonical sources over new layers of abstraction. Preserve relevant craft while adapting obsolete orchestration; do not replace context-sensitive judgment with universal aesthetic bans. Update affected links, installation instructions, notices, and the `Unreleased` changelog when behavior or the payload changes. Do not invent a release or bump a version to document work that has not shipped.

Preserve the root `LICENSE` byte-for-byte unchanged. Bundle an identical license copy at `skills/peccable/LICENSE`, and retain upstream and third-party attribution in `skills/peccable/NOTICE.md`, including applicable license text; do not duplicate the notice at the root. Installation must exclusively create the configured skills directory's `peccable` destination, refuse existing destinations, and copy all of `skills/peccable/.`, including any future referenced scripts or assets, without copying repository maintenance files.

## Verification requirements

After all changes have landed, the integration owner runs the maintenance gates once from the repository root. Delegated edit-only workers must not run gates, tests, builds, lint, or formatters mid-flight.

```sh
python3 scripts/check.py
python3 -m unittest discover -s tests
uvx --from 'git+https://github.com/agentskills/agentskills.git@69ef37e9424c0a7ea9dd2293b559e43ec8176379#subdirectory=skills-ref' skills-ref validate "$PWD/skills/peccable"
```

- `scripts/check.py` checks portable resource integrity, not YAML or specification conformance. Its default directory is the repository's `skills/peccable/` derived from `__file__`, independent of the working directory; an optional directory argument, such as `python3 scripts/check.py "$SKILLS_DIR/peccable"`, checks an installed payload without repository maintenance files.
- The standard-library regression suite covers checker boundary behavior without requiring the removed runtime or integrations. Add focused cases when checker behavior changes.
- Official `skills-ref`, pinned to the revision above, owns frontmatter and Agent Skills specification validation. Do not duplicate that validator in the local checker.
- Review instruction changes against the autonomy and scope contract. Structural validation cannot establish visual quality, factual accuracy, or activation in every harness.

Python 3 and `uvx` are needed only for these maintenance gates. No build or generation step is required. Report only checks actually run, with results and any unavailable evidence; do not describe a skipped gate as passing. If the assignment explicitly requires edit-only work, hand off the required checks to the integration owner instead.
