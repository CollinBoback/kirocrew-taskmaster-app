# AI resource intake

Log of AI agents, skills, and ideas proposed for Cursor/Kiro ingestion. Each entry records
title, URL, research summary, proposed value, caveats, and a Decision. A Decision stays
**Pending** until Collin records yes/no. External skills stay out of `.kiro/skills/` until the
Decision is **yes**.

## find-skills

- **Title:** find-skills
- **URL:** https://github.com/vercel-labs/skills (skill path: `skills/find-skills/SKILL.md`)
- **Research summary:** Skill from Vercel Labs' open agent-skills registry that teaches an agent
  to discover and install other skills through the Skills CLI (`npx skills find` / `npx skills
  add`). Installed via that CLI and pinned in `skills-lock.json`; copies currently live under
  `.claude/skills/` and `.agents/skills/`, and the source is staged in
  `input-resources-staged/find-skills/`.
- **Proposed value:** Lets agents search the open skills ecosystem and pull in capabilities on
  demand instead of hand-copying skill files.
- **Caveats:** Third-party instructions executed by agents, and it drives installation of
  further external skills — each of those still needs its own intake entry. Removed from
  `.kiro/skills/` pending this decision.
- **Decision:** Pending
