# /update-components

Review and update all design system components after Figma token changes.

Run this after Figma variables have been re-exported to `FigmaTokens/` to ensure all component
CSS, HTML demos, and documentation stay in sync with the updated token values.

---

## Step 0 — Permissions (ALWAYS first, before any other action)

Before doing anything, output the following numbered list and ask the user to confirm which
categories are pre-approved for this session. Do NOT proceed until all categories are addressed.

```
The following actions may be taken during /update-components. Please confirm which are approved:

1. Run `npm run tokens` (regenerates all 4 CSS files)
2. Read-only Figma fetches (get_design_context, get_variable_defs, get_metadata)
3. Edit component CSS files
4. Edit component HTML demo files
5. Edit figma-notes.md files
6. Edit CLAUDE.md §2 and §10
7. Update memory files (.claude/memory/)
8. Commit and push

Reply with which numbers are approved, or say "all approved" to approve everything.
```

Do not run `npm run tokens` or make any edits until the user has responded.

---

## Step 1 — Rebuild tokens

Run `npm run tokens`.

Capture any warnings or errors and report them. If the build fails, stop and report the error.

Run `git diff HEAD css/` to compare the newly generated files against the last committed
HEAD versions. Save this diff output as the **change manifest**.

> Note: the generated CSS files (`css/tokens*.css`) are in `.gitignore` and are not committed
> to git. If `git diff HEAD css/` shows nothing, the CSS was not previously tracked. Instead,
> compare the file contents directly by reading them — the token values in them are the ground
> truth for what's live.

If no token values changed (diff is empty AND no files were newly created), report:
> "No token values changed. No components need updating."
> Then stop — do not continue to Step 2.

---

## Step 2 — Verify mode integrity

Check that desktop fluid font values are LARGER than mobile fluid values for the same variables.

Read `css/tokens.css` and `css/tokens-mobile.css` and compare `--ai-font-fluid-sm`:
- Desktop (tokens.css): should be `1rem` (16px)
- Mobile (tokens-mobile.css): should be `0.875rem` (14px)

Desktop > Mobile for all fluid sizes = ✓ correct order.

If ANY fluid value is smaller on desktop than on mobile, STOP and report:
> "Mode order error detected: --ai-font-fluid-[X] is [Xrem] on desktop but [Yrem] on mobile (desktop should be larger). Check FigmaTokens/Typography/ source files."

Do not continue until this is resolved.

---

## Step 3 — Triage components

Read the CSS file for each component. Check which `--ai-*` tokens it uses.
Cross-reference each token against the change manifest from Step 1.

Build a triage table:

| Component | CSS file | Tokens changed | Action |
|---|---|---|---|
| Button | Button.css | --ai-btn-primary | Review + update |
| InfoLabel | InfoLabel.css | none | Skip |
| … | … | … | … |

Components with "Skip" require NO further action this session.
Components with "Review + update" proceed to Step 4.

Also flag any component that:
- Uses a token whose value CHANGED (not just added)
- Uses a hardcoded hex or px value that should now map to a changed token
- Should NOW use a newly-added token (e.g. `--ai-surface-minimal`) based on its Figma design

---

## Step 4 — Review and update each affected component

For each component flagged in Step 3 (in leaf-first order):

### 4a. Fetch fresh Figma design context

Call `get_design_context` for each variant of the component. Do NOT skip variants.
Call `get_variable_defs` to identify any token gaps.

Follow all rules from CLAUDE.md §6 (Figma → Code Workflow):
- Token gap rule: STOP and report any property with no `--ai-*` semantic token
- Contextual override rule: STOP and flag any anomaly vs the child component design
- Interaction discovery rule: STOP if any JS-interaction variants are found that lack JS

### 4b. Update CSS

Apply the exact token values from Figma. Follow all rules from CLAUDE.md §8 (Token Usage Rules).

Do NOT:
- Infer values for states that weren't refetched
- Use hardcoded hex values
- Use primitives without per-session user approval

### 4c. Update HTML demo

If the CSS class names, markup structure, or visible content changed, update the demo HTML.

### 4d. Update figma-notes.md

Update the CSS Class Mapping and Dependencies sections if anything changed.

---

## Step 5 — Wrap up

### 5a. Update CLAUDE.md

For each token that was ADDED or CHANGED:
- Update §2 tables (Surface, Border, Text, etc.) with the new values
- Update §2a Dark Mode table if the token has a dark-mode override
- Add §2b Minimised table entries if relevant

For each component that was updated:
- Update §10 (Current Components) table — "Status", "Notes" columns

### 5b. Update memory files

Update `.claude/memory/MEMORY.md`:
- Fix any outdated token value notes (e.g. `Neutral/200 primitive` mapping)
- Add notes about new tokens or patterns discovered

### 5c. Commit

Create a commit with all changes. Message format:
```
Update token values and component CSS after Figma re-export

- Regenerated css/tokens*.css (npm run tokens)
- Updated CLAUDE.md §2 token tables
- [list specific components if any were updated]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Push if the user pre-approved it in Step 0.

---

## Rules that apply throughout

All rules from `CLAUDE.md` apply at every step:
- Never infer token values — always fetch from Figma
- Token gap rule: STOP on any missing `--ai-*` semantic token
- Contextual override rule: STOP and flag before writing any code
- Transition prompt rule: ask before adding any `transition` CSS
- No hardcoded hex or px dimension values
- All components must have working demo HTML pages
- Dark mode toggle script must be in every demo page

---

## Component order (leaf-first)

When updating multiple components, always work in this order to ensure dependencies are
already correct before touching composites:

1. Button
2. InfoLabel
3. Input
4. Tooltip
5. Pill
6. Portraits
7. Avatar
8. Header
9. SignUpForm
10. VersionHistoryRow
11. VersionHistory
12. PromptTemplateItem
13. PromptTemplates
