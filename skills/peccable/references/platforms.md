# Responsive and native platforms

Read when adapting to viewport sizes, input methods, device classes, or web/native boundaries. Adapt to context; do not merely scale pixels or copy another platform's interface chrome.

## Context and continuity

- Identify the shipped platforms, available window space, input methods, orientation, connection, and likely usage posture.
- Identify the platform from the actual target and implementation; a mobile website is not a native application.
- Preserve the user's task, core capabilities, product terminology, and recognizable information architecture across contexts.
- Adapt navigation presentation and layout structure as needed without changing destination meanings.
- Do not hide essential functionality on small screens, lock orientation to conceal layout bugs, or assume a large display means a powerful device.
- Respect a coherent existing cross-platform identity while retaining each OS's navigation, input, accessibility, and lifecycle guarantees.
- Prefer platform controls and conventions where they fit the task; custom alternatives may serve usability, brand identity, or visual exploration.

## Web layout, zoom, and input

- Derive breakpoints from content; use viewport or container conditions according to the component's constraint.
- Start with a usable narrow layout; add wider arrangements where useful. No fixed phone/tablet/desktop breakpoint list is universal.
- Reflow columns, controls, and navigation without losing reading order, task context, or the user's place.
- Bound reading width and large-screen stretch; use extra space for useful comparisons or panes, not inflated controls.
- Support narrow widths around 320 CSS pixels and text zoom to 200%; inspect reflow at 400% browser zoom where applicable.
- Do not disable user zoom or force fixed heights that clip enlarged text; horizontal scrolling belongs only where inherently needed.
- Let long labels wrap and forms expand; do not shrink type merely to fit a desktop arrangement.
- Keep dense tables semantic and labeled; choose scrolling, prioritized columns, or meaningful alternate representations for the task.
- Keep core content and actions available if optional enhancements fail; provide supported fallbacks without claiming every application works without JavaScript.
- Detect feature/input capabilities, not device models. Touch, pointer, keyboard, and assistive input can coexist at any width.
- Do not make functionality hover-only; provide equivalent focus and touch access to actions and help.
- For web touch, aim for comfortable hit areas around 44 CSS pixels where practical; accessibility standards include minimum-size/spacing exceptions, not a universal native size.
- Keep body and form text readable; `1rem`/`16px` is a useful baseline, and sub-`16px` inputs can trigger focus zoom in iOS Safari.
- Account for browser chrome, safe-area insets, sticky controls, and the on-screen keyboard; focused fields and errors remain reachable.
- Use minimum heights for viewport-filling sections that must accommodate growing content; choose stable or dynamic viewport sizing for the intended browser-chrome behavior, not a universal unit.
- Use responsive images for density and width, and alternate crops only when needed to preserve the subject and composition.
- Exercise custom sliders/drags with scrolling and cancellation; resized screenshots do not prove working touch interaction.

## iOS and iPadOS

- Follow native navigation: tabs for peer top-level destinations, a stack for hierarchy, and sheets for focused subtasks.
- Tabs represent destinations, not actions; choose destination count and bar/sidebar presentation for the app and current platform conventions.
- Preserve system back controls and interactive edge-swipe navigation where the stack supports it.
- Keep actionable content clear of safe areas, display cutouts, home indicators, rounded corners, and the keyboard.
- Backgrounds may extend edge-to-edge while controls and important content respect the appropriate insets.
- Use system text styles and Dynamic Type; scale brand fonts compatibly rather than fixing point sizes.
- System fonts are a reliable UI default; brand faces are acceptable if legibility, scaling, and native behavior remain intact.
- Aim for tappable areas at least 44 by 44 points with adequate separation; visible glyphs may be smaller than their hit areas.
- At accessibility text sizes, allow multi-line controls and vertically reorganized groups; do not clip text or suppress scaling.
- Use semantic colors and supported appearance variants for labels, surfaces, separators, and interactive tint.
- Support dark appearance and increased contrast when applicable; custom colors need explicit readable variants.
- Prefer system materials for native translucency and bars; do not replace readable chrome with decorative glass effects.
- Use familiar switches, segmented controls, steppers, pickers, menus, alerts, and swipe actions for their intended jobs.
- Use SF Symbols or a coherent compatible custom set with appropriate baseline, weight, scale, and accessible names.
- Large titles suit some top-level screens; choose title treatment for navigation and content, not a universal style.
- Grouped/inset lists often suit settings; use other structures when the task genuinely benefits.
- Clarify sheet Cancel/Done and dismissal behavior; guard unsaved work when necessary without breaking routine exits.
- Prefer system transitions and honor Reduce Motion; reduce displacement or use immediate transitions where appropriate.
- VoiceOver needs meaningful labels, traits, values, selection state, traversal order, and focus after navigation.

## Android

- Use established Material components and theme roles when they fit the app; Cupertino-inspired or custom styling is acceptable while preserving Android interaction and accessibility behavior.
- Match navigation to window space: use navigation bars for appropriate compact peer destinations, and rails or drawers where wider structure benefits.
- Clarify screen context with an appropriate top app bar; reserve FABs for suitable prominent actions, not competing action groups.
- Preserve system Back and supported predictive Back behavior; distinguish Back in history from Up in a hierarchy.
- Back should close transient UI or navigate naturally, not trap users, hijack the gesture, or unexpectedly erase work.
- Account for edge-to-edge status/navigation bars, display cutouts, gesture areas, and IME insets without double-padding.
- Aim for interactive hit areas at least 48 by 48 dp, with spacing that prevents ambiguous adjacent taps.
- Use scalable `sp` text and established type roles; support system font-size and display-size changes without clipping.
- A coherent brand face may theme the type scale if it remains legible and respects user settings.
- Use semantic Material color roles and readable light/dark schemes; custom values need deliberate contrast behavior.
- Dynamic Color can suit supported versions; retain a static fallback and respect binding brand requirements.
- Use tonal surface hierarchy and suitable elevation, not arbitrary shadows on every container.
- Prefer Material switches, chips, pickers, sheets, and dialogs where appropriate; reserve dialogs for necessary interruptions.
- Use snackbars for suitable transient actionable feedback; critical errors also need durable context and recovery.
- Keep iconography coherent; Material Symbols are a useful default, not a prohibition on meaningful brand assets.
- Honor reduced/removed animation settings while preserving visible state changes and navigation continuity.
- TalkBack needs roles, labels, values, state announcements, logical traversal, and restored focus after modal exits.

## Tablets, multi-window, and foldables

- Restructure phone layouts instead of stretching them: list/detail panes, grids, sidebars, and contextual popovers can use available space.
- Derive native structure from available size classes/window constraints, not hard-coded device names.
- A split-screen tablet may have a phone-width window; support resizing and multi-window without losing selection or drafts.
- Handle portrait and landscape unless the actual task justifies restriction; reconsider control reach and keyboard space in both.
- On foldables, account for hinge occlusion and relevant posture changes; keep important controls out of obstructed regions.
- Support pointer and hardware-keyboard input when available; do not default large-screen native apps to touch-only.
- Preserve valid detail/back paths, navigation, and selected-item context as panes appear or disappear.

## Platform translation and other outputs

- Web-to-native adaptation rebuilds navigation, modality, controls, text scaling, and gestures using target-platform conventions.
- iOS-to-Android translation preserves product truth and brand intent, not identical tab bars, pickers, back gestures, or animations.
- Shared code can preserve data and business logic while adapting presentation and OS behavior at appropriate boundaries.
- For print, remove irrelevant interactive chrome, reveal necessary hidden content, use logical page breaks, and keep charts understandable without color alone.
- For email, use the project's client-compatible layout and styling conventions; provide obvious accessible links to complex web tasks rather than assuming rich interaction works.

## Concrete checks and evidence

- Check the relevant compact/expanded windows, portrait/landscape, zoom/text scale, themes, keyboard visibility, and long localized content.
- Exercise touch, pointer, keyboard, screen-reader traversal, back, modal dismissal, and focus recovery on the actual target runtime when possible.
- Native screenshots should come from the native app; browser mockups cannot prove native navigation or accessibility.
- Emulation/simulation provides useful breadth; label it honestly. Hardware gestures, posture, and performance require separate evidence.
- Include supported multi-window/foldable configurations and interrupted gestures when in scope.
- Report unavailable target hardware or unexercised inputs as gaps, not proven conformance or justification for an invented mandatory toolchain.
