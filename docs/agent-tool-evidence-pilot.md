# Agent-tool evidence packet pilot

As of: **2026-09-02 19:48 UTC**
Decision owner: repository owner
Use case: choose whether to add another agent-assisted repository issue-resolution tool
alongside the existing Cursor/Kiro workflow.
Candidates: OpenHands Agent Canvas, aider, and SWE-agent. They overlap on repository
changes but are not identical: OpenHands is an automation/control plane, aider is an
interactive pair-programming CLI, and SWE-agent is a research-oriented autonomous harness.
The comparison therefore evaluates fit to this narrow use case rather than claiming product
equivalence. [claim:C001] [evidence:M001,M003]

Data boundary: public repository content only. No private code, credentials, employer data,
or customer data was sent to any candidate.
Runtime verification: **none**. The repositories were cloned into temporary directories and
their pinned sources were inspected; no candidate was installed or executed.
Pilot type: **source-evidence method experiment**, not a runtime benchmark. Installing or
running these external agents is outside this repository's development-environment boundary,
and no candidate can receive an `Adopt` decision without a separate authorized runtime pilot.

## Decision

| Candidate | Disposition | Why now | Reconsider when |
|---|---|---|---|
| OpenHands Agent Canvas | **Watch** | It directly supports self-hosted, multi-backend agent automation, but the inspected revision is marked beta, can grant agents filesystem/shell/network access, needs deliberate hardening, and sends an anonymous first-use event unless telemetry is fully disabled. The current repository already has a working automation path, so that operating burden does not close a demonstrated gap. [claim:C101] [evidence:OH01,OH02,OH03,OH04,OH05] | A multi-backend control-center need appears and an isolated, telemetry-disabled pilot has an approved threat model. |
| aider | **Adapt** | Borrow its explicit git checkpoints/undo and post-edit lint/test loop. Do not add another installed agent yet: aider is an interactive pair-programming tool, not the current autonomous automation surface, and its default auto-commit behavior needs local policy choices. It can use local model endpoints and analytics are opt-in. [claim:C201] [evidence:AD01,AD02,AD03,AD04,AD05] | A recurring terminal pair-programming need appears and the model endpoint, auto-commit, hook, and analytics settings are approved. |
| SWE-agent | **Reject** for new adoption | Its autonomous issue-fixing and Docker/YAML design are relevant, but the maintainers explicitly say mini-SWE-agent has superseded it and recommend the successor. Adopting the legacy harness would begin from a maintainer-superseded path. [claim:C301] [evidence:SW01,SW02,SW03,SW04] | Reproducing a legacy SWE-agent trajectory becomes necessary. Evaluate mini-SWE-agent separately for any new deployment. |

These are repository-fit decisions, not general product rankings. No candidate received an
`Adopt` decision because source inspection found no unmet requirement that justifies another
runtime dependency. [claim:C002] [evidence:LOCAL01]

## Construct and criteria

The construct is **fitness for adding a repository issue-resolution tool to this project's
existing agent workflow**. It excludes model quality, popularity, vendor prestige, and
enterprise approval. [claim:C003] [evidence:M003,LOCAL01]

The inspected repository licenses are MIT for OpenHands, Apache-2.0 for aider, and MIT
for SWE-agent. That removes one source-code licensing objection for this pilot but says
nothing about dependency, model-provider, hosted-service, or enterprise-use terms.
[claim:C006] [evidence:OH06,AD06,SW05]

| Criterion | Supportive evidence | Adverse evidence | Missing proof |
|---|---|---|---|
| Workflow fit | Can inspect/edit a repository and support the intended human or automation loop | Solves a different job or duplicates the current loop | Same bounded issue attempted with all candidates |
| Control and isolation | Scoped filesystem, sandbox, explicit approvals, rollback | Host-level shell/network access or implicit side effects | Target-environment threat model and escape tests |
| Evidence and recovery | Pinned config, inspectable changes, tests, rollback, run record | Marketing-only claim or unverifiable output | Same-task artifact and log comparison |
| Operating burden | Fits current runtime and provider boundary with few new moving parts | Additional services, containers, repositories, or policy surfaces | Installation/upgrade exercise in an isolated environment |
| Lifecycle | Maintainer recommends the inspected path for new use | Beta, deprecated, superseded, or unclear direction | Release/support policy review |
| Data and telemetry | Explicit routing, local option, telemetry control | Undocumented routing or pre-consent network event | Packet capture and approved provider/data review |

Ratings below use `supported`, `mixed`, `gap`, and `not tested`; there is no composite
score. A missing item is not converted to zero. [claim:C004] [evidence:M002,M003]

## Retrieval ledger

| Objective | Sources searched | Retrieved | Result or shortfall |
|---|---|---|---|
| Adapt a reproducible packet structure | K-Dense AI Scientific Agent Skills: `research-lookup`, `scientific-writing`, `scholar-evaluation`, contribution and repository checks | `main` at `1e5eeff` on 2026-09-02 | Reused pinned source manifests, claim maps, adverse-evidence search, qualitative-first review, progressive disclosure, and bounded checks. Provider-specific and scientific-review machinery was excluded. |
| Establish candidate purpose and maintainer direction | Candidate READMEs and architecture/configuration docs | Three pinned `main` revisions | SWE-agent's successor notice materially changed its disposition. |
| Inspect execution and recovery boundaries | OpenHands self-hosting/telemetry code, SWE-agent environment architecture, aider git and lint/test docs | Full files at pinned revisions | Repository behavior documented; sandbox escape, rollback reliability, and target-host behavior not executed. |
| Inspect data and telemetry boundaries | OpenHands telemetry implementation; aider analytics and local-model docs; SWE-agent docs/source search | Full files where found | OpenHands and aider controls found. SWE-agent data-routing/telemetry posture remains `not tested`; absence of a found document is not evidence of absence. |
| Check popularity or benchmark position | Deliberately not used | None | Stars, downloads, testimonials, and self-reported leaderboard claims do not establish fit for this decision. |

## Execution ledger

The following relevant retrieval and verification commands ran in this public-data
workspace. Paths were temporary; no candidate package, service, or script ran.

```text
git clone --depth 1 https://github.com/K-Dense-AI/scientific-agent-skills.git /tmp/scientific-agent-skills
git clone --depth 1 https://github.com/All-Hands-AI/OpenHands.git /tmp/col360-openhands
git clone --depth 1 https://github.com/SWE-agent/SWE-agent.git /tmp/col360-swe-agent
git clone --depth 1 https://github.com/Aider-AI/aider.git /tmp/col360-aider
git -C <checkout> rev-parse HEAD
git -C <checkout> log -1 --format="%H %cI"
git diff --check
python3 <inline packet check: claim IDs, evidence IDs, local links, table widths,
         checkout SHAs, cited files, and cited line ranges>
```

The inline standard-library check reported 10 declared claims, 22 source records, and 26
pinned locators with no unresolved IDs or missing cited files. `skills-ref` was not
available, so the new skill's name, quoted version, frontmatter opening, and sub-500-line
length were checked directly. Candidate runtime commands executed: **none**.

## Source manifest

`opened` means the cited source was inspected at the pinned revision. It does not mean the
candidate ran.

| ID | Candidate | Pinned source and exact locator | Type | Access | Verification | Supports | Limits |
|---|---|---|---|---|---|---|---|
| M001 | Method | [Research Lookup, lines 144–192](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/skills/research-lookup/SKILL.md#L144-L192) | Maintainer skill | Full | opened | Packet artifacts, claim-source mapping, coverage limits, contradictory evidence | Scientific/manuscript context is not this decision context |
| M002 | Method | [Evidence workflow, lines 1–89](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/skills/scientific-writing/references/evidence_workflow.md#L1-L89) | Maintainer reference | Full | opened | Draft/verification separation, stable evidence IDs, explicit missing states | Requires adaptation because this pilot has no accountable scientific verifier |
| M003 | Method | [Scholar Evaluation, lines 64–78](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/skills/scholar-evaluation/SKILL.md#L64-L78) and [responsible assessment, lines 65–129](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/skills/scholar-evaluation/references/responsible_assessment.md#L65-L129) | Maintainer skill/reference | Full | opened | Qualitative-first review; no prestige proxies; missing is not zero; rubric provenance | Scholarly-work safety scope does not itself evaluate software |
| M004 | Method | Contributing guide [lines 20–40](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/CONTRIBUTING.md#L20-L40), [76–105](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/CONTRIBUTING.md#L76-L105), and [210–225](https://github.com/K-Dense-AI/scientific-agent-skills/blob/1e5eeffbdad3749125afe7ab48a39694e27f181c/CONTRIBUTING.md#L210-L225) | Maintainer guide | Full | opened | Concise main skill, optional references/scripts/assets, versioned metadata, and tests for shipped scripts | Local Kiro discovery conventions remain authoritative here |
| OH01 | OpenHands | [README, lines 3–46](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/README.md#L3-L46) | Maintainer docs | Full | opened | Beta status, self-hosted control center, multiple agent/back-end support | Does not prove runtime reliability |
| OH02 | OpenHands | [README, lines 50–111](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/README.md#L50-L111) | Maintainer docs | Full | opened | Direct-host full-filesystem warning and Docker-sandbox option | Does not test container isolation |
| OH03 | OpenHands | Self-hosting guide [lines 3–18](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/docs/SELF_HOSTING.md#L3-L18) and [73–103](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/docs/SELF_HOSTING.md#L73-L103) | Security/deployment docs | Full | opened | Filesystem/shell/network threat boundary, firewall/API-key hardening | Guidance is not an independent security assessment |
| OH04 | OpenHands | [Telemetry implementation, lines 1–30](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/src/services/telemetry.ts#L1-L30) | Source code | Full | opened | First-use event precedes consent; complete disable controls exist | Network behavior was not packet-captured |
| OH05 | OpenHands | [README architecture boundaries, lines 123–150](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/README.md#L123-L150) | Architecture docs | Full | opened | Canvas depends on separate SDK/client/automation responsibilities | Does not quantify maintenance cost |
| OH06 | OpenHands | [MIT license](https://github.com/All-Hands-AI/OpenHands/blob/a4aca995912b5041ed5c9f8dd4389b06fc283cab/LICENSE) | License | Full | opened | Repository license | Dependencies and hosted offerings may have separate terms |
| AD01 | aider | README [lines 7–12](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/README.md#L7-L12) and [40–95](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/README.md#L40-L95) | Maintainer docs | Full | opened | Interactive terminal pair-programming purpose; code map, git, lint/test features | Feature claims were not executed |
| AD02 | aider | [Git integration, lines 7–44](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/git.md#L7-L44) | Maintainer docs | Full | opened | Automatic commits, dirty-file handling, undo/review controls, configurable hooks | Does not prove recovery for every edit |
| AD03 | aider | [Linting and testing, lines 7–73](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/usage/lint-test.md#L7-L73) | Maintainer docs | Full | opened | Automatic lint and configurable post-edit tests | Correct commands and coverage remain repository-specific |
| AD04 | aider | [Analytics, lines 7–57](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/more/analytics.md#L7-L57) | Maintainer docs | Full | opened | Opt-in analytics, stated exclusions, permanent/session disable controls | Policy claim was not independently audited |
| AD05 | aider | [LLM routing, lines 34–50](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/llms.md#L34-L50) | Maintainer docs | Full | opened | Local models and OpenAI-compatible local endpoint support | Model quality and endpoint security are not tested |
| AD06 | aider | [Apache-2.0 license](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/LICENSE.txt) | License | Full | opened | Repository license | Dependencies and model providers may have separate terms |
| SW01 | SWE-agent | [README, lines 17–36](https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/README.md#L17-L36) | Maintainer docs | Full | opened | Maintainer says mini-SWE-agent supersedes SWE-agent and is recommended; legacy purpose | Does not evaluate the successor |
| SW02 | SWE-agent | [Architecture, lines 5–17](https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/docs/background/architecture.md#L5-L17) | Architecture docs | Full | opened | Docker/remote deployment, shell execution, model action loop | Runtime behavior not executed |
| SW03 | SWE-agent | [Configuration, lines 1–27](https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/docs/config/config.md#L1-L27) | Maintainer docs | Full | opened | YAML controls tools, prompts, model behavior, and I/O interface | Does not prove safe defaults |
| SW04 | SWE-agent | [Environment guide, lines 1–32](https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/docs/config/environments.md#L1-L32) | Maintainer docs | Full | opened | Docker image is the default environment and can be customized | Container security and target-host fit not tested |
| SW05 | SWE-agent | [MIT license](https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/LICENSE) | License | Full | opened | Repository license | Dependencies and model providers may have separate terms |
| LOCAL01 | Local workflow | [`AGENTS.md` product/change boundaries](../AGENTS.md) and [README architecture](../README.md#architecture) | Repository authority | Full | opened | Existing Cursor/Kiro/Taskmaster workflow and backend-less product boundary | Does not evaluate external tools |

## Claim-to-source matrix

| Claim | Candidate | Observation | Evidence | Interpretation | Confidence |
|---|---|---|---|---|---|
| C001 | All | The candidates overlap on code changes but expose different interaction and control models. | OH01, AD01, SW01, SW02 | Compare against one declared use case; do not present a universal ranking. | High |
| C002 | All | This repository already defines a Cursor/Kiro/Taskmaster execution path; no inspected source establishes an unmet need for another runtime. | LOCAL01 | Prefer no new dependency until a concrete gap appears. | High for current repo, not transferable |
| C003 | Method | The adapted method rejects prestige/popularity proxies and requires construct-first, direct evidence. | M003 | Stars, downloads, and testimonials are excluded from the decision. | High |
| C004 | Method | Opened source, executed behavior, missing evidence, and qualitative interpretation are separate states. | M001, M002, M003 | No composite score or inferred runtime proof is justified. | High |
| C005 | Pilot | The packet records adverse lifecycle, telemetry, execution-boundary, and default-workflow evidence that changes or bounds each decision. | OH02, OH03, OH04, AD02, AD03, SW01 | The adapted method made each disposition traceable to supporting and adverse evidence. | High for traceability; comparative decision quality remains untested |
| C006 | All | The inspected repository licenses are MIT, Apache-2.0, and MIT respectively. | OH06, AD06, SW05 | Source-code licenses are permissive; other terms still require separate review. | High |
| C007 | Method | Upstream authoring guidance keeps the main skill concise and makes scripts optional, with tests required when scripts exist. | M004 | Keep this adaptation as one skill with no validator until repeated failures justify code. | High |
| C101 | OpenHands | Maintainer docs mark Agent Canvas beta, describe multi-backend automation, warn of broad agent privileges, prescribe hardening, and code a pre-consent first-use telemetry event with hard-disable options. | OH01, OH02, OH03, OH04, OH05 | The capability is relevant, but lifecycle, security, telemetry, and operating burden justify `Watch`. | High for documented behavior; runtime not tested |
| C201 | aider | Maintainer docs define interactive pair programming, git checkpoints/undo, configurable lint/tests, local models, and opt-in analytics. | AD01, AD02, AD03, AD04, AD05 | Reuse the recovery and verification patterns; do not install another tool without a recurring need and configuration review. | High for documented behavior; runtime not tested |
| C301 | SWE-agent | Maintainers explicitly recommend mini-SWE-agent for future use while SWE-agent retains an autonomous, Docker/YAML research harness. | SW01, SW02, SW03, SW04 | Reject new adoption of the superseded path; preserve it only for legacy reproduction. | High |

## Qualitative comparison

| Criterion | OpenHands Agent Canvas | aider | SWE-agent |
|---|---|---|---|
| Workflow fit | **mixed** — directly supports automated issue workflows and multiple agents, but duplicates the current automation surface. `OH01`, `LOCAL01` | **mixed** — strong interactive repository-editing fit, but not the current autonomous trigger path. `AD01`, `LOCAL01` | **mixed** — directly targets autonomous issue repair, but the inspected project is superseded. `SW01` |
| Control and isolation | **mixed** — Docker is available; direct mode grants full filesystem access, and self-hosting requires explicit hardening. `OH02`, `OH03` | **mixed** — git rollback and diff controls are explicit; execution isolation was not established. `AD02` | **supported in design, not tested** — Docker/remote deployments isolate the shell in the documented architecture. `SW02`, `SW04` |
| Evidence and recovery | **gap** — this pass did not inspect or execute run-artifact recovery deeply enough for adoption. | **supported in design, not tested** — automatic commits, `/undo`, lint, and configured tests provide a clear recovery/check loop. `AD02`, `AD03` | **supported in design, not tested** — pinned YAML controls the agent interface; same-task reproducibility was not run. `SW03` |
| Operating burden | **gap** — Node/uv or Docker plus separate server responsibilities add moving parts beyond the present workflow. `OH02`, `OH05` | **mixed** — a single CLI is narrower, but provider, auto-commit, hooks, analytics, and test commands still require policy. `AD02`, `AD03`, `AD04`, `AD05` | **gap** — Docker/configuration are manageable, but adopting a superseded harness creates avoidable migration work. `SW01`, `SW03`, `SW04` |
| Lifecycle | **gap** — inspected revision is beta. `OH01` | **not tested** — no lifecycle/support claim was needed or verified for this bounded `Adapt` decision. | **gap** — maintainer directs new users to mini-SWE-agent. `SW01` |
| Data and telemetry | **mixed** — self-hosting is available, but first-use telemetry precedes consent unless fully disabled. `OH01`, `OH04` | **supported in documentation, not audited** — local endpoints are supported and analytics require opt-in. `AD04`, `AD05` | **not tested** — this pass found no source sufficient to make a data-routing or telemetry claim. |

## Contradictions and unknowns

- OpenHands combines a self-hosting story with a pre-consent anonymous install event.
  Both are true in the inspected revision; full telemetry disable must be part of any
  pilot. `OH01`, `OH04`
- aider's automatic commits improve rollback, but committing dirty files and skipping
  commit hooks by default may conflict with a repository's preferred commit discipline.
  Both controls are configurable. `AD02`
- SWE-agent's README still describes strong autonomous/research capabilities while also
  telling new users to choose its successor. The successor notice controls this adoption
  decision. `SW01`
- No candidate was run on the same issue, so relative correctness, latency, cost, model
  quality, sandbox containment, and recovery success remain unknown.
- Enterprise approval, provider contracts, retention, and private-code routing were not
  evaluated. Repository evidence cannot grant that approval.

## Reversible next actions

1. Keep the current Cursor/Kiro execution path unchanged.
2. Apply aider's checkpoint-and-check pattern to future agent workflows: inspect diff,
   preserve rollback, then run repository-native checks.
3. If a multi-backend control center becomes necessary, pilot OpenHands in an isolated
   disposable repository with telemetry hard-disabled and record network/filesystem
   observations.
4. Evaluate mini-SWE-agent, not SWE-agent, if a lightweight autonomous benchmark harness
   becomes a real requirement.

## Experiment result

The adapted packet linked each disposition to a maintainer successor notice, telemetry
behavior, host-access warnings, configurable recovery controls, or explicit proof gaps.
Those facts changed or bounded every disposition.
[claim:C005] [evidence:OH02,OH03,OH04,AD02,AD03,SW01]

The experiment establishes traceability and reproducibility of the written decision. It
does not establish that a human reviewer would reach a better decision than with another
method; that comparison would need a predefined baseline and reviewer study.

The reusable parts are:

- pinned source manifest plus retrieval ledger;
- claim-to-source mapping with exact locators;
- qualitative-first criteria and no composite score;
- adverse-evidence and contradiction sections;
- opened-versus-executed verification states;
- one reversible action and reconsideration trigger per decision.

The local skill keeps the workflow in one concise `SKILL.md` and adds no script or
dependency; that follows the source collection's progressive-disclosure and script-testing
convention without copying infrastructure the pilot does not need.
[claim:C007] [evidence:M004]

## Quality gate

- [x] Every factual conclusion claim maps to evidence.
- [x] Adverse evidence was sought for each candidate.
- [x] Candidate and method sources use pinned commits and exact locators.
- [x] Opened repositories are not described as executed tools.
- [x] Contradictions, unavailable proof, and asymmetric candidate scope remain labeled.
- [x] Stars, downloads, testimonials, and opaque scores were excluded.
- [x] Data, license, telemetry, and execution boundaries are explicit.
- [ ] Runtime behavior is verified — intentionally open; required only before an `Adopt`
  decision.
