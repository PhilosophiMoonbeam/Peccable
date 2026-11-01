# V3 final evidence-recovery supplement

**Do not adopt this candidate from this pilot.** The recovered evidence verifies 11 of its 21 tasks; four fail noncompensable requirements and six lack required evidence. Known failures alone defeat the all-21-success prerequisite. Relative design benefit remains unestablished.

This is a separate supplement to the [original V3 pilot](pilot-2026-10-31-v3.md) and [first evidence repair](pilot-v3-evidence-repair.md), not a rewritten experiment. The original formal label remains `inconclusive`. Candidate, baseline, fixtures, rubric, adoption thresholds, author artifacts, original votes, and pair preferences are unchanged. No author trials, additional favorable repetitions, comparative reviews, or optional installed resources were introduced.

[Structured report](pilot-v3-final-recovery.json): all 63 task outcomes, every failed or uncertain assertion, source bindings, selections, adjudications, independent audit, and all 160 new call metadata records. Full raw responses and native evidence have bounded local retention.

## Recovered task outcomes

| Arm | Verified | Failed | Incomplete evidence |
| --- | ---: | ---: | ---: |
| no-skill | 11 | 4 | 6 |
| current | 12 | 4 | 5 |
| candidate | 11 | 4 | 6 |

Task success follows the frozen rubric's task, authority, data, and accessibility gates. All 35 failed assertions remain recorded: 16 noncompensable and 19 design assertions. Design failures do not silently become task failures; their counts are seven no-skill, seven current, and five candidate. These supplemental counts are evidence reconciliation, not treatment-effect estimates or newly reranked pair preferences.

Unverified assertions fell from 108 in the original review to 51 in the first repair and **33 here: 18 fewer than the prior repair**. This is a net evidence change, not 18 new successful trials. Fifteen remaining assertions concern accessibility and eighteen authority.

| Remaining assertion | Unverified artifacts |
| --- | ---: |
| `V3-02-authority` | 1 |
| `V3-03-authority` | 6 |
| `V3-03-communication` | 9 |
| `V3-04-authority` | 9 |
| `V3-04-communication` | 6 |
| `V3-07-authority` | 2 |

The candidate's V3-02/R1 authority gap is irrecoverable from retained data: artifact `20b4ec4ab3484b255bd9` has a 6,286,040-byte trace with five omitted events totaling 511,446 bytes. A favorable author rerun would not repair that original outcome.

## Candidate blockers

| Brief / repetition | Artifact | Observed noncompensable failure |
| --- | --- | --- |
| V3-01 / 1 | `4e58e4492da2d4a34234` | Required disclosure semantics/name; decorative glyphs enter the accessible name. |
| V3-04 / 2 | `829a49dd98d64599226c` | Essential settings communication is horizontally clipped at controlled 200% text scaling. Both selected reviewers fail `V3-04-communication`. |
| V3-07 / 1 | `46b892cc099ebecd5ffc` | Required method-control accessible names differ from the specified names. |
| V3-07 / 3 | `2220c1baf22a4a2b9a28` | Required method-control accessible names differ from the specified names. |

The three native accessible-name failures independently block adoption. The settings failure is a separate manual judgment grounded in supplied images; passing keyboard interactions do not erase clipped essential text. Every baseline failure and negative design judgment is also retained in the structured report.

## Measurement repair and evidence delivery

Two real measurement defects were reproduced on unchanged candidate V3-04/R1, artifact `15f06e7101d8058e5312`: redundant scaling reset window scroll from 693 to 0; a necessary Large-font rebase reset modal scroll from 550 to 0 and window scroll from 693 to 244. These were measurement effects, not evidence that the author moved focus incorrectly.

`ensureTextScale` now reuses valid snapshots without DOM, focus, or scroll writes. Necessary rebases detect masked authored font/inheritance changes and restore incoming scroll positions within current geometry, without focus changes or `scrollIntoView`. Both reproduced paths preserve their original focus geometry and scroll after repair. Twenty-nine native controls include application font changes, registered custom properties, inheritance, index-only rule shifts, zero sizes, and proof that pre-existing clipped focus is **not** repaired. Unsupported font sources remain unverified; scroll-driven application side effects are not universally excluded.

The collector preserved all 63 author artifacts and released 341 indexed resources with no final collection failures: 40 original author PNGs with successful tool delivery and actual outbound-provider inclusion, 54 current final PNGs, 126 named-state PNGs, and 18 each of native evaluation and scaling records. Current modal and data capture includes all nine artifacts per affected brief, not selected repetitions. Real Tab, PageUp, PageDown, and Escape observations supplement modal evidence without adding an acceptance criterion.

Four permitted-read claims are supported by exact frozen source/excerpt hashes, matching requests, successful completions, and transcript delivery. The initial unknown statuses came from assuming SDK start preceded resource metadata. Corrected ordering requires completion/delivery after both; three negative controls still return unknown. No native capture was rerun for this metadata-only correction. Blind attestations disclose no guide contents, paths, sizes, shared hashes, or arm labels. Delivery is not proof of comprehension or general honesty.

All nine print artifacts produced 11 native PDF pages. Networkless, read-only-input rasterization rendered every page at 96 dpi, with no favorable crop or page selection and no failures. Pins: Python 3.14.7, pypdfium2 5.14.0, Pillow 12.1.1, native PDFium 156.0.8076.0. Physical printers and OS print dialogs remain unobserved.

## Review failure, strict recovery, and adjudication

The first supplemental panel had 68 logical reviewer slots and 136 actual attempts. **Every response passed strict JSON schema but returned the complete canonical assertion set, which the narrower subset-only decoder rejected.** The original failure records and cost remain unchanged; the unusable intermediate count summary is not an outcome improvement.

A separate frozen recovery plan selects the first request/schema/citation-valid retained response per fixed artifact/reviewer slot. Exact target sets or complete canonical sets are allowed; only the predeclared 72 target assertions contribute new votes. All canonical extras receive citation validation before being ignored. No result-based selection or new individual-review calls occurred.

Independent audit reconciled all 136 requests, raw hashes, model/SDK identities, ID sets, and outbound text/image inclusion. Four responses have out-of-bounds trace citations: two first attempts require fallback, and two unselected second attempts remain rejected. Selection uses attempt 1 for 66 slots and attempt 2 for two; 64 other attempts qualify but are not selected. All historical rejections remain historical rejections.

Two selected reviewers disagree on 13 assertions across 11 artifacts. Disagreement inputs and the canonical-extra adjudication rule were frozen before new calls. Eleven independent adjudicator contexts required 12 attempts; one response cited an absent authority record and was rejected before retry. Seven adjudicated assertions remain unverified. Missing evidence is neither a pass nor misconduct. A finalized-plan resume returned the same result without additional provider calls.

Before scoring, the registered native receipt passed 67 semantic fixtures, 193 native observations, 29 scaling controls, 33 evidence-admission controls, and 67 packet-text checks, with zero mismatches, errors, or visual gaps. Recovery preserves the exact 94,620-byte validated consumer/client/merge block and native producers, adds 13 decoder controls (three positive, ten negative), and passes a new exact-source four-protocol real-provider probe. The producer/consumer identities and inherited native receipt remain hash-bound; this is not an unreported rerun of the original benchmark.

Frozen identities:

- Original manifest: `3335c67aef5c03ad19bbc6261d2e31c533d0d4a1be15dc6d9e9a895b68cb93ea`.
- Original supplemental plan: `2b36cc529db406a69ae17420c068ecf81fed8ce02e495a298626b50d34d16e53`.
- Recovery plan: `1455b81cf1f964eff1f33fcb35a2c1b24519a5b774c1c6887bb3ea974c53a5f9`.
- Recovery reviewer: `329e0ff372fe667aac5504fa1546f0c29df0782b87af42014ac5ad8d12a8c6eb`.
- Final raw recovery report: `ee75e3d90ae64c7d6d08b6f790262da8af7ac27ca7a558b71b36fe73b96395fd`.

## Context and cost

All this-round calls use independent contexts with `openai-codex/gpt-6.1-sol`, SDK 18.14.2, and matching reported model metadata. Bun 1.4.4, Puppeteer 25.3.0, Chrome 153.0.8010.12, and bubblewrap 0.11.1 remain pinned. Source inventories and isolation boundaries are retained. A model selector does not freeze backend weights; labels do not prove treatment cannot be inferred from artifact style or claims.

| This-round stage | Actual attempts | SDK catalog estimate |
| --- | ---: | ---: |
| Protocol calibration, three exact-source probe runs | 12 | $0.1541340 |
| Originally rejected individual panel | 136 | $53.5481052 |
| Recovery adjudication | 12 | $6.9033000 |
| Total | 160 | $60.6055392 |

These are **SDK estimates, not invoices or a hard spending cap**. Requested output-token limits are hints for this provider. All 160 attempts retain normalized usage, raw provider usage, reported model, independent context, outbound hashes, and expected text/image inclusion. HTTP status/requestId objects were not retained. Orchestration/subagent cost and interrupted historical backend usage are unavailable. Prior retained pilot estimates remain separately recorded at $175.7662412; the combined recorded estimate is $236.3717804, with the same exclusions.

This round measured 28,964,221 noncached input tokens, 547,072 cache-read tokens, no cache writes, and 262,239 output tokens: 29,773,532 total. Raw provider input includes cached input; do not count it twice. Guide-attributable tokens remain unknown, not zero.

Across the 63 neutral packets, text is median 415,811 bytes, range 42,858–2,884,051; images are median 677,719 bytes, range 0–1,927,598, with at most 15 images. All fit unchanged limits; no truncation or raised bounds. Independent reference checks resolved 54 font-source and 432 actual-observation references. Actual outbound SDK bodies across all 160 calls are median 2,289,521 bytes, range 1,656–3,996,256; call latency is median 34.0895 seconds, range 2.197–100.677. These are not wire sizes, backend-attention measurements, or token savings.

Original author measurements are carried forward, not new trials:

| Arm | Median unique loaded skill bytes | Loaded-byte range | Median author seconds |
| --- | ---: | ---: | ---: |
| no-skill | 0 | 0–0 | 53.643 |
| current | 12,592 | 12,592–29,297 | 64.275 |
| candidate | 12,822 | 12,822–30,521 | 62.563 |

Loaded bytes measure transcript-delivered UTF-8 excerpts, not installed payload size or tokenizer attribution. The candidate has one incomplete trace and one unmeasured SDK-default usage record; its missing final usage is not a measured zero. Read-delivery repair does not reconstruct omitted events.

## Failure retention, verification, and resources

The raw handoff retains the interrupted first collection (exit 143 after a temporary-file `ENOENT` monitor race), its partial outputs, the insecure-`about:blank` diagnostic setup failure, two corrected temporary-driver syntax failures, initial attestation unknowns, all 136 original decoder rejections, four strict citation rejects, the rejected adjudicator response, and every successful/superseded probe. None is charged to author performance or silently erased.

The actual documented installer succeeded into a configured path containing spaces; all 15 installed files match the frozen candidate byte-for-byte. Reinstallation refused the existing destination without mutation. A dangling existing destination symlink was also refused without creating its target. Root, bundled, and installed licenses retain the original bytes.

Final root checker, standard-library suite, pinned official validator, installed-payload checker/validator, command outputs, and post-cleanup state are recorded in the raw handoff's `final-verification.json` and retention sidecar, with actual results reported in delivery. These maintenance checks do not establish design quality or adoption.

Raw evidence: `/home/bbferko/.cache/peccable-final-recovery-6e9e14517f.tar.gz`. Its `peccable-final-recovery-6e9e14517f.tar.gz.json` sidecar records SHA-256, content comparison, exact expiry one day after handoff, and cleanup. The combined restored/scratch/archive budget is 2 GiB under soft monitoring, not an OS quota. Verified immutable original archives are reused; only owned disposable restored/scratch roots are retired. Shared dependency caches and unrelated processes/data are preserved.

## Adoption implication

The rule requires 21/21 verified candidate tasks, at least 14 candidate/current pair wins with at most three losses, coverage across at least five briefs, baseline conditions, and auditable isolation/context. This supplement cannot satisfy the first prerequisite and does not rerank the historical panel, where 14 candidate/current pairs remain unresolved. Therefore **do not adopt on this evidence**; do not present the historical `inconclusive` label as uncertainty about whether known failures may be ignored.

No causal quality gain, real-user benefit, token saving, or recurring need for optional assets, libraries, or installed scripts is demonstrated. Further candidate iteration must use these exposed artifacts as development evidence and commission genuinely fresh held-out evaluation before a new adoption claim.
