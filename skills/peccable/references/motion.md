# Motion

Use motion to explain feedback, state, relationships, or a meaningful moment of product character. Preserve the existing motion language and explicit brief. A static interface can be complete; movement is not inherently an improvement.

## Motion purpose

Useful motion can:

- acknowledge an action as soon as it occurs;
- connect an object to its changed location or state;
- explain the origin and destination of a panel or navigation transition;
- direct attention to a consequential change;
- express the product's character at a moment worth remembering.

Working and reading surfaces usually need fast feedback and continuity, not page-load choreography. An expressive surface may justify an authored focal sequence; repeated generic entrances rarely strengthen its identity. If every section fades upward, the pattern is probably driving the design rather than explaining content.

## Material and meaning

- Transform and opacity are economical foundations for movement and visibility.
- Shared-element or FLIP-style movement can preserve identity across position and size changes when continuity is the point.
- Cropping, masks, and controlled occlusion can explain a reveal or a compositional relationship.
- Bounded shadow, blur, or color changes can clarify depth, attention, or material behavior.
- Springs can communicate manipulation or physical response; bounce is not a universal sign of delight.
- Use hover motion to help users recognize or operate a target; moving inert imagery can falsely imply actionability.
- Sibling stagger can show a list arriving as a list; cap total delay and keep items usable without waiting.

Prefer one coherent material idea with quiet supporting states to stacked effects. For local refinements, improve the confusing transition rather than introduce a new motion system throughout.

## Duration and easing

These are starting ranges, not required constants:

| Duration | Typical job |
|---|---|
| 100–150 ms | immediate control feedback |
| 150–300 ms | routine state transition |
| 300–500 ms | overlay, layout, or view continuity |
| 500–800 ms | an occasional authored focal sequence |

Short travel and frequent actions usually need shorter durations. Entrances can decelerate into place; exits often need less time than entrances. Choose an intentional easing curve rather than a generic slow ease for every property. Never delay the actual result to finish a flourish: long feedback feels like latency.

## Authoritative state

- Update real state immediately; animation presents it, not a separate source of truth.
- Rapid clicks, reversal, navigation, and dismissal must interrupt cleanly without leaving a half-open or unclickable interface.
- Do not move focus unexpectedly, animate a focused control away, or leave visually hidden controls reachable.
- Keep content visible and usable before scripts initialize and when effects are unsupported.
- Use the existing stack's smallest adequate mechanism; an isolated transition rarely justifies a new dependency.
- Avoid reflexively animating layout-driving properties. Transforms can move elements without relaying out siblings, but expanding content still needs an honest final layout.
- Bound expensive filters, shadows, canvas, and shader effects to a purposeful region and lifetime.
- Apply `will-change` only where a known animation benefits; permanently promoting many elements consumes memory without proving smoothness.
- Stop nonessential loops when hidden or offscreen; unseen flourishes should not consume attention or device resources.

## Reduced motion

Make content visible by default. Opt into nonessential movement only where the preference permits:

```css
.confirmation-mark { opacity: 1; transform: none; }
@media (prefers-reduced-motion: no-preference) {
  .confirmation-mark { animation: acknowledge 180ms ease-out; }
}
@keyframes acknowledge {
  from { opacity: 0.65; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
}
```

This example enhances an existing confirmation; it must not manufacture success before an operation completes. The reduced-motion path shows final state immediately, without requiring a script, animation event, or entrance sequence to reveal content.

- For elaborate effects, replace large spatial travel, parallax, or zoom with immediate updates or restrained nonspatial feedback.
- Preserve meaningful confirmation and orientation; reduced motion does not justify erasing status changes.
- Avoid blanket near-zero animation-duration overrides that can break sequencing or unrelated functional controls.
- Provide pause, stop, or hide controls for nonessential automatically moving content where required; respect autoplay, sound consent, and mute preferences.
- Avoid flashing effects and do not hijack ordinary scrolling to stage a sequence.

## Celebration and repeated use

A milestone may justify celebration; an ordinary save should simply feel certain. Waiting can be informative, but never fake progress or delay completion to express personality.

- In recovery or error states, explain the problem and next action first; flourishes must not trivialize loss, money, or blocked work.
- Keep distinctive responses pleasant after repeated use; required functionality must never depend on discovering an easter egg.

## Concrete checks

- Name the job of each changed animation and the state or relationship it clarifies.
- Exercise repeated activation, reversal, dismissal, and navigation during the transition; inspect both final state and focus.
- Inspect keyboard and touch paths as well as pointer hover; a screenshot cannot prove interruption or interaction behavior.
- Compare normal and reduced-motion states, including initialization failure: content and essential feedback must remain available.
- Inspect performance on the relevant device class; transform-only code does not by itself prove smooth rendering.
- Confirm frequent use remains quick and that the interface still makes sense with the flourish absent.
