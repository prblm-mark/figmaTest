# ApiProfileTestTool (CC) — Figma Notes

Two screens, one build, done together at Mark's request (2026-10-05):

| Screen | Task | Classic | Output |
|---|---|---|---|
| `/control/api-profile-user-test-tool` | TASK-470999 | `/AfcControl/CC/APIProfileUserTestTool.cfm` (772 lines) | `ApiProfileUserTestTool.html` |
| `/control/api-profile-crm-test-tool` | TASK-471000 | `/AfcControl/CC/APIProfileCRMTestTool.cfm` (814 lines) | `ApiProfileCRMTestTool.html` |

Harnesses for the REST APIs the two API Profile help pages document. Both tasks are `blocked` on the
Hub (Lynx, 2026-09-17, no comment, the same minute as Export System). Mark asked for the demos anyway.

## Figma Node

**None.** No-design, composed on the ControlScreen shell, with the **API help pages' layout**
(`../ApiProfileHelp/ApiProfileHelp.css` + `.js`, loaded as-is): "On this page" rail with endpoint
counts, the sticky Select with count chips below 1023, one RecordSection card per section, endpoint
articles with method Badges. This file adds only the forms. Breadcrumb Settings › API Profiles ›
<screen>.

## Agreed beyond a straight conversion (Mark, 2026-10-05, "go ahead with all five")

1. **The API help layout** (above).
2. **A Sign button on every form.** It fills the form's Time Stamp, Signature and MD5 with the same
   calculation as Create signature, for that form's method, path and body. Classic made you run
   Create signature and copy the values across by hand.
3. **One shared credentials card:** API Key (both pages), plus Access Token and Refresh Token on the
   User page. Entered once instead of 33 / 20 times. A form's "Use different credentials" values win
   when filled in.
4. **Mock responses = the API help's documented example** for the same endpoint. With no API key,
   Send returns the help's documented `401` `{"error":{"code":"-101","message":"API Key is missing"}}`.
   All 31 endpoints have an example (12 User, 19 CRM).
5. **Generated** by `_generate.py`, which reuses the help generator's ColdFusion evaluator and
   tolerant parser.

## Generated

```
python3 _generate.py --classic <dir>
```

`<dir>` needs the two test-tool sources plus the help pages' six (for the example responses). None
are committed. Every section, endpoint, field, label, default value and select option comes from the
classic markup. Checked 2026-10-05: every classic control name is present in the output (the only
extras are the shared credentials card), as are every label (HTTP Method / URI Pattern / URL Variables
become the route line and per-variable labels) and every textarea default, verbatim.

## Behaviour (`ApiProfileTestTool.js`)

| Part | Behaviour |
|---|---|
| Route line | Method Badge + URI. ID / ID2 fields fill the path as you type (classic does too) |
| Fields | DS Input / Textarea / Select in a grid (min 240px, `size-4`; gaps `spacing-4` / `spacing-6`, ExportSystem's). URL variables, path IDs and extra headers (Filter, ContentType), then the JSON body full width |
| Sign | Time Stamp = now (ISO 8601, as classic's `toISOString()`), MD5 of the trimmed body for POST / PUT, Signature = SHA-512 of `METHOD+path+MD5+secret+timestamp`, uppercase hex |
| Send request | Headers = the form's credentials + signing fields + extra fields; URL variables as a query string; JSON body for POST / PUT; the same request classic's jQuery sends. The response shows a status Badge (success 2xx, danger otherwise), the request line, a "Request headers (and body)" disclosure, then the pretty-printed body. A note says it is the example response and nothing was sent |
| Create signature | Classic's card. The Time Stamp ticks every 100ms (as classic's). Classic's warning sentence becomes an Alert `--warning` with its red phrase in bold. The result reads as classic's: "Signature: … / Time Stamp: … / MD5: …" |

**Hashes verified (2026-10-05, headless):** the in-page MD5 matches hashlib for the docs' body,
empty, non-ASCII ("£ café ☃") and 1,000-character strings. SHA-512 reproduces the CRM help's
128-character example. The Sign results on User Login and CRM Get Account match an independent
Python computation exactly. Web Crypto has no MD5, so a standard RFC 1321 implementation lives in
the JS.

## Fixed / differs from classic

- **User Token form couldn't submit.** `input[name='APIKey")` (mismatched quotes) throws in jQuery.
  The generated form uses the generic handler.
- **User Create Signature never validated.** It signed with an empty secret for an unknown key. Both
  pages now use the CRM tool's checks and messages ("URI Pattern not valid", "HTTP Method not
  valid", "API Key not valid").
- **Query string:** classic always appends `?` and a trailing `&` when the form has URL variables.
  Here `?` appears only when one is filled and there's no trailing `&`.
- **The demo pre-fills the docs' example API key** (`49yRcAR9J9`) so Sign works. Live leaves it empty.

## Responsive

The same as the help pages. The field grid reflows intrinsically. Measured at 390: both pages
390/390, nothing past the edge. The pinned Select gained a page-ground backdrop (in
ApiProfileHelp.css, so the help pages have it too): content no longer shows through the 24px band
above it.

## Backend (`TODO(backend:ApiProfileTestTool)`)

| id | What |
|---|---|
| `api-test-send` | Send a real request: `$.ajax({type: method, url: '/rest/<site>/…' + query, headers, data})` in classic, and show the real status and body |
| `api-test-sign` | Sign / Create signature → POST `{thisDoc}?action=hash {APIKey, HTTPMethod, URIPattern, TimeStamp, Body}`; the server looks up the key's secret (never sent to the browser). Classic's action also sets `Access-Control-Allow-Origin: *` and trusts only a Referer check. Worth tightening |
| `api-test-demo-key` | The shared API Key is pre-filled with the docs' example; live starts empty |
