---
name: github-issue-creator
description: Convert raw notes, error logs, voice dictation, or screenshots into crisp GitHub-flavored markdown issue reports. Use when the user pastes bug info, error messages, or informal descriptions and wants a structured GitHub issue. Supports images/GIFs for visual evidence.
---

# GitHub Issue Creator

Transform messy input (error logs, voice notes, screenshots) into clean, actionable GitHub issues.

> **Provenance:** Adapted for this repository from
> [`microsoft/skills`](https://github.com/microsoft/skills/tree/a2003b6b95ead129e53dd5377a2229682ff75b1b/.github/skills/github-issue-creator)
> at commit `a2003b6` (MIT). Two changes from upstream, per the intake decision in
> `docs/ai-resource-intake.md` (COL-335): the output location files issues through
> GitHub instead of committing `/issues/*.md` files, and the Azure-product examples
> are replaced with synthetic generic ones.

## Output Template

```markdown
## Summary
[One-line description of the issue]

## Environment
- **Product/Service**: 
- **Region/Version**: 
- **Browser/OS**: (if relevant)

## Reproduction Steps
1. [Step]
2. [Step]
3. [Step]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Error Details
```
[Error message/code if applicable]
```

## Visual Evidence
[Reference to attached screenshots/GIFs]

## Impact
[Severity: Critical/High/Medium/Low + brief explanation]

## Additional Context
[Any other relevant details]
```

## Output Location

**Draft the issue body, show it for review, then file it as a GitHub issue** in the
target repository (GitHub issues sync to Linear here). Never commit issue markdown
files into the repo — `tasks.md` is the source of truth and GitHub issues are the
mirror, so committed issue files would create a third, unsynced tracking surface.

## Guidelines

**Be crisp**: No fluff. Every word should add value.

**Extract structure from chaos**: Voice dictation and raw notes often contain the facts buried in casual language. Pull them out.

**Infer missing context**: If user mentions "same project" or "the dashboard", use context from conversation or memory to fill in specifics.

**Placeholder sensitive data**: Use `[PROJECT_NAME]`, `[USER_ID]`, etc. for anything that might be sensitive. Never include real employer, customer, or internal server names.

**Match severity to impact**:
- Critical: Service down, data loss, security issue
- High: Major feature broken, no workaround
- Medium: Feature impaired, workaround exists
- Low: Minor inconvenience, cosmetic

**Image/GIF handling**: Reference attachments inline. Format: `![Description](attachment-name.png)`

## Examples

**Input (voice dictation)**:
> so I was trying to run the agent step and it just failed silently no error nothing the run started but then poof the step was still sitting there unfinished had to refresh and try again three times

**Output**:
```markdown
## Summary
Agent step run fails silently - no error displayed, step stays unfinished

## Environment
- **Product/Service**: [APP_NAME] agent runner
- **Region/Version**: [VERSION]

## Reproduction Steps
1. Open a task with a runnable step
2. Start the agent run
3. Observe the run appears to start
4. Check the step status

## Expected Behavior
Step settles as done/failed with a result summary, errors shown if the run fails

## Actual Behavior
Step remains unfinished. No error message. Requires page refresh and retry.

## Impact
**High** - Blocks the step-execution workflow, no feedback on failure cause

## Additional Context
Required 3 retry attempts before a successful run
```

---

**Input (error paste)**:
> Error: PERMISSION_DENIED when posting the sync webhook. Code: 403. Was working yesterday.

**Output**:
```markdown
## Summary
403 PERMISSION_DENIED error when posting the sync webhook

## Environment
- **Product/Service**: [APP_NAME] → [INTEGRATION_NAME] sync
- **Region/Version**: [REGION]

## Reproduction Steps
1. Configure the sync integration
2. Trigger a sync event

## Expected Behavior
Webhook posts successfully and the sync completes

## Actual Behavior
Returns `PERMISSION_DENIED` with code 403

## Error Details
```
Error: PERMISSION_DENIED
Code: 403
```

## Impact
**High** - Blocks the sync integration, regression from previous working state

## Additional Context
Was working yesterday - possible permission/config change or service regression
```
