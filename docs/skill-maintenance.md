# Skill maintenance

## Payload edits

The canonical installable source, [`skills/peccable/`](../skills/peccable/), contains `SKILL.md`, twelve focused files in `references/`, `LICENSE`, and `NOTICE.md`. The frontmatter name is `peccable`, matching the source and installation directory names. The current skill calls no scripts.

The authored distribution stays separate from repository discovery paths `agents/skills/` and `.agents/skills/` to avoid intentional frontend-skill auto-loading during maintenance; neither the standard nor this layout guarantees discovery across all harnesses.

Keep entry-point and reference links relative to the installable skill root. [`skills/peccable/SKILL.md`](../skills/peccable/SKILL.md) links directly to each focused reference and states when to read it; references must not create reference-to-reference loading chains. Use practical, concise, provider-neutral plain Markdown. Links in repository-only documentation are relative to the document containing them; this does not change the installable skill's root-relative link rule.

Adapt obsolete orchestration while preserving relevant craft; do not replace context-sensitive judgment with universal aesthetic bans.

The [data-interface reference](../skills/peccable/references/data-interfaces.md) adds decision-led data scope, truthful encoding and aggregation, and actionable outcomes without duplicating generic interface-state guidance. Composition examples are optional reasoning aids, not presets, fixed catalogs, or a mandatory house workflow. Add optional resources only with evidence of value; permission neither requires populating directories nor promises shipped features. Source-project evaluation claims alone cannot justify optional-resource adoption.

## Packaging and installation

Preserve root `LICENSE` byte-for-byte; bundle an identical license copy at [`skills/peccable/LICENSE`](../skills/peccable/LICENSE). Retain upstream and third-party attribution, including applicable license text, in [`skills/peccable/NOTICE.md`](../skills/peccable/NOTICE.md); do not duplicate that notice at the root.

Installation must create only the configured skills directory's `peccable` destination, refuse existing destinations, and copy all `skills/peccable/.`, including future referenced scripts or assets but excluding repository maintenance files. `scripts/check.py`, `tests/`, `evals/`, `.github/`, and root documentation are maintenance-only, not installed. Repository-only documentation is not a runtime resource.

## Upstream sync

[UPSTREAM.md](../UPSTREAM.md) records only the last fully reviewed `pbakaus/impeccable:main` commit. Review later changes against this fork's contract, adapting compatible guidance and omitting incompatible material. Replace its single entry only after review, applicable edits, and required verification are complete. Never append history or advance it merely because a newer tip was fetched; record adoption and rejection rationale in the `Unreleased` changelog, not the ledger.
