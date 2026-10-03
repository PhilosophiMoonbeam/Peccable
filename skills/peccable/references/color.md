# Color

Color should establish hierarchy, communicate state, or create product-specific atmosphere.
Honor confirmed brand colors, domain conventions, and the explicit brief. Local palette adjustments must not quietly replace the identity.

## Define palette purpose

Inspect existing tokens, assets, themes, and representative states before choosing new swatches.
Identify weak hierarchy, ambiguous state, poor contrast, or excessive competition; each requires a different intervention.

- In working interfaces, prioritize actions, selection, status, and wayfinding over decoration.
- In reading surfaces, protect extended reading comfort and recognizable links and annotations.
- In expressive surfaces, a large color region may organize the design; restraint does not require a percentage of neutral space.
- Choose light or dark treatment for the use scene and established identity, not a category stereotype.
- Name the desired temperature, dominant relationship, and strongest focal role. Attractive swatches alone are not a strategy.

## Define color roles

Reuse existing semantic roles. Typical needs include:

- canvas and elevated surfaces;
- primary, secondary, and inverse text;
- action, hover, pressed, focus, and selection;
- borders and separators;
- success, warning, error, and information;
- categorical, sequential, or diverging data scales.

A role defines a color's purpose; a primitive defines its value. Themes can remap roles without changing component intent.

- Avoid a new accent for every section or an almost-identical neutral for every component.
- Keep status meanings stable; pair color with text, an icon, a shape, or a pattern.
- Do not use semantic colors decoratively when that obscures success, warning, or error.

## Direct attention

- Assign the strongest hue or contrast to an important role or region rather than scattering equally loud accents.
- Preserve a clear primary action; do not let surrounding decoration compete.
- For a more assertive target, amplify an existing identity palette relationship and quiet neighboring elements within the authorized scope.
- For a calmer target, remove redundant colored surfaces or reduce decorative chroma before lowering text or control contrast.
- Neutral gray is legitimate. Tint neutrals for cohesion, not because every palette supposedly requires a tint.
- Tune supporting text against its actual colored surface. A hue-related foreground may cohere better than generic gray, but readability decides.
- Gradients, glass, shadows, and strong accents can be legitimate materials. Keep them only when they clarify depth, content, state, or an intentional visual world.
- A glow is not automatically elevation; depth should communicate what sits above what and why.

## Compose themes and ramps

Retain the project's color representation. For new web palettes, OKLCH can simplify reasoning about lightness and chroma adjustments.
Perceptual lightness is not a WCAG contrast ratio; compute the rendered foreground/background pair.

- Adjust ramp lightness deliberately; usually reduce chroma near white and black.
- Check output in the supported color gamut; highly chromatic values can clip or shift across displays and browsers.
- Design dark-theme surfaces, elevation, text, and accents together rather than mechanically inverting the light theme.
- Inspect selected, disabled, error, hover, pressed, and focus states in every supported theme.
- Prefer explicit foreground/surface pairs when stacked translucent layers make their final contrast hard to predict.
- For sequential data, make ordering legible through lightness; for diverging data, make the meaningful midpoint clear.
- For categorical data, pair distinguishable colors with labels or other redundant cues. More hues cannot fix an unreadable legend.

## Check contrast by role

For WCAG 2.x AA, check the actual rendered pair, including transparency and its underlying background:

| Role | Minimum contrast |
|---|---|
| Ordinary text, including meaningful placeholder text | 4.5:1 |
| Large text: at least 18pt regular or 14pt bold | 3:1 |
| Visual information needed to identify an active control or graphical object | 3:1 against adjacent colors |

At standard CSS units, large-text thresholds are 24px regular or about 18.67px bold; visual importance alone does not make text large.

- Apply the non-text rule where visual information is needed to understand or operate the interface; not every decorative border or icon needs 3:1.
- Make authored focus indicators clearly visible against their surroundings. Contrast alone neither ensures an adequate indicator nor prevents obscuring it.
- Inactive controls have WCAG contrast exceptions, but unreadable disabled content can still confuse workflows.
- Do not dim all supporting text to manufacture hierarchy; size, weight, and spacing can distinguish roles without failing contrast.

## Inspect evidence

- List critical foreground/background pairs, measured ratios, and states; do not assert accessibility from appearance.
- For text over photography or gradients, inspect the weakest area behind the text and provide a stable backing if needed.
- In grayscale or with common color-vision deficiencies simulated, confirm action, selection, status, and data meaning remain recoverable.
- Inspect empty, dense, error, and loading states for accents that change meaning or overpower the intended task.
- Confirm focus, hover, pressed, and selected states are distinguishable without relying on color alone where they convey information.
- Identify what receives attention first and whether it matches the intended priority.
- Quiet results should retain identity and usable affordances; expressive results should retain reading comfort and a clear task path.
