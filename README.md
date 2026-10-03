# Impeccable — autonomous fork

This is a deliberately divergent fork of Impeccable, created by Paul Bakaus and originally inspired by Anthropic's frontend-design skill. It retains frontend design craft while replacing the command-driven product and its runtime with **one portable, standards-compliant Agent Skill** named `impeccable`.

The agent infers context from your task, repository, existing documentation, interface, and ongoing direction. It decides which design interventions are useful within the assignment; you do not select a design command, initialize a project, or complete a workshop. No runtime build, engine download, account, private service, or development toolchain is required to use the skill.

## Install

Choose an Agent Skills-compatible harness and find its configured skills directory. Discovery, activation, and permissions depend on that harness; copying these files does **not** guarantee that every harness automatically loads them.

From this repository's root, set `SKILLS_DIR` to that configured directory, then copy the complete portable payload:

```sh
export SKILLS_DIR='/absolute/path/to/configured/skills'
(
    set -eu
    : "${SKILLS_DIR:?Set SKILLS_DIR to your configured skills directory}"
    mkdir -p "$SKILLS_DIR"
    destination="$SKILLS_DIR/impeccable"
    if ! mkdir "$destination"; then
        printf '%s\n' "Installation stopped: cannot create a new $destination directory; existing destinations are not overwritten." >&2
        exit 1
    fi
    cp SKILL.md LICENSE NOTICE.md "$destination/"
    cp -R references "$destination/references"
)
```

The installed directory must be named `impeccable`, matching the skill's frontmatter name. If that destination already exists, the installation stops without replacing it. Review and move an older installation deliberately before installing again. Follow your harness's documented discovery or activation procedure; if it supports explicitly loading a skill file, point it at the installed `impeccable/SKILL.md`.

Only `SKILL.md`, `references/`, `LICENSE`, and `NOTICE.md` are needed in the installed directory. Repository maintenance scripts and tests are not runtime dependencies.

## Use ordinary tasks

Once the harness has loaded the skill, describe the outcome you want, for example:

- “Make this checkout easier to complete on a phone; preserve the existing brand.”
- “Build a distinctive landing page for this product using the facts already in the repository.”
- “Improve the settings screen's hierarchy, keyboard navigation, and error states.”
- “Review this onboarding flow and propose changes only; do not edit code.”

The agent chooses relevant guidance and actions itself. It can simplify a layout, strengthen typography, improve copy, repair interaction states, or tune motion without asking you to choose a technique. Accessibility, responsiveness, functionality, and performance are part of the work, not separate opt-in modes.

### Authority and limits

Autonomy is bounded by the assignment and user intent. The agent respects planning-only requests, preserves a coherent existing identity, and does not treat design work as permission to deploy, destroy data, expand scope, or invent product facts. It asks user-intent questions only when a material gap in intent, facts, or authority remains unresolved after inspecting available context—not for routine design decisions or blanket approval at each step.

Iteration is bounded by the task's acceptance criteria and available evidence, rather than endless polishing or an arbitrary number of passes. The agent reports what it actually inspected and checked, and identifies evidence it could not obtain. The skill is guidance for the host agent, not an enforcement engine or a guarantee of visual quality.

## Architecture

[SKILL.md](SKILL.md) is the only entry point and source of behavioral authority. It loads focused references only when needed:

| Reference | Focus |
| --- | --- |
| [Workflow](references/workflow.md) | Context inference, decisions, implementation, and bounded iteration |
| [Quality](references/quality.md) | Accessibility, responsiveness, states, and evidence |
| [Typography](references/typography.md) | Type choice, hierarchy, readability, and rhythm |
| [Color](references/color.md) | Intentional palettes, contrast, and semantic color |
| [Layout](references/layout.md) | Composition, spacing, density, and responsive structure |
| [Motion](references/motion.md) | Purposeful animation and reduced-motion behavior |
| [Interaction](references/interaction.md) | Controls, navigation, feedback, and recovery |
| [Content](references/content.md) | Clear interface copy and truthful product communication |
| [Systems](references/systems.md) | Existing identity, reusable components, and tokens |
| [Performance](references/performance.md) | Efficient frontend implementation and rendering |
| [Platforms](references/platforms.md) | Web and native platform conventions |

These are authored Markdown sources, not generated replicas or provider adapters. There are no required product/design documents or hidden project-state files. Existing project documents remain useful evidence when present.

### What this fork removes

The old CLI and installer, deterministic detector engine, browser extension and live-variant tooling, provider integrations, generated distributions, command menus and aliases, and initialization/state machinery are not included. This fork does not scan a page with the old detector, supply browser automation, or provision a model provider. An agent may use tools already available in its harness, but the skill does not install them.

### Assessment behind the cutover

The assessment judged **3,357 text files**: **520 keep**, **1,214 adapt**, **369 mixed**, **1,183 remove**, and **71 other**. There were **33 deterministic exclusions** and **209 capped or truncated assessments**. These are assessment counts, not a claim about the final payload or a complete review of every byte.

- **Keep:** transferable design craft and useful domain knowledge.
- **Adapt:** useful guidance tied to commands, workshops, rigid aesthetic rules, or mandatory project state; retain its purpose within context-sensitive autonomous decisions.
- **Mixed:** separate reusable craft from obsolete orchestration and packaging.
- **Remove:** the runtime, integration, replication, and maintenance architecture that this fork no longer ships.
- **Other:** material requiring separate disposition rather than a craft verdict.

Verdicts were advisory. Canonical contracts were manually confirmed before the cutover. Generated replicas were removed because the architecture now has one source, not because their design craft had no value.

## Maintainer validation

There is no runtime build or generation step. From the repository root, maintainers run:

```sh
python3 scripts/check.py
python3 -m unittest discover -s tests
uvx --from 'git+https://github.com/agentskills/agentskills.git@69ef37e9424c0a7ea9dd2293b559e43ec8176379#subdirectory=skills-ref' skills-ref validate "$PWD"
```

The portable-resource checker defaults to the repository root derived from its own location. Its optional path checks an installed payload:

```sh
python3 scripts/check.py "$SKILLS_DIR/impeccable"
```

The checker validates portable resource integrity; it does not reimplement YAML or Agent Skills specification validation. The boundary regression tests are isolated. The official `skills-ref` validator is pinned to the revision above; Python 3 and `uvx` are maintainer tooling only, not installation or usage prerequisites. Structural checks do not prove design quality or universal harness compatibility.

Pass an absolute skill-directory path to the pinned reference validator: a literal `.` is interpreted with an empty directory name and fails its name-matching check. The documented copy installation has been exercised with official validation, metadata reading, and discovery-prompt generation; existing destinations are refused without changing their contents.

[AGENTS.md](AGENTS.md) defines contribution and verification policy. [CHANGELOG.md](CHANGELOG.md) records this unreleased cutover. [SKILLS_SPEC.md](SKILLS_SPEC.md) is the retained specification reference.

## Attribution and license

Upstream Impeccable was created by [Paul Bakaus](https://www.paulbakaus.com), with origins in Anthropic's [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design). The root [LICENSE](LICENSE) remains unchanged. [NOTICE.md](NOTICE.md) preserves upstream attribution and the MIT notice for platform guidance adapted from ehmo's platform-design-skills.
