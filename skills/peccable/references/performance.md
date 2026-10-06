# Measured interface performance

Use for slow loading, delayed responses, poor scrolling, unexpected shifts, or wasted memory. Identify this surface's bottleneck; do not sacrifice correctness, accessibility, or visual intent for an unmeasured score.

## Establish a baseline

- Identify the affected task: first useful content, startup, typing, filtering, navigation, dragging, scrolling, or saving.
- Separate network wait, main-thread work, rendering, image decoding, and application-state causes.
- Use the project's available profiling and measurement tools; no particular binary, hosted service, or agent is a prerequisite.
- Record route/state, build mode, device or emulation, browser/runtime, network, cache warmth, and data size.
- Compare before and after under equivalent conditions; repeat noisy samples enough to separate changes from variance.
- Prioritize user-experienced delay over micro-optimizations that cannot affect the task.
- When execution is unavailable or unauthorized, identify likely source-level costs and report hypotheses, not measured improvements.
- Use representative slower hardware and constrained connections when possible; desktop width does not imply a fast device.

## Distinguish metrics

- For web loading, track Largest Contentful Paint (LCP), first visible content, request waterfall, and critical payload sizes.
- For responsiveness, track Interaction to Next Paint (INP), long tasks, input latency, and expensive event handlers.
- For stability, track Cumulative Layout Shift (CLS), font swaps, media sizing, and asynchronous insertions.
- Common good Core Web Vitals thresholds: LCP ≤ 2.5 seconds, INP ≤ 200 milliseconds, CLS ≤ 0.1, evaluated at the 75th percentile of real visits when available.
- A laboratory trace diagnoses one run; it cannot establish population-wide field performance or a percentile alone.
- Use request count, transferred bytes, bundle composition, memory, and rendering traces to explain causes, not as isolated goals.
- For native UI, measure launch to first useful frame, frame pacing, image decode cost, memory growth, and expensive recomposition/rendering.
- Budget animation work against the actual refresh rate: roughly 16.7 ms per frame at 60 Hz and 8.3 ms at 120 Hz, including all frame work.
- Loading indicators, skeletons, and optimistic updates can improve feedback but do not prove reduced latency.

## Deliver critical content first

- Deliver primary text, controls, and the initial visual focal point without waiting for optional features.
- Do not lazy-load the LCP image or other immediately required content by default.
- Size and compress images for their display dimensions and pixel density; use suitable modern formats with supported fallbacks.
- Use responsive image candidates and accurate size hints; art-directed crops must still communicate the intended subject.
- Reserve image/video dimensions or aspect ratio to avoid layout shifts; retain meaningful alternative text.
- Lazy-load genuinely offscreen media and defer heavy noncritical widgets without breaking navigation or discovery.
- Split code at useful route/feature boundaries; avoid tiny chunks that create an interaction-time request waterfall.
- Remove unused dependencies and CSS through the existing build process, not a second delivery pipeline.
- Before importing a UI or motion library, confirm dependency availability, version-compatible exports, and target-runtime requirements; follow existing initialization and styling conventions.
- Reduce unnecessary third-party scripts and embeds where the task permits; never silently remove required functionality.
- Preload only proven critical resources; indiscriminate preload competes with resources users need.
- Prefetch likely next work only when product needs and connection cost justify it, not every possible destination.

## Fonts and rendering stability

- Load only used font families, weights, and styles; preserve required language coverage and fallback behavior.
- Choose a font-display strategy that keeps text readable and respects the intended experience.
- Use metric-compatible fallbacks where possible to reduce reflow; do not hide the page until fonts arrive.
- Subset safely for the supported content and scripts; an English-only font subset is not a localization strategy.
- Reserve realistic space for asynchronous content without fixed heights that clip larger text.
- Avoid inserting banners or content above the user's current position without preserving context.
- Keep loading and loaded structures reasonably stable; skeletons should represent the real layout, not random decoration.

## Main-thread and rendering cost

- Batch layout reads before writes; avoid alternating measurements and style mutation in loops.
- Remove unnecessary repeated computation, rendering, and allocations in measured hot paths.
- Use stable list keys and scoped state so one edit does not rebuild an unrelated large region.
- Keep high-frequency pointer, scroll, and animation-frame values local to the rendering mechanism rather than repeatedly updating broad application state; commit meaningful state changes separately.
- Memoize expensive computations or renders when profiling shows reuse; blanket memoization adds complexity and can cost more.
- Debounce expensive search where useful while keeping typing feedback immediate; prevent stale responses from replacing newer results.
- Throttle repeated scroll work; use platform observation facilities where appropriate instead of continuous polling.
- Split long tasks into interruptible work; use background computation when measured workload justifies its overhead.
- Bound layout and paint areas for expensive filters, shadows, masks, or blur rather than banning meaningful effects outright.
- Prefer transform/opacity for ordinary movement when suitable; compositor-friendly properties do not guarantee cheap animation.
- Use layer promotion hints sparingly and only while useful; excessive layers consume memory.
- Limit layout/shared-element animation measurements to transitions that need them; static content should not incur continuous motion bookkeeping.
- Use containment or deferred offscreen rendering only where focus, sizing, search, printing, and accessible content remain intact.

## Data, lists, and network

- Paginate or incrementally fetch large collections instead of transferring everything on entry.
- Virtualize genuinely large rendered lists when needed; preserve keyboard traversal, accessibility, selection, and scroll context.
- Provide collection search/filter access without claiming locally searched coverage of unloaded items.
- Request needed data through the existing API; do not change protocols for an imagined optimization.
- Reuse project caching and request conventions; invalidate to keep data accurate after mutation.
- Compress/cache supported assets appropriately; never expose private data across accounts or present stale success as current truth.
- Avoid duplicate requests; cancel or ignore obsolete work when a surface or query changes.
- Use optimistic feedback only with credible rollback and conflict handling; do not mask uncertain mutation results.
- Offline caching and queued writes are product capabilities, not mandatory slow-interface fixes.

## Native runtime and lifecycle

- Keep expensive work off the launch and gesture-critical main-thread path where the platform permits.
- Use native recycling/lazy-list conventions and decode thumbnails at suitable sizes rather than repeatedly decoding originals.
- Profile wasted renders/recompositions and image cache behavior before adding framework-specific tricks.
- Clean up subscriptions, event handlers, observers, timers, and pending work; check repeated mount/navigation paths for memory growth.
- Pause nonessential animations and work when offscreen or backgrounded where appropriate.
- Preserve battery, reduced-motion settings, and operating-system behavior while improving frame pacing.

## Checks and evidence

- Compare equivalent cold and warm loads, interaction traces, large datasets, and constrained-network paths as relevant.
- Check that the complete task still works: keyboard, focus, screen readers, error/retry, search, and navigation.
- Check for regressions in font coverage, layout stability, image quality, full text, and native text scaling.
- Report observed before/after numbers, conditions, and the responsible change; distinguish perceived feedback from actual latency.
- Name unmeasured areas, especially field percentiles, target hardware, native gestures, and production network behavior.
- Stop optimizing when evidence no longer identifies a user-relevant bottleneck within scope.
