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
