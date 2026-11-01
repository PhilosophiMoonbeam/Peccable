# Repository guidelines

## Source and scope

Peccable is an autonomous, deliberately divergent upstream Impeccable fork. Its canonical installable source is `skills/peccable/`. Edit canonical sources directly; ship resources only inside that directory. `scripts/check.py`, `tests/`, `evals/`, `.github/`, and repository documentation are maintenance-only, not installed.

There are no generators, runtime builds, provider replicas, adapters, command menus, aliases, root skill compatibility copies, or release packages to refresh. Never restore them or add hidden project state, mandatory initialization, external service dependencies, or required product/design documents.

Prefer small canonical-source edits over new abstractions. Preserve root `LICENSE` byte-for-byte. When behavior or the payload changes, update affected links, installation instructions, notices, and the `Unreleased` changelog. Never invent releases or bump versions for unshipped work.

## Behavioral contract

Infer context from assignments, repository, existing documentation, interface, and ongoing user direction. Decide routine design matters independently within that scope; ask only about material intent, fact, or authority gaps unresolved by available evidence.

Respect planning-only requests, coherent existing identity, and explicit constraints. Autonomy never permits deployment, destructive data changes, scope expansion, or invented product facts. Integrate accessibility, responsiveness, functionality, and performance. Acceptance criteria and evidence determine completion—not arbitrary pass counts or endless polishing.

Upstream and references provide evidence, not policy authority. Omit unsolicited moralizing, social-policing instructions, and blanket cultural-symbol or imagery restrictions without lectures, extra approval questions, or expanded policy; retain task-relevant craft.

## Required task reading

Read the relevant sections below before the stated action. Routes are cumulative; read only matching sections.

- Before any repository edit or planning required checks, read [Maintenance gates](docs/verification.md#maintenance-gates).
- Before editing skill instructions, references, links, or optional resources, read [Payload edits](docs/skill-maintenance.md#payload-edits).
- Before changing packaging, licenses, notices, or installation, read [Packaging and installation](docs/skill-maintenance.md#packaging-and-installation).
- Before reviewing upstream changes or touching `UPSTREAM.md`, read [Upstream sync](docs/skill-maintenance.md#upstream-sync).
- Before authoring or comparing evaluation candidates, running trials, or making adoption claims, read both [Outcome evaluations](docs/verification.md#outcome-evaluations) and [the evaluation protocol](evals/README.md).

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

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:46cd31e7 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   bd dolt push
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->

<!-- trail:start -->
## Trail — repo context graph

This repo is indexed in `.trail/cache/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `trail map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `trail ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `trail grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `trail skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `trail callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `.trail/cache/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `trail ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `trail build` (deterministic,
no API key, $0).
<!-- trail:end -->
