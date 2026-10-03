# Changelog

## Unreleased

This deliberately divergent fork replaces Impeccable's command-driven product with one autonomous Agent Skill named `impeccable`.

### Changed

- Root `SKILL.md` is the canonical entry point, with focused, demand-loaded references instead of generated provider replicas.
- The agent infers task context and chooses design interventions within the assignment. User-intent questions are reserved for unresolved material gaps; no command selection, initialization workshop, or mandatory product/design documents are required.
- Design iteration follows acceptance criteria and evidence. Accessibility, responsiveness, functionality, and performance are integrated into ordinary frontend work; planning-only requests and existing coherent identity remain binding.
- Installation is a direct copy of `SKILL.md`, `references/`, `LICENSE`, and `NOTICE.md` into a configured skills directory named `impeccable`, refusing to replace an existing destination silently. Harness discovery and activation remain harness-specific.
- Maintenance uses a portable-resource checker for missing or escaping resources, isolated boundary regressions including Markdown code spans, and the pinned official Agent Skills validator with an absolute directory path. There is no runtime build or generation step.

### Retained and adapted

- Frontend craft across typography, color, layout, motion, interaction, content, reusable systems, performance, platform conventions, and quality practices.
- Context-sensitive design judgment, adapted from command-specific guidance without preserving command menus, rigid aesthetic bans, or workshop dependencies.
- The unchanged root license and skill specification, upstream Impeccable/Paul Bakaus and Anthropic frontend-design attribution, and the MIT license notice for ehmo's platform guidance.

### Removed

- The old CLI, installer, engine downloads, and deterministic detector runtime.
- Browser extension, live-variant tooling, and their supporting integrations.
- Provider adapters and integrations, generated skill replicas and distributions, and runtime packaging/build infrastructure.
- User-selected design commands and aliases, initialization/state machinery, and mandatory hidden project files or product/design documents.

These removals are an architectural cutover, not a backward-compatible update. The fork no longer provides the old detector, CLI, live browser workflow, or provider integrations; it supplies portable guidance for tools already available in the host harness.
