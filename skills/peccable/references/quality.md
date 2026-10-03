# Quality and evidence

Use when inspecting interface changes, reviewing design and implementation, or determining supportable claims. Quality is ordinary design work, not a separate mode requiring a user request. Follow assignment permissions and check restrictions; this guidance does not override planning-only, read-only, or edit-only boundaries.

## Establish available evidence

- Identify the target route/screen, relevant components, requested outcome, supported platforms, and changed states.
- Use existing project runtime and inspection tools when authorized; this skill requires no downloaded engine, detector, account, or private service.
- Prefer the documented local workflow over a second environment.
- Do not deploy for a preview or use production data to prove a control works.

Distinguish evidence types:
- **Source evidence:** a semantic element, handler, token, layout rule, or state branch exists in the implementation.
- **Rendered evidence:** the current implementation displays correctly in a named runtime, viewport/device, theme, and state.
- **Behavioral evidence:** an exercised interaction produces the expected transition, focus movement, recovery, or result.
- **Measured evidence:** a contrast calculation, accessibility-tree observation, profile, or other tool result with its scope identified.
- **Inference:** a plausible, unobserved conclusion. Label it; do not present it as fact.

Existing screenshots or visual-regression fixtures can establish incumbent appearance when their route, state, theme, and freshness are known. Compare them with current components, assets, and tokens; stale captures cannot resolve conflicts with the implementation. A design comp expresses intent, not proof of a matching running interface.

## Inspect rendered output

- For web work, inspect the current surface at representative desktop and mobile widths, including the user's reported width and content-driven breakpoints implicated by the change.
- For native work, inspect a running app on relevant shipped device classes and operating systems with an available simulator, emulator, or physical device.
- Desktop browser rendering is not native-app evidence; a resized viewport is layout evidence, not a physical-device test.

Use real content, loaded fonts/assets, and representative data. Inspect the opening composition and the rest of the scoped surface.
Before trusting a capture:
- Confirm the route/screen, viewport, theme, and state are the intended ones.
- Allow loading and entrance motion to settle; separately inspect intentional loading or motion states when relevant.
- Open the capture and check for blank regions, missing assets, clipping, wrong scroll position, and mislabeled screenshots.
- Capture the whole scoped surface or its important regions, not only the flattering first viewport.

Name runtime and context precisely: for example, “Chromium at 1440 and 390 CSS pixels; pointer and synthesized touch,” not “tested on desktop and iPhone.” Emulated Chromium touch proves neither Safari behavior nor real-device ergonomics; name untested contexts. A screenshot cannot prove submission, dragging, keyboard operation, screen-reader behavior, or data persistence.

## Assess design effectiveness

Assess the surface from the visitor's perspective: can they identify the subject, understand important information, find the next action, and complete the intended task? Determine whether hierarchy, sequence, density, type, imagery, color, and motion serve that path and fit the project. Look for a product-specific idea rather than an interchangeable template; preserve useful conventions and explicit user aesthetics.

Inspect:
- **Hierarchy:** primary content and action lead without making supporting information disappear.
- **Grouping:** related items read as groups; space distinguishes groups more clearly than gratuitous containers.
- **Typography:** real headings, body copy, metadata, and data roles remain legible and distinct at relevant widths.
- **Rhythm:** measure, line height, spacing, and density fit the actual content and usage scene.
- **Material:** imagery and proof depict the subject, rather than substituting decorative interface elements for missing substance.
- **Continuity:** repeated roles and adjacent states follow one coherent system, including supported themes.
- **Truth:** copy and demonstrations do not invent commercial claims, capability, or working integrations.

Preserve strengths. Explain observed friction and its consequence; do not penalize departures from your preferred aesthetic. Do not turn observations into arbitrary health scores or imply that a high total compensates for a blocked task.

## Exercise the primary path and states

- Use sanctioned fixtures, test accounts, or a local environment where required. Do not send real messages, spend money, delete records, or make irreversible submissions without authority.
- Exercise the affected path from entry to meaningful outcome, not just the first click.

Check state transitions as well as static appearance:
- Initial, first-use, and empty states explain what is available and how to proceed.
- Loading preserves context, prevents accidental duplicate work where necessary, and communicates progress honestly.
- Errors identify the problem and recovery while retaining recoverable user input.
- Success confirms the actual result; an optimistic animation is not proof that persistence succeeded.
- Disabled or permission-limited controls communicate why the action is unavailable.
- Interrupted actions, cancellation, retries, and navigation do not strand the interface where these paths are relevant.

- Inspect realistic minimum, typical, and maximum content: long names/headings, localization expansion, missing images, many rows, zero values, and validation text as applicable.
- Do not invent states or build a speculative fault-injection framework beyond the changed flow's needs.
- Report states unreachable with available fixtures or authority.

## Keyboard and accessible operation

- On web and keyboard-capable native surfaces, traverse the changed flow without a pointer.
- Confirm logical focus order, visible focus, reachable controls, expected activation, and no keyboard traps.
- For overlays, inspect initial focus, contained navigation when appropriate, Escape or platform dismissal, and focus restoration to a meaningful element.
- After navigation, errors, or dynamic updates, verify understandable focus and status feedback; never focus removed or hidden content.
- Hover-only controls, pointer-only gestures, and color-only status are insufficient.

Inspect semantic structure or the native accessibility tree:
- Controls expose accurate names, roles, values, and changing states.
- Inputs have persistent labels; errors and help are programmatically associated when needed.
- Headings and landmarks describe the information hierarchy without abusing headings for styling.
- Meaningful images have useful alternatives; decorative imagery is excluded from the reading path.
- Status updates are announced appropriately without flooding or interrupting the user unnecessarily.
- Reading and focus order match the meaningful visual order.

- Prefer native semantic controls over recreating behavior with generic containers and ARIA.
- Where available and relevant, exercise a screen reader, including VoiceOver or TalkBack on native targets; tree inspection alone is not a screen-reader test.
- Do not claim comprehensive accessibility compliance from a scanner or one keyboard pass.

## Contrast, scaling, and input robustness

- Measure actual foreground/background combinations, including states, overlays, gradients, images, and every supported theme affected by the work.
- For WCAG AA web targets, normal text needs at least 4.5:1 and large text at least 3:1; large means at least 24 CSS pixels, or about 18.7 pixels when bold.
- Meaningful control boundaries, icons, and other required non-text indicators generally need at least 3:1 against adjacent colors. Apply the standard's actual exceptions; not every decorative border must qualify.
- Do not use placeholder text as the only label. Inactive-control exemptions do not justify unreadable essential explanations.
- Check focus and selection contrast; ensure sticky regions or overlays do not obscure focus.
- Convey errors, selection, and status with more than color.

- Inspect web text resized to 200% and reflow at narrow effective widths, such as a 320 CSS-pixel viewport or equivalent 400% zoom, where applicable.
- Keep essential controls and text available without clipping or unnecessary two-dimensional scrolling; genuinely two-dimensional data may need a contained scroll region.
- For native targets, inspect larger system text/accessibility sizes and relevant safe areas, keyboard insets, and orientations.
- Aim for comfortable targets, often around 44 CSS pixels on web. WCAG 2.2 AA's target-size criterion specifies 24 by 24 CSS pixels or qualifying spacing/exceptions, not a universal 44-pixel compliance rule.
- Respect platform targets such as 44 points on iOS and 48 dp on Android; inspect spacing and reachability in the actual usage context.

Exercise custom drag/slider/scroll controls with the relevant input method:
- The primary gesture completes rather than merely starting.
- Scrolling across the control does not accidentally activate it or trap page scroll.
- Interrupted gestures, cancellation, and lost capture leave usable state.
- A keyboard or other accessible alternative exists when the gesture alone excludes users.

## Motion and performance in context

- Check normal and reduced-motion settings. Preserve understandable state changes without forcing large movement, parallax, flashing, or motion-dependent content access.
- Make essential content available before entrance sequences finish; transitions must not interfere with focus or reading.
- Observe scroll, input responsiveness, loading, and layout stability in the affected flow.
- When performance is the task or observed jank needs explanation, profile the relevant path before choosing a fix.
- Do not claim speed from source inspection alone or add memoization, dependencies, or architecture without causal evidence.

## Correct and confirm the final state

- Prioritize blocked tasks, inaccessible controls, false information, data-loss risks, and broken layouts over ornamental defects.
- Fix causes, batch related corrections, then reinspect affected behavior and regression risks.
- Continue until scoped requirements hold or a concrete unavailable prerequisite blocks them; a fixed pass count is not a completion criterion.
- Stop speculative visual tweaking once evidence supports the requested outcome.
- For read-only review, deliver prioritized findings, not fixes. Include location, evidence, user impact, a concrete remedy, and important strengths to preserve.

## Limits and handoff

- If the app cannot run or runtime inspection is prohibited, finish reachable source-level implementation or requested analysis.
- Record the exact missing dependency, access, fixture, device, or permission and remaining observations.
- Do not substitute a mock screen or stale capture for current behavior, or request information already available in project context.
- If an unavailable prerequisite prevents a named acceptance criterion, report that criterion as blocked; source completion is not runtime acceptance.
- Report changed or reviewed scope, meaningful observations, runtime/viewport/device provenance, corrections, and outstanding risks.
- Distinguish performed checks from recommendations and untested paths. Avoid “fully tested,” “all accessible,” or “ready to ship” unless evidence genuinely supports the claim's scope.
- Stop temporary inspection resources you created unless the assignment requires retaining them; preserve user-owned resources and artifacts.
