# Changelog

## Unreleased

Peccable is a deliberately divergent fork replacing upstream Impeccable's command-driven product with one autonomous Agent Skill named `peccable`.

### Changed

- Reformatted the entry point and all eleven focused references in terse, complete Standard Technical English: shorter sentence-case headings, direct prose, and consistent instruction groups. Preserved guidance, examples, qualifications, technical thresholds, code snippets, reference loading, and authority boundaries; frontmatter, licenses, and attribution are unchanged.
- Added a README SVG logo with custom path-based serif lettering. Its initial stylized p includes a deliberately offset coral segment and forms part of the name. The original generated PNG is retained; artwork lives with repository documentation, outside the installed skill payload.
- Renamed the project to Peccable and the skill to `peccable`; Impeccable remains the upstream project name.
- Moved the canonical entry point to `skills/peccable/SKILL.md`, alongside focused, demand-loaded references, a bundled copy of the unchanged root license, and the attribution notice. The complete directory is authored distribution source, not a generated replica; there are no root skill aliases or notice duplicates.
- Isolated the shipping source from repository-level skill discovery paths to avoid intentionally loading frontend guidance during skill maintenance. The standard does not mandate a repository layout, and harness discovery remains harness-specific.
- The agent infers task context and chooses design interventions within the assignment. User-intent questions are reserved for unresolved material gaps; no command selection, initialization workshop, or mandatory product/design documents are required.
- Design iteration follows acceptance criteria and evidence. Accessibility, responsiveness, functionality, and performance are integrated into ordinary frontend work; planning-only requests and existing coherent identity remain binding.
- Installation exclusively creates a configured skills directory's `peccable` destination, refuses an existing destination, and copies all of `skills/peccable/.`, including any future referenced scripts or assets. Root scripts, tests, specification, and maintenance documentation do not ship. Harness discovery and activation remain harness-specific.
- Maintenance uses a portable-resource checker for missing or escaping resources, isolated boundary regressions including Markdown code spans, and the pinned official Agent Skills validator with the absolute `"$PWD/skills/peccable"` directory path. The checker defaults to the canonical payload independently of the working directory and accepts an optional installed-payload path without requiring repository maintenance files. There is no runtime build or generation step.

### Retained and adapted

- Frontend craft across typography, color, layout, motion, interaction, content, reusable systems, performance, platform conventions, and quality practices.
- Context-sensitive design judgment, adapted from command-specific guidance without preserving command menus, rigid aesthetic bans, or workshop dependencies.
- The unchanged root license and skill specification, an identical license copy bundled for portability, upstream Impeccable/Paul Bakaus and Anthropic frontend-design attribution, and the MIT license notice for ehmo's platform guidance in `skills/peccable/NOTICE.md`.

### Removed

- The old CLI, installer, engine downloads, and deterministic detector runtime.
- Browser extension, live-variant tooling, and their supporting integrations.
- Provider adapters and integrations, generated skill replicas and distributions, and runtime packaging/build infrastructure.
- User-selected design commands and aliases, initialization/state machinery, and mandatory hidden project files or product/design documents.

These removals are an architectural cutover, not a backward-compatible update. The fork no longer provides the old detector, CLI, live browser workflow, or provider integrations; it supplies portable guidance for tools already available in the host harness.
