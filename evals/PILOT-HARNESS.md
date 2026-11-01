# Repository-only pilot agent harness

`pilot-agent.mjs` exports `runTask(contract)`, a real model/tool loop for this pilot. It uses the locally installed omp **18.14.2** runtime packages, not a source-to-files simulation, template answer generator, or application-specific test runner. It is evaluation maintenance code, not part of the installable skill. It does not itself decide task success, design preference, replacement eligibility, or adoption; those remain the frozen `RUBRIC.md` procedure. A `completed` agent status is not a `verified_success` evaluation result.

Implementation presence is not verification. Per-run manifests, preflight receipts, immutable trial records, and blind-review reports establish which paths executed and whether their observations are valid. Invalidated cohorts remain evidence of measurement failure, not adoption or regression.

## Runtime and source findings

Use **Bun**, not plain Node, to run the worker: the installed packages export TypeScript source and use Bun APIs. Resolve dependencies from an explicit installed module root; no repository dependency installation or universal runtime project dependency is introduced. The runner imports these exact files below that root:

- `@oh-my-pi/pi-agent-core/src/index.ts`: `Agent`.
- `@oh-my-pi/pi-ai/src/index.ts`: `streamSimple`, `type` (the parameter-schema builder re-exported from omptype).
- `@oh-my-pi/pi-catalog/src/models.ts`: `getBundledModel`.

It checks `package.json` for `pi-coding-agent`, `pi-agent-core`, `pi-ai`, and `pi-catalog`, requiring version `18.14.2`. It logs each manifest hash, Bun/Node runtime versions, and its own source hash. The default module root is the existing local installation; sandbox launchers should explicitly pass `/runtime/node_modules` instead. Record launcher, browser harness and worker hashes separately in the run manifest.

Source anchors are relative to those installed packages, not mutable upstream documentation:

| Source | Verified API or behavior |
| --- | --- |
| coding-agent `package.json`, lines 30–59 | `omp` CLI entry is `dist/cli.js`; SDK imports point at `src/index.ts`; installed version is 18.14.2. |
| coding-agent `src/cli/args.ts`, lines 356–390; `src/cli/flag-tables.ts`, lines 136–218 | `--no-session`, `--no-tools`, `--no-extensions`, `--no-skills`, `--no-rules`, `--no-context-files`, `--no-title`; `--mode json`, `--provider`, `--model`, `--system-prompt`, `--tools` are actual flags. |
| coding-agent `src/modes/print-mode.ts`, lines 167–171 and 360–362 | JSON print mode writes the session header and event JSON records. This is a trace interface, not an OS sandbox. |
| coding-agent `src/sdk.ts`, lines 547–899 | `createAgentSession` accepts a resolved `model`, literal `systemPrompt`, `customTools`, `skills: []`, `rules: []`, `contextFiles: []`, `noContextFiles: true`, `promptTemplates: []`, `slashCommands: []`, `disableExtensionDiscovery: true`, `enableMCP: false`, `enableLsp: false`, `enableIrc: false`, `toolNames`, `restrictToolNames: true`, `allowRestrictedCustomTools: true`, explicit settings/session/auth objects. A literal SDK `systemPrompt` replaces rendered defaults. CLI custom-prompt wrapping must not be assumed equivalent. |
| coding-agent `src/sdk.ts`, lines 1882–1962 | Even when normal skill/context discovery is bypassed, full session startup contains repository, watchdog and advisor discovery paths. Built-in file/exec tools also have broader capabilities than this pilot needs. |
| core `src/agent.ts`, lines 112–245, 402–414, 555–614, 970–973, 1582–1583 and 1630 onward | Explicit initial state, tool array, model, thinking effort, `getApiKey`, `streamFn`, deadline, session ID, subscription, prompt and abort APIs. No coding-agent session discovery is involved. |
| core `src/types.ts`, lines 1140 onward and 1288–1317 | Custom tools carry parameter schemas, `execute`, an exclusive concurrency policy and explicit intent policy; events include full messages/tool start/end/updates. |
| catalog `src/models.ts`, lines 17–24 and 57–60 | `getBundledModel(provider,id)` is the exact bundled lookup, with no runtime discovery or local model-cache overlay. Missing rows must be checked. |
| ai `src/types.ts`, lines 502–508, 658–679, 724–735, 1277–1338 and 1674–1697 | Generic requested output-token hint; payload/response/raw-SSE observers; assistant model, usage and stop metadata; delta events carry growing `partial` messages, while done/error events carry final state. |
| ai `src/providers/openai-codex-responses.ts`, lines 1515–1522 | `maxTokens` is intentionally not forwarded: the backend rejects caller-supplied output caps. Sampling controls, including temperature, are also dropped. A generic API option is not enforcement for this provider. |
| core `src/agent.ts`, lines 837–841 | `PI_DIALECT` can affect tool calling even in the low-level runtime. Clear inherited environment rather than assuming only SDK discovery settings matter. |

Do **not** use the installed README's stale `getModel` import from pi-ai. The harness uses `getBundledModel('openai-codex', 'gpt-6.1-sol')` from pi-catalog, checks exact equality, records the complete resolved model and its hash, and refuses a model switch at dispatch/auth resolution. It records each assistant model/upstream-model/response ID and each observed raw `response.model`. An absent raw response-model field remains unknown. Neither the catalog selector nor a provider's model echo freezes provider weights or proves a stable backend build.

For non-pilot manual inspection, a source-supported CLI shape is `omp --print --mode json --provider openai-codex --model gpt-6.1-sol --thinking low --no-session --no-extensions --no-skills --no-rules --no-context-files --no-lsp --no-title --tools read,edit,write --system-prompt <literal> <brief>`. This is **not** the isolation mechanism used by this pilot: it retains coding-agent startup behavior and built-in tools and is not a substitute for the bounded runner. `--tools` is a tool selection flag, not proof of a secure filesystem/network boundary.

## Mandatory owner launch boundary

`runTask` is an agent, **not a sandbox launcher**. Invoke it once per fresh subprocess inside the owner's minimal bubblewrap namespace. Its required `isolation.kind = 'bwrap'` record is a reference to owner evidence, not self-certification that a namespace is sound. Never score a task merely because this field exists.

Mount only:

1. This trial's disposable starter/workspace, writable.
2. This arm's frozen skill snapshot, read-only, outside the workspace; omit the mount entirely for no-skill.
3. The runner/worker source and required installed runtime packages, read-only.
4. Required Bun/system libraries, minimal device/proc support and trust store.
5. This trial's private home/tmp and evidence destination, outside the two model-readable roots.

Do not bind the evaluation checkout, real home, global agent config, auth database, sibling trials, old/new fixture suites, expected values, reviewer material, parent process artifacts, or broad host `/` tree. A successful broad-root bwrap probe establishes capability only; it is not acceptable trial isolation. A single per-trial root containing `workspace/`, `home/`, and `evidence/` is acceptable only because tools are confined to `workspace/` and the selected separate skill root; do not place evidence/home within the workspace. Preflight mount contents and symlink/hard-link behavior independently. Never expose full runtime filesystem paths through an arbitrary file/exec tool.

Use an environment allowlist with a fresh HOME/TMPDIR and no inherited `PI_*`, `OMP_*`, provider overrides, profile selectors, proxy settings or global startup context. Allow only explicit runtime, credential transport and bounded browser-RPC variables needed by the worker. A fresh process, UUID session and fresh provider-state map prevent previous messages, cache state and local model sessions from being reused; they do not claim that the provider has no server-side caching.

No terminal, shell, arbitrary JavaScript/Python evaluation, package installation, deployment or generic network tool is registered. The author can read/edit local files and, only when permitted, invoke the narrow browser adapter. Provider networking is SDK-owned, not an author tool. The agent namespace isolates mounts/PIDs but shares networking for provider access and the host browser bridge; it does **not** implement or prove a destination firewall/provider-only outbound ACL. The absence of a model-facing fetch tool constrains model authority, not runtime network reachability. The browser uses its local HTTP-origin proxy and outer bubblewrap filesystem boundary; those controls are not a general runtime destination firewall. Record these actual boundaries without claiming stronger network isolation.

The owner must retain partial traces and the process exit status on a hard kill and implement a hard wall-clock watchdog in addition to the cooperative `deadline`/abort inside the agent. Module import, a blocked filesystem operation or a broken transport cannot be bounded reliably by a JavaScript timer alone.

## Contract

```js
const result = await runTask({
  taskId: 'neutral-task-id',
  workspace: '/trial/workspace',
  skillRoot: '/skill', // null for no-skill; same mount mechanism for current/candidate
  runtimeRoot: '/runtime/node_modules',
  model: { provider: 'openai-codex', id: 'gpt-6.1-sol' },
  thinking: 'low', // freeze across all arms
  systemPrompt: frozenCommonSystemPrompt,
  brief: selectedAgentBrief,
  fixture: selectedInputFixture,
  mode: 'edit', // 'read-only' or 'no-runtime' where required by the brief
  allowedWritePaths: selectedPermissionMode.source_writes, // exact relative file paths; [] for read-only
  browserAdapter: authorizedBrowser ? authorizedBrowser.tools : undefined,
  logPath: '/trial/evidence/trace.jsonl', // parent exists; path must not exist
  maxSeconds: frozenWallClockLimit,
  maxTurns: frozenTurnLimit,
  maxToolCalls: frozenToolLimit,
  maxOutputTokensPerCall: frozenRequestedTokenHint, // unsupported by this Codex backend
  maxResponseBytesPerCall: frozenDeliveredDeltaByteThreshold,
  maxTraceBytes: frozenJsonlByteCeiling,
  isolation: { kind: 'bwrap', evidence: ownerIsolationRecordReference },
  getApiKey: async requestedModel => ownerCredentialAccessor(requestedModel),
});
```

`maxSeconds`, `maxTurns`, explicit thinking, model, common prompt, brief, mode and credential callback are required. Defaults are 200 tool calls, a **requested** 16000-output-token hint, a 262144-byte per-response delivered-delta abort threshold, and a 7340032-byte (7 MiB) JSONL trace ceiling. `maxTraceBytes` must be at least 65536. Freeze explicit identical values for all arms in the manifest rather than relying on defaults. `maxOutputTokensPerCall` is passed as `streamSimple`'s `maxTokens`, but **openai-codex-responses drops it**: supported=false, hardCap=false. It is not a maximum the client or provider guarantees. Optional `temperature` is recorded as requested but is also unsupported/dropped by this backend. No deterministic seed is supplied or claimed. `fixture` must be a JSON value, not a path to the suite or evaluator data. The input fixture is serialized as task data, not elevated system instructions. Do not put arms, expected values, rubric, reviewer instructions or other tasks into these fields.

`maxResponseBytesPerCall` counts UTF-8 bytes in received assistant text, thinking and tool-argument **deltas** and requests client abort after crossing the threshold. It is not a token count, a cap on hidden thinking, a transport-frame/memory ceiling, or a backend generation cap: a delivered chunk can overshoot, abort is cooperative, and actual provider usage may exceed any requested token hint. End/error/final-message state remains retained unless the separate trace ceiling is reached. The client can abort on wall time and delivered bytes; it cannot assert a hard Codex token cap from usage unavailable during streaming. Keep the owner hard wall watchdog as well as the existing turn/tool-execution bounds.

`limits` records the six exact requested values. `limitCapabilities` is logged in configuration and returned both at result top level and in `context`; it identifies the unsupported token hint and distinguishes cooperative wall/response aborts from the local trace write ceiling. `observedLimits` returns `deliveredAssistantUtf8Bytes`, `responseUtf8Bytes` (per dispatched call), `traceBytes`, `traceComplete`, `omittedTraceEvents`, and `omittedTraceUtf8Bytes`. These are byte observations, not token estimates. `usage` and `context.actualUsage` preserve actual per-assistant reported usage; missing usage remains unknown.

Permission mapping is exact:

| Mode | Tools |
| --- | --- |
| `read-only` | `list_files`, `read_file`; browser rejected; no author writes or execution. |
| `no-runtime` | `list_files`, `read_file`, `write_file`, `edit_file`; browser rejected; no execution. |
| `edit` | Same source tools, plus `browser` only if an authorized adapter is explicitly passed; still no terminal/execution tool. |

`allowedWritePaths` is required. It is an explicit array of authorized relative file paths, never an implicit whole-workspace grant. Empty arrays authorize no files. Globs and parent traversal are rejected. Both write and edit check the normalized path against this allowlist before touching directories or files. The custodian's exact `source_writes` list must be passed unchanged; broader terminal permission does not broaden file-write authority in this bounded runner.

Each file tool uses relative paths and an explicit `workspace` or read-only `skill` root; write/edit never accept a root selector. Traversal, absolute paths, symlink components, special files and hard-linked ordinary files are rejected. Files are capped at 2 MiB. Read calls require inclusive positive line numbers; a response exceeding 64 KiB fails with a narrowing request, not silent truncation. Directory listing is one level with a 1000-entry limit. Exact edit requires one unambiguous `oldText` occurrence; whole-file write is also available. Tools are exclusive so file edits do not race each other. OS isolation remains mandatory: these checks do not defend against an authorized external process deliberately racing path components.

Both skill arms get the same short wrapper requesting `skill/SKILL.md` through `read_file` and selective reference reads; only the mounted frozen resource differs. Payload text is not automatically injected, and no extra references are force-loaded. No-skill gets no skill root and no skill invocation. The exact resolved common/arm wrapper, prompt and tool names are logged. The current/candidate initial read request is lines 1–200, followed by further reads as needed; an oversized response is not silently delivered partially.

The browser interface is deliberately not a general evaluator:

```js
browserAdapter = {
  actions: ['navigate', 'viewport', 'click', 'fill', 'select', 'keyboard', 'read', 'screenshot'],
  invoke: async (action, args, { signal }) => ({
    content: [{ type: 'text', text: JSON.stringify(observation) }],
    details: observation,
  }),
};
```

Image responses use `{type:'image', data:base64, mimeType:'image/png'}`. The runner's browser tool accepts `action` and `argsJson`; unknown actions, nonobject arguments, non-text/image blocks and results above 8 MiB are rejected. `pilot-browser.mjs` owns action-specific argument validation, local-origin enforcement and browser lifecycle. The worker may proxy this interface to that owned adapter but must not expose its raw browser/page or evaluation API to the model. Browser failures remain tool failures in the trace. No application-specific evaluator assertions run inside the author agent.

## Existing auth, without copying the store

Resolve auth **on the host**, not in the sandbox. These are source-verified APIs, not a reason to mount global credentials:

- coding-agent `src/sdk.ts:1074–1088`: `discoverAuthStorage(explicitAgentDir, {cwd: neutralHostDirectory})` opens the existing configured store/broker and applies effective auth policy. Its default local store is `<agentDir>/agent.db`; use the owner's actual resolved agent directory, not a guessed default profile.
- ai `src/auth/types.ts:480 onward` and `:953`: `auth.keys.get(provider, sessionId, {baseUrl, modelId})` resolves an access key/token, with model-scoped options and existing OAuth refresh/routing.
- ai `src/auth-storage.ts:281–283`: `auth.close()` retires the host storage instance.

A host-only integration shape is:

```js
const auth = await discoverAuthStorage(actualAgentDir, { cwd: neutralHostDirectory });
try {
  const token = await auth.keys.get('openai-codex', freshSessionId, {
    baseUrl: resolvedModel.baseUrl,
    modelId: resolvedModel.id,
  });
  // Transfer only this access token through an inherited private FD, or an
  // explicitly protected child environment. Do not print it or write a file.
} finally {
  auth.close();
}
```

Keep store reads, configured auth commands and refresh traffic outside the bounded author process. The worker supplies `getApiKey`, returning only the needed access-token string; the runner refuses absent/non-string credentials and does not discover auth or fall back to ambient provider keys. A long task with an expired one-shot token may fail; preserve that failure or use the owner's private credential broker rather than exposing refresh tokens. Never send the token in task JSON, command-line arguments, traces, repository files or review packets. An env transport should be read into a private worker closure and removed from `process.env` before author work; an inherited FD avoids environment exposure. The runner retains returned token strings only in memory for exact credential redaction if a provider error unexpectedly echoes one. Raw HTTP authorization headers and full response headers are not logged. Credentials must never be part of model metadata.

## Trace, context cost and failures

The agent synchronously appends JSONL records to a newly created mode-0600 `logPath` outside model-readable roots. Existing trace paths are rejected. There is no deferred write queue that would lose an entire trace on a killed process. Retain the file and outer process stderr/exit metadata separately, guarding stderr for unexpected credential disclosures. Writes never exceed `maxTraceBytes`; up to 1 MiB (or one quarter of a smaller ceiling) is reserved for terminal metadata. The first record that cannot fit the ordinary allowance triggers `trace_byte_limit`, aborts the agent, and writes `trace_limit` with the rejected record's type, serialized UTF-8 bytes and hash. Subsequent unretained records are explicitly counted; `traceComplete=false` means mandatory evidence is missing, never a silently complete transcript. A full `run_end` that cannot fit is replaced by a compact terminal record with `summaryOmitted=true`, an omission declaration, and a requirement to use the separately owner-retained returned result. Trace exhaustion is `limit_reached`, not a successful task or an infrastructure-only label. At the default ceiling 63 trace files total at most 441 MiB; this is not a ceiling on screenshots, returned results, or other cohort artifacts.

Records include:

- `run_start`, `configuration`: UUID, package/runtime/harness versions, full resolved model/hash, exact prompt/system wrapper, tool names, permission mode, limits and the owner-provided isolation record.
- `agent_event`: actual streaming deltas and lifecycle metadata without repeatedly serializing growing `message_update.message` or `assistantMessageEvent.partial`; end/error events and completed messages retain final state, including a failed provider's partial answer. Trace exhaustion explicitly marks missing evidence rather than silently dropping it.
- `resource_read`: actual selected source version/hash, relative identity, line interval, exact source-byte interval, excerpt hash/UTF-8 bytes and full/partial status. A read performed by the tool but never emitted as a successful tool result is not counted as delivered context.
- `tool_delivery`: hashes/UTF-8 sizes for actual serialized tool-result blocks, text hashes/sizes and decoded image hashes/sizes. Source excerpt bytes and SDK tool-wrapper bytes are distinct measurements.
- `provider_context`, `provider_payload`: actual low-level context and observed outbound payload/hash for each request. These distinguish a tool result present in transcript from one actually included in the next provider request. Payload callbacks may be unavailable on a provider failure before dispatch; missing evidence is unknown, not zero.
- `provider_response`, `provider_response_model`: response status/request ID and raw reported model where available; no secret headers.
- `trace_limit`: explicit trace-ceiling evidence and rejected-record identity when reached.
- `run_end`: status, stop cause, exception, elapsed time, limit capabilities, observed bytes, complete response/usage list, resource records, handoff and trace reference, or an explicitly marked compact terminal record if the full summary cannot fit.

`result` contains the full final summary, even if the trace could retain only compact terminal metadata; the owner must retain the returned result separately. `observedLimits.traceBytes` in a `run_end` record describes bytes before that record; the returned result includes the final file byte count. `status` is one of `completed`, `timed_out`, `limit_reached`, `agent_failed`, `incomplete`, `infrastructure_interrupted`. A provider-reported output-length stop is `incomplete`; it does not prove the requested output-token hint was honored. Explicit time/turn/tool/delivered-response-byte/trace-byte bounds abort the agent without relabeling them successes. Byte/trace limit stops use `response_byte_limit`/`trace_byte_limit`. Provider error/abort stop reasons and `agent.state.error` remain failures. Exceptions preserve name/message/stack/code; filesystem trace persistence failures reject rather than fabricate a successfully retained trace. The owner must retain host-killed tasks without `run_end` and must not make an automatic rerun eligibility decision from a status label alone.

`usage` is an array of per-assistant pi-ai usage objects, not inferred tokens. Catalog `src/types.ts:210 onward` defines `input` as noncached input, `cacheRead` as cache-read input, `cacheWrite` as cache creation, and `output` as output including thinking/text/tool arguments; `totalTokens` may also include provider orchestration. Preserve these buckets and any provider-specific fields. Do not report `input` alone as all input or silently assume missing usage is zero. There is no skill-attributable tokenizer estimate: `skillAttributableTokens` is null. Unique skill UTF-8 bytes use the union of delivered source-byte intervals per relative resource/source hash; cumulative skill bytes include actual rereads. Both refer to transcript-delivered excerpts, with provider-request inclusion separately auditable. Images, tool wrappers, common instructions and task data are not misclassified as skill source bytes. There is no compaction, summary carryover or local tool-result truncation; provider input transformations remain observable metadata rather than an asserted zero.

## Browser and oracle measurement boundary

The browser explicitly controls and observes `en-US`, UTC, light color scheme, and device scale 1. Chrome runs with its inner sandbox disabled only inside the mandatory outer bubblewrap namespace. Record this boundary rather than claiming Chrome's inner sandbox remains active.

Author browsers navigate normally. Evaluator browsers start at `about:blank`, call the custodian's `preparePage(page, scenario)` once, then navigate each scored context after clearing that origin's storage. Pre-document hooks observe service settlements and print requests before application scripts can cache those APIs. A print request is not proof of printed layout or an operating-system print dialog.

For each declared `review_states` label, the evaluator calls `context.captureState(label)` after establishing that state. The runner retains a separate full-scope PNG, context/timing metadata, and scaling observation; final captures do not replace pending, error, recovery, dialog, or print-media states. Capture limits are 8 MiB and 24 million pixels. Exceeding a limit leaves missing evidence, not a favorable crop.

The text-200 context is 320 × 900 CSS pixels. `scaleText` explicitly resets and snapshots computed font sizes before doubling them; this is controlled text scaling, not browser zoom or a complete real-user accessibility audit. Zero-sized text remains zero without a false ratio failure. Reset removes only overrides still owned by the scaler, preserving later application inline changes; identical value/priority writes are indistinguishable.

Measurement callbacks use `ensureTextScale`: an already verified snapshot is reused without DOM, focus, or scroll writes. Authored font-size/line-height dependencies, applicable rules, registered custom properties, inline mutations, parent identity, and element/pseudo-element changes detect stale baselines hidden by the overlay. Diagnostic rule positions do not determine semantic equality. Unsupported font sources remain explicitly unverified; this is not a general CSS cascade interpreter.

A necessary rebase records incoming scroll positions, resets the overlay, establishes the new baseline, and restores those positions within current geometry. It never focuses a control or calls `scrollIntoView`; existing clipped focus is not repaired. Raw before/after positions, geometric clamping, source changes, sizes, line heights, exceptions, and ratios remain auditable. Scroll-driven application reactions are not universally proven noninterfering.

Every runtime assertion carries typed `evidence.kind` and actual observations. Planning inventory equality is measured evidence; source plausibility cannot establish interaction. Free-text semantic judgments remain explicit independent-review assertions rather than unpublished wording whitelists.

Presentation labels inside data hooks are not themselves data corruption. Check complete supplied text separately from numeric values, dates, and unknown semantics. In flow measurements, hidden optional labels may be excluded, but required names/notes must remain present in visible text; visible descendants, clipping, and document overflow still determine access. Positive decorated-field and negative hidden-required-text controls exercise that boundary.

Run `validate-oracles.mjs` before setup. It snapshots inputs before importing them, validates compliant alternatives and targeted broken controls in the pinned browser, and preserves complete raw observations, state captures, source inventories, consumer-boundary controls, failures, and mismatches. Its required receipt binds cases, evaluator, browser harness, orchestrator, reviewer, Chrome, driver, validator, and raw results. Setup freezes these records; changed source or environment identities invalidate the receipt. Candidate content remains fixed throughout measurement repair.

The validator also exercises source-versus-runtime evidence, measured inventory integrity, completed versus attempted browser readbacks, incomplete authority traces, uncertain adjudication, and deterministic observations independent of packet eligibility. Projected control text must fit the registry's actual bound before readiness. These controls contain no author trace or model judgment and cannot guarantee that every future trial packet fits; validate each actual packet too.

## Blind-review context and transport

Reviewers receive neutral briefs, data, source, handoffs, assertion evidence, relevant traces, and actual final/named-state PNGs, not arm wrappers or peer judgments. Runtime assertions require measured/behavioral evidence with an actual observation. Source plausibility, a rendered-only record, or an omitted `actual` field cannot establish runtime success. Every paired citation names an existing resource from each compared artifact.

Raw measurements remain complete. Reviewer projections group conforming font/line-height tuples with multiplicities and raw-array hashes; mismatches, unknowns, and disconnected nodes remain explicit. Duplicate aggregates become resource references. Default trace projection replaces author screenshot base64 with byte/hash references; independent evaluator PNGs are supplied as images. A separately frozen supplement may recover exact author-time PNGs with successful tool-delivery and outbound-provider inclusion records. Those images do not independently establish final-artifact correctness or retroactively validate claims from later evaluator success. Audit records distinguish raw versus delivered UTF-8 bytes and actual image bytes/counts. Projection is not token attribution.

Large exact duplicate `actual` observations become references to an already supplied observation with a raw-content hash. Distinct values and every assertion result remain separate. The complete raw records remain available for citation/integrity checks. No truncation or raised packet limit is used to make a packet eligible.

Exact repeated baseline font-source diagnostics also use references to full values supplied in the same packet. Changed sources, uncertainty, and failure records remain distinct; complete raw producer files retain their hashes.


SDK payload callbacks verify the requested system text, text blocks, and decoded image hashes in the actual outbound body. This proves observed SDK inclusion, not backend attention, wire compression, or per-resource tokens. Preserve every call, rejected response, retry, disagreement, adjudication, usage bucket, and missing observation; report SDK catalog cost estimates separately from invoices.

Source citations may refer to the supplied brief, input, starter, artifact, or handoff; they do not establish runtime behavior. Measured inventory citations require coherent before/after hashes matching the actual artifact inventory. A browser start citation needs a successful matching completion, and readback evidence must contain actual returned state. Missing or failed calls remain unverified. An adjudicator's uncertainty supersedes a disputed manual failure, but never an independently observed runtime failure.

Blind traces explicitly disclose omitted permitted-context reads without revealing their contents or treatment identity. Their absence cannot establish that an author's claimed read never occurred. A diagnostic custodian check is not a replacement blind vote.

`review-pilot.mjs reconcile` writes an offline, source-hashed supplement in a new external directory. It preserves original outputs, reuses original votes, and does not create new preferences or certify adoption. Packet failure no longer discards separately integrity-checked deterministic observations.

### Targeted supplemental review

`recovery-evidence.mjs` exports `collectRecoveryEvidence` for a new external output directory. It checks the original freeze and artifact/evidence inventories, snapshots producers before import, and collects original author images, content-free read attestations, current dialog/data observations, and native print PDFs. The receipt is custodian-only; only explicitly indexed resources enter sanitized packets. Native remeasurement includes every artifact in each affected brief, not favorable repetitions.

`claimAttestation` checks assigned frozen source bytes, the matching read request, successful completion, and exact excerpt delivery to the transcript. Resource metadata may precede the SDK start event; completion and delivery must follow both. A separately source-hashed correction may replace only these attestations while retaining native evidence unchanged. Publish neither guidance contents nor shared guidance hashes, sizes, paths, or treatment labels. Supported delivery does not establish comprehension, use, or broader honesty.

Print recovery honors CSS page size, retaining the pinned driver default when absent. `render-recovery-pdf.py` uses `pypdfium2` 5.14.0 and Pillow 12.1.1; the run records Python, native PDFium, executable, and package inventories. Execute it in a networkless namespace with only its exact runtime and input mounted read-only, a dedicated writable output, and no real home or credentials. Render every page at 96 dpi without cropping or selecting a favorable range. Partial output is retained but excluded from affirmative print proof. Physical printer and OS-dialog behavior remain unobserved.

After native validation and an exact-source real-provider protocol probe:

```sh
bun evals/review-pilot.mjs prepare-supplement --manifest ABS_ORIGINAL_MANIFEST --accept-freeze ORIGINAL_SHA256 --scope ABS_SCOPE --evidence ABS_COLLECTOR_RECEIPT --renderer ABS_RASTER_RECEIPT --validation ABS_NATIVE_RECEIPT --probe ABS_PROTOCOL_RECEIPT --out ABS_NEW_DIRECTORY
bun ABS_NEW_DIRECTORY/frozen/harness/review-pilot.mjs supplement --plan ABS_NEW_DIRECTORY/plan.json --accept-plan PLAN_SHA256
```

Preparation checks every actual packet against the unchanged text/image bounds, atomically replaces superseded evaluator resources, and freezes neutral packets, image identities, producer sources, reviewer/rubric, validation bindings, and renderer environment. It never fills a failed current capture with an unlabeled historical image.

The accepted scope selects manual assertions before scored calls. Two independent contexts review each selected artifact; an independent context adjudicates result disagreements. Missing required fresh votes or adjudication remain unverified unless a deterministic failure is independently established. Empty, failed, scope-only, or uncorroborated custody metadata is not affirmative measured proof. Author-time/read attestations support authority claims, not final task facts or interaction.

Original votes, results, artifacts, and pair preferences remain unchanged. Retain every new raw response, rejected attempt, disagreement, usage bucket, and actual outbound text/image inclusion record. A finalized accepted plan resumes without new provider calls. Supplemental task counts are evidence reconciliation, not a new matched experiment, reranked preferences, or an adoption decision.

#### Recovering a rejected panel without new individual reviews

Individual requests identify the scored subset in `requested_assertion_ids`; other supplied assertions remain context. A retained panel may instead contain complete canonical assertion sets rejected by the earlier subset-only decoder. Preserve those rejections and their costs; do not silently relabel the original run.

```sh
bun evals/review-pilot.mjs prepare-panel-recovery --plan ABS_ORIGINAL_PLAN --accept-plan ORIGINAL_PLAN_SHA256 --probe ABS_NEW_EXACT_SOURCE_PROBE --out ABS_NEW_RECOVERY_DIRECTORY
bun ABS_NEW_RECOVERY_DIRECTORY/frozen/harness/review-pilot.mjs adjudicate-panel-recovery --plan ABS_NEW_RECOVERY_DIRECTORY/plan.json --accept-plan RECOVERY_PLAN_SHA256
```

Preparation requires unchanged validated consumer predicates, native producers, original packets, requests, source inventories, and historical responses. The new source must pass an exact-source provider probe and positive/negative decoder controls. For each fixed artifact/reviewer slot, select the first retained attempt with valid request bindings, schema, citations, and either exactly the targeted IDs or the complete canonical set. Validate ignored canonical assertions too; reject duplicates, unknown IDs, missing targets, and arbitrary partial supersets.

Freeze selection and disagreement inputs before adjudication. Make no new individual or author calls. Adjudication may return disputed IDs plus known canonical context IDs, but only disputed IDs contribute votes; strict schema, citation, and uniqueness checks still apply. Missing required votes remain unverified. Retain ignored assertions, rejected alternatives, selection reasons, every actual request, raw usage, and separate historical/new costs. A finalized recovery resumes without provider calls. This is a supplemental interpretation of existing evidence, not a repaired historical result or a new adoption experiment.



## Owner verification before adoption evidence

Verify the integration with actual provider calls, namespace/tool denials, overlapping resource reads, native browser interactions, deadline and hard-kill trace retention, and isolated browser state. Validate semantic positive and negative oracle controls before scoring. The manifest requires the successful oracle receipt and exact review implementation's real-provider JSON probe. Then freeze and execute the registered 63 tasks and independent blind review/adjudication. Report unavailable evidence and invalid observations; do not alter `RUBRIC.md`, its thresholds, or a frozen cohort to accommodate outcomes.
