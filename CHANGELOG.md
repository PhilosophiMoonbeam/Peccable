# Changelog

## Unreleased

Peccable is a deliberately divergent fork replacing upstream Impeccable's command-driven product with one autonomous Agent Skill named `peccable`.

### Changed

- Recommended `npx skills add PhilosophiMoonbeam/Peccable` in the README for simpler installation; retained the exclusive whole-directory copy procedure as a manual alternative.
- Corrected the repository guidelines by removing the accidental specification-retention requirement. Root and bundled license preservation requirements remain unchanged.
- Reformatted the entry point and all eleven focused references in terse, complete Standard Technical English: shorter sentence-case headings, direct prose, and consistent instruction groups. Preserved guidance, examples, qualifications, technical thresholds, code snippets, reference loading, and authority boundaries; frontmatter, licenses, and attribution are unchanged.
- Restored precision after auditing the terse rewrite against its parent: explicit acceptance and interaction-completion requirements, typeface evaluation, deliberate font-display choice, API-exposure scope, animation-independent content, and context-sensitive effect guidance.
- Added a README SVG logo with custom path-based serif lettering. Its initial stylized p includes a deliberately offset coral segment and forms part of the name. The SVG is the sole logo asset; removed the superseded PNG and its generation prompt. Artwork lives with repository documentation, outside the installed skill payload.
- Renamed the project to Peccable and the skill to `peccable`; Impeccable remains the upstream project name.
- Moved the canonical entry point to `skills/peccable/SKILL.md`, alongside focused, demand-loaded references, a bundled copy of the unchanged root license, and the attribution notice. The complete directory is authored distribution source, not a generated replica; there are no root skill aliases or notice duplicates.
- Isolated the shipping source from repository-level skill discovery paths to avoid intentionally loading frontend guidance during skill maintenance. The standard does not mandate a repository layout, and harness discovery remains harness-specific.
- The agent infers task context and chooses design interventions within the assignment. User-intent questions are reserved for unresolved material gaps; no command selection, initialization workshop, or mandatory product/design documents are required.
- Design iteration follows acceptance criteria and evidence. Accessibility, responsiveness, functionality, and performance are integrated into ordinary frontend work; planning-only requests and existing coherent identity remain binding.
- Installation exclusively creates a configured skills directory's `peccable` destination, refuses an existing destination, and copies all of `skills/peccable/.`, including any future referenced scripts or assets. Root scripts, tests, specification, and maintenance documentation do not ship. Harness discovery and activation remain harness-specific.
- Maintenance uses a portable-resource checker for missing or escaping resources, isolated boundary regressions including Markdown code spans, and the pinned official Agent Skills validator with the absolute `"$PWD/skills/peccable"` directory path. The checker defaults to the canonical payload independently of the working directory and accepts an optional installed-payload path without requiring repository maintenance files. There is no runtime build or generation step.

### Upstream review

- Reviewed `pbakaus/impeccable` from [e103efe7](https://github.com/pbakaus/impeccable/commit/e103efe779e2dd01274dabae83531fef00bf2563) through [ca6ca49f](https://github.com/pbakaus/impeccable/commit/ca6ca49f6a74e2e23adb955fb3801f4aa6426f3d), fetched 2026-10-06: [full baseline-to-tip comparison](https://github.com/pbakaus/impeccable/compare/e103efe779e2dd01274dabae83531fef00bf2563...ca6ca49f6a74e2e23adb955fb3801f4aa6426f3d). Adapted transferable guidance to autonomous, assignment-bounded work rather than importing upstream orchestration.
- Adapted culturally appropriate symbolic judgment and contextual direction inspiration. Avoid incidental militarist, supremacist, or hate-movement emblems without excluding factual historical content; draw from audience-relevant visual traditions without copying motifs or fragmenting the design system. Sources: [5cee9450](https://github.com/pbakaus/impeccable/commit/5cee9450), [981031de](https://github.com/pbakaus/impeccable/commit/981031de).
- Added optional visual prompt composition in visitor reading order, led by exact headline/action and one dominant move. Show the actual surface and inspect generated drafts; prompts are not runnable evidence, and accepted comps are reused. Sources: [f3132ffe](https://github.com/pbakaus/impeccable/commit/f3132ffe), [b89311dc](https://github.com/pbakaus/impeccable/commit/b89311dc).
- Clarified fixed comp authority, final-evidence freshness, and limited viewport acceptance. When the assignment designates a supplied or accepted comp as the visual target, correct builds or assets rather than altering that target; later explicit user direction may change it. Inspiration and incumbent evidence are not inherently fixed targets. Evidence must cover current files and dependencies, with relevant recapture or re-exercise after changes. Accepted first-viewport choices do not settle the remaining page, accessibility, or functionality. Sources: [4bc74df2](https://github.com/pbakaus/impeccable/commit/4bc74df2), [1d789ba1](https://github.com/pbakaus/impeccable/commit/1d789ba1), [8b91c4f7](https://github.com/pbakaus/impeccable/commit/8b91c4f7).
- Clarified valid capture targets and rendered text measurement. Confirm the intended interface rather than an unintended challenge, login, or error page; requested error states remain valid, and unavailable observation is not clean evidence. Measure visible text with loaded fonts, whitespace, and script shaping; qualify source-only measurements rather than guessing unresolved CSS values. Sources: [75557d12](https://github.com/pbakaus/impeccable/commit/75557d12), [ca6ca49f](https://github.com/pbakaus/impeccable/commit/ca6ca49f6a74e2e23adb955fb3801f4aa6426f3d), [1486a6f9](https://github.com/pbakaus/impeccable/commit/1486a6f9).
- Added contextual neutral-ink judgment and modal focus guidance. Assess actual computed colors and contrast instead of banning dark neutral ink on chromatic surfaces. Respect native modal inertness; inspect topmost and nested-overlay focus, closing, and restoration without disabling containment for tools, and exclude inspector chrome from captures. Sources: [961dd847](https://github.com/pbakaus/impeccable/commit/961dd847), [e727d00e](https://github.com/pbakaus/impeccable/commit/e727d00e), [6d1d354d](https://github.com/pbakaus/impeccable/commit/6d1d354d), [6c768d9b](https://github.com/pbakaus/impeccable/commit/6c768d9b).
- Rejected mandatory choices and approval rituals, fixed candidate counts, roll catalogs/services, hidden state, required product/design documents, and hosted lifecycle gates. They replace assignment-bounded judgment with workshops or external prerequisites.
- Excluded engine, hooks, telemetry, provider/runtime distributions, installation changes, parser/source-rewriting internals, browser process controls, generated bundles, dependencies, and test/corpus artifacts. Rejected universal aesthetic bans, numeric authority overrides, mandatory comp generation, fixed iteration caps, and forced binary/raster asset workflows; retain contextual judgment, existing identity, and evidence-based acceptance instead.

### Retained and adapted

- Frontend craft across typography, color, layout, motion, interaction, content, reusable systems, performance, platform conventions, and quality practices.
- Context-sensitive design judgment, adapted from command-specific guidance without preserving command menus, rigid aesthetic bans, or workshop dependencies.
- The unchanged root license, an identical license copy bundled for portability, upstream Impeccable/Paul Bakaus and Anthropic frontend-design attribution, and the MIT license notice for ehmo's platform guidance in `skills/peccable/NOTICE.md`.

### Removed

- The old CLI, installer, engine downloads, and deterministic detector runtime.
- Browser extension, live-variant tooling, and their supporting integrations.
- Provider adapters and integrations, generated skill replicas and distributions, and runtime packaging/build infrastructure.
- User-selected design commands and aliases, initialization/state machinery, and mandatory hidden project files or product/design documents.

These removals are an architectural cutover, not a backward-compatible update. The fork no longer provides the old detector, CLI, live browser workflow, or provider integrations; it supplies portable guidance for tools already available in the host harness.
