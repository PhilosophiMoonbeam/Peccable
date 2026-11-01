# Repository verification

These requirements are maintenance-only, not installed skill dependencies.

## Maintenance gates

After all changes land, the integration owner runs these maintenance gates once from the repository root. Delegated edit-only workers must not run gates, tests, builds, lint, or formatters mid-flight.

```sh
python3 scripts/check.py
python3 -m unittest discover -s tests
uvx --from 'git+https://github.com/agentskills/agentskills.git@69ef37e9424c0a7ea9dd2293b559e43ec8176379#subdirectory=skills-ref' skills-ref validate "$PWD/skills/peccable"
```

- `scripts/check.py` checks portable resource integrity, not YAML or specification conformance. It defaults to the repository's `skills/peccable/`, derived from `__file__` regardless of working directory. An optional directory argument, such as `python3 scripts/check.py "$SKILLS_DIR/peccable"`, checks installed payloads without repository maintenance files.
- Standard-library regressions cover checker boundaries without the removed runtime or integrations. Add focused cases for checker behavior changes.
- Official `skills-ref`, pinned above, owns frontmatter and Agent Skills specification validation; do not duplicate it in the local checker.
- Review instruction changes against the autonomy and scope contract. Structural validation cannot establish visual quality, factual accuracy, or activation in every harness.

Python 3 and `uvx` are required only for these maintenance gates; no build or generation is required. Report only checks run, their results, and unavailable evidence—never a skipped gate as passing. For explicitly edit-only assignments, hand required checks to the integration owner.

## Outcome evaluations

Repository-only [outcome evaluations](../evals/README.md) add no skill-runtime dependency. Before repeated no-skill, current-skill, and candidate trials, freeze the rubric and adoption criteria. Use fresh agents with matched models, tools, and fixtures; balance blind review and keep a held-out set untouched. Record actual loaded context per completed task, not installed payload size. Separate noncompensable task, authority, data-truthfulness, and accessibility failures from visual model preference. Report only completed trials and observed results; model comparisons do not establish real-user efficacy. Source-project evaluation claims alone cannot justify optional-resource adoption.
