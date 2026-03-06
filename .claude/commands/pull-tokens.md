# /pull-tokens

Automates the post-export token workflow after a manual Figma re-export.

> **Note:** Pulling tokens directly from the Figma Variables REST API requires an Enterprise
> plan. The current Org account cannot use it. This skill automates everything *after* the
> manual export step — it does not replace it.

---

## Steps

1. **Confirm export has happened**

   Ask the user: "Have you re-exported the token files from Figma? (Plugins → export to
   `FigmaTokens/`). If not, please do that first, then re-run `/pull-tokens`."

   Wait for confirmation before continuing.

2. **Rebuild generated CSS**

   ```
   npm run tokens
   ```

   This regenerates all four CSS files from the updated `FigmaTokens/` JSON:
   - `css/tokens.css` (desktop)
   - `css/tokens-mobile.css` (mobile overrides)
   - `css/tokens-dark.css` (dark theme)
   - `css/tokens-minimised.css` (compact layout)

3. **Show what changed**

   ```
   git diff css/
   ```

   Report the full diff to the user so they can see exactly which `--ai-*` values changed.

4. **Triage affected components**

   Cross-reference every changed `--ai-*` variable name against component CSS files in
   `src/components/`, `src/patterns/`, and `src/templates/`.

   For each changed token, list the component files that reference it.

5. **Report and offer next step**

   If any components use changed tokens, report them and ask:
   > "The following components use tokens that changed: [list]. Would you like me to review
   > them for visual regressions, or run `/update-components` to update them?"

   If no component CSS changed visually (e.g. only generated file metadata differed), confirm
   that no component updates are needed.
