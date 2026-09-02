# Todoist resource intake review

**Closes:** #63  
**Date reviewed:** 2026-08-26  
**Source:** GitHub issue #63 comments (205 deduplicated URLs)

---

## TL;DR

Reviewed the full Todoist bookmark backlog into five actions: **adopt, adapt, experiment, defer,** or **discard**. The high-signal keepers are upstream Kiro/Copilot workflow references, a smaller set of issue/review/integration skills, and a few reusable prompt/agent workflow guides. Personal, stale, private, or off-scope links were discarded; adjacent data/platform material was mostly deferred.

Where a link was obviously private, personal, or off-scope, the decision follows directly from its title/category. Where a link was upstream, repo-adjacent, or clearly workflow-oriented, the decision reflects likely reuse value for this repository/toolbox.

The links below intentionally preserve the exact captured URLs from issue #63, even when a label points at a marketplace, category page, or other discovery index. The review decision applies to the deduplicated Todoist bookmark as captured, not to a rewritten substitute URL.

## Decision summary

- **Total reviewed items**: 205
- **Most likely to keep close at hand:** upstream Kiro/Copilot references, review-loop skills, and issue/repo automation ideas.
- **Most likely to revisit selectively:** plugin/marketplace directories, planning skills, and workflow-reading references.
- **Mostly parked or removed:** personal/private links, jobs, inbox items, and domain-specific data/platform material outside current scope.

## Decision key

- **Adopt** — directly useful as an active reference or near-term toolbox item.
- **Adapt** — useful idea, but only after translating it into this repo's conventions.
- **Experiment** — promising enough for a bounded trial, not a default workflow yet.
- **Defer** — adjacent or potentially useful later, but not current priority.
- **Discard** — off-scope, private, stale, duplicative, or not actionable here.

---

## Social / media

_Default lean: **discard** — Not relevant to the project or reusable toolbox._

- [x] [Instagram post Day4aaUsjYY](https://www.instagram.com/p/Day4aaUsjYY/) — **discard**: Not relevant to the project or reusable toolbox.
- [x] [TikTok — ZTA21oCMn](https://www.tiktok.com/t/ZTA21oCMn/) — **discard**: Not relevant to the project or reusable toolbox.
- [x] [Instagram reel DbMsC7sOJ4C](https://www.instagram.com/reel/DbMsC7sOJ4C/) — **discard**: Not relevant to the project or reusable toolbox.
- [x] [TikTok — ZTAfw6gQq](https://www.tiktok.com/t/ZTAfw6gQq/) — **discard**: Not relevant to the project or reusable toolbox.
- [x] [Rick Glassman — reflecting on autism diagnosis](https://www.instagram.com/reel/DW_MAlrCXOB/) — **discard**: Not relevant to the project or reusable toolbox.

---

## Agent skills / plugin discovery

_Default lean: **experiment** — Potentially useful for workflow/tooling discovery; validate before adopting._

- [x] [Clean Code — Skills for Claude Code | AI Templates](https://www.aitmpl.com/component/skill/development/clean-code) — **adapt**: May improve prompt quality, but should match existing repo conventions.
- [x] [Trendshift — Leonxlnx/unlazy](https://trendshift.io/repositories/176099) — **experiment**: Useful discovery breadcrumb, but validate the underlying project before adopting.
- [x] [Trendshift — DietrichGebert/ponytail](https://trendshift.io/repositories/50668) — **experiment**: Useful discovery breadcrumb, but validate the underlying project before adopting.
- [x] [Microsoft/github-issue-creator — OfficialSkills](https://officialskills.sh/microsoft/skills/github-issue-creator) — **experiment**: Highly relevant to the issue-heavy workflow; test on a low-risk issue first. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [CodeRabbit/autofix — OfficialSkills](https://officialskills.sh/coderabbitai/skills/autofix) — **experiment**: Relevant to existing review/autofix automation; evaluate overlap before adopting. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Garry Tan/office-hours — OfficialSkills](https://officialskills.sh/garrytan/skills/office-hours) — **discard**: Content is not directly actionable for this repository workflow. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Garry Tan/document-release — OfficialSkills](https://officialskills.sh/garrytan/skills/document-release) — **discard**: Release-document guidance is too indirect for current repo needs. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [homeassistant-ai/ha-mcp — MCPskills.io](https://mcpskills.io/servers) — **defer**: Interesting MCP example, but unrelated to this product domain. — 🆕 **Added &lt;24h**
- [x] [anthropics/claude-quickstarts — AwesomeAgentSkills](https://awesomeagentskills.dev/skills) — **experiment**: Useful discovery source for practical agent patterns. — 🆕 **Added &lt;24h**
- [x] [Cursor Directory — Plugins for Cursor](https://cursor.directory/) — **experiment**: Useful discovery surface, but individual plugins still need validation. — 🆕 **Added &lt;24h**
- [x] [Cursor Marketplace — Cursor Plugins](https://cursor.com/marketplace) — **experiment**: Useful discovery surface, but individual plugins still need validation. — 🆕 **Added &lt;24h**

---

## Kiro / agent infrastructure

_Default lean: **experiment** — Relevant to Kiro/agent workflows; worth a bounded trial or closer read._

- [x] [Continuous Prompt Evaluation: How We Use LLM Judges and Live Signals to Improve Kiro Agent Quality](https://kiro.dev/blog/continuous-prompt-evaluation/) — **adopt**: Directly relevant to the Kiro/agent workflow already explored in this repo. — 🆕 **Added &lt;24h**
- [x] [aws-samples/sample-specship](https://github.com/aws-samples/sample-specship) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [aws-samples/sample-geospatial-kiro-power-pack](https://github.com/aws-samples/sample-geospatial-kiro-power-pack) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [aws-samples/sample-kiro-cli-multiagent-development](https://github.com/aws-samples/sample-kiro-cli-multiagent-development) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [ray-r-ren/agent-apprenticeship](https://github.com/ray-r-ren/agent-apprenticeship) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [aurelienaws/kiro-centralised-config](https://github.com/aurelienaws/kiro-centralised-config) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [kirodotdev-labs/awesome-kiro](https://github.com/kirodotdev-labs/awesome-kiro) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [KiroCrew — knowledge-library-how-it-works](https://github.com/kirodotdev/KiroCrew/blob/main/src/kiro_crew/docs/knowledge-library-how-it-works.md) — **adopt**: Direct upstream reference for the product and memory-sync behavior.
- [x] [KiroCrew — kirocrew-worktree-dev skill](https://github.com/kirodotdev/KiroCrew/blob/main/skills/kirocrew-dev/kirocrew-worktree-dev/SKILL.md) — **adopt**: Directly relevant upstream workflow guidance for KiroCrew development.
- [x] [danielmiessler/LifeOS](https://github.com/danielmiessler/LifeOS) — **discard**: Broad personal-system project, not a focused dependency for this repo.
- [x] [kirodotdev-labs/config-control-kiro](https://github.com/kirodotdev-labs/config-control-kiro) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [atomsbaza/my-superpowers](https://github.com/atomsbaza/my-superpowers) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [0xwilliamortiz/ponytail-improved](https://github.com/0xwilliamortiz/ponytail-improved) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [aws-samples/sample-agent-skills](https://github.com/aws-samples/sample-agent-skills) — **experiment**: Likely useful examples for reusable skills.
- [x] [GitGuardian/agent-skills](https://github.com/GitGuardian/agent-skills) — **experiment**: Promising source of reusable security-conscious skills.
- [x] [amaynez/kiro-style-sdd](https://github.com/amaynez/kiro-style-sdd) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [linny006/trending-claude-skills](https://github.com/linny006/trending-claude-skills) — **experiment**: Relevant to Kiro/agent workflows; worth a bounded trial or closer read.
- [x] [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) — **adapt**: Relevant inspiration, but should stay translated into local repo rules rather than copied wholesale.

---

## GitHub — skills / agents / engineering

_Default lean: **experiment** — Relevant to engineering workflow exploration; validate fit before adopting._

- [x] [wshobson/agents — team-collaboration](https://github.com/wshobson/agents/tree/main/plugins/team-collaboration) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting.
- [x] [wshobson/agents — business-analyst](https://github.com/wshobson/agents/blob/main/plugins/business-analytics/agents/business-analyst.md) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting. — 🔴 **P1**
- [x] [github/copilot-sdk](https://github.com/github/copilot-sdk) — **adopt**: High-signal upstream reference for future GitHub/Copilot integrations.
- [x] [Panniantong/Agent-Reach — README](https://github.com/Panniantong/Agent-Reach/blob/main/docs/README_en.md) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting.
- [x] [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting.
- [x] [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting.
- [x] [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) — **discard**: Job-search tooling is outside the product/toolbox scope here.
- [x] [tt-a1i/archify](https://github.com/tt-a1i/archify) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting.
- [x] [anthropics/knowledge-work-plugins — data README](https://github.com/anthropics/knowledge-work-plugins/blob/main/data/README.md) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting.
- [x] [github/awesome-copilot](https://github.com/github/awesome-copilot) — **adopt**: High-signal discovery source for Copilot-oriented workflows and examples. — 🆕 **Added &lt;24h**
- [x] [awesome-llm-apps — project-graveyard skill](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/project-graveyard) — **experiment**: Relevant to engineering workflow exploration; validate fit before adopting. — 🆕 **Added &lt;24h**

---

## Jobs / careers

_Default lean: **discard** — Personal job links are outside this repository and toolbox scope._

- [x] [Boeing — Business Intelligence Analyst](https://www.linkedin.com/jobs/view/4438737271/) — **discard**: Personal job links are outside this repository and toolbox scope.
- [x] [Boeing — Artificial Intelligence Architect (Senior or Lead)](https://www.linkedin.com/jobs/view/4438415332/) — **discard**: Personal job links are outside this repository and toolbox scope.
- [x] [Anthropic — Data Science, Finance & Strategy](https://job-boards.greenhouse.io/anthropic/jobs/5184585008?gh_src=whdo6iwx8us) — **discard**: Personal job links are outside this repository and toolbox scope.
- [x] [Google Careers — Global Product Solutions Lead, Measurement and Data Strength](https://www.google.com/about/careers/applications/jobs/results/128669228382200518-global-product-solutions-lead-measurement-and-data-strength) — **discard**: Personal job links are outside this repository and toolbox scope.

---

## Gmail-linked tasks

_Default lean: **discard** — Private inbox links are not repository artifacts._

- [x] [Transaction Declined](https://mail.google.com/mail?extsrc=sync&amp;client=docs&amp;plid=ACUX6DNeV0QZMEVt_eCH3emW9Vxw7sjUnuyZJnA) — **discard**: Private inbox links are not repository artifacts.
- [x] [Notification from the IRS](https://mail.google.com/mail/u/0/#all/19f5acaf86309478) — **discard**: Private inbox links are not repository artifacts.
- [x] [Building: Networking: (Tech Career Advice Collin)](https://mail.google.com/mail/u/0/#all/19f51bf444cbef85) — **discard**: Private inbox links are not repository artifacts.

---

## GitHub — data / AI frameworks

_Default lean: **defer** — Interesting adjacent frameworks, but not current Taskmaster Pro priorities._

- [x] [microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel/tree/main) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [microsoft/agentic-applications-for-unified-data-foundation-solution-accelerator](https://github.com/microsoft/agentic-applications-for-unified-data-foundation-solution-accelerator) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [microsoft/agent-framework](https://github.com/microsoft/agent-framework) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [microsoft/Modernize-your-code-solution-accelerator](https://github.com/microsoft/Modernize-your-code-solution-accelerator) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [microsoft/sql-ai-promptathon](https://github.com/microsoft/sql-ai-promptathon) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [microsoft/sql-ai-datathon](https://github.com/microsoft/sql-ai-datathon) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [microsoft/mssql-python](https://github.com/microsoft/mssql-python) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [AWS guidance — natural-language queries of relational databases](https://github.com/aws-solutions-library-samples/guidance-for-natural-language-queries-of-relational-databases-on-aws) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [AWS guidance — high-speed RAG chatbots](https://github.com/aws-solutions-library-samples/guidance-for-high-speed-rag-chatbots-on-aws) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [aws-samples/sample-dbmig-aidlc](https://github.com/aws-samples/sample-dbmig-aidlc.git) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities.
- [x] [alanchn31/Data-Engineering-Projects](https://github.com/alanchn31/Data-Engineering-Projects) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities. — 🆕 **Added &lt;24h**
- [x] [josephmachado/data_engineering_project_template](https://github.com/josephmachado/data_engineering_project_template) — **defer**: Interesting adjacent frameworks, but not current Taskmaster Pro priorities. — 🔴 **P1** · 🆕 **Added &lt;24h**

---

## Data / analytics reading

_Default lean: **defer** — Useful background reading, but not directly tied to current repo work._

- [x] [Track Data Changes — SQL Server | Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/track-data-changes-sql-server?view=sql-server-ver17) — **adapt**: Relevant if database change-tracking work resumes, but not current app scope.
- [x] [SQL Server 2025: The AI-ready enterprise database | BRK124](https://youtube.com/watch?v=HelG1r0GneA&amp;si=h225eGBp4Ro_LKKk) — **defer**: Useful background reading, but not directly tied to current repo work.
- [x] [Five use cases for the dbt Semantic Layer](https://www.getdbt.com/blog/five-use-cases-for-the-dbt-semantic-layer) — **defer**: Interesting analytics context, but not driving this repository today.
- [x] [Supply chain graph database use cases — Neo4j](https://neo4j.com/use-cases/supply-chain-management/) — **discard**: Domain-specific marketing material outside current product scope.
- [x] [AI systems — Build smarter AI systems with context — Neo4j](https://neo4j.com/use-cases/ai-systems/) — **defer**: Adjacent conceptually, but not a near-term dependency.

---

## ChatGPT conversation links

_Default lean: **discard** — Ephemeral external conversation links are not durable project inputs._

- [x] [Check out this chat — 6a636b67](https://chatgpt.com/share/6a636b67-199c-83e8-89da-efa1909cb1c4) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — 6a636c12](https://chatgpt.com/share/6a636c12-8d30-83e8-861f-9501b19e5487) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — 6a636c38](https://chatgpt.com/share/6a636c38-faa4-83e8-9ac8-5c75898b4295) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — t_6a75b6d9](https://chatgpt.com/s/t_6a75b6d9a25c8191b015569d5e4dcb5a) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — 6a75b6ee](https://chatgpt.com/share/6a75b6ee-a4fc-83e8-8dfb-95dcf2e9118f) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — t_6a75d28c](https://chatgpt.com/s/t_6a75d28c67c4819190ef5ff55748bd0a) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — t_6a75d4b9](https://chatgpt.com/s/t_6a75d4b9c60c8191b38160113fa0c3f3) — **discard**: External chat link without durable in-repo value.
- [x] [Check out this chat — link triage](https://chatgpt.com/share/6a8c5a6a-3048-83e8-aef7-14ba5089014c) — **discard**: External chat link without durable in-repo value.

---

## Productivity / workflow reading

_Default lean: **adapt** — Keep the idea, but translate only the parts that fit this workflow._

- [x] [Stop Tab-Switching: Unify Jira, GitHub, GitLab Tasks](https://super-productivity.com/blog/stop-tab-switching-unify-jira-github-gitlab/) — **adapt**: Relevant workflow idea, but needs translation into the current GitHub/Linear-first setup.

---

## GitHub — work items

_Default lean: **discard** — External or already-completed work items are not new toolbox actions._

- [x] [CollinBoback/BoeingBIAnalyst — PR #250](https://github.com/CollinBoback/BoeingBIAnalyst/pull/250) — **discard**: External or already-completed work items are not new toolbox actions.
- [x] [Add always-applied i-have-adhd Cursor output-shaping rule — Issue #22](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/22) — **discard**: Already completed; no further action needed from this backlog. — 🆕 **Added &lt;24h**

---

## Cursor / AI-agent reading

_Default lean: **adapt** — Read for workflow ideas, then apply selectively in this repo._

- [x] [How we set up our cloud agent environment](https://cursor.com/blog/cloud-agent-environment) — **adopt**: Highly relevant operational guidance for agent-enabled development. — 🆕 **Added &lt;24h**
- [x] [Agent swarms and the new model economics](https://cursor.com/blog/agent-swarm-model-economics) — **adapt**: Useful strategic framing, but any adoption should be incremental. — 🆕 **Added &lt;24h**
- [x] [CodeRabbit Documentation — prioritization](https://docs.coderabbit.ai/triage/prioritization) — **adapt**: Could inform review triage, but should be mapped onto existing review tools first. — 🆕 **Added &lt;24h**
- [x] [Loop Engineering — Anthropic Agent Loop for Developers](https://www.coolplugz.com/guides/loop-engineering-anthropic-playbook) — **experiment**: Worth comparing against the repo's existing agent loop patterns. — 🆕 **Added &lt;24h**

---

## GitHub Docs / Learn / Blog

_Default lean: **adapt** — Good reference material; pull in concrete practices rather than treating it as required reading._

- [x] [Using custom instructions to unlock the power of Copilot code review](https://docs.github.com/en/copilot/tutorials/customize-code-review) — **adopt**: Directly actionable for improving review quality in this repo. — 🆕 **Added &lt;24h**
- [x] [Awesome GitHub Copilot — Skills](https://awesome-copilot.github.com/skills/) — **adopt**: Strong discovery source for Copilot-compatible skills. — 🆕 **Added &lt;24h**
- [x] [Awesome GitHub Copilot — Skills sorted by last updated](https://awesome-copilot.github.com/skills/?sort=lastUpdated) — **adopt**: Same discovery source as the main skills page, sorted view kept as a convenience breadcrumb. — 🆕 **Added &lt;24h**
- [x] [GitHub Learn — repository checklist / repo merge](https://learn.github.com/well-architected/scenarios/migrations/repository-checklist) — **adapt**: Already useful in this repo, but should stay applied case-by-case. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [GitHub Actions Documentation — productivity quick links](https://learn.github.com/well-architected/productivity/quick-links) — **adapt**: Good reference material; pull in concrete practices rather than treating it as required reading. — 🆕 **Added &lt;24h**
- [x] [Learning about new features and models — GitHub Docs](https://docs.github.com/en/copilot/concepts/learning-about-new-features-and-models) — **adopt**: Good recurring reference for keeping the toolbox current. — 🆕 **Added &lt;24h**
- [x] [Home — The GitHub Blog](https://github.blog/) — **adapt**: Good reference material; pull in concrete practices rather than treating it as required reading. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [The latest on GitHub Copilot — Page 4](https://github.blog/ai-and-ml/github-copilot/page/4/) — **adapt**: Good reference material; pull in concrete practices rather than treating it as required reading. — 🆕 **Added &lt;24h**
- [x] [The latest on GitHub Copilot — Page 5](https://github.blog/ai-and-ml/github-copilot/page/5/) — **adapt**: Good reference material; pull in concrete practices rather than treating it as required reading. — 🆕 **Added &lt;24h**
- [x] [The latest on automation — GitHub Blog](https://github.blog/enterprise-software/automation/) — **adapt**: Good reference material; pull in concrete practices rather than treating it as required reading. — 🆕 **Added &lt;24h**
- [x] [GitHub Learn — productivity checklist](https://learn.github.com/well-architected/productivity/checklist) — **adapt**: Reference for improving workflow, not a direct implementation input. — 🆕 **Added &lt;24h**
- [x] [GitHub Learn — productivity design principles](https://learn.github.com/well-architected/productivity/design-principles) — **adapt**: Reference for workflow refinement, not a direct implementation input. — 🆕 **Added &lt;24h**
- [x] [GitHub Learn — anti-patterns](https://learn.github.com/well-architected/scenarios/anti-patterns) — **adapt**: Useful guardrails to compare against the current workflow. — 🆕 **Added &lt;24h**
- [x] [GitHub Learn — measuring GenAI impact](https://learn.github.com/well-architected/scenarios/measuring-genai-impact) — **adapt**: Helpful if workflow metrics become explicit, but not urgent. — 🆕 **Added &lt;24h**
- [x] [GitHub Learn — monorepos / scaling repositories](https://learn.github.com/well-architected/scenarios/monorepos) — **adapt**: Good reference material; pull in concrete practices rather than treating it as required reading. — 🆕 **Added &lt;24h**
- [x] [Pilot a new Copilot feature or model in your enterprise](https://docs.github.com/en/copilot/tutorials/roll-out-at-scale/govern-at-scale/pilot-a-feature-or-model) — **adapt**: Potentially useful for future evaluation work, but not an immediate change driver. — 🆕 **Added &lt;24h**

---

## Miscellaneous product / research

_Default lean: **defer** — Interesting side references, but not immediate repo priorities._

- [x] [Product Hunt — Meridian](https://www.producthunt.com/products/meridian-16) — **discard**: Insufficiently tied to current product needs. — 🆕 **Added &lt;24h**
- [x] [klaudiosinani/ao — Microsoft To-Do desktop app](https://github.com/klaudiosinani/ao) — **defer**: Interesting reference app, but not a near-term dependency. — 🆕 **Added &lt;24h**
- [x] [Repomix — pack kirocrew-taskmaster-app](https://repomix.com/?repo=https%3A%2F%2Fgithub.com%2FCollinBoback%2Fkirocrew-taskmaster-app) — **experiment**: Potentially useful for packaging repo context for external review or analysis. — 🆕 **Added &lt;24h**

---

## ClaudePluginHub — agent skills / plugins

_Default lean: **experiment** — Try only the most relevant plugins; keep the rest as discovery backlog._

- [x] [linear-pack](https://www.claudepluginhub.com/plugins/jeremylongshore-linear-pack-plugins-saas-packs-linear-pack-2) — **experiment**: Relevant integration idea; worth a bounded trial if Linear workflow expands. — 🆕 **Added &lt;24h**
- [x] [Linear MCP Server](https://www.claudepluginhub.com/plugins/anthropics-linear-external-plugins-linear) — **experiment**: Relevant integration idea; worth a bounded trial if Linear workflow expands. — 🆕 **Added &lt;24h**
- [x] [ponytail](https://www.claudepluginhub.com/plugins/dietrichgebert-ponytail) — **experiment**: Relevant enough to trial because it appears in multiple discovery sources. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Anthropic document skills](https://www.claudepluginhub.com/plugins/anthropics-document-skills) — **experiment**: Could help with documentation-heavy tasks; validate quality first. — 🆕 **Added &lt;24h**
- [x] [impeccable](https://www.claudepluginhub.com/plugins/pbakaus-impeccable) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [taste-skill](https://www.claudepluginhub.com/plugins/leonxlnx-taste-skill) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [addyosmani agent-skills](https://www.claudepluginhub.com/plugins/addyosmani-agent-skills) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [claude-hud](https://www.claudepluginhub.com/plugins/jarrodwatts-claude-hud-2) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [Anthropic code-simplifier](https://www.claudepluginhub.com/plugins/anthropics-code-simplifier-plugins-code-simplifier) — **adapt**: Potentially useful, but should be applied surgically. — 🆕 **Added &lt;24h**
- [x] [Anthropic code-review](https://www.claudepluginhub.com/plugins/anthropics-code-review-plugins-code-review-2) — **adapt**: May help review workflow, but should complement existing review tools. — 🆕 **Added &lt;24h**
- [x] [Anthropic PR review toolkit](https://www.claudepluginhub.com/plugins/anthropics-pr-review-toolkit-plugins-pr-review-toolkit) — **experiment**: Worth evaluating alongside current PR review tooling. — 🆕 **Added &lt;24h**
- [x] [humanizer](https://www.claudepluginhub.com/plugins/blader-humanizer) — **discard**: Writing-style polish plugin is outside the current repo need. — 🆕 **Added &lt;24h**
- [x] [Anthropic ralph-wiggum](https://www.claudepluginhub.com/plugins/anthropics-ralph-wiggum-plugins-ralph-wiggum-2) — **discard**: Novelty skill with no clear repo value. — 🆕 **Added &lt;24h**
- [x] [wshobson agent-teams](https://www.claudepluginhub.com/plugins/wshobson-agent-teams-plugins-agent-teams) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [Anthropic GitHub plugin](https://www.claudepluginhub.com/plugins/anthropics-github-external-plugins-github) — **experiment**: Directly relevant to GitHub-heavy workflow; validate capabilities first. — 🆕 **Added &lt;24h**
- [x] [wshobson codebase-cleanup](https://www.claudepluginhub.com/plugins/wshobson-codebase-cleanup-plugins-codebase-cleanup-2) — **adapt**: Could help focused cleanup tasks if kept constrained. — 🆕 **Added &lt;24h**
- [x] [wshobson conductor](https://www.claudepluginhub.com/plugins/wshobson-conductor-plugins-conductor-2) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [wshobson database-design](https://www.claudepluginhub.com/plugins/wshobson-database-design-plugins-database-design-2) — **adapt**: Useful only for future database-heavy work, not current scope. — 🆕 **Added &lt;24h**
- [x] [Anthropic learning-output-style](https://www.claudepluginhub.com/plugins/anthropics-learning-output-style-plugins-learning-output-style-3) — **adapt**: Relevant to output shaping, but should follow current repo conventions. — 🆕 **Added &lt;24h**
- [x] [github/napkin](https://www.claudepluginhub.com/plugins/github-napkin) — **defer**: Interesting, but unclear immediate fit from title alone. — 🆕 **Added &lt;24h**
- [x] [academic-paper](https://www.claudepluginhub.com/plugins/imbad0202-academic-paper-academic-paper) — **discard**: Academic-writing helper is outside immediate repo scope. — 🆕 **Added &lt;24h**
- [x] [Anthropic GitLab plugin](https://www.claudepluginhub.com/plugins/anthropics-gitlab-external-plugins-gitlab) — **defer**: Only relevant if GitLab becomes an active execution surface. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [wshobson git-pr-workflows](https://www.claudepluginhub.com/plugins/wshobson-git-pr-workflows-plugins-git-pr-workflows-2) — **experiment**: Promising fit for a GitHub-first workflow; worth a small trial. — 🆕 **Added &lt;24h**
- [x] [wshobson database-migrations](https://www.claudepluginhub.com/plugins/wshobson-database-migrations-plugins-database-migrations-2) — **adapt**: Potentially useful later, but not current app scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [web-video-presentation](https://www.claudepluginhub.com/plugins/conardli-presentation-skills-skills-web-video-presentation) — **discard**: Presentation helper is outside repo/tooling priorities. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [wshobson data-validation-suite](https://www.claudepluginhub.com/plugins/wshobson-data-validation-suite-plugins-data-validation-suite-2) — **adapt**: Could help future data-validation tasks; not immediate product scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [wshobson team-collaboration](https://www.claudepluginhub.com/plugins/wshobson-team-collaboration-plugins-team-collaboration-2) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Anthropic productivity](https://www.claudepluginhub.com/plugins/anthropics-productivity-productivity) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [content-research-writer](https://www.claudepluginhub.com/plugins/composiohq-composiohq-content-research-writer-content-research-writer) — **discard**: Content-writing helper is not a current repo need. — 🆕 **Added &lt;24h**
- [x] [domain-name-brainstormer](https://www.claudepluginhub.com/plugins/composiohq-composiohq-domain-name-brainstormer-domain-name-brainstormer) — **discard**: Naming/marketing helper is out of scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [executive-mentor](https://www.claudepluginhub.com/plugins/alirezarezvani-executive-mentor-c-level-advisor-executive-mentor) — **discard**: General advisory skill is not actionable project tooling. — 🆕 **Added &lt;24h**
- [x] [Anthropic project-artifact](https://www.claudepluginhub.com/plugins/anthropics-project-artifact-plugins-project-artifact) — **experiment**: Could help structured project outputs; validate against current docs style. — 🆕 **Added &lt;24h**
- [x] [Anthropic meeting-prep-agent](https://www.claudepluginhub.com/plugins/anthropics-meeting-prep-agent-plugins-agent-plugins-meeting-prep-agent) — **discard**: Meeting prep is not repository work. — 🆕 **Added &lt;24h**
- [x] [fable-goal](https://www.claudepluginhub.com/plugins/alirezarezvani-fable-goal-productivity-fable-goal) — **discard**: Generic coaching skill is out of scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [avoid-ai-writing](https://www.claudepluginhub.com/plugins/wshobson-avoid-ai-writing-plugins-avoid-ai-writing) — **adopt**: Now pinned as a contributor-side Claude Code and Codex plugin; this supersedes the 2026-08-26 discard decision. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [meetings-productivity](https://www.claudepluginhub.com/plugins/alirezarezvani-meetings-productivity-meetings) — **discard**: Meetings workflow is outside repo scope. — 🆕 **Added &lt;24h**
- [x] [GDPR data handling](https://www.claudepluginhub.com/plugins/wshobson-wshobson-gdpr-data-handling-plugins-hr-legal-compliance-skills-gdpr-data-handling) — **adopt**: High-value compliance/safety reference for any future personal-data handling. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [database-migration](https://www.claudepluginhub.com/plugins/wshobson-wshobson-database-migration-plugins-framework-migration-skills-database-migration) — **adapt**: Potentially useful later, but not current app scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [deep-work](https://www.claudepluginhub.com/plugins/alirezarezvani-deep-work-productivity-deep-work) — **discard**: Personal productivity skill is outside repository scope. — 🆕 **Added &lt;24h**
- [x] [Taskmaster Claude Code plugin](https://www.claudepluginhub.com/plugins/eyaltoledano-taskmaster-packages-claude-code-plugin) — **adopt**: Name and scope align closely enough to justify direct evaluation. — 🆕 **Added &lt;24h**
- [x] [shadcn improve](https://www.claudepluginhub.com/plugins/shadcn-improve) — **adapt**: Potentially useful for UI polish, but current app changes should stay minimal. — 🆕 **Added &lt;24h**
- [x] [PM data analytics](https://www.claudepluginhub.com/plugins/phuryn-pm-data-analytics-pm-data-analytics) — **adapt**: Relevant only if product analytics work is brought into this repo. — 🆕 **Added &lt;24h**
- [x] [brag](https://www.claudepluginhub.com/plugins/latent-spaces-brag) — **discard**: Self-promotion helper is out of scope. — 🆕 **Added &lt;24h**
- [x] [council](https://www.claudepluginhub.com/plugins/0xnyk-council) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [Trail of Bits git-cleanup](https://www.claudepluginhub.com/plugins/trailofbits-git-cleanup-plugins-git-cleanup) — **adopt**: High-signal hygiene/safety workflow worth keeping in the toolbox. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Trail of Bits culture-index](https://www.claudepluginhub.com/plugins/trailofbits-culture-index-plugins-culture-index-2) — **discard**: Not a clear fit for repo implementation work. — 🆕 **Added &lt;24h**
- [x] [ifixai](https://www.claudepluginhub.com/plugins/ifixai-ai-ifixai-plugin) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [my-brain-is-full-crew](https://www.claudepluginhub.com/plugins/gnekt-my-brain-is-full-crew) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [goal-prompt](https://www.claudepluginhub.com/plugins/trailofbits-goal-prompt-plugins-goal-prompt) — **experiment**: Try only the most relevant plugins; keep the rest as discovery backlog. — 🆕 **Added &lt;24h**
- [x] [CodeRabbit pack](https://www.claudepluginhub.com/plugins/jeremylongshore-coderabbit-pack-plugins-saas-packs-coderabbit-pack) — **experiment**: Worth comparing against current review/autofix setup. — 🆕 **Added &lt;24h**
- [x] [agents-data-ai](https://www.claudepluginhub.com/plugins/davepoon-agents-data-ai-plugins-agents-data-ai) — **defer**: Adjacent data/AI skill bundle, but not immediate scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [data-preprocessing-pipeline](https://www.claudepluginhub.com/plugins/jeremylongshore-data-preprocessing-pipeline-plugins-ai-ml-data-preprocessing-pipeline-3) — **defer**: Data-pipeline helper is outside the current app focus. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [database-documentation-gen](https://www.claudepluginhub.com/plugins/jeremylongshore-database-documentation-gen-plugins-database-database-documentation-gen-3) — **adapt**: Potentially useful later for data-doc tasks. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Cursor unslop](https://www.claudepluginhub.com/plugins/cursor-unslop-pstack-skills-unslop) — **adapt**: Relevant output-shaping idea, but apply only the parts that fit this repo. — 🆕 **Added &lt;24h**
- [x] [SOW generator](https://www.claudepluginhub.com/plugins/jeremylongshore-sow-generator-plugins-ai-agency-sow-generator-3) — **discard**: Sales/proposal artifact is out of scope. — 🆕 **Added &lt;24h**
- [x] [Grammarly pack](https://www.claudepluginhub.com/plugins/jeremylongshore-grammarly-pack-plugins-saas-packs-grammarly-pack) — **discard**: Writing polish pack is not a core repo need. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [ROI calculator](https://www.claudepluginhub.com/plugins/jeremylongshore-roi-calculator-plugins-ai-agency-roi-calculator-3) — **discard**: Business-calculation helper is outside current repo scope. — 🆕 **Added &lt;24h**
- [x] [agentic-awesome-skills](https://www.claudepluginhub.com/plugins/sickn33-antigravity-awesome-skills) — **experiment**: Useful discovery bundle for future selective trials. — 🔴 **P1** · 🆕 **Added &lt;24h**

---

## GitHub Marketplace / integrations / registry links

_Default lean: **experiment** — Integration candidates should be trialed before any workflow commitment._

- [x] [Linear Code](https://github.com/marketplace/linear-code) — **adopt**: Already aligned with the existing GitHub↔Linear workflow in this repo. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [CodeFactor](https://github.com/marketplace/codefactor) — **defer**: Another review signal source, but not clearly needed alongside existing tools. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [GitHub Copilot for Linear](https://github.com/marketplace/github-copilot-for-linear) — **experiment**: Relevant to the current GitHub/Linear workflow; worth a small trial. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [LovableBot](https://github.com/marketplace/lovablebot) — **discard**: No clear fit for the current product workflow. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Todoist <- GitHub Sync](https://github.com/marketplace/todoist-github-sync) — **experiment**: High relevance to the Todoist-origin backlog; validate before committing workflow changes. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Codetree](https://github.com/marketplace/codetree) — **experiment**: Potential workflow integration candidate; validate fit first. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Claude Code Action Official](https://github.com/marketplace/actions/claude-code-action-official) — **experiment**: Directly relevant to agent-enabled repo automation; worth a bounded trial. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] MCP Registry — Zereight GitLab — `https://github.com/mcp/zereight/gitlab-mcp` — **defer**: Captured as an MCP registry-style bookmark with an invalid GitHub path shape; only useful if GitLab becomes active in this workflow. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] MCP Registry — Outlook Personal MCP — `https://github.com/mcp/salahawad/outlook-personal-mcp` — **discard**: Captured as an MCP registry-style bookmark with an invalid GitHub path shape; personal mailbox integration is outside repository scope. — 🆕 **Added &lt;24h**

---

## GitHub — product / planning skills

_Default lean: **adapt** — Useful planning prompts may help, but should be adapted to this repo's conventions._

- [x] [phuryn/pm-skills — metrics-dashboard](https://github.com/phuryn/pm-skills/tree/main/pm-product-discovery/skills/metrics-dashboard) — **adapt**: Useful planning artifact only if product metrics work becomes explicit. — 🆕 **Added &lt;24h**
- [x] [phuryn/pm-skills — prioritize-assumptions](https://github.com/phuryn/pm-skills/tree/main/pm-product-discovery/skills/prioritize-assumptions) — **adapt**: Relevant planning lens, but should be adapted to current backlog management. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [phuryn/pm-skills — prioritize-features](https://github.com/phuryn/pm-skills/tree/main/pm-product-discovery/skills/prioritize-features) — **adapt**: Relevant planning lens, but should be adapted to current backlog management. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [phuryn/pm-skills — grammar-check](https://github.com/phuryn/pm-skills/tree/main/pm-toolkit/skills/grammar-check) — **discard**: Grammar tooling is not a priority for this repo. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [resend-skills — email-best-practices](https://github.com/resend/resend-skills/tree/main/skills/email-best-practices) — **discard**: Email writing guidance is outside repo scope. — 🆕 **Added &lt;24h**
- [x] [google/skills — agent-platform-skill-registry](https://github.com/google/skills/tree/main/skills/cloud/agent-platform-skill-registry) — **experiment**: Relevant registry pattern worth comparing against current skill organization. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Product-Manager-Skills — altitude-horizon-framework](https://github.com/deanpeters/Product-Manager-Skills/tree/main/skills/altitude-horizon-framework) — **adapt**: Useful planning framework, but should stay lightweight if used. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Product-Manager-Skills — opportunity-solution-tree](https://github.com/deanpeters/Product-Manager-Skills/tree/main/skills/opportunity-solution-tree) — **adapt**: Useful planning framework, but should stay lightweight if used. — 🆕 **Added &lt;24h**
- [x] [context-engineering-kit — write-concisely](https://github.com/NeoLabHQ/context-engineering-kit/tree/master/plugins/docs/skills/write-concisely) — **adopt**: Directly useful for higher-signal agent prompts and docs. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [advertising-skills — generic-language-killer](https://github.com/realkimbarrett/advertising-skills/tree/main/skills/qa/generic-language-killer) — **discard**: Marketing copy helper is not a repository need. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [advertising-skills — objection-crusher](https://github.com/realkimbarrett/advertising-skills/tree/main/skills/copy-chief/objection-crusher) — **discard**: Sales-oriented prompt is out of scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [advertising-skills — mechanism-builder](https://github.com/realkimbarrett/advertising-skills/tree/main/skills/copy-chief/mechanism-builder) — **discard**: Marketing/copywriting prompt is out of scope. — 🔴 **P1** · 🆕 **Added &lt;24h**

---

## AWS / SAP / enterprise data

_Default lean: **defer** — Enterprise-data references are adjacent, not current product scope._

- [x] [How frontier teams are reinventing AI-native development](https://aws.amazon.com/blogs/machine-learning/how-frontier-teams-are-reinventing-ai-native-development/) — **adapt**: Useful directional reading for agent-enabled development practices. — 🆕 **Added &lt;24h**
- [x] [Democratizing institutional knowledge — AI-powered knowledge management](https://aws.amazon.com/blogs/machine-learning/democratizing-institutional-knowledge-building-an-ai-powered-knowledge-management-system-with-aws/) — **adapt**: Relevant to knowledge capture patterns, but not an immediate change driver. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Agentic Data Operations Platform (ADOP)](https://aws.amazon.com/blogs/machine-learning/agentic-data-operations-platform-adop-data-engineering-into-hours/) — **defer**: Adjacent platform material, not current Taskmaster Pro scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Accelerating Analytics on AWS](https://docs.aws.amazon.com/solutions/accelerating-analytics-on-aws/?did=sl_card&amp;trk=sl_card) — **defer**: Broad platform guidance outside current app scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Data Federation between SAP and AWS](https://docs.aws.amazon.com/solutions/data-federation-between-sap-and-aws/) — **defer**: Enterprise integration topic outside current app scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Data Lakes with SAP and Non-SAP Data on AWS](https://docs.aws.amazon.com/solutions/data-lakes-with-sap-and-non-sap-data-on-aws/) — **defer**: Enterprise integration topic outside current app scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [SAP Data Integration and Management on AWS](https://docs.aws.amazon.com/solutions/sap-data-integration-and-management-on-aws/?did=sl_card&amp;trk=sl_card) — **defer**: Enterprise integration topic outside current app scope. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [aws-samples/sample-aws-genai-db-modernizer](https://github.com/aws-samples/sample-aws-genai-db-modernizer) — **defer**: Interesting adjacent sample, but not immediate product scope. — 🆕 **Added &lt;24h**
- [x] [aws-samples/sample-spec-driven-presentation-maker](https://github.com/aws-samples/sample-spec-driven-presentation-maker) — **experiment**: Relevant enough to inspect for spec-driven workflow ideas. — 🆕 **Added &lt;24h**
- [x] [aws-samples/sample-aws-data-processing-and-analytics](https://github.com/aws-samples/sample-aws-data-processing-and-analytics) — **defer**: General analytics sample outside current app scope. — 🆕 **Added &lt;24h**
- [x] [aws-samples/sample-sap-load-testing-a-serverless-approach-with-aws](https://github.com/aws-samples/sample-sap-load-testing-a-serverless-approach-with-aws) — **discard**: Very domain-specific and outside current repo needs. — 🆕 **Added &lt;24h**

---

## Skillselion — agent / Claude skills

_Default lean: **experiment** — Discovery source for reusable agent skills; trial selectively._

- [x] [Best skills for AI & Agents [2026]](https://skillselion.com/best/skills-for-ai-agents) — **experiment**: Discovery roundup; use it to find candidates, not as an authority. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Repo Intake And Plan Skill for Claude Code](https://skillselion.com/skills/lllllllama/rigorpilot-skills/repo-intake-and-plan) — **adopt**: Directly relevant to recurring repository-intake work. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Brainstorming](https://skillselion.com/category/docs-planning) — **discard**: Captured URL is a broad Skillselion docs/planning category page, not a durable single-skill permalink, so treat it as generic discovery only. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Doc Coauthoring](https://skillselion.com/category/docs-planning?page=2) — **discard**: Captured URL is page 2 of the same broad Skillselion docs/planning category, not a durable single-skill permalink. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Review Loop](https://skillselion.com/category/testing-review) — **adopt**: Captured URL is a broad testing/review category page rather than a stable single-skill permalink, but the review-loop theme is relevant enough to keep as an active reference. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Antigravity Awesome Skills / Ponytail marketplace page](https://skillselion.com/marketplaces) — **experiment**: Captured URL is the marketplace index, so use it only as a breadcrumb to the underlying skill if needed. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [improve-codebase-architecture](https://skillselion.com/leaderboard) — **adapt**: Captured URL is the Skillselion leaderboard rather than a stable skill permalink; keep only the architecture-improvement theme. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Database Migration](https://skillselion.com/browse) — **defer**: Captured URL is the generic Skillselion browse page, so this is too ambiguous to prioritize now. — 🔴 **P1** · 🆕 **Added &lt;24h**
- [x] [Writing For Agents Skill for Claude Code](https://skillselion.com/skills/mattpocock/skills/writing-for-agents) — **adapt**: Useful if translated into the repo's existing prompt and docs style. — 🆕 **Added &lt;24h**
- [x] [Self Improving Agent Skill for Claude Code](https://skillselion.com/skills/zhaono1/agent-playbook/self-improving-agent) — **experiment**: Interesting advanced pattern worth a bounded trial. — 🆕 **Added &lt;24h**
