# Content and localization

Read when improving labels, navigation, forms, errors, onboarding, long text, or translated interfaces. Copy should simplify the next decision without changing product truth.

## Meaning before brevity

- Read the entire path, including states before and after the string; isolated copy can misdescribe an interaction.
- Identify the one fact needed now, the available action, and supporting context that changes the decision.
- State each idea once. Introductions should add information, not repeat headings.
- Use plain language, active verbs, and concrete nouns; retain domain terms the audience genuinely knows.
- Use one term per concept across navigation, forms, help, and errors; avoid literary variation.
- Use the project's existing glossary, or record necessary terminology in existing documentation when useful.
- Keep voice consistent while adapting tone to risk, urgency, success, or frustration.
- Cut words without losing consequences, eligibility, useful instructions, or recovery.
- Remove ornamental marketing filler, not legal meaning or information needed for informed decisions.

## Truth and authority

- Preserve factual meaning, product names, legal obligations, and supported capabilities unless authorized to change them.
- Never invent real prices, discounts, availability, integrations, certifications, performance claims, customers, or endorsements.
- Do not fabricate testimonials, customer logos, metrics, case studies, press coverage, or photographs presented as documentary evidence.
- Visual redesign does not authorize stronger, unsupported claims in place of real copy.
- Use supplied or repository-backed facts. If essential evidence is absent, identify the exact missing fact; do not invent it.
- Clearly label sample data and fictional examples in prototypes and tutorials; never present them as production evidence.
- Do not invent failure causes, wait times, saving guarantees, privacy promises, or resolutions the implementation cannot know.
- State uncertainty honestly: an unconfirmed payment or save is neither confirmed failure nor confirmed success.

## Optional visual composition prompts

- When a mockup or sketch would help and suitable tools are available, describe the surface in visitor reading order. Generation is optional.
- Lead with the exact authorized headline and primary action, then one dominant compositional move. Describe supporting regions briefly with real content.
- For interface inspection, depict the actual surface without presentation framing. Use atmospheric, browser-framed, or device-presented compositions when they serve the requested deliverable.
- Inspect drafts for hierarchy, content fidelity, and fit with the established direction. A draft is not evidence of runtime behavior; reuse an accepted comp rather than regenerating it for variety.

## Actions, navigation, and help

- Prefer a specific verb and object when the result is not obvious: "Save changes" rather than "Submit".
- Describe the outcome, not the gesture: "View invoice" rather than "Click here".
- Keep link text meaningful outside its sentence; distinguish repeated destinations where context is needed.
- Align visible labels, accessible names, and actual outcomes; include the visible label in the accessible name.
- Name destructive actions and affected objects; use "Delete project", not "Yes", on confirmation buttons.
- Explain irreversible consequences, downstream effects, and scope in proportion to risk.
- Use helper text to answer likely questions, not restate controls; disclose uncommon detail on demand.
- Provide context-sensitive help for unfamiliar tasks without explaining every standard control.

## Forms and messages

- Use persistent labels; placeholders are examples and disappear during entry.
- Put format, eligibility, limits, and important consequences before submission.
- Explain why personal information is needed when the purpose is unclear; collect no extra data for decorative completeness.
- Treat required/optional fields consistently; provide readable units or examples for unfamiliar input.
- Errors explain what failed, why when known and useful, and how to recover or which alternative remains.
- Use "Enter a date after today", not "Invalid input"; blame neither the user nor a mysterious system.
- Accessibly associate field instructions and errors; retain input and identify unsaved content when relevant.
- Exclude internal codes and stack traces from primary messages; include a secondary support identifier only if genuinely useful.
- Treat privacy, payment, deletion, access loss, and blocked work seriously; avoid jokes at the user's expense.
- Announce material changes to assistive technology without repeating every loading tick or keystroke.

## Loading, empty, and success states

- Name the actual operation when the wait matters; never simulate determinate progress or unsupported countdowns.
- Distinguish first use, deliberately cleared content, no search results, access limits, and failed loading.
- First-use text explains what belongs here and offers a supported way to begin; decorative illustrations are optional.
- No-results text retains query/filter context and offers a correction, not an unrelated create action.
- Access messages explain the boundary without exposing private content or promising unavailable access.
- Failure text offers a safe retry or available alternative; do not misrepresent failure as no data.
- Success text briefly confirms the completed outcome; add consequences only when they affect the next action.
- Onboarding states the useful outcome, asks only necessary setup questions, and avoids extensive feature descriptions.
- Time commitments, templates, and help destinations must match actual product offerings.

## Long text and realistic data

- Design for empty, short, typical, and extreme names, titles, descriptions, URLs, counts, and amounts.
- Let containers and controls grow with text; avoid fixed text heights and narrowly fixed button widths.
- Let flex/grid children shrink appropriately; wrap prose and break unbroken strings without hiding content.
- Prefer wrapping essential labels and messages; truncation is for genuinely secondary or constrained previews.
- When truncation is necessary, provide an accessible route to the full value, not only a hover tooltip.
- Do not clamp errors, critical instructions, prices, consent language, or primary actions into ambiguity.
- Keep numbers, units, signs, and status qualifiers together where separation would change interpretation.
- Do not size layouts around a single English sample, a small count, or an assumed Latin-script name.

## Localization and direction

- Follow project localization conventions; write complete messages, not concatenated translated fragments.
- Structure variables for translator reordering; use locale-aware plural rules, not English suffix logic.
- Format dates, times, numbers, currencies, and lists with locale-aware facilities already in the stack.
- Preserve actual currency and time-zone meaning; formatting must not silently convert business facts.
- Allow substantial translation expansion and validate real target languages; fixed percentages are only initial stress cases.
- Support Unicode, accented names, CJK text, emoji, and script-appropriate fallback fonts; never assume one code unit per character.
- Use logical spacing/alignment and a deliberate direction context for RTL layouts and mixed-direction user content.
- Mirror directional navigation where appropriate, not every icon, logo, media control, chart, or number.
- Keep email addresses, code, identifiers, and embedded opposite-direction text legible through suitable direction isolation.
- Do not embed interface text in imagery or add decorative spaces that damage shaping, translation, or reading order.

## Accessible alternatives and concrete checks

- Alt text conveys image information or function; decorative images have empty alternatives.
- Charts and diagrams need understandable labels and an equivalent route to important information.
- Do not convey messages solely through color, punctuation, position, or icons.
- Read the flow without hidden product knowledge: are actions, consequences, and recovery understandable?
- Check long names, long translations, mixed RTL/LTR strings, plural forms, large numbers, and missing values.
- Check narrow widths, 200% text zoom, accessible names, announced errors, and access to full truncated values.
- Compare final wording with the implementation: every claim, permission, timing statement, and success message must remain true.
