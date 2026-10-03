# Layout

Layout translates product priority into reading order, grouping, rhythm, and usable space.
Preserve the established identity and authorized target. Improving one section does not require rebuilding the page around it.

## Start with relationships

Name what leads, what supports it, what belongs together, and the order in which someone should understand or act.
Choose the simplest structure that expresses those relationships rather than filling a familiar template.

- Task-heavy interfaces benefit from stable locations, predictable density, and fast comparison.
- Reading surfaces benefit from a clear linear path, comfortable measure, and landmarks that support navigation.
- Expressive surfaces may use asymmetry or disruption when it makes the artifact or message more compelling, not merely different.
- Density depends on use frequency and decision complexity. Expert tools need not become airy marketing pages; unfamiliar decisions need not become compact dashboards.
- Repetition supports recognition. Break it when content or priority changes, not to satisfy a quota for visual variety.

## Make hierarchy visible in the skeleton

Blur or squint at the composition: the primary element, secondary element, and major groups should remain apparent.
If removing the words makes every section interchangeable, consider whether the structure actually reflects its purpose.

- Group by meaning with proximity before adding borders or containers.
- Use tight internal spacing and more generous separation between distinct groups.
- Give a heading a closer relationship to the content it introduces than to the section above it.
- Align meaningful edges: labels, text baselines, controls, and image boundaries should share an intelligible structure.
- Make optical corrections after inspecting the rendered shapes; mathematical centering is not always perceptual centering.
- Use empty space to establish priority, pacing, or separation, not as compensation for missing content.
- Choose one strong local move when a target feels flat: a clearer lead, a different content proportion, or a confident use of an existing motif.
- Quiet competing elements within scope rather than making every element larger or louder.

## Use containers only when they earn their boundary

Cards are useful for independent items, selectable units, or repeated records. They are not required around every paragraph or section.
A list, table, editorial column, band, or unboxed grouping may communicate the content more directly.
Nested containers can express real parent/child relationships; remove layers that merely repeat padding and decoration.
Eyebrows, section numbers, and metrics should supply orientation, sequence, or evidence, not obligatory template ornaments.
Depth should explain layers or state. Borders, shadows, and radii need a coherent role rather than accumulating by component default.

## Build a rhythm that survives change

- Reuse the existing spacing scale. Add a role only when a repeated relationship cannot be expressed clearly with what exists.
- Use `gap` for sibling relationships and padding for a container's internal boundary; avoid stacked margins that obscure the source of an interval.
- Alternate compact groups with generous transitions where the content benefits. Equal spacing everywhere erases hierarchy.
- Keep repeated controls and comparable records consistent so their differences remain easy to scan.
- Bound wide reading regions and workspaces; a large display does not require stretching every line or panel edge to edge.
- Keep the target's rhythm related to its neighbors without changing those neighbors merely to justify a local refinement.

## Let composition respond to content

Choose breakpoints where the content relationship stops working, not from device labels alone.
Components reused in different regions may need container-aware behavior rather than a single viewport assumption.
A flexible grid can protect its minimum item width without overflowing a container narrower than that minimum:

```css
.items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-group);
}
.items > * { min-width: 0; }
```

Use the project's spacing token and a minimum suited to the actual content. `auto-fit` expands remaining items; choose a different model if sparse rows must retain fixed column tracks.
`min-width: 0` permits shrinking but does not solve long-string overflow by itself; wrap, abbreviate with access to the full value, or give genuinely wide content a purposeful scrolling region.

- Reflow or collapse around task priority. Do not hide essential content merely because it is difficult to fit.
- Preserve meaningful DOM and keyboard order when columns stack; visual reordering must not create a contradictory interaction path.
- Check intermediate widths, where layouts often fail before the narrowest breakpoint.
- Make sticky headers, overlays, and safe-area handling preserve access to content and focused controls.
- Keep visible marks and their interactive areas distinct when needed: a small icon does not justify a tiny touch target.

## Give imagery a real compositional job

Use actual product views, artifacts, photography, or illustration when the subject needs visual evidence.
A decorative gradient, placeholder chart, or unrelated stock scene cannot substitute for showing the thing the visitor needs to understand.
Choose crop, aspect ratio, and scale to preserve the subject and its relationship to the text; inspect each responsive crop.
If an effect needs the subject's organic edge, use an actual cut-out or image-derived matte rather than approximating it with arbitrary geometric masks.
Geometry is appropriate for diagrams and shapes whose structure conveys meaning. If the needed asset is unavailable, state the gap instead of presenting a decorative substitute as evidence.

## Evidence to inspect

- Identify the reading and task path in the rendered target, including the lead and supporting groups.
- Inspect narrow, intermediate, wide, zoomed, and enlarged-text states for overflow, stranded controls, and broken grouping.
- Use long real content, localized expansion, empty states, and dynamic updates to expose fixed-height or fragile alignment assumptions.
- Compare visual order with DOM and keyboard order, and confirm sticky or overlaid elements do not obscure focus.
- Inspect computed gaps and padding where rhythm looks wrong; name the relationship the corrected interval expresses.
- Confirm imagery still shows the intended evidence and the authorized surrounding layout remains unchanged.
