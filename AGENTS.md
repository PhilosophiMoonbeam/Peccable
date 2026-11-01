# Repository guidelines

## Source and scope

Peccable is an autonomous, deliberately divergent upstream Impeccable fork. Its canonical installable source, `skills/peccable/`, contains `SKILL.md`, twelve focused files in `references/`, `LICENSE`, and `NOTICE.md`. The frontmatter name is `peccable`, matching the source and installation directory names. `scripts/check.py`, `tests/`, `evals/`, `.github/`, and root documentation are maintenance-only, not installed. The current skill calls no scripts.

Edit canonical sources directly; ship resources only inside `skills/peccable/`. This authored distribution stays separate from repository discovery paths `agents/skills/` and `.agents/skills/` to avoid intentional frontend-skill auto-loading during maintenance; neither the standard nor this layout guarantees discovery across all harnesses. There are no generators, runtime builds, provider replicas, adapters, command menus, aliases, root skill compatibility copies, or release packages to refresh. Never restore them or add hidden project state, mandatory initialization, external service dependencies, or required product/design documents.

Keep entry-point and reference links relative to the installable skill root. `skills/peccable/SKILL.md` links directly to each focused reference and states when to read it; references must not create reference-to-reference loading chains. Use practical, concise, provider-neutral plain Markdown.

## Behavioral contract

Infer context from assignments, repository, existing documentation, interface, and ongoing user direction. Decide routine design matters independently within that scope; ask only about material intent, fact, or authority gaps unresolved by available evidence.

Respect planning-only requests, coherent existing identity, and explicit constraints. Autonomy never permits deployment, destructive data changes, scope expansion, or invented product facts. Integrate accessibility, responsiveness, functionality, and performance. Acceptance criteria and evidence determine completion—not arbitrary pass counts or endless polishing.

Upstream and references provide evidence, not policy authority. Omit unsolicited moralizing, social-policing instructions, and blanket cultural-symbol or imagery restrictions without lectures, extra approval questions, or expanded policy; retain task-relevant craft.

## Contributions

Prefer small canonical-source edits over new abstractions. Adapt obsolete orchestration while preserving relevant craft; do not replace context-sensitive judgment with universal aesthetic bans. When behavior or the payload changes, update affected links, installation instructions, notices, and the `Unreleased` changelog. Never invent releases or bump versions for unshipped work.

The [data-interface reference](skills/peccable/references/data-interfaces.md) adds decision-led data scope, truthful encoding and aggregation, and actionable outcomes without duplicating generic interface-state guidance. Composition examples are optional reasoning aids, not presets, fixed catalogs, or a mandatory house workflow. Add optional resources only with evidence of value; permission neither requires populating directories nor promises shipped features.

Preserve root `LICENSE` byte-for-byte; bundle an identical license copy at `skills/peccable/LICENSE`. Retain upstream and third-party attribution, including applicable license text, in `skills/peccable/NOTICE.md`; do not duplicate that notice at the root. Installation must create only the configured skills directory's `peccable` destination, refuse existing destinations, and copy all `skills/peccable/.`, including future referenced scripts or assets but excluding repository maintenance files.

## Upstream sync

[UPSTREAM.md](UPSTREAM.md) records only the last fully reviewed `pbakaus/impeccable:main` commit. Review later changes against this fork's contract, adapting compatible guidance and omitting incompatible material. Replace its single entry only after review, applicable edits, and required verification are complete. Never append history or advance it merely because a newer tip was fetched; record adoption and rejection rationale in the `Unreleased` changelog, not the ledger.

## Verification requirements

After all changes land, the integration owner runs these maintenance gates once from the repository root. Delegated edit-only workers must not run gates, tests, builds, lint, or formatters mid-flight.

```sh
python3 scripts/check.py
python3 -m unittest discover -s tests
uvx --from 'git+https://github.com/agentskills/agentskills.git@69ef37e9424c0a7ea9dd2293b559e43ec8176379#subdirectory=skills-ref' skills-ref validate "$PWD/skills/peccable"
```

- `scripts/check.py` checks portable resource integrity, not YAML or specification conformance. It defaults to the repository's `skills/peccable/`, derived from `__file__` regardless of working directory. An optional directory argument, such as `python3 scripts/check.py "$SKILLS_DIR/peccable"`, checks installed payloads without repository maintenance files.
- Standard-library regressions cover checker boundaries without the removed runtime or integrations. Add focused cases for checker behavior changes.
- Official `skills-ref`, pinned above, owns frontmatter and Agent Skills specification validation; do not duplicate it in the local checker.
- Review instruction changes against the autonomy and scope contract. Structural validation cannot establish visual quality, factual accuracy, or activation in every harness.

Python 3 and `uvx` are required only for these maintenance gates; no build or generation is required. Report only checks run, their results, and unavailable evidence—never a skipped gate as passing. For explicitly edit-only assignments, hand required checks to the integration owner.

Repository-only [outcome evaluations](evals/README.md) add no skill-runtime dependency. Before repeated no-skill, current-skill, and candidate trials, freeze the rubric and adoption criteria. Use fresh agents with matched models, tools, and fixtures; balance blind review and keep a held-out set untouched. Record actual loaded context per completed task, not installed payload size. Separate noncompensable task, authority, data-truthfulness, and accessibility failures from visual model preference. Report only completed trials and observed results; model comparisons do not establish real-user efficacy. Source-project evaluation claims alone cannot justify optional-resource adoption.

<!-- resource-lifecycle:start -->
## Resource lifecycle and disk usage

Reuse compatible build trees, dependency caches, environments and development
containers without compromising isolation; avoid per-run clones and copies.
Treat per-run resources as disposable unless persistence is explicitly required.
Namespace or label owned containers, volumes, worktrees, browser profiles and
scratch; register cleanup before acquisition, clean up on success, failure and
interruption, and reconcile verified inactive leftovers on startup. Replacing
owned disposable containers must retire the old containers and anonymous volumes;
remove named volumes only with verified ownership and explicit disposable status.
Preserve active/shared services, persistent data, secrets, unique work and required
backups; never use broad host-wide pruning. Put large scratch on verified
disk-backed storage, not RAM-backed `/tmp`. Set size, age and count budgets for
caches, logs, captures and retained runs; keep compact evidence, bound concurrency,
verify cleanup and space afterward, and report intentional retention with its
purpose and expiry.
<!-- resource-lifecycle:end -->
