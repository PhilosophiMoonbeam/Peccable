# Repository-only outcome evaluations

These resources support controlled outcome trials, not skill activation or installation. The repository-only pilot runner uses an existing Bun/SDK/browser installation and bubblewrap; none of these maintenance dependencies ships with the skill or changes its installation or runtime requirements. Repository integrity tests do not establish design quality; these trials do not establish real-user efficacy. The presence of a runner, protocol, or report template is not evidence of a completed trial or adoption.

## Resources and access boundary

- `evals/scenarios.json`: two **development** briefs, inline starter/data fixtures, expected values, observable assertions, and the shared empty-page starter contract. Candidate authors may inspect and try these cases before freeze; the actual pilot below does not add a development comparison.
- `evals/fixtures/holdout.json`: the seven **retired, exposed** holdouts from the exploratory run. They are development material only, not the next pilot's unseen cohort.
- `evals/fixtures/pilot-v3.json` and `evals/fixtures/pilot-v3-evaluator.mjs`: independently authored replacement cases and semantic oracle controls. Candidate preparation must finish before holdout validation or release. The prior `pilot-v2` cohort is exposed and invalid: its evaluator imposed hidden requirements and its declared text-scaling viewport conflicted with execution.
- [RUBRIC.md](RUBRIC.md): unchanged evidence categories, noncompensable gates, design review, and adoption criteria. Safe for candidate authors to read before freeze.
- [run-pilot.mjs](run-pilot.mjs), [pilot-agent.mjs](pilot-agent.mjs), [pilot-worker.mjs](pilot-worker.mjs), and [pilot-browser.mjs](pilot-browser.mjs): repository-only orchestration, real model/tool loop, isolated worker, and bounded browser adapter. [PILOT-HARNESS.md](PILOT-HARNESS.md) documents the SDK, isolation, trace, and context contracts.
- [validate-oracles.mjs](validate-oracles.mjs): pre-cohort semantic controls, assertion-consumer boundaries, and projected control-packet text limits in the pinned isolated browser. Inputs are snapshotted before execution; manual judgment and actual trial-packet eligibility remain separate requirements.
- `skills/peccable/references/quality.md`: existing evidence and quality guidance being compared, not an extra skill implicitly supplied to every arm. Do not edit the payload to call these evaluations.

All fixtures are synthetic, local, and complete for their assigned task. They require no real accounts, messages, purchases, or production data. Source fixtures are inline JSON strings; materialize them as files only in disposable task workspaces, not in this repository or the installed payload. The actual pilot's maintenance dependencies are described below; they are not requirements for using Peccable.

**Holdout protection is procedural, not secrecy by filename.** Candidate authors, development agents, and trial agents must not have the evaluation repository mounted or searchable. A task agent receives exactly one selected brief and its input fixture, never the full suite, expected values, evaluator assertions, other repetitions, peer outputs, or rubric. If authors have read a holdout, it is no longer unseen. Record exposure, retire those cases to development, and obtain new briefs from an independent custodian before scoring a final candidate. Renaming a seen brief is not a fresh holdout. After review feedback has influenced a revision, the released cases cannot be reused as unseen evidence for that revision.

**Cohort status:** The [old exploration](results/exploratory-2026-10-06.md) is retired and its preliminary comparisons are invalid. The [V2 pilot](results/pilot-2026-10-31-v2-invalid.md) was invalidated by measurement defects. The [completed V3 pilot](results/pilot-2026-10-31-v3.md) is **inconclusive** under the unchanged rule: nine projected packets exceeded the frozen review bound, one author trace was incomplete, and required observations remain unverified. No adoption or quality/context gain is established. All released cases are now exposed development material; a revised candidate needs independently new cases and a new freeze.

**H02 oracle correction:** The brief supplies minima for the current shift only; next-shift projection rows supply ward names and projected counts, not next-shift minima. The expected values therefore record the supplied projected counts, not projected slack derived from an invented next-shift staffing policy. This correction does not retroactively validate the exposed cohort or its exploratory results.

## Before trials: freeze the manifest

The owner/custodian creates a run record outside the installable payload and, for `run-pilot.mjs`, outside this checkout. Freeze every field before repeated comparison; the runner's manifest and existing SDK logs implement the record contract:

| Field | Required value |
| --- | --- |
| Run identity | Unique run ID, timestamp, custodian, storage path, owned resource names, retention/cleanup plan. |
| Arms | Immutable source revision or content-addressed snapshot for each arm; payload file hashes and how the harness loads it. |
| Task model | Exact provider/model/version, generation parameters including seeds if supported, prompt wrappers and system/developer instructions. Fix them across arms; disclose nondeterminism. |
| Harness/tools | Harness version, allowed tools, tool instructions, static preview method, browser/version, fonts available, network policy, OS, viewport/theme/zoom, fixture clock, and per-brief tool overrides. |
| Limits | Same explicit wall-clock/turn/tool/byte limits per brief in every arm; provider token settings and their actual enforcement; timeout handling; concurrency policy. A timeout remains an observed task outcome, not a silently dropped run. |
| Review | Review model/version or human panel, reviewer instructions, independent review order and left/right assignment seed; at least two blind reviewers and one adjudicator available. |
| Cohort | Seven independently custodied fresh holdouts; three fresh repetitions per arm per brief; predetermined run order and replacement rule. The actual pilot has no additional development comparison. |
| Freeze | Hashes of rubric, selected fresh case/oracle files, starter contents, arm snapshots, protocol and harness; unchanged adoption rule from `evals/RUBRIC.md`; no unresolved edits to frozen resources. |
| Context instrumentation | What the harness logs for input tokens, visible skill reads, automatic loading, cache reads, truncation and compaction; unavailable fields explicitly marked unknown. |

Use these three arms:

1. **No-skill:** no design skill or Peccable payload is available or auto-loaded. Common harness instructions stay identical; do not remove ordinary safety, authority, or tool instructions.
2. **Current:** the pre-change Peccable payload at `04324e126e25939d4d30eff09073af4433481e53`, loaded through the same mechanism as candidate.
3. **Candidate:** the frozen proposed Peccable payload, identified by immutable snapshot hashes even if no commit is made.

Do not equate an installed skill with a loaded one. Audit harness discovery, inherited repository instructions, global skills, caches, and automatic context injection. A no-skill agent that receives candidate guidance is contaminated. Current/candidate agents should receive the same skill invocation/request wrapper; only the frozen payload differs. Do not force-feed extra references in one arm. If evaluating selective loading, preserve that mechanism and record what each task actually loaded. Do not add evaluation resources to a skill arm.

Development may guide revisions before the final freeze. A separate comparable development report would use all three arms and the same three-repetition protocol, never contributing to holdout adoption totals. **This actual pilot runs only 63 fresh holdout tasks (seven briefs × three arms × three repetitions); no additional development comparison is performed.** Do not treat the old exploratory artifacts as development controls for this cohort or add runs after seeing outcomes.

## Actual pilot: maintenance launch and review

The actual pilot uses [run-pilot.mjs](run-pilot.mjs) and the independent [review-pilot.mjs](review-pilot.mjs) stage, under this protocol, [PILOT-HARNESS.md](PILOT-HARNESS.md), and the **unchanged [RUBRIC.md](RUBRIC.md)**. These are maintenance resources only. No payload or candidate guidance changes are part of the pilot harness work; neither the skill's installation procedure nor its runtime gains a runner, SDK, browser, or package dependency.

### Existing host prerequisites

- **Bun** runs the installed TypeScript SDK sources; plain Node is not a substitute. Use the existing `@oh-my-pi/pi-agent-core`, `@oh-my-pi/pi-ai`, `@oh-my-pi/pi-catalog`, and `@oh-my-pi/pi-coding-agent` **18.14.2** installation, recording installed manifests/source identities rather than adding a repository package installation.
- **Linux bubblewrap (`bwrap`)** must support the required per-trial namespaces and minimal mounts for both author and browser processes. A namespace capability probe is not proof of full trial isolation or a provider-only outbound network ACL. Record the actual boundary and any limitations; do not fall back to a broad host mount or unrestricted host browser.
- **The host's util-linux `flock`** provides exclusive crash-safe ownership across author and review stages. Both stages retain the same run lease throughout execution; review also retains its review lease. Persistent lock files are metadata, not evidence of an active owner. These are maintenance resources outside the payload, not author tools.
- **An existing Chrome/Chromium executable**, its required system libraries/fonts, and the coding-agent installation's **`puppeteer-core` 25.3.0** support the bounded browser adapter. No browser is downloaded. Freeze the actual executable/version/hash, installed driver, fonts, viewport, theme, clock, and text-scaling method. A brief that prohibits runtime tools still receives none.
- **Existing host `omp` authentication** supplies the `openai-codex` access token in memory. Do not persist it, print it, put it in command arguments or manifests, or mount the credential store in a trial/reviewer workspace. Provider calls are owned by the SDK, not exposed as an author network tool.

Pin the selector to **`getBundledModel('openai-codex', 'gpt-6.1-sol')`** from pi-catalog, with matched generation settings across arms. Preserve the resolved catalog record/hash and actual response model, response identifiers, usage, and unavailable metadata. This pins the requested provider/model and records observed catalog/response metadata; it does **not** pin vendor weights or establish an immutable backend build. Order/identity seeds do not make provider generation deterministic. Output-token settings may be provider hints rather than hard bounds; freeze and disclose the actual wall/turn/tool/byte enforcement.

### Register before release

The owner prepares separately frozen current/candidate snapshots and their file-hash registry outside the payload. The review registry declares two independent blind reviewers, an independent adjudicator, exact model/SDK identities, instructions, schemas, and presentation seed. Export it with `review-pilot.mjs registry`. Before setup, run the final review implementation's real-provider `probe`: strict JSON, individual positive/negative evidence, paired citations, and adjudication must all pass. The probe also verifies actual outbound text/image inclusion and measurement-projection controls. It does not inspect cohort artifacts or establish design quality.

The probe's `--evidence` input is an owner-collected native-browser canary, not a typed expected result. Using `pilot-browser.mjs`, capture a native `<details><summary>` AX snapshot, `scaleText(page, 2)` observations, a full PNG, and browser evidence. Preserve the successful process result as `{exit: 0, result: {values, fontObservation, capture, evidence}}`: `values` includes `{id: "native", ax_name, role: "DisclosureTriangle"}`; `capture` has `mimeType: "image/png"` and actual base64 `data`; `evidence` includes `browserVersion`. Retain the producer, fixture, and raw observations. The probe freezes this input; a registry export or fabricated canary is not a substitute.

Owner command shapes from the repository root are:

```sh
bun evals/review-pilot.mjs registry
bun evals/review-pilot.mjs probe --modules /absolute/installed/node_modules --omp /absolute/bin/omp --evidence /absolute/native-canary.json --out /absolute/new-review-probe
bun evals/validate-oracles.mjs --out /absolute/new-oracle-validation --modules /absolute/installed/node_modules --chrome /absolute/bin/chrome
bun evals/run-pilot.mjs setup --out /absolute/new-run --custodian OWNER --reviewers /absolute/reviewers.json --review-probe /absolute/new-review-probe/probe.json --oracle-validation /absolute/new-oracle-validation/receipt.json --arms-freeze /absolute/arm-freeze.json
bun evals/run-pilot.mjs validate --manifest /absolute/new-run/manifest.json
bun /absolute/new-run/frozen/harness/run-pilot.mjs run --manifest /absolute/new-run/manifest.json --accept-freeze MANIFEST_SHA256
bun /absolute/new-run/frozen/harness/review-pilot.mjs --manifest /absolute/new-run/manifest.json --accept-freeze MANIFEST_SHA256
```

These are owner command shapes, not claims of successful execution. Supply actual installed paths. Oracle validation requires compliant alternatives and targeted negative controls for every case, complete assertion coverage, native browser observations, and consumer-boundary controls. It preserves all mismatches and errors; a failed receipt cannot authorize setup. A successful receipt binds the exact cases, evaluator, browser, runner, reviewer, validator, Chrome, driver, and raw results.

`setup` requires a new external run directory and both successful pre-cohort receipts. It freezes receipts, validation results, source identities, arm snapshots, protocol, environment, limits, ordering, and all 63 slots. It hashes/copies custodian case/oracle bytes without parsing/importing them. `validate` checks frozen bytes and environment identities; it is not a quality gate or oracle validation. Execute the frozen runner with `--accept-freeze` to release the cohort. The frozen review stage requires the matching registry, probe, and oracle receipt predating setup.

Freeze candidate content before independent oracle validation. Candidate authors must not inspect fresh cases or outcomes while revising guidance. Custodians and harness owners may validate the fixed candidate's measurement infrastructure before cohort release; semantic positive and negative controls must pass first. Any candidate revision influenced by released evidence requires independently authored new cases. After release, author tools see only their selected source/skill roots and permitted brief/input; evaluator source and review packets remain read-only in separate contexts. Retain every failure, denied action, timeout, and incomplete observation. Only the rubric's infrastructure-only replacement rule applies. No mid-cohort candidate repair, oracle change, favorable extra repetition, or retrospective threshold change is permitted.

### Per-run evidence, blind review and results

The external run root contains `trials/<neutral-task>/attempt-N/` with immutable final `artifact/`, `outcome.json`, `blind-packet.json`, `review-trace.json`, and `evidence/`, plus `cohort-<timestamp>.json`. The custodian retains the arm map separately; review packets exclude arm wrappers, credentials, peer reviews and unrelated task material, without removing task-relevant failures or handoff claims.

Each independent reviewer records every applicable assertion for every artifact before comparing matched brief/repetition pairs. Then record separate task wins and design preferences, rationale, original disagreements and blind adjudication under the unchanged rubric. Missing runtime observations remain `unverified`/`incomplete_evidence`; model completion or a source-only observation does not imply a verified task pass. Report every observed noncompensable failure and uncertainty, including limitations in isolation, oracle coverage, browser state, provider metadata and actual context attribution.

The review stage writes **`<run-root>/review/results.json` and `<run-root>/review/results.md`**, retaining raw call records, parsing retries, provider/model/usage metadata and original/adjudicated judgments in `<run-root>/review/records/`. Archive the compact per-run reports and cohort JSON in [results/](results/) with links to retained manifest/evidence before the registered cache expiry; preserve evidence through independent review and archive handoff. Loaded context must use actual delivered resources/provider usage, with byte proxies and unknown token attribution labeled, not installed payload size.

Per-run decisions and limitations are recorded in [results/](results/), not inferred from implementation presence or passing structural gates. The completed V3 pilot does not authorize adoption. Preserve failures, rejected packets, aborted calls, original votes, disagreements, unknowns, and measured costs even when they prevent a complete comparison.

### Supplemental evidence recovery

Use the current maintenance implementation to diagnose a completed immutable run without changing its original results:

```sh
bun evals/review-pilot.mjs reconcile --manifest /absolute/original-run/manifest.json --accept-freeze ORIGINAL_SHA256 --out /absolute/new-reconciliation
```

This offline command validates the original freeze, inventories, and recorded source identities; reuses original individual votes/adjudications; and writes a separate source-hashed reconciliation. It makes no author, browser, or provider calls and does not rerank pairs. The output must be outside both checkout and original run. Original review files are hashed before and after. Recovered deterministic observations and accepted citations are not new blind votes or a replacement adoption decision.

The [V3 evidence-repair supplement](results/pilot-v3-evidence-repair.md) distinguishes consumer errors, incorrect oracle constraints, missing observations, and genuine artifact defects. Corrected oracle observations use a separately recorded evaluator against unchanged artifacts; they are not repairs to the author work. Historical reports remain unchanged. A changed panel, packet, evaluator, or consumer must never be presented as the original frozen experiment.

Targeted remeasurement and fresh blind judgments are a separate procedure, not another `reconcile` pass. The [supplemental harness protocol](PILOT-HARNESS.md#targeted-supplemental-review) documents the custodian collector, complete native-PDF rendering, source/packet freeze, two-context panel, disagreement adjudication, scoped evidence admission, and finalized resume.

Select affected assertions before scored calls. Apply a common measurement repair to every artifact in the affected brief; retain unsuccessful captures and remove superseded evaluator resources atomically. Original author-time observations and permitted-read attestations can support past authority claims, but later evaluator success cannot retroactively establish those claims. Missing required fresh votes or adjudication remain unknown; deterministic failures remain failures.

Report supplemental context and cost separately. New judgments on unchanged, already exposed artifacts do not create a new held-out efficacy result, replace historical scores, rerank original pair preferences, relax adoption thresholds, or justify optional installed resources.

The [final V3 recovery report](results/pilot-v3-final-recovery.md) records completed native collection, strict recovery of rejected canonical-set responses, blind adjudication, remaining gaps, and measured cost. All historical failures remain unchanged. The [rejected-panel protocol](PILOT-HARNESS.md#recovering-a-rejected-panel-without-new-individual-reviews) freezes first-valid selection before new adjudication, validates canonical extras before ignoring them, and makes no replacement individual or author calls.



## Running one task

1. Start a genuinely fresh agent/context, workspace, browser profile, and local app state. Use the same immutable starter files and fixture for a matched brief/repetition in every arm. Do not carry over summaries, screenshots, edits, hidden storage, design decisions, or reviewer feedback. Share only compatible immutable dependency/browser caches, not task state.
2. The custodian selects one scenario and materializes its exact `starter_files` in an owned disposable workspace. Preserve those bytes for comparison. Provide only the selected `agent_brief` and `input_fixture`, not hidden expected values, assertion specifications, or other tasks.
3. Apply the selected case's exact `permission_mode`. Read-only planning permits source reads but no writes, execution, browser, installation, network, or deployment. Edit-only work permits the enumerated source writes but no author runtime tools. A separate evaluator may inspect completed artifacts with its own authorized tools. Keep permissions identical across arms.
4. Use the isolated bounded browser adapter when the brief permits browser work. Its owned local server, exact-origin proxy, disposable profile, and outer namespace form one boundary; a generic host server or browser is not a substitute. Do not bypass intentional missing-tool cases.
5. Let the agent finish the entire assignment within the frozen common limits. Record all tool calls, messages, loaded context, final changes, and handoff. Do not coach an arm or reveal expected values after an error. Do not let a reviewer fix its artifact. Capture incomplete and failed runs as well as successes.
6. Preserve a final immutable artifact and trace. For planning-only work preserve the chat plan, read trace, and unchanged-file evidence rather than inventing a rendered artifact. For denied tools preserve attempted calls as well as successful calls. The custodian can inventory workspace bytes before/after, independently of task-agent permissions.
7. In a separate evaluator context, follow every `evaluator_assertions` item against the final artifact, using `expected_values` where present. Record a result and evidence per assertion. Exercise actual controls; compare generated export contents, exact detail values, focus and error recovery, not only source strings. For scripted responses, use the fixture completion control to inspect initial loading, pending refresh, failure/stale, and recovered states deliberately.
8. At minimum inspect the supplied wide (1440 × 1000 CSS pixels) and narrow (320 × 900) contexts at 100% zoom and the relevant long-content path at 200% text scaling. Record actual dimensions and scaling method; browser zoom and text-only scaling are not interchangeable measurements. Inspect all named states and full scoped content. A genuinely two-dimensional table may use a contained scroller. No arbitrary screenshot crop or universal style threshold replaces the scenario assertions.
9. Create an arm-blind review packet containing the exact brief/input/starter reference, final artifact/source, handoff claims, named screenshots, assertion evidence and relevant trace. Keep an unmapped neutral output ID in the packet; the custodian alone retains its arm map. Keep source/task-relevant claims intact while removing arm labels and evaluation metadata. Independent reviewers score before discussing. Adjudicate disagreements as described in the rubric.
10. Archive the small evidence bundle, then retire owned workspaces, servers, profiles, and unused large captures under the recorded retention policy. Never delete shared caches or user-owned artifacts. Preserve failures and all repetitions in the report, not just attractive screenshots.

## Repetitions and balanced order

Use three independent task runs for every arm/brief, with the same model/tools/fixtures and no shared context. A seed alone is not independence; a fresh context is required. When deterministic seeds are supported, preselect three and pair the same seed across the arms without claiming this guarantees identical randomness.

For every brief, use a cyclic order across repetitions: no-skill/current/candidate, current/candidate/no-skill, candidate/no-skill/current. Rotate the starting cycle by brief index and predeclare the order so machine load or evaluator fatigue does not always favor an arm. Do not expose these labels to reviewers. Use a separately recorded randomization seed to assign neutral artifact IDs and comparison sides; balance each arm's left/right appearances within one placement. Reviewer presentation order must not reveal task execution order. Sequential runs are acceptable and avoid resource contention; if concurrent, use the same bounded concurrency and isolated ports/profiles in all arms.

Report variability per brief and repetition, not only a pooled average. Pair outputs on brief/repetition; never compare each arm's hand-picked best output. Do not replace a run for ordinary bad design, tool choices, timeout, or failed validation. The rubric specifies the narrow infrastructure-only rerun policy and how to handle contaminated or revised cohorts.

## Actual loaded context

Measure each completed task, including failed tasks that reached a final outcome; keep interrupted tasks separately identified. Installed payload size is not task context cost. Capture:

- Initial automatically injected skill text, entry point, and each reference/script/resource actually delivered to the agent, with source identity and a content hash or immutable excerpt record.
- Every visible resource read, including rereads, truncation, tool-return wrappers, automatic expansion, compaction summaries, and whether the resource was delivered in full or partially. A file that exists but was never loaded contributes no loaded-skill bytes.
- Provider/harness reported total input tokens, cache-read tokens and output tokens when available, with model/tokenizer and semantics. Cumulative input can include the same text on many requests; cache reads are not zero context. Keep these measures distinct from unique skill content.
- Skill-attributable delivered tokens when trace attribution is available. Record both unique loaded skill content and cumulative delivered skill content; do not count a tool result's unseen truncated remainder. Keep task data, common harness instructions, source, and reviewer context separate.

If the harness cannot attribute tokens, report known UTF-8 bytes/characters of delivered skill excerpts as a proxy, label it as such, and mark token attribution unknown. Do not turn installed bytes into claimed tokens or assume no-skill overhead is zero. If automatic context loading cannot be audited, report the isolation/context limitation; do not claim a measured savings. Summarize median and range per arm and per brief, with missing measurements and total task input separated from skill-attributable input.

## Minimal record contract

Plain JSON/Markdown records and existing tool logs suffice. An owner can use this structure without implementing a new runner:

```json
{
  "run_id": "owner-assigned",
  "manifest_hash": "recorded-before-trials",
  "task_id": "neutral-task-id",
  "brief_id": "selected-id",
  "repetition": 1,
  "artifact_id": "blind-artifact-id",
  "arm": "custodian-only mapping; omit from reviewer copy",
  "agent_status": "completed | timed_out | infrastructure_interrupted",
  "task_outcome": "verified_success | failed | incomplete_evidence",
  "assertions": [
    {
      "id": "scenario-assertion-id",
      "result": "pass | fail | unverified | not_applicable",
      "category": "task | authority | data | accessibility | design",
      "evidence_type": "source | rendered | behavioral | measured | inference",
      "evidence_path": "retained trace/capture/observation reference",
      "observation": "what happened, where, and in which runtime/state"
    }
  ],
  "context": {
    "loaded_skill_resources": [],
    "unique_skill_utf8_bytes": null,
    "cumulative_delivered_skill_utf8_bytes": null,
    "skill_attributable_tokens": null,
    "total_task_input_tokens": null,
    "cache_read_tokens": null,
    "output_tokens": null,
    "measurement_semantics": "unknown until the harness supplies evidence"
  },
  "elapsed_seconds": null,
  "review_records": [],
  "unverified": [],
  "contamination_or_replacement": null
}
```

Use actual values in records; the sample is a schema illustration, not a completed result. Include dimension scores and independent pair preferences in `review_records`, with reviewer provenance, left/right IDs, task win versus design preference, rationale, disagreement and adjudication. Keep the custodian's arm map separate until blind review is finished. Publish all per-brief outcomes, noncompensable failures, unresolved observations, actual context measurements and the exact adoption decision from `evals/RUBRIC.md`. The source Taste evaluation material is a set of briefs and a manual procedure, not an automated runner; neither that material nor Taste's own reported study establishes a quality benefit for Peccable.
