# Content and localization

Read when improving labels, navigation, forms, errors, onboarding, long text, or translated interfaces. Copy should make the next decision easier without changing product truth.

## Meaning before brevity

- Read the entire path, including states before and after the string; isolated copy can misdescribe an interaction.
- Establish the one fact needed now, the available action, and supporting context that changes the decision.
- Say each idea once. An introduction should add information rather than repeat its heading.
- Use plain language, active verbs, and concrete nouns; retain domain terms the audience genuinely knows.
- Keep one term for one concept across navigation, forms, help, and errors; do not vary words for literary effect.
- Use a glossary already present in the project, or record necessary terminology in existing documentation when useful.
- Keep voice consistent while adapting tone to risk, urgency, success, or frustration.
- Cut words only while retaining consequences, eligibility, useful instructions, and recovery.
- Remove ornamental marketing filler, not legal meaning or information needed for an informed decision.

## Truth and authority

- Preserve factual meaning, product names, legal obligations, and supported capabilities unless authorized to change them.
- Never invent real prices, discounts, availability, integrations, certifications, performance claims, customers, or endorsements.
- Do not fabricate testimonials, customer logos, metrics, case studies, press coverage, or photographs presented as documentary evidence.
- A visual redesign is not permission to replace real copy with stronger but unsupported claims.
- Use supplied or repository-backed facts. If essential evidence is absent, identify the exact missing fact rather than filling it in.
- Clearly label sample data or fictional examples in prototypes and tutorials; never let them masquerade as production evidence.
- Do not invent a failure cause, wait time, saving guarantee, privacy promise, or resolution the implementation cannot know.
- Name uncertainty honestly: an unconfirmed payment or save is not a confirmed failure or success.

## Actions, navigation, and help

- Prefer a specific verb and object when the result is not obvious: "Save changes" rather than "Submit".
- Describe the outcome, not the gesture: "View invoice" rather than "Click here".
- Keep link text meaningful outside its sentence; distinguish repeated destinations where context is needed.
- Align visible labels, accessible names, and actual outcomes; include the visible label in the accessible name.
- Name destructive actions and the affected object; confirmation buttons say "Delete project", not "Yes".
- Explain irreversible consequences, downstream effects, and scope in proportion to the risk.
- Helper text answers a likely question instead of restating the control; disclose uncommon detail on demand.
- Provide context-sensitive help for unfamiliar tasks without explaining every standard control.

## Forms and messages

- Use persistent labels; placeholders are examples and disappear during entry.
- Put format, eligibility, limits, and important consequences before submission.
- Explain why personal information is needed when its purpose is not obvious; collect no extra data for decorative completeness.
- Show consistent required/optional treatment and readable units or examples for unfamiliar input.
- Errors say what failed, why when known and useful, and how to recover or what alternative remains.
- Write "Enter a date after today" instead of "Invalid input"; blame neither the user nor a mysterious system.
- Associate field instructions and errors accessibly; retain input and state what was not saved when relevant.
- Keep internal codes and stack traces out of primary messages; a support identifier may be secondary if genuinely useful.
- Treat privacy, payment, deletion, access loss, and blocked work seriously; avoid jokes at the user's expense.
- Announce material changes to assistive technology without repeating every loading tick or keystroke.

## Loading, empty, and success states

- Name the real operation when the wait matters; never simulate determinate progress or an unsupported countdown.
- Distinguish first use, deliberately cleared content, no search results, access limits, and failed loading.
- First-use text explains what belongs here and offers a supported way to begin; a decorative illustration is optional.
- No-results text keeps query/filter context and offers a correction, not an unrelated create action.
- Access messages explain the boundary without exposing private content or promising access that cannot be granted.
- Failure text provides a safe retry or an available alternative; it does not pretend there is simply no data.
- Success confirms the completed outcome briefly and adds next consequences only when they affect the next action.
- Onboarding states the useful outcome, asks only necessary setup questions, and avoids a wall of feature descriptions.
- Time commitments, templates, and help destinations must correspond to something the product actually provides.

## Long text and realistic data

- Design with empty, short, typical, and extreme values: names, titles, descriptions, URLs, counts, and amounts.
- Let containers and controls grow with text; avoid fixed text heights and narrowly fixed button widths.
- Allow flex/grid children to shrink appropriately, then wrap prose and break unbroken strings without hiding content.
- Prefer wrapping essential labels and messages; truncation is for genuinely secondary or constrained previews.
- When truncation is necessary, provide an accessible route to the complete value, not only a hover tooltip.
- Do not clamp errors, critical instructions, prices, consent language, or primary actions into ambiguity.
- Keep numbers, units, signs, and status qualifiers together where separation would change interpretation.
- Do not size layouts around a single English sample, a small count, or an assumed Latin-script name.

## Localization and direction

- Follow the project's localization conventions; write complete messages rather than concatenating translated fragments.
- Keep variables structured so translators can reorder them; use locale-aware plural rules instead of English suffix logic.
- Format dates, times, numbers, currencies, and lists with locale-aware facilities already available in the stack.
- Preserve the actual currency and time-zone meaning; formatting must not silently convert a business fact.
- Allow substantial translation expansion and validate real target languages; a fixed percentage is only an initial stress case.
- Support Unicode, accented names, CJK text, emoji, and script-appropriate fallback fonts; do not assume one code unit per character.
- Use logical spacing/alignment and a deliberate direction context for RTL layouts and mixed-direction user content.
- Mirror directional navigation where appropriate, not every icon, logo, media control, chart, or number.
- Keep email addresses, code, identifiers, and embedded opposite-direction text legible with suitable direction isolation.
- Do not bake interface text into imagery or insert decorative spaces that damage shaping, translation, or reading order.

## Accessible alternatives and concrete checks

- Alt text conveys the information or function of an image; decorative images have an empty alternative.
- Charts and diagrams need understandable labels and an equivalent route to important information.
- Do not use color, punctuation, position, or icons as the sole carrier of a message.
- Read the flow without hidden product knowledge: is each action, consequence, and recovery understandable?
- Check long names, long translations, mixed RTL/LTR strings, plural forms, large numbers, and missing values.
- Check narrow widths, 200% text zoom, accessible names, announced errors, and access to full truncated values.
- Compare the final wording with the implementation: every claim, permission, timing statement, and success message stays true.
