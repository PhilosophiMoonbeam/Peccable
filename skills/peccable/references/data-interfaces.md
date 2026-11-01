# Data interfaces

Read when designing or reviewing dashboards, analytics, operational tables, quantitative reports, or controls whose decisions depend on data. Start with the user's decision, establish the authoritative data and scope, choose an encoding, and connect the evidence to the real supported action.

## Establish what the numbers mean

- Identify the decision before choosing metrics: which request needs attention, whether capacity is sufficient, or what changed enough to investigate. A chart is optional; a few values or a working table may answer better.
- Establish the objects, relevant fields, units, expected cardinality, and meaningful thresholds from existing contracts and domain evidence. Do not invent data shapes or rules to fit a composition.
- Identify the authoritative source for each value and calculation. Repeated facts, labels, and annotations must use the same underlying meaning, not separately maintained copies.
- Make the applicable account, workspace, population, filters, time window, and time zone clear where they change interpretation. Distinguish an event's period from the time it was fetched or last updated.
- Separate observed results, provisional measurements, plans, and forecasts. Mark where prediction begins and expose supported uncertainty; do not continue a measured line into the future as though it were observed.
- Name comparison baselines: prior complete week, equivalent elapsed period, target, or minimum required coverage. An unfinished day against a full day is not a like-for-like change unless clearly described.
- Distinguish absolute change, percentage change, and percentage-point change. A rate from 20% to 25% rises by 5 percentage points or 25% relative to its baseline. A zero baseline has no finite percentage increase; show the absolute change and baseline rather than inventing 100% growth.

## Scope, aggregation, and precision

- Distinguish the whole population, filtered result, loaded page, and selected rows. Label counts and totals accordingly; a visible subset does not establish a global total.
- Use authoritative aggregates for server-paginated or partially loaded collections. Never sum the current page and label it as the filtered or account-wide total. If the aggregate is unavailable, show the known scope rather than an invented total.
- Match summary, chart, and table scopes when they are presented as the same answer. If a global summary deliberately remains unchanged by a table filter, label that difference. Do not combine values from incompatible windows or snapshots as if they reconcile.
- Respect domain aggregation: balances may be point-in-time, flows cover intervals, distinct counts can overlap, and averages or rates may need weights. For groups with 1 of 2 and 9 of 10 successes, the combined rate is 10 of 12 (83.3%), not the unweighted mean of 50% and 90%.
- Apply the contract's calculation order, precision, currency rules, and rounding mode. Aggregate authoritative values at the prescribed precision, then format for display; sum rounded line values only when those line values are themselves the authoritative amounts under that contract.
- Preserve legitimate rounding differences. Three underlying values of 1.004 display as 1.00 each at two decimals, while their authoritative sum of 3.012 displays as 3.01. Do not change that total to 3.00 merely to match the displayed rows. Explain the rounding or offer useful precision when reconciliation matters. Conversely, three authoritative ledger amounts of 1.00 total 3.00; hidden fractions cannot justify 3.01.
- Derive deltas from authoritative comparable values using the same rules. If display rounding makes the delta appear inconsistent with displayed endpoints, expose precision or explain rounding rather than substituting a false change. Rounded shares can legitimately total 99.9% or 100.1%; do not silently alter a category unless the domain specifies an allocation rule.
- Keep exports, detail values, summaries, and visual encodings consistent with their stated scope and precision. Abbreviation must not erase a decision threshold or make unequal values look equal when exact comparison matters.

### Worked boundary: a paginated invoice table

A fictional fixture contains 640 invoices in the account; 127 match the active status and date filters. Page two shows records 26–50, and three rows are selected.

- Show “26–50 of 127 matching invoices”; identify 640 separately only if the account-wide count helps the task. The page length of 25 is neither total.
- A filtered amount comes from the aggregate for all 127 matches, not the 25 loaded rows. A page subtotal or selection total is a different quantity and needs that label.
- Make selection scope explicit: “3 selected” does not mean all matching invoices. A supported “Select all 127 matching invoices” action must actually change that scope before a bulk action uses it.
- Preserve the filter and aggregation contract when moving between pages. If the result changes while browsing, communicate the changed scope or snapshot rather than implying a stable reconciliation.
- If an aggregate is still loading or failed, retain any correctly scoped available rows without presenting their sum as the final filtered amount. Apply the authoritative rounding rules above independently of pagination.

## Encode the question, not a chart template

| Decision | Useful representation and boundary |
|---|---|
| Compare quantities or rank objects | Aligned positions or lengths on a shared scale; keep identity and units visible. Use a table when exact values, several attributes, or row actions drive the task. |
| Understand change over time | Ordered time positions with a meaningful interval and scale. Preserve gaps for missing observations; distinguish per-period values from cumulative totals. |
| Compare a distribution | Bins whose boundaries and widths have meaning. Unequal-width bins require an encoding such as density that does not misrepresent frequency by area. |
| Compare parts of a whole | A stated denominator and compatible, non-overlapping parts. Do not imply a complete whole when categories are missing or overlapping. |
| Judge capacity, progress, or deviation | Show the relevant minimum, target, or limit alongside the actual value and remaining margin. Preserve overruns rather than clipping them to a completed track. |
| Inspect records and act | A table or list with the identifying field, decision-relevant evidence, and supported action together. Sorting, filtering, and selection must mean what their labels promise. |

- Preserve quantitative meaning in geometry. Bars and area encodings need a truthful baseline; a zero must not become a visible positive stub. A restricted line-chart range may help comparison when its bounds are explicit and do not disguise the change.
- Keep comparable series on comparable scales, or explicitly disclose differences. Label logarithmic or broken scales; decorative smoothing must not invent peaks, timing, or intermediate measurements.
- Make direction, units, thresholds, and series distinctions readable from labels and marks, not color alone. A rise is not automatically good: increased error rate and increased successful throughput have different implications.
- When exact values matter, provide a reachable labeled table, list, or equivalent structured alternative with the same units, scope, and important values. A hover-only tooltip or summary sentence is insufficient for auditing individual records.
- Preserve table relationships through row and column headers, stable object identity, and comparable numeric alignment and precision. Expose the active sort; distinguish sorting the loaded page from sorting the full result. Do not turn a record table into an interactive grid unless cell navigation or editing needs it.
- Reconsider representation when actual cardinality or content outgrows the composition: crowded labels, indistinguishable series, or too many independent comparisons may call for grouping, filtering, a table, or a different encoding. Keep a route to meaningful omitted detail; do not silently drop inconvenient records.

## Worked domain decisions

### Staffing: slack against the minimum

The decision is whether a leave request would leave a team below required coverage. A fictional Tuesday has 5 available qualified staff and a required minimum of 4: slack is +1. A request removing two available staff would leave 3, with slack −1.

Show the proposed 3 against the required 4 and the resulting shortage next to the request's supported review action. A team-by-day matrix can encode slack when several days must be compared; retain access to available headcount, the applicable minimum, and the proposed change. Zero slack means exactly meeting the minimum, not missing data or spare capacity. Check each affected day and applicable qualification or shift rule; a weekly average or raw team size cannot establish coverage. Do not reinterpret a visual warning as authority to approve a request or remove a business constraint.

### Energy: balanced flows with consistent units

The decision is where power is going now. A fictional same-instant snapshot has solar generation of 4.2 kW and battery discharge of 0.8 kW. These supply 3.5 kW of home demand and 1.5 kW of grid export: both sides total 5.0 kW.

Use labeled flows or another encoding that makes sources, destinations, direction, and magnitudes understandable. If geometry represents magnitude, preserve its proportional meaning; decorative arrows need not pretend to be measured widths. State the import/export sign convention when using a signed plot. Do not mix instantaneous power in kW with daily energy in kWh, or measurements from different instants, to manufacture a balance. Real systems may include conversion losses, unmetered flows, or rounding residuals: show an authoritative known component or explain the discrepancy, never invent a balancing flow. Missing battery telemetry is not 0 kW, and projected generation is not observed supply.

## Data states that change the decision

- Keep legitimate zero, missing, not applicable, loading, stale, and failed measurement distinct. A blank interval must not silently become zero, and interpolation must not conceal missing evidence.
- Identify the affected metric and last known measurement time when freshness changes whether an action is safe or useful. A recent fetch does not make an old observation current.
- Show partial coverage when only some sources or periods loaded. Do not present the surviving subset's percentage, total, or trend as complete.
- Check the actual decision with zero and negative values, a zero comparison baseline, missing periods, partial pages, changed filters, rounded residuals, threshold crossings, and forecasts. Use existing data or clearly illustrative fixtures when needed; no separate dataset file or prescribed chart library is required.
