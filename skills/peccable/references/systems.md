# Design systems and reuse

Read when consolidating repeated UI, extracting tokens or components, extending an established identity, or explaining the system in code. Reuse should improve the next screen's coherence, not create a second framework.

## Identify the source of truth

- Inspect the affected surface's styles, theme, tokens, shared components, assets, and existing documentation.
- Infer authority from consistent implementation and current rendered behavior, not a required filename.
- Treat existing documentation as evidence; resolve conflicts against the intended current system, not stale prose.
- Follow the project's directory structure, naming, imports/exports, styling approach, and component conventions.
- Prefer the incumbent system for refinement. Do not rename scales, replace icon sets, or add a theme layer merely for tidiness.
- Use supplied, licensed, or original assets. Borrow reference rhythm and treatment rather than unrelated identity; reuse distinctive marks, slogans, or visual assets when the task and rights permit.
- Keep related photographs, illustrations, and icons coherent in treatment, palette, lighting, and framing where applicable; vary subjects and composition without accidental identity drift.
- When brandmark changes are authorized, check recognition and balance at actual use sizes and across required backgrounds and variants; preserve established marks otherwise.
- Distinguish intentional variants from accidental drift; similar pixels do not always imply the same component intent.
- Without a shared system, choose the smallest structure consistent with the repository and current scope.
- This guidance requires no special context document, generated sidecar, private service, or external engine.

## Decide what to extract

- Look for repeated components, field rows, toolbar groups, empty states, type roles, and interaction patterns in the authorized area.
- Extract when repeated intent and behavior are clear. Repetition across several uses is evidence, not a rigid numerical gate.
- Keep one-off editorial compositions and context-specific behavior local unless a genuine shared requirement exists.
- Consolidate duplicate implementations of the same concept before creating a broader abstraction.
- Record the real consumers and variations a shared component must support.
- Prefer composition to a large component with unrelated boolean switches.
- Shared components should remove repeated decisions while preserving meaningful product differences.
- Do not create unused tokens, speculative variants, or universal component APIs for hypothetical future screens.

## Define tokens by role

- Separate primitive values from semantic intent when that distinction fits the incumbent system.
- A primitive might describe a palette step; a semantic role describes text, surface, action, focus, or error.
- Name tokens by purpose at the usage site: `text-muted` is more durable than repeated literal gray values.
- Preserve existing naming and color formats instead of adding parallel aliases or converted copies of canonical values.
- Cover the repeated vocabulary present: color, type, spacing, shape, elevation, borders, and motion.
- Treat text styles as coherent family/size/weight/line-height/spacing roles, not isolated font-size tokens.
- Keep spacing and radius scales deliberate; specific, documented exceptions may remain local.
- Define meaningful component roles and states, including focus, disabled, pressed, selected, loading, and error.
- Resolve light/dark and contrast-sensitive roles consistently; a dark theme is not a blanket inversion.
- Native tokens map to platform semantic colors, text scaling, and materials instead of overriding OS behavior.
- Do not tokenize every literal. Centralize values when shared meaning or coordinated change warrants it.
- Maintain one authoritative definition per role; prevent drift across code, theme configuration, and descriptive prose.

## Include behavior in components

- Preserve semantic elements, accessible names, roles, and expected keyboard or native interaction models.
- A button abstraction supports pending and disabled behavior without removing its label or focus feedback.
- A field abstraction keeps labels, hints, errors, required state, and accessible associations together.
- Dialogs include focus entry, containment, dismissal, and restoration, not just a shared background and radius.
- Expose real variants with sensible defaults and clear types or prop contracts in the project's language.
- Keep controlled/uncontrolled state ownership clear and consistent with existing patterns.
- Support appropriate content wrapping, localization, and text scaling; shared controls must not assume short English labels.
- Include actual empty, loading, failure, and success behavior in the appropriate shared pattern.
- Support class/style extension through existing conventions without requiring routine overrides of internals.
- Avoid exposing internal implementation details as an API when consumers need only a semantic option.
- Preserve stable identity and state when lists reorder or layouts change; reused UI must not unexpectedly discard user work.

## Migrate consumers without parallel conventions

- Define the token/component contract before replacing callers; include every variant currently needed.
- Replace affected consumers with the shared implementation; preserve task, content, and interaction outcomes.
- Migrate every consumer of an obsolete API within the authorized cutover; leave no competing conventions.
- Remove replaced local styles, duplicate components, unused variants, dead imports, and examples made obsolete by the change.
- Preserve unrelated project work; do not turn a scoped refinement into a whole-product rewrite.
- Consider every consumer of shared changes, including themes, compact layouts, and error states.
- Prefer small reusable patterns to deeper nesting or wrappers that merely relocate markup.
- Reduce visual noise through hierarchy, spacing, and alignment before adding another card or container abstraction.

## Document the existing system

- When documentation is useful or requested, update the project's existing system documentation or component catalog.
- State observed rules and intentional decisions; distinguish established conventions from proposals.
- Explain purpose and use: color roles, type hierarchy, density, container behavior, spacing, shape, and elevation.
- Describe flat or tonal depth honestly; do not invent shadows or extra palette roles to fill a template.
- Include state behavior, responsive constraints, accessibility guarantees, and rationale for important exceptions.
- Document component variants with representative real usage, not every theoretical combination.
- Align token names and values with code; refer or link to authoritative definitions instead of maintaining unnecessary duplicate tables.
- Preserve the project's format; do not impose a new specification, required root document, or machine-readable sidecar.
- Do not ask users to choose ordinary token names or CSS values derivable from the system.
- Ask only when available context cannot resolve a binding identity, authority, or product requirement.

## Concrete checks

- Can the same intent be expressed through one component API without visual or behavioral hacks?
- Are similarly named tokens actually the same role, and are unlike roles still independently expressible?
- Does every affected consumer and existing example use the new contract, with obsolete implementations removed?
- Are labels, focus, keyboard behavior, loading/error states, long text, and text scaling preserved after extraction?
- Do semantic roles remain readable in supported themes and do native controls retain platform behavior?
- Is building a future screen with this system easier without reading parallel configuration or consulting a hidden service?
- Does documentation describe actual implementation and constraints, not an invented aesthetic narrative?
