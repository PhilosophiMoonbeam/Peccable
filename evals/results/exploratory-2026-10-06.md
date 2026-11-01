# Exploratory evaluation — 2026-10-06

## Decision and scope

**Strict adoption decision: INCONCLUSIVE.** This exploration is not a registered pilot, a benchmark pass, or evidence of a quality gain. All preliminary outcome votes are invalid for comparison. No outcome win/fail totals or model-quality conclusions are reported.

Source guidance was frozen and reviewed without material defects. The reachable exploratory work produced artifacts, browser observations, a scoped evaluator audit, and context-byte proxies. That phase is closed; a valid comparative pilot remains unperformed. This report does not claim a replacement harness, corrected evaluation run, or follow-up implementation has been completed.

The installed payload is unchanged by this report. No new asset, library, or helper is justified by this run. The root license is unchanged. Maintenance gates were observed passing by the owner only; this documentation task ran no gates, tests, builds, formatters, or evaluations. Maintenance integrity does not establish outcome quality.

## Coverage and retained evidence

Three arms (no-skill, current, candidate), three repetitions, and nine briefs produced **81 artifacts**: **18 development** and **63 holdout**. These cohorts must not be pooled into an adoption result.

- **72 browser exercises:** 69 generated evaluators finished; three ended in errors: `H01-3-no-skill`, `H03-3-no-skill`, and `H05-1-candidate`. Finishing an evaluator does not establish that its assertions or verdicts are valid.
- **Nine planning-only artifacts:** no app was launched. These are planning evidence, not missing browser exercises or runtime successes.
- Final captures used **1440 × 1000** and **320 × 900** viewports. Action/exercise viewports varied; final capture dimensions do not prove that interactions ran at those dimensions.
- **200% text scaling is unknown**, not passed.
- Two blind judge passes each returned **79 answers and two max-token errors**. These response counts are not outcome totals, and they do not establish a formal blind visual comparison.

The [compact evidence ledger](exploratory-2026-10-06.json) retains arm snapshots, artifact hashes, delivered-context proxies, and independently confirmed smoke observations. Raw generated outputs, scripts, and captures were temporary and were removed after extraction. The scoped evaluator audit covered metadata/counts and selected records, not exhaustive manual review of every output. Preliminary comparative labels are not retained as valid assertion results.

## Why comparison is invalid

Artifact authoring used source-to-files generation with the model's default alias. The exact model version and token metadata are unavailable. This does not establish the matched, fresh-agent authoring protocol required by [the evaluation procedure](../README.md).

Browser work used a shared managed browser rather than separate fresh profiles. Together with varying action viewports and unverified text scaling, this prevents claims that the prescribed isolation and accessibility coverage were achieved. No formal blind visual comparison was completed.

The scoped audit found evaluator defects that can produce false failures or unsupported verdicts:

- `Control+A` and `ControlOrMeta+A` were unsupported by the harness. A failed chord is not evidence that the artifact's keyboard behavior failed.
- Evaluator native-date fills failed. Those tool failures do not establish a broken date control.
- The H06 wait depended on presentation rather than a stable task-state condition.
- Input-scroll and focus-ID heuristics did not validly establish the required behavior.
- The H02 oracle assumed an unsupported next-shift minimum. The fixture now expects the supplied projected counts instead; that correction does not retroactively validate this cohort.

These limitations invalidate preliminary comparative votes, not merely selected inconvenient results. Neither generated evaluator completion nor judge agreement repairs invalid assertion evidence. No errors are silently replaced with successes, and no attractive subset is promoted to a comparative result.

All holdouts are now exposed. They cannot serve as unseen holdouts for a future candidate, including a revision influenced by this review.

## Independently confirmed primary paths

Direct browser helpers, with actual input values checked, confirmed four candidate-artifact paths at a 320 CSS-pixel viewport:

- D01: empty and invalid email recovery, followed by keyboard submission of the supplied long address; document width remained 320 pixels.
- D02: next-page navigation and inspection of INV03 showed its exact $10.49 value while the matching aggregate remained $39.
- H03: native date and other field entry produced a local review containing the supplied name, date, and four-person party, without claiming a booking.
- H06: selecting each route updated its corresponding detail panel.

These observations correct specific unsupported failure claims. They do not establish all scenario assertions, comprehensive accessibility, a corrected comparative cohort, or a quality advantage.

## Known prompt-byte proxies

There were **27 tasks per arm**. The following values describe known delivered skill prompt bytes, not total task context or tokens.

| Arm | Unique loaded skill bytes: median | Unique loaded skill bytes: range | Cumulative delivered skill bytes: median |
| --- | ---: | ---: | ---: |
| No-skill | 0 | 0–0 | 0 |
| Current | 57,117 | 44,676–79,341 | 69,709 |
| Candidate | 56,858 | 45,900–82,094 | 69,680 |

Unique loaded bytes and cumulative delivery are distinct measures; rereads can increase the latter. These are known UTF-8 prompt-byte proxies, not skill-attributable token counts, cache accounting, or proven context benefit. Zero known skill bytes in the no-skill arm does not imply zero common harness overhead. Exact model/version, total input/output tokens, cache-read tokens, and skill-attributable tokens are unknown. The small difference between arm medians supports no efficiency or quality claim.

## Requirements for a valid pilot

A new pilot must satisfy [the frozen rubric](../RUBRIC.md) and [the protocol](../README.md), rather than retroactively relabeling this exploration:

1. Obtain independently authored, genuinely unseen holdouts under custodian control. Retire these exposed cases to development; do not rename or reuse them as unseen evidence.
2. Before generation, register immutable arm snapshots and fixture/rubric hashes, exact provider/model/version, common prompts and generation settings, limits, ordering, replacement policy, harness/browser configuration, and review/adjudication procedure. Explicitly record any unavailable instrumentation.
3. Use matched fresh agents, workspaces, browser profiles, and app state. Audit actual skill loading and no-skill isolation. Preserve task-specific tool restrictions and planning-only boundaries.
4. Validate evaluator operations against supported harness input APIs before scoring. Use task-state assertions rather than presentation-dependent waits or incidental focus IDs. Derive numeric oracles from the supplied fixture and authorized requirements, without adding assumptions such as H02's next-shift minimum. Keep infrastructure errors distinct from artifact failures.
5. Exercise and record each required assertion and state at controlled wide/narrow contexts, plus the relevant long-content path at verified 200% text scaling. Record action dimensions separately from final capture dimensions and preserve source, rendered, behavioral, and measured evidence distinctions.
6. Preserve every repetition, error, timeout, and unverified assertion. Apply only the preregistered infrastructure replacement rule; do not repair an artifact or coach an arm during review.
7. Complete independent arm-blind review and adjudication with the prescribed task-success gates before visual preference. Preserve reviewer provenance and incomplete responses; do not infer a verdict from a truncated answer.
8. Record actual delivered context with explicit byte/token semantics and unknowns. Report development separately from holdout evidence, per brief and repetition, then apply the strict adoption rule without substituting pooled votes or maintenance gates.

These are prerequisites for new evidence, not claims that the pilot or its tooling has been implemented. This run supplies exploratory lessons only; it does not justify changing the payload or adding runtime resources.
