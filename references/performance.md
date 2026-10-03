# Measured interface performance

Read when an interface loads slowly, responds late, scrolls poorly, shifts unexpectedly, or wastes memory. Find the bottleneck for this surface; do not trade away correctness, accessibility, or visual intent for an unmeasured score.

## Establish a useful baseline

- Identify the affected task: first useful content, startup, typing, filtering, navigation, dragging, scrolling, or saving.
- Separate network wait, main-thread work, rendering, image decoding, and application-state causes.
- Use the project's available profiling and measurement tools; no particular binary, hosted service, or agent is a prerequisite.
- Record route/state, build mode, device or emulation, browser/runtime, network, cache warmth, and data size.
- Compare before and after under equivalent conditions; repeat noisy samples enough to distinguish a change from variance.
- Prioritize delay users experience over micro-optimizations that cannot affect the task.
- When execution is unavailable or not authorized, identify likely costs from source and report them as hypotheses, not measured improvements.
- Use representative slower hardware and constrained connections when possible; desktop width does not imply a fast device.

## Metrics answer different questions

- For web loading, track Largest Contentful Paint (LCP), first visible content, request waterfall, and critical payload sizes.
- For responsiveness, track Interaction to Next Paint (INP), long tasks, input latency, and expensive event handlers.
- For stability, track Cumulative Layout Shift (CLS), font swaps, media sizing, and asynchronous insertions.
- Common good Core Web Vitals thresholds are LCP at most 2.5 seconds, INP at most 200 milliseconds, and CLS at most 0.1, evaluated at the 75th percentile of real visits when available.
- A laboratory trace diagnoses one run; it does not establish population-wide field performance or a percentile by itself.
- Use request count, transferred bytes, bundle composition, memory, and rendering traces to explain causes, not as goals in isolation.
- For native UI, measure launch to first useful frame, frame pacing, image decode cost, memory growth, and expensive recomposition/rendering.
- Relate animation work to the actual refresh rate: roughly 16.7 ms per frame at 60 Hz and 8.3 ms at 120 Hz, including all frame work.
- A loading indicator, skeleton, or optimistic update can improve feedback but cannot prove reduced latency.

## Deliver critical content first

- Make the primary text, controls, and initial visual focal point available without waiting for optional features.
- Do not lazy-load the LCP image or other immediately required content by default.
- Size and compress images for their display dimensions and pixel density; use suitable modern formats with supported fallbacks.
- Use responsive image candidates and accurate size hints; art-directed crops must still communicate the intended subject.
- Reserve image/video dimensions or aspect ratio to avoid layout shifts; retain meaningful alternative text.
- Lazy-load genuinely offscreen media and defer heavy noncritical widgets when doing so does not break navigation or discovery.
- Split code at useful route/feature boundaries, not into so many tiny chunks that interaction creates a request waterfall.
- Remove unused dependencies and CSS through the existing build process rather than adding a second delivery pipeline.
- Reduce unnecessary third-party scripts and embeds where the task permits; do not silently remove required functionality.
- Preload only proven critical resources; indiscriminate preload competes with the resources the user actually needs.
- Prefetch likely next work only when justified by the product and connection cost, not every possible destination.

## Fonts and stable rendering

- Load only used font families, weights, and styles; preserve required language coverage and fallback behavior.
- Choose a font-display strategy that keeps text readable and respects the intended experience.
- Use metric-compatible fallbacks where possible to reduce reflow; do not hide the page until fonts arrive.
- Subset safely for the supported content and scripts; an English-only font subset is not a localization strategy.
- Reserve honest space for asynchronously loaded content without fixing heights that clip larger text.
- Avoid inserting banners or new content above the user's current position without preserving context.
- Keep loading and loaded structure reasonably stable; skeletons should represent the real layout, not random decoration.

## Main-thread and rendering cost

- Batch layout reads before writes; avoid alternating measurements and style mutation in loops.
- Remove unnecessary repeated computation, rendering, and allocations in measured hot paths.
- Use stable list keys and scoped state so one edit does not rebuild an unrelated large region.
- Memoize expensive computations or renders when profiling shows reuse; blanket memoization adds complexity and can cost more.
- Debounce expensive search work where useful while keeping typing feedback immediate; stale responses must not replace newer results.
- Throttle repeated scroll work and use platform observation facilities where appropriate instead of continuous polling.
- Break long tasks into interruptible work; use background computation when its overhead is justified by the measured workload.
- Keep layout and paint areas bounded for expensive filters, shadows, masks, or blur rather than banning meaningful effects outright.
- Prefer transform/opacity for ordinary movement when suitable; compositor-friendly properties do not guarantee a cheap animation.
- Use layer promotion hints sparingly and only while useful; excessive layers consume memory.
- Apply containment or deferred offscreen rendering only where it preserves focus, sizing, search, printing, and accessible content.

## Data, lists, and network

- Paginate or incrementally fetch large collections instead of transferring everything on entry.
- Virtualize genuinely large rendered lists when needed; preserve keyboard traversal, accessibility, selection, and scroll context.
- Give users search/filter access to the collection without claiming unloaded items have been searched locally.
- Request needed data through the existing API rather than changing protocols solely for an imagined optimization.
- Reuse the project's caching and request conventions; choose invalidation that keeps data accurate after mutation.
- Compress/cache supported assets appropriately; caching must not expose private data across accounts or show stale success as current truth.
- Avoid duplicate requests and cancel or ignore obsolete work when a surface or query changes.
- Use optimistic feedback only with credible rollback and conflict handling; do not mask an uncertain mutation result.
- Offline caching and queued writes are product capabilities, not mandatory fixes for a slow interface.

## Native runtime and lifecycle

- Keep expensive work off the launch and gesture-critical main-thread path where the platform permits.
- Use native recycling/lazy-list conventions and decode thumbnails at suitable sizes rather than repeatedly decoding originals.
- Profile wasted renders/recompositions and image cache behavior before adding framework-specific tricks.
- Clean up subscriptions, event handlers, observers, timers, and pending work; check repeated mount/navigation paths for memory growth.
- Pause nonessential animations and work when offscreen or backgrounded where appropriate.
- Preserve battery, reduced-motion settings, and operating-system behavior while improving frame pacing.

## Concrete checks and evidence

- Compare equivalent cold and warm loads, interaction traces, large datasets, and constrained-network paths as relevant.
- Check the complete task still works: keyboard, focus, screen readers, error/retry, search, and navigation.
- Look for regressions in font coverage, layout stability, image quality, full text, and native text scaling.
- Report observed before/after numbers with conditions and the responsible change; separate perceived feedback from actual latency.
- Name what was not measured, especially field percentiles, target hardware, native gestures, or production network behavior.
- Stop adding optimizations when evidence no longer identifies a user-relevant bottleneck within scope.
