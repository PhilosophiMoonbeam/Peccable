# Color

Color should establish hierarchy, communicate state, or create an atmosphere specific to the product.
Honor confirmed brand colors, domain conventions, and the explicit brief. A local palette adjustment must not quietly become an identity replacement.

## Give the palette a purpose

Look at the existing tokens, assets, themes, and representative states before choosing new swatches.
Identify whether the problem is weak hierarchy, ambiguous state, poor contrast, or excessive competition; each calls for a different intervention.

- In a working interface, spend color on actions, selection, status, and wayfinding before decoration.
- In a reading surface, protect extended reading comfort and make links and annotations recognizable.
- In an expressive surface, a large color region may be the right organizing idea; restraint is not a mandatory percentage of neutral space.
- Choose light or dark treatment for the use scene and established identity, not a category stereotype.
- Name the desired temperature, dominant relationship, and strongest focal role. A collection of attractive swatches is not yet a strategy.

## Build roles, not exceptions

Use existing semantic roles where they exist. Typical needs are:

- canvas and elevated surfaces;
- primary, secondary, and inverse text;
- action, hover, pressed, focus, and selection;
- borders and separators;
- success, warning, error, and information;
- categorical, sequential, or diverging data scales.

A role expresses what a color does; a primitive expresses its value. Themes can remap roles without changing component intent.
Avoid adding a new accent for every section or an almost-identical neutral for every component.
Keep status meanings stable and provide a text, icon, shape, or pattern cue alongside color.
Do not borrow semantic colors for decorative emphasis when that makes success, warning, or error harder to recognize.

## Control attention deliberately

- Let the strongest hue or contrast own an important role or region instead of scattering equally loud accents.
- Preserve a clear primary action; surrounding decoration should not compete with it.
- To make a target more assertive, amplify a palette relationship the identity already owns and quiet its neighbors within the authorized scope.
- To make it calmer, remove redundant colored surfaces or reduce decorative chroma before lowering text or control contrast.
- Neutral gray is legitimate. Tint neutrals when it creates cohesion, not because every palette supposedly needs a tint.
- On a colored surface, tune supporting text against that actual surface; a hue-related foreground may cohere better than a generic gray, but readability decides.
- Gradients, glass, shadows, and strong accents can be legitimate materials. Keep them only when they clarify depth, content, state, or an intentional visual world.
- A glow is not automatically elevation; depth should communicate what sits above what and why.

## Compose themes and ramps

Retain the project's color representation. For a new web palette, OKLCH can make lightness and chroma adjustments easier to reason about.
Perceptual lightness is not a WCAG contrast ratio: compute the rendered foreground/background pair.

- When building ramps, adjust lightness deliberately and usually reduce chroma near white and black.
- Check output in the supported color gamut; highly chromatic values can clip or shift across displays and browsers.
- Design dark-theme surfaces, elevation, text, and accents together rather than mechanically inverting the light theme.
- Inspect selected, disabled, error, hover, pressed, and focus states in every supported theme.
- Prefer explicit foreground/surface pairs when stacked translucent layers make their final contrast hard to predict.
- For sequential data, make ordering legible through lightness; for diverging data, make the meaningful midpoint clear.
- For categorical data, combine distinguishable colors with labels or other redundant cues. More hues cannot rescue an unreadable legend.

## Contrast is role-specific

For WCAG 2.x AA, check the actual rendered pair, including transparency and the background beneath it:

| Role | Minimum contrast |
|---|---|
| Ordinary text, including meaningful placeholder text | 4.5:1 |
| Large text: at least 18pt regular or 14pt bold | 3:1 |
| Visual information needed to identify an active control or graphical object | 3:1 against adjacent colors |

At standard CSS units, the large-text thresholds are 24px regular or about 18.67px bold; visual importance alone does not qualify text as large.
The non-text rule does not require every decorative border or icon to reach 3:1. It applies where that visual information is needed to understand or operate the interface.
Make authored focus indicators clearly visible against their surroundings; contrast alone does not ensure an adequate indicator or prevent it being obscured.
Inactive controls have WCAG contrast exceptions, but unreadable disabled content can still make a workflow confusing.
Do not dim all supporting text to manufacture hierarchy: size, weight, and spacing can carry the distinction without failing contrast.

## Evidence to inspect

- List critical foreground/background pairs with their measured ratios and states, rather than asserting that a palette is accessible by appearance.
- For text over photography or gradients, inspect the weakest area behind the text and provide a stable backing if needed.
- In grayscale or with common color-vision deficiencies simulated, confirm action, selection, status, and data meaning remain recoverable.
- Inspect empty, dense, error, and loading states for accents that change meaning or overpower the intended task.
- Confirm focus, hover, pressed, and selected states are distinguishable without relying on color alone where they convey information.
- Identify what now receives attention first and whether that matches the intended priority.
- A quiet result should retain identity and usable affordances; an expressive result should retain reading comfort and a clear task path.
