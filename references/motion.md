# Motion

Motion should explain feedback, state, relationships, or one meaningful moment of product character.
Preserve the existing motion language and explicit brief. A static interface can be complete; adding movement is not inherently an improvement.

## Find the job before the effect

Useful motion can:

- acknowledge an action as soon as it occurs;
- connect an object to its changed location or state;
- explain the origin and destination of a panel or navigation transition;
- direct attention to a consequential change;
- express the product's character at a moment worth remembering.

Working and reading surfaces usually need fast feedback and continuity, not page-load choreography.
An expressive surface may earn an authored focal sequence, but repeated generic entrances rarely strengthen its identity.
If every section fades upward, the pattern is probably driving the design rather than explaining the content.

## Match material to meaning

- Transform and opacity are economical foundations for movement and visibility.
- Shared-element or FLIP-style movement can preserve identity across position and size changes when continuity is the point.
- Cropping, masks, and controlled occlusion can explain a reveal or a compositional relationship.
- Bounded shadow, blur, or color changes can clarify depth, attention, or material behavior.
- A spring can communicate manipulation or physical response; bounce is not a universal sign of delight.
- Hover motion should help someone recognize or operate a target. Moving inert imagery can falsely suggest that it is actionable.
- Sibling stagger can show a list arriving as a list, but cap the total delay and keep items usable without waiting.

Prefer one coherent material idea with quiet supporting states over stacked effects.
For a local refinement, improve the transition that is actually confusing rather than introducing a new motion system everywhere.

## Tune duration to consequence

These are starting ranges, not required constants:

| Duration | Typical job |
|---|---|
| 100–150 ms | immediate control feedback |
| 150–300 ms | routine state transition |
| 300–500 ms | overlay, layout, or view continuity |
| 500–800 ms | an occasional authored focal sequence |

Short travel and frequent actions usually need shorter durations. Entrance can decelerate into place; exit often needs less time than entrance.
Use an intentional easing curve rather than a generic slow ease on every property.
Never hold the actual result back to finish a flourish: long feedback feels like latency.

## Keep state authoritative

- Update the real state immediately; animation presents that state rather than becoming a separate source of truth.
- Rapid clicks, reversal, navigation, and dismissal must interrupt cleanly without leaving a half-open or unclickable interface.
- Do not move focus unexpectedly, animate a focused control away, or leave visually hidden controls reachable.
- Keep content visible and usable before scripts initialize and when effects are unsupported.
- Use the existing stack's smallest adequate mechanism; an isolated transition rarely earns a new dependency.
- Avoid animating layout-driving properties reflexively. Transforms can represent movement without relaying out siblings, but expanding content still needs an honest final layout.
- Bound expensive filters, shadows, canvas, and shader effects to a purposeful region and lifetime.
- Apply `will-change` only where a known animation benefits; permanent promotion of many elements spends memory without proving smoothness.
- Stop nonessential loops when hidden or offscreen. Do not consume attention and device resources for an unseen flourish.

## Make reduced motion an intentional experience

Content should be visible by default. Opt into nonessential movement only where the preference permits it:

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

This example enhances a confirmation that already exists; it must not manufacture success before an operation completes.
The reduced-motion path shows the final state immediately. No script, animation event, or entrance sequence is required to reveal content.
For more elaborate effects, replace large spatial travel, parallax, or zoom with an immediate update or restrained nonspatial feedback.
Preserve meaningful confirmation and orientation; reduced motion is not permission to erase status changes.
Avoid a blanket near-zero animation-duration override that can break sequencing or unrelated functional controls.
Provide pause, stop, or hide controls for nonessential automatically moving content where required; respect autoplay, sound consent, and mute preferences.
Avoid flashing effects and do not hijack ordinary scrolling to stage a sequence.

## Let delight follow effort

A milestone may earn celebration; an ordinary save should simply feel certain.
Waiting can be informative, but never fake progress or delay completion to perform personality.
In recovery or error states, clarify the problem and next action first; flourishes must not trivialize loss, money, or blocked work.
A distinctive response should remain pleasant after repeated use, and required functionality must never depend on discovering an easter egg.

## Evidence to inspect

- Name the job of each changed animation and the state or relationship it clarifies.
- Exercise repeated activation, reversal, dismissal, and navigation during the transition; inspect both final state and focus.
- Inspect keyboard and touch paths as well as pointer hover; a screenshot cannot prove interruption or interaction behavior.
- Compare normal and reduced-motion states, including initialization failure: content and essential feedback must remain available.
- Inspect performance on the relevant device class; transform-only code does not by itself prove smooth rendering.
- Confirm frequent use remains quick and that the interface still makes sense with the flourish absent.
