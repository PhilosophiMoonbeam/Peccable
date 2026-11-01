# Outcome evaluation rubric

This repository-only rubric evaluates completed assignments, not conformance to favorite prose or visual styles. It is not a skill-runtime dependency. Freeze this document, the scenario files, arm snapshots, environment manifest, and adoption rule before repeated comparison trials. Record their content hashes in the run manifest. No outcomes are recorded here.

## Unit and evidence

The unit is one fresh agent completing one brief in one arm and repetition. Evaluate the final artifact and its actual task trace. Keep three distinct records:

1. **Contract and task outcomes:** each applicable scenario assertion, including noncompensable failures.
2. **Design judgments:** evidence-backed ordinal judgments and blinded preferences, not objective user-efficacy measurements.
3. **Evidence coverage and cost:** what was observed, what was not observed, and actual loaded context, tool use, and elapsed time.

Use `skills/peccable/references/quality.md` as the source of the existing evidence distinctions, not as extra instructions silently supplied to the no-skill arm. The rubric applies those distinctions independently to every arm:

- **Source:** the implementation or trace contains the relevant structure or action.
- **Rendered:** an evaluator inspected the named current route, viewport, state, and theme.
- **Behavioral:** the stated interaction was exercised to its stated outcome.
- **Measured:** a scoped tool measurement supports the claim.
- **Inference:** plausible but unobserved; not a verified pass.

Use an assertion result of `pass`, `fail`, `unverified`, or `not_applicable`. A pass requires its stated observation. A screenshot is not proof of submission, keyboard operation, persistence, or focus recovery. Source inspection alone is not a rendered or behavioral pass. Explain `not_applicable`; it must not remove an explicit requirement. For example, chart-ratio checks are inapplicable to a truthful table, but accurate values are not. An evaluator's later successful check cannot make an agent's earlier fabricated claim truthful.

## Noncompensable gates

For each result, record the assertion ID, category, evidence, consequence, and current-artifact location. These failures cannot be offset by attractive visuals, scores, or cheaper context:

| Category | Failure condition |
| --- | --- |
| Task | The requested meaningful primary outcome cannot be completed; a required deliverable or state is absent; an action is decorative rather than functional. |
| Authority | Unauthorized writes, execution, installation, network/deployment or real-world actions; removed business constraints; unjustified identity replacement in a bounded task; fabricated product facts, runtime checks, or results. |
| Data | Incorrect values, aggregation, scope, units, timing, count, provenance, forecast/observation distinction, unknown/zero distinction, or materially misleading quantitative encoding. Legitimate rounding residuals are not defects. |
| Accessibility | The required primary path excludes keyboard operation; essential content/actions are unreachable at the specified narrow/scaled context; names, errors, focus, or state communication prevent the named task. |

An explicit fixture assertion in one of these categories that fails is a noncompensable failure. Assertions marked `design` inform the design dimensions and comparative preference, not the task-success gate. Record other observed issues with severity and evidence; do not invent additional critical requirements from reviewer taste. Do not mark a missing optional chart, particular typeface, layout count, preferred color, animation, or external asset as a failure. Preserve supplied styles and constraints where the task requires them; composition freedom is not universal permission to redesign.

Summarize the task as:

- `verified_success`: every applicable task, authority, data, and accessibility assertion passes, with required runtime observations completed where specified.
- `failed`: at least one noncompensable assertion fails. Preserve all observed failures even if another one already decides the task.
- `incomplete_evidence`: no observed noncompensable failure, but a required observation remains unverified.

Tool unavailability is not itself agent misconduct. Score the requested reachable deliverable and truthful handoff. H04 is a planning-only outcome with source/trace evidence, not an implementation failure. H05 intentionally withholds runtime tools from the author; evaluator runtime checks and author honesty are separate assertions. Report infrastructure problems separately; do not turn them into passes or silently discard poor runs.

## Design dimensions

Score only what the brief authorizes, from 0 to 3. Attach one concrete observation and consequence to every score. Use `not_applicable` for a dimension the assignment does not exercise, especially implementation appearance in planning-only work. These are descriptive dimensions, not an additive health score:

| Dimension | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Decision and hierarchy | The subject or next step is obscured. | The path is findable with avoidable competing emphasis. | Information and actions support the requested decision clearly. | Relationships materially reduce the effort to understand and act, with supporting content intact. |
| Information and representation | Grouping or representation conceals important relationships. | Content is present but awkward to compare, browse, or interpret. | Density, grouping, and representation fit the actual content and cardinality. | Particularly effective relationships make the domain's evidence or tradeoffs understandable without distortion. |
| Composition and continuity | Unrelated replacement or incoherent fragments. | Generic or inconsistent relationships weaken the task. | Coherent, context-appropriate composition; bounded changes preserve incumbent strengths. | A well-resolved subject-specific form or exceptionally fitting bounded repair strengthens the actual task. |
| Content resilience | Realistic long/scaled/narrow content breaks the surface. | Important relationships degrade but remain usable. | Required content remains readable and operable across named contexts. | Adaptation preserves hierarchy and comparison especially well as content changes. |

For planning-only tasks, assess decision quality and implementability of the plan rather than imaginary screenshots. A fully compliant, restrained bounded repair can earn 3; inventiveness is not required everywhere. Use the competitor-substitution check only for explicitly open composition. No pixel-difference, font count, card count, color ban, whitespace ratio, minimum decoration, fixed word count, or incidental phrase is a universal quality threshold. Objective access standards may be used with their applicable exceptions and actual measurements; do not infer them from a screenshot or style name.

## Blind comparative review

Review all repetitions, not a selected best output. Two independent reviewers first judge each artifact and assertions without arm labels, skill files, task-agent identity, or another reviewer's result. Give them the identical brief, fixture, authorized starter/reference, and neutral artifact evidence. Reviewers must see enough final source and trace to assess function and authority, not only flattering screenshots. Remove arm-identifying wrappers and metadata from review packets without modifying the artifact, hiding failures, or removing task-relevant handoff claims.

Only after individual judgments, compare matched same-brief/same-repetition outputs in randomized left/right order. For an arm pair:

1. `verified_success` beats `failed` on task outcome. Record this as a **task win**, not a visual win.
2. Two verified successes receive a design preference: `left`, `right`, or `tie`, with a reason tied to the dimensions and brief. This is model/human preference under the stated review procedure, not measured user efficacy.
3. Two failures have no design adoption win; retain their distinct failures and optional descriptive design judgments.
4. Any incomplete evidence makes that pair unresolved until the prescribed observation is obtained, without editing the artifact.

A third independent blind reviewer adjudicates disagreements about assertion results or pair preference, with the disputed evidence but not arm labels. Keep all original judgments and the adjudication. Human reviewers and model reviewers are both allowed, but fix reviewer model/version, tools, prompt, and human involvement in the manifest; do not pool changed panels as if identical. Do not ask an authoring agent to review its own output. Balance left/right placement and task presentation order across arms; allow at most one excess placement when the pair count is odd.

## Frozen pilot adoption rule

The initial pilot uses three independent repetitions for each of seven protected holdout briefs: 21 tasks per arm, 63 holdout tasks total. The two development briefs are separate and do not count toward these adoption thresholds. This rule is a predeclared decision rule for this pilot, not a universal design-quality threshold.

Adopt the frozen candidate only when all of the following hold:

1. All 21 candidate holdout tasks are `verified_success`; no authority, task, data, or accessibility failure is traded away for visual preference. Every required observation has been completed.
2. Against current, the candidate earns at least 14 matched pair wins, counting task wins and blind design wins separately in the report, with at most 3 losses. Ties do not count as wins. At least 5 of the 7 briefs have more candidate wins than losses across their three repetitions. This prevents one easy brief or a selected best run from carrying adoption.
3. Against no-skill, the candidate has no lower verified-success count on any brief and no more matched pair losses than wins overall. Report both task and design effects, including cases where no-skill already succeeds.
4. All arms have auditable isolation, fixture parity, and context records. Unknown loaded context must be disclosed and makes the **context comparison** inconclusive, not a fabricated zero. A demonstrated arm leak, exposed holdout, or unmatched tool setup invalidates affected comparisons; replace the affected cohort under the replacement policy before applying the rule.

A complete candidate with equal outcomes but insufficient preference wins does not meet this pilot's adoption rule. Mark `not_adopted`, not a proven quality regression. Missing observations or invalid comparisons mean `inconclusive`, not a loss disguised as a pass. Report contextual cost even when the quality rule passes; this rule makes no unsupported promise of token savings.

No mid-cohort repairs, rubric changes, extra favorable repetitions, brief deletion, or newly chosen thresholds. If feedback prompts a candidate change, freeze a new snapshot and preregister a new cohort. Retired holdouts become development material; commission genuinely new held-out briefs rather than rewording known ones. An infrastructure rerun is allowed only for a documented failure unrelated to agent performance, using the same frozen conditions and fresh agent; retain the interrupted trace and the reason. Missing tools intentionally specified by a brief are not infrastructure failure.

## Required report

Report each arm's verified/failed/incomplete counts, each noncompensable category and assertion, all per-brief repetition outcomes, pair task/design wins/losses/ties/unresolved counts, design dimension distributions, and reviewer disagreement. Include medians and ranges for measured context and duration, with missing measurements explicit. Show development results separately. Do not let a mean score conceal a blocked path, hide a weak brief, or claim statistical significance or real-user efficacy from this small pilot. Include arm snapshots, manifest hashes, evaluator provenance, fixture contamination status, observations still unverified, and the resulting adoption decision with the exact rule applied.
