# Typography

Typography establishes hierarchy, reading comfort, and product voice before decoration.
Preserve established families and the explicit brief. Local refinement does not authorize identity replacement or restyling neighboring surfaces.

## Choose type by role

- For task-heavy interfaces, favor distinguishable characters, stable widths, clear labels, and a reliable range of weights.
- For reading, assess paragraphs at the actual measure, not specimen headings.
- For expressive surfaces, give display type a specific voice while keeping supporting text effortless to read.
- Familiar or system families can be appropriate. Distinctiveness comes from relationships to content, scale, composition, and detail, not obscurity alone.
- Add a second family only for a role it performs better; pair complementary jobs, not collected styles.
- Inspect actual glyph coverage, italics, numerals, punctuation, and language support before choosing a face.

## Build recognizable roles

Identify the lead, section heading, body, label, metadata, and data roles the target needs.
Use the fewest roles with unmistakable differences; reuse existing project tokens before adding new ones.

- Combine size, weight, space, and tone. Size alone cannot express every level of importance.
- Distinguish adjacent roles at a glance without turning routine labels into display typography.
- Keep each role stable across repeated components and states.
- Use semantic headings for document structure; visual size need not mechanically mirror heading rank.
- Make labels and metadata subordinate without making them faint or unreadably small.
- Align numbers for comparison with tabular numerals where supported; use proportional numerals where even spacing is unnecessary.
- Reserve monospaced treatment for a meaningful reading or identity role, not a generic signal that a product is technical.

Boldness often means committing to one existing display role and quieting competitors.
Restraint means fewer competing weights and clearer spacing, not equal sizes for every role.

## Tune reading

- Around 1rem is a useful web body starting point, not a universal minimum for every dense label or a substitute for testing readability.
- Start prose around 45–75 characters per line. Adjust for the face, language, audience, and content; short UI labels are not prose.
- Wider lines usually need more leading. Start body line height around 1.4–1.6; inspect actual paragraphs rather than applying one ratio everywhere.
- Display headings can use tighter leading, but accents, descenders, and wrapped lines must not collide or clip.
- Adjust tracking for the face and role. Tighten large display text only while letter shapes remain clear; do not copy one negative tracking value across the interface.
- Reassess apparent weight and spacing on dark surfaces. Slightly more weight or leading may help; automatic compensation can make a robust face clumsy.
- Use paragraph spacing or indentation as the primary paragraph signal. Applying both often overstates the boundary.
- Give headings more separation from the preceding section than from the content they introduce.
- Keep links recognizable within prose, including keyboard focus and sufficient underline separation from descenders.

## Make text resilient

- Size expressive headings to available space with bounded fluid values when appropriate; keep frequently scanned product roles predictable.
- Let meaningful phrases wrap naturally. Balanced headings can help, but forced line breaks often fail in translation or narrower containers.
- Avoid fixed-height text boxes unless overflow behavior is explicitly designed.
- Truncation must not hide essential actions, errors, or distinctions between records. Supply a reachable full value when abbreviation is justified.
- Preserve browser zoom, user font settings, and platform text scaling. Layouts that work only at the designer's text size are incomplete.
- Check the longest real heading, localized expansion, mixed scripts, and strings without convenient spaces.

## Deliver fonts reliably

Load only used families, weights, and language subsets. Confirm licensing and follow the project's existing delivery approach.
For an actual variable font asset, a declaration can describe its supported range instead of loading separate files for each weight:

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

- Match the path and weight range to the actual asset; declare each static font's actual weight.
- Use `swap` to keep fallback text available during loading. `optional` can avoid a late swap when retaining the fallback is acceptable; choose deliberately.
- When reflow is disruptive, match fallback metrics with measured `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` values on a fallback face. Values depend on the chosen pair; never borrow percentages from an unrelated font example.
- Preload only a critical font needed immediately; loading every weight competes with other content.

## Inspect evidence

- Identify the lead, supporting roles, and reading path at a glance without relying on the copy's meaning.
- Inspect real paragraphs and headings at narrow, intermediate, and wide widths; name any clipped, cramped, or awkwardly wrapped role.
- At enlarged text and zoom, confirm controls grow or reflow and all essential text remains reachable.
- Inspect fallback and loaded-font states for invisible text, changed line counts, displaced controls, or synthetic missing weights.
- Confirm numerals, punctuation, diacritics, and required scripts render correctly.
- Record the relevant role, computed values, and observed state instead of claiming typography simply looks better.
