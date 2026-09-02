# Awesome-Copilot skill ranking (COL-353 follow-up)

Ranking of all 416 skills in [github/awesome-copilot](https://github.com/github/awesome-copilot)
by ROI/relevance/applicability to Collin's work surface. Companion to entry #4 in
[`ai-resource-intake.md`](ai-resource-intake.md).

**Method.** Every skill description in the catalog's [`llms.txt`](https://awesome-copilot.github.com/llms.txt)
(fetched 2026-09-02) was reviewed and scored on three factors: relevance to current work
(SQL Server / mssql-python / pandas / Arrow reconciliation, BI deliverables, this repo's
TypeScript/React UI and CI, the Kiro/Cursor agent workflow), portability outside the Copilot
CLI ecosystem, and adoption cost/risk. Skills are ranked into tiers; everything not named in
Tiers 1–3 falls into a Tier 4 category. Ranks are based on catalog descriptions, not per-skill
content audits — the one skill audited so far (`sql-server-table-reconciliation`) showed real
gaps between description and implementation, so treat this as an intake shortlist, not adoption
decisions.

## Tier 1 — highest ROI, direct fit (ranked)

| # | Skill | Why it ranks here |
|---|-------|-------------------|
| 1 | [sql-server-table-reconciliation](https://github.com/github/awesome-copilot/tree/main/skills/sql-server-table-reconciliation) | Already vendored at pin `4742f26`; COL-199 pilot in flight. Proven-fit baseline the rest are ranked against. |
| 2 | [sql-code-review](https://github.com/github/awesome-copilot/tree/main/skills/sql-code-review) | Universal SQL review (explicitly covers SQL Server): injection prevention, access control, anti-patterns. Direct day-job fit; complements the reconciliation work. |
| 3 | [sql-optimization](https://github.com/github/awesome-copilot/tree/main/skills/sql-optimization) | Execution-plan analysis, indexing, batch operations across engines including SQL Server. Same fit as #2; the two are designed as a pair. |
| 4 | [convert-excel-to-md](https://github.com/github/awesome-copilot/tree/main/skills/convert-excel-to-md) | BI work is spreadsheet-heavy (see `deliverables/otb-diagnosis/tagging-template.xlsx`). Script-backed, self-contained, agent-portable. |
| 5 | [security-review](https://github.com/github/awesome-copilot/tree/main/skills/security-review) | Data-flow-tracing security scan covering TypeScript and Python — both stacks here. Supports the protect-credentials requirement in the AI Research project. |
| 6 | [github-actions-hardening](https://github.com/github/awesome-copilot/tree/main/skills/github-actions-hardening) | This repo runs CI on every push; skill covers script injection, token scoping, action pinning. Small, bounded, immediately checkable against `.github/workflows/`. |
| 7 | [remember](https://github.com/github/awesome-copilot/tree/main/skills/remember) + [memory-merger](https://github.com/github/awesome-copilot/tree/main/skills/memory-merger) | Lessons-to-instructions memory pattern; direct conceptual overlap with Taskmaster's one-lesson-per-task memory sync. Value is as a design reference (adapt, not install). |
| 8 | [eval-driven-dev](https://github.com/github/awesome-copilot/tree/main/skills/eval-driven-dev) | Evaluation-driven development for LLM-calling code: golden datasets, criteria, action plans. Fits the AI Research project's need to define success criteria before adoption decisions. |
| 9 | [doublecheck](https://github.com/github/awesome-copilot/tree/main/skills/doublecheck) | Claim-extraction + source-verification pipeline for AI output. Useful guardrail for research deliverables like this one. |
| 10 | [daily-focus-board](https://github.com/github/awesome-copilot/tree/main/skills/daily-focus-board) | Executive-function-friendly focus board: one-task focus, kind carryover, brain-dump box. Not an adoption candidate (Taskmaster/work-cockpit own this space) but a high-value design reference for the Focus view. |

## Tier 2 — relevant, evaluate when the need is live

- **Power BI cluster (5):** `powerbi-modeling`, `power-bi-dax-optimization`, `power-bi-model-design-review`, `power-bi-performance-troubleshooting`, `power-bi-report-design-consultation`. High ROI *if* Power BI is part of the BI toolchain; otherwise skip. Some depend on a Power BI MCP server.
- **Document conversion siblings (2):** `convert-pdf-to-md`, `convert-word-to-md` — same pattern as the Tier-1 Excel converter; take them together if that one is adopted.
- **Python-side testing (2):** `pytest-coverage`, `ruff-recursive-fix` — useful once the reconciliation script grows tests (a known gap from the COL-199 audit).
- **Repo hygiene (3):** `secret-scanning`, `dependabot`, `github-actions-efficiency` — bounded, low-risk CI/security improvements.
- **Agent-workflow safety (4):** `agent-governance`, `agent-owasp-compliance`, `mcp-security-audit`, `verify-agent-action` — relevant to the taskmaster agent's destructive-command approval model; reference material more than installs.
- **Working-method (4):** `poka-yoke` (make invalid states unrepresentable — fits the STEP RESULT contract mindset), `harness-engineering` (turn agent failures into durable instructions), `impediment-prioritization` (ROI-scored ranking model, same shape as this document), `build-evidence-map` (evidence preservation for research decisions).
- **Windows work machine (1):** `batch-files` — the deployment target is Windows; occasional .bat automation help.

## Tier 3 — niche or conditional

Diagramming (`drawio`, `excalidraw-diagram-generator`, `plantuml-ascii`, `mermaid`-adjacent generators), documentation generators (`create-readme`, `documentation-writer`, `code-tour`, blueprint generators), commit/branch conventions (overlap with tooling already in place), `prompt-optimizer`, `webapp-testing`/Playwright cluster (this environment already has equivalent testing paths), `refactor`/`refactor-plan`, `incident-postmortem`, `create-technical-spike`, `snowflake-semanticview` and `fabric-lakehouse` (only if those platforms enter the toolchain), `ssma-console` (only for an Oracle-to-SQL-Server migration).

## Tier 4 — not applicable (the remaining ~330)

Everything not named above, by category: Azure SDK/infra skills (~45); the Oracle-to-PostgreSQL
migration suite (8); language stacks not in use — .NET/C#, Java, Kotlin, Swift, PHP, Ruby, Rust,
Go, including all per-language MCP-server generators (~70); vendor platforms not in the toolchain —
Salesforce, Dynamics 365, Power Platform/FlowStudio, Arize, Phoenix, Qdrant, Pinecone, Transloadit,
Shopify, Namecheap, Minecraft, FreeCAD, Rhino3D, shaders, game engines (~50); Copilot-CLI- or
WorkIQ-bound skills that don't port (`cli-mastery`, `copilot-cli-quickstart`, `vardoger-analyze`,
`noob-mode`, `email-drafter`, `daily-prep`, `roundup`, `setup-my-iq`, Joyride-dependent skills)
(~25); React 18/19 migration suite (~10); marketing/GTM/sales (~20); and assorted one-offs
(IoT, mobile, CAD, LinkedIn formatting, job search, exam prep, Finnish humanizer, etc.).

## Suggested consumption order

1. Finish the COL-199 pilot (rank 1) — its verdict calibrates trust in the whole catalog.
2. Run ranks 2–4 through the intake list one at a time (each needs its own content audit before a decision).
3. Pull Tier-2 items only when the triggering need is real, not speculatively.
