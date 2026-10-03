# Interaction and recovery

Read when designing task flows, navigation, forms, onboarding, destructive actions, or difficult states. Design for a real outcome, not just an ideal screenshot.

## Task topology

- Infer the user's job, experience level, urgency, and success condition from the request and existing product.
- Map entry points, decisions, dependencies, destinations, exits, and return paths before changing screens.
- Preserve authorized functionality and information architecture; simplification removes obstacles, not necessary capabilities.
- Use hierarchical navigation for parent–child relationships, peer destinations for peer sections, and sequences only for dependent steps.
- Keep location visible through a title, selected destination, breadcrumb, or step indicator appropriate to the surface.
- Co-locate decision evidence and controls; do not require users to remember values from another screen.
- Make the primary next action prominent at the current decision point without hiding useful alternatives.
- Group related choices and disclose advanced options when relevant; no universal option-count limit applies.
- Remove redundant steps, competing emphasis, and meaningless containers; retain necessary domain complexity.

## Affordances and input

- Prefer semantic links for destinations and buttons for actions; use established native controls in native applications.
- Make enabled, disabled, selected, expanded, focused, pressed, and pending states distinguishable without color alone.
- Make labels and hit areas understandable without hover; hover may enhance an already reachable action.
- Give icon-only controls accessible names; ensure the name agrees with the visible label when one exists.
- Provide a non-drag alternative for reordering, sliders, or other gesture-driven tasks when the gesture is not essential.
- Support each control's keyboard model beyond Tab: activation, arrow keys, selection, and dismissal as applicable.
- Preserve a logical focus order and visible focus; avoid positive tab indices and keyboard traps.
- Match touch target size and spacing to platform expectations; enlarge the hit area without overlapping nearby controls.
- Use shortcuts for frequent expert tasks where useful, without replacing visible controls or hijacking standard shortcuts.
- Avoid ambiguous nested actions inside clickable rows; clearly separate targets and outcomes.

## States and transitions

For every data-bearing or mutating interaction, cover applicable states and transitions:

| State | User needs | Recovery or next transition |
|---|---|---|
| First use | What belongs here and why | Create, import, or explore a supported example |
| Loading | What is in progress | Completion, cancellation where supported, or failure |
| Ready | Current data and available actions | Edit, navigate, refresh, or submit |
| Empty by choice | Confirmation that nothing remains | Recreate or return, without a first-run sales pitch |
| No results | Query/filter context | Revise search or clear filters |
| Partial/stale | What is available and what is missing | Refresh or retry the affected portion |
| Validation failure | Which input needs correction | Fix without losing other input |
| Access denied/read-only | Actual access boundary | Sign in or request access only when supported |
| Offline/timeout/server failure | What failed and what is retained | Safe retry or an available alternative |
| Conflict | Which changes cannot be combined | Compare, reload, or resolve with retained local work |
| Success | The completed outcome | Continue with authoritative state |

- Keep useful content visible during refresh where appropriate; do not replace every update with a blank loading screen.
- Distinguish initial load, pagination, and background refresh; retain scroll position and selection when meaningful.
- Never show an error as an empty collection, or success before the operation actually succeeds.
- Show determinate progress only when known; give time estimates only when supported by evidence.
- Prevent duplicate mutation submissions; show pending state and keep cancellation or navigation understandable.
- Treat expired authentication separately from insufficient permissions; preserve a safe return path and unsaved work where possible.
- Handle out-of-order responses so stale searches or selections cannot overwrite newer results.
- Use optimistic updates only when rollback and conflict handling are credible; show and recover from rejection.
- Offer retry only when the operation can be retried safely; account for an uncertain result after a lost response.
- Do not promise offline editing, queued writes, or automatic recovery unless the product actually implements them.

## Forms and destructive actions

- Use persistent field labels, appropriate input types, autocomplete, and input modes; use placeholders only for examples.
- Explain requirements before submission and mark required/optional fields consistently.
- Validate at useful moments rather than penalizing incomplete typing; client feedback does not replace server validation.
- Associate inline errors with fields, provide an error summary for long forms, and move focus purposefully after failure.
- Preserve entered values, uploaded-work context, and the user's place after recoverable errors.
- Keep destructive actions away from habitual primary targets and name the affected object and consequence.
- Prefer undo for safely reversible changes; state its actual availability and duration.
- For irreversible or high-impact changes, use proportionate confirmation with scope and explicit action labels.
- Guard unsaved work when leaving would discard it; distinguish Save, Discard, and Cancel rather than vague confirmation.
- A destructive UI is not authority to execute destructive data changes beyond the user's request.

## Dialogs, gestures, and lifecycle

- Use a dialog only for a focused interruption; inline editing or disclosure is often less disruptive.
- Give modal dialogs an accessible name, sensible initial focus, contained keyboard navigation, and a clear exit.
- Restore focus to the invoker or a sensible successor after dismissal; announce material updates without noisy repetition.
- Keep dismissal consistent with the platform and task; guard data loss rather than silently disabling every escape path.
- Track the initiating pointer for custom drags; a second pointer must not steal the gesture or cause a jump.
- End drag state on cancellation, lost capture, release outside the control, or loss of window focus.
- Allow page-axis scrolling across custom controls while recognizing intentional control-axis dragging.
- Clean up listeners, timers, subscriptions, and obsolete requests when an interaction ends or its surface disappears.

## Onboarding and contextual learning

- Teach only what users need to reach a useful real outcome; collect only necessary setup information up front.
- Prefer working templates and contextual examples to long passive tours; label demonstration data as examples.
- Make optional education skippable, dismissible, and replayable; respect returning users' completion and dismissal.
- Request permissions at the moment their purpose is clear, with an honest denial path.
- Use a safe, clearly identified practice space for high-stakes learning rather than disguising practice as real work.

## Concrete checks

- Walk the main path and its cancellation, back, retry, denied-access, conflict, and interruption branches.
- Check keyboard-only and screen-reader operation, including focus after navigation, errors, and dismissed dialogs.
- Exercise double submission, slow/offline responses, stale results, empty data, and very large collections.
- For custom controls, complete tap, drag, scroll-across, cancellation, and next-gesture recovery; screenshots cannot prove these.
- Confirm simplification preserves the task and that a returning user can bypass education without losing access.
