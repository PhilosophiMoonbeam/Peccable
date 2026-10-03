# Design systems and reuse

Read when consolidating repeated UI, extracting tokens or components, extending an established identity, or explaining the system already present in code. Reuse should make the next screen more coherent, not create a second framework.

## Find the actual source of truth

- Inspect the affected surface's styles, theme, tokens, shared components, assets, and existing documentation.
- Infer authority from consistent implementation and current rendered behavior, not a required filename.
- Existing documentation is evidence; resolve conflicts against the intended current system rather than copying stale prose.
- Follow the project's directory structure, naming, imports/exports, styling approach, and component conventions.
- Prefer the incumbent system for refinement. Do not rename scales, replace icon sets, or add a new theme layer for tidiness alone.
- Distinguish intentional variants from accidental drift; similar pixels do not always imply the same component intent.
- Where no shared system exists, choose the smallest structure consistent with the repository and current scope.
- No special context document, generated sidecar, private service, or external engine is needed to use this guidance.

## Decide what earns extraction

- Look for repeated components, field rows, toolbar groups, empty states, type roles, and interaction patterns in the authorized area.
- Extract when repeated intent and behavior are clear; repetition across several uses is evidence, not a rigid numerical gate.
- Keep one-off editorial compositions and context-specific behavior local unless a shared requirement genuinely exists.
- Consolidate duplicated implementations of the same concept before inventing a broader abstraction.
- Record the real consumers and variations that a shared component must support.
- Prefer composition over a giant component with many unrelated boolean switches.
- A shared component should remove repeated decisions while leaving meaningful product differences expressible.
- Do not create unused tokens, speculative variants, or a universal component API for hypothetical future screens.

## Tokens express roles

- Separate primitive values from semantic intent when that distinction fits the incumbent system.
- A primitive might describe a palette step; a semantic role describes text, surface, action, focus, or error.
- Name tokens by purpose at the usage site: `text-muted` is more durable than scattering a literal gray.
- Preserve existing naming and color formats instead of adding parallel aliases or converted copies of canonical values.
- Cover the repeated vocabulary actually present: color, type, spacing, shape, elevation, borders, and motion.
- Treat a text style as a coherent family/size/weight/line-height/spacing role, not an isolated font-size token.
- Keep spacing and radius scales deliberate; exceptions can stay local when their job is specific and documented.
- Define meaningful component roles and states, including focus, disabled, pressed, selected, loading, and error.
- Resolve light/dark and contrast-sensitive roles consistently; a dark theme is not a blanket inversion.
- Native tokens map to platform semantic colors, text scaling, and materials instead of overriding OS behavior.
- Do not make every literal a token. Promote values whose shared meaning or coordinated change justifies central control.
- Keep one authoritative definition per role; avoid drift between code, theme configuration, and descriptive prose.

## Components include behavior

- Preserve semantic elements, accessible names, roles, and expected keyboard or native interaction models.
- A button abstraction supports pending and disabled behavior without removing its label or focus feedback.
- A field abstraction keeps labels, hints, errors, required state, and accessible associations together.
- Dialogs include focus entry, containment, dismissal, and restoration rather than sharing only a background and radius.
- Expose real variants with sensible defaults and clear types or prop contracts in the language the project uses.
- Keep controlled/uncontrolled state ownership understandable and consistent with existing patterns.
- Permit appropriate content wrapping, localization, and text scaling; shared controls must not assume short English labels.
- Include the actual empty, loading, failure, and success behavior where it belongs in the shared pattern.
- Support class/style extension through the existing convention without making callers override internals routinely.
- Avoid exposing internal implementation details as an API when the consumer only needs a semantic option.
- Keep stable identity and state when lists reorder or a layout changes; reused UI must not discard user work unexpectedly.

## Migrate, do not layer

- Define the token/component contract before replacing callers; include every variant currently needed.
- Replace affected consumers with the shared implementation and preserve their task, content, and interaction outcomes.
- Migrate all consumers of an obsolete API within the authorized cutover; do not leave two competing conventions.
- Remove replaced local styles, duplicate components, unused variants, dead imports, and stale examples made obsolete by the change.
- Keep unrelated project work intact and do not broaden a scoped refinement into a whole-product rewrite.
- Shared changes need consideration of every consumer, including themes, compact layouts, and error states.
- Prefer a small reusable pattern over deeper nesting or extra wrapper components that merely move markup around.
- Simplify visual noise with hierarchy, spacing, and alignment before adding another card or container abstraction.

## Describe what exists

- When documentation is useful or requested, update the project's existing system documentation or component catalog.
- State observed rules and intentional decisions; separate established conventions from proposed changes.
- Explain purpose and use: color roles, type hierarchy, density, container behavior, spacing, shape, and elevation.
- Describe flat or tonal depth honestly; do not invent shadows or extra palette roles to fill a template.
- Include state behavior, responsive constraints, accessibility guarantees, and the reason for important exceptions.
- Document component variants with representative real usage rather than every theoretically possible combination.
- Keep token names and values aligned with code; link or refer to the authoritative definition rather than maintaining duplicate tables unnecessarily.
- Preserve the project's format; do not impose a new specification, required root document, or machine-readable sidecar.
- Do not ask users to choose ordinary token names or CSS values that can be derived from the system.
- Ask only when a binding identity, authority, or product requirement cannot be resolved from available context.

## Concrete checks

- Can the same intent be expressed through one component API without visual or behavioral hacks?
- Are similarly named tokens actually the same role, and are unlike roles still independently expressible?
- Do every affected consumer and existing example use the new contract, with obsolete implementations removed?
- Are labels, focus, keyboard behavior, loading/error states, long text, and text scaling preserved after extraction?
- Do semantic roles remain readable in supported themes and do native controls retain platform behavior?
- Is a future screen easier to build using this system without reading a parallel configuration or hidden service?
- Does the documentation describe real implementation and constraints rather than a newly invented aesthetic story?
