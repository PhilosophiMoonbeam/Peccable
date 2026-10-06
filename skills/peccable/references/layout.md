# Layout

Layout expresses product priority through reading order, grouping, rhythm, and usable space.
Preserve the established identity and authorized target; improving one section does not require rebuilding the page.

## Establish content relationships

Identify the lead, supporting content, related groups, and the intended comprehension or action order.
Choose the simplest structure that expresses these relationships, not a familiar template by default.

- Task-heavy interfaces benefit from stable locations, predictable density, and fast comparison.
- Reading surfaces benefit from a clear linear path, comfortable measure, and landmarks that support navigation.
- Expressive surfaces may use asymmetry or disruption to strengthen the artifact or message, not merely differentiate it.
- Match density to use frequency and decision complexity. Expert tools need not become airy marketing pages; unfamiliar decisions need not become compact dashboards.
- Use repetition for recognition. Break it when content or priority changes, not to meet a visual-variety quota.

## Make structural hierarchy visible

Blur or squint at the composition: the primary and secondary elements and major groups should remain apparent.
If sections become interchangeable without their words, reconsider whether the structure reflects their purpose.

- Group by meaning with proximity before adding borders or containers.
- Use tight internal spacing and more generous separation between distinct groups.
- Place headings closer to the content they introduce than to the preceding section.
- Align meaningful edges: labels, text baselines, controls, and image boundaries should share a clear structure.
- Inspect rendered shapes before making optical corrections; mathematical centering is not always perceptual centering.
- Use empty space for priority, pacing, or separation, not to compensate for missing content.
- If the target lacks emphasis, choose one strong local change: clarify the lead, change content proportions, or use an existing motif confidently.
- Reduce competing elements' emphasis within scope rather than enlarging or emphasizing every element.

## Use meaningful container boundaries

- Cards suit independent items, selectable units, or repeated records; they are not required around every paragraph or section.
- Consider a list, table, editorial column, band, or unboxed grouping when it communicates content more directly.
- Use nested containers for real parent/child relationships; remove layers that merely repeat padding and decoration.
- Use eyebrows, section numbers, and metrics for orientation, sequence, or evidence, not obligatory template decoration.
- Use depth to explain layers or state. Give borders, shadows, and radii coherent roles rather than accumulating component defaults.
- For concentric rounded enclosures, derive the inner radius from the outer radius minus the intervening inset, floored at zero. Unrelated controls can retain their own role-based radii.

## Maintain rhythm as content changes

- Reuse the existing spacing scale. Add a role only when a repeated relationship cannot be expressed clearly with what exists.
- Use `gap` for sibling relationships and padding for a container's internal boundary; avoid stacked margins that obscure the source of an interval.
- Alternate compact groups with generous transitions where the content benefits. Equal spacing everywhere erases hierarchy.
- Keep repeated controls and comparable records consistent so their differences remain easy to scan.
- In comparison groups, align matching titles, prices, feature groups, and actions where that helps scanning. Use shared, content-sized rows rather than fixed-height spacers that fail with localized or enlarged text.
- Bound wide reading regions and workspaces; a large display does not require stretching every line or panel edge to edge.
- Give display text, prose, and media separate width constraints when their jobs differ; a comfortable paragraph measure need not restrict a headline or image.
- Keep the target's rhythm related to its neighbors without changing those neighbors merely to justify a local refinement.

## Adapt composition to content

Choose breakpoints where content relationships fail, not from device labels alone.
Components reused across regions may need container-aware behavior rather than one viewport assumption.
A flexible grid can protect minimum item width without overflowing a narrower container:

```css
.items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-group);
}
.items > * { min-width: 0; }
```

Use the project's spacing token and a content-appropriate minimum. `auto-fit` expands remaining items; use another model if sparse rows must retain fixed column tracks.
`min-width: 0` permits shrinking but does not alone prevent long-string overflow. Wrap, abbreviate while preserving access to the full value, or provide a purposeful scrolling region for genuinely wide content.

- Reflow or collapse around task priority. Do not hide essential content merely because it is difficult to fit.
- Preserve meaningful DOM and keyboard order when columns stack; visual reordering must not create a contradictory interaction path.
- Reconsider desktop spans, overlaps, and transforms when columns stack; reset those that would create stray tracks, clipped content, or conflicting touch targets.
- Check intermediate widths, where layouts often fail before the narrowest breakpoint.
- Make sticky headers, overlays, and safe-area handling preserve access to content and focused controls.
- Keep visible marks and their interactive areas distinct when needed: a small icon does not justify a tiny touch target.

## Use imagery as evidence

- Use actual product views, artifacts, photography, or illustration when the subject needs visual evidence.
- Do not substitute a decorative gradient, placeholder chart, or unrelated stock scene for what the visitor needs to understand.
- Choose crop, aspect ratio, and scale to preserve the subject and its relationship to text; inspect every responsive crop.
- When an effect needs the subject's organic edge, use an actual cut-out or image-derived matte, not an arbitrary geometric mask.
- Use geometry for diagrams and shapes whose structure conveys meaning.
- If the needed asset is unavailable, state the gap; do not present a decorative substitute as evidence.

## Evidence to inspect

- Identify the reading and task path in the rendered target, including the lead and supporting groups.
- Inspect narrow, intermediate, wide, zoomed, and enlarged-text states for overflow, stranded controls, and broken grouping.
- Use long real content, localized expansion, empty states, and dynamic updates to expose fixed-height or fragile alignment assumptions.
- Compare visual order with DOM and keyboard order, and confirm sticky or overlaid elements do not obscure focus.
- Inspect computed gaps and padding where rhythm looks wrong; name the relationship the corrected interval expresses.
- Confirm imagery still shows the intended evidence and the authorized surrounding layout remains unchanged.
