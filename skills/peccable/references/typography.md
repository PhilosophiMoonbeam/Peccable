# Typography

Typography carries hierarchy, reading comfort, and product voice before any decoration does.
Preserve established families and an explicit brief. A local refinement is not permission to replace the identity or restyle neighboring surfaces.

## Choose type for its job

- For task-heavy interfaces, favor distinguishable characters, stable widths, clear labels, and a reliable range of weights.
- For reading, judge the face in paragraphs at the actual measure, not in a specimen heading.
- For expressive surfaces, let display type carry a specific voice while supporting text stays effortless to read.
- A familiar or system family can be the right choice. Distinctiveness comes from its relationship to content, scale, composition, and detail, not obscurity alone.
- Add a second family only for a role it performs better; pair complementary jobs rather than collecting styles.
- Inspect actual glyph coverage, italics, numerals, punctuation, and language support before committing to a face.

## Build recognizable roles

Identify the lead, section heading, body, label, metadata, and data roles the target actually needs.
Use the fewest roles that make their differences unmistakable; reuse the project's existing tokens before adding new ones.

- Combine size, weight, space, and tone. Size alone cannot express every level of importance.
- Give adjacent roles enough distinction to survive a quick glance, but avoid turning routine labels into display typography.
- Keep the same role stable across repeated components and states.
- Use semantic headings for document structure; visual size need not mirror heading rank mechanically.
- Make labels and metadata subordinate without making them faint or unreadably small.
- Align numbers for comparison with tabular numerals where supported; use proportional numerals where even spacing is unnecessary.
- Reserve monospaced treatment for a meaningful reading or identity role, not a generic signal that a product is technical.

Boldness often means committing to one existing display role and quieting its competitors.
Restraint means fewer competing weights and clearer spacing, not flattening every role to the same size.

## Tune reading, not just the scale

- Around 1rem is a useful web body starting point, not a universal minimum for every dense label or a substitute for testing readability.
- Start prose around 45–75 characters per line. Adjust for the face, language, audience, and content; short UI labels are not prose.
- Wider lines usually need more leading. Start body line height around 1.4–1.6 and inspect actual paragraphs rather than applying one ratio everywhere.
- Display headings can use tighter leading, but accents, descenders, and wrapped lines must not collide or clip.
- Tracking depends on the face and role. Tighten large display text only while letter shapes remain clear; do not copy a negative tracking value across the whole interface.
- On dark surfaces, inspect apparent weight and spacing anew. Slightly more weight or leading may help; automatic compensation can make an already robust face clumsy.
- Use paragraph spacing or indentation as the primary paragraph signal. Applying both often overstates the boundary.
- Give headings more separation from the preceding section than from the content they introduce.
- Keep links recognizable within prose, including keyboard focus and sufficient underline separation from descenders.

## Make composition resilient

- Size expressive headings to available space with bounded fluid values when appropriate; keep frequently scanned product roles predictable.
- Let meaningful phrases wrap naturally. Balanced headings can help, but forced line breaks often fail in translation or narrower containers.
- Avoid fixed-height text boxes unless overflow behavior is explicitly designed.
- Truncation must not hide essential actions, errors, or distinctions between records. Supply a reachable full value when abbreviation is justified.
- Preserve browser zoom, user font settings, and platform text scaling. A layout that only works at the designer's text size is incomplete.
- Check the longest real heading, localized expansion, mixed scripts, and strings without convenient spaces.

## Deliver fonts without sacrificing text

Load only the families, weights, and language subsets actually used. Confirm licensing and use the project's existing delivery approach.
For a real variable asset, a declaration can describe its supported range rather than loading separate files for every weight:

```css
@font-face {
  font-family: "Product Sans";
  src: url("/fonts/product-sans.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
body { font-family: "Product Sans", system-ui, sans-serif; }
```

The path and weight range must match the actual asset; static fonts need their actual individual weights.
`swap` keeps fallback text available while the face loads. `optional` can avoid a late swap when keeping the fallback is acceptable; choose deliberately.
Match fallback metrics using measured `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` values on a fallback face when reflow is disruptive.
Those values depend on the chosen pair: never borrow percentages from an unrelated font example.
Preload only a critical font that is genuinely needed immediately; loading every weight competes with other content.

## Evidence to inspect

- At a glance, identify the lead, supporting roles, and reading path without relying on the copy's meaning.
- Inspect real paragraphs and headings at narrow, intermediate, and wide widths; name any clipped, cramped, or awkwardly wrapped role.
- At enlarged text and zoom, confirm controls grow or reflow and all essential text remains reachable.
- Inspect fallback and loaded-font states for invisible text, changed line counts, displaced controls, or synthetic missing weights.
- Confirm numerals, punctuation, diacritics, and required scripts render correctly.
- Record the relevant role, computed values, and observed state rather than claiming that typography simply looks better.
