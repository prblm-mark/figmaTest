# `_shell/` — extracted CC shell partials

**Do not hand-edit these files.** They are lifted verbatim from
`src/cc/templates/ListingScreen/Articles.html` so that this prototype mounts the *real* Control
Centre shell rather than a retyped approximation of it. Retyping a 250-line sidebar is exactly the
kind of thing that drifts silently and then reads as a design decision.

Regenerate with:

```bash
SRC=src/cc/templates/ListingScreen/Articles.html
OUT=src/prototypes/ControlRecordScreen/_shell
fix() { sed -e 's#\.\./\.\./\.\./#@SRC@#g' -e 's#\.\./\.\./#@CC@#g' \
            -e 's#@SRC@#../../#g' -e 's#@CC@#../../cc/#g'; }
sed -n '86,333p'    $SRC | fix > $OUT/sidebars.html      # both sidebar asides
sed -n '335,446p'   $SRC | fix > $OUT/chrome-open.html   # <main> + chrome + top nav + icon nav
sed -n '462,464p'   $SRC | fix > $OUT/chrome-close.html  # closes header-group + chrome
sed -n '634,696p'   $SRC | fix > $OUT/rail.html          # right ActionsMenu icon rail
sed -n '1028,1052p' $SRC | fix > $OUT/toast-modal.html   # toast stack + favourites modal
{ sed -n '1054,1071p' $SRC; echo; sed -n '1073,1221p' $SRC; } | fix > $OUT/scripts.html
```

Line numbers are against `Articles.html` as of 2026-09-22; re-check them if that file moves.

## The path rewrite

`Articles.html` sits at `src/cc/templates/ListingScreen/` — four levels below `src/`. This
prototype sits at `src/prototypes/ControlRecordScreen/` — three levels below. So every relative
path shifts up one:

| In `Articles.html` | Resolves to | Here |
|---|---|---|
| `../../../X` | `src/X` | `../../X` |
| `../../X` | `src/cc/X` | `../../cc/X` |
| `../ControlScreen/X` | `src/cc/templates/ControlScreen/X` | written out in full by the generator |

The two-pass placeholder in `fix()` matters: rewriting `../../` first would also eat the tail of
every `../../../`. A stylesheet linked at the wrong depth 404s **silently** and the page just
looks unstyled, so after regenerating, resolve every asset against the real page URL rather than
grepping for the filenames:

```bash
BASE=http://localhost:8080/src/prototypes/ControlRecordScreen/
grep -ohE '(href|src)="(\.\./|[A-Za-z])[^"]*"' ../article-view-a.html \
  | sed -E 's/^[^"]*"//;s/"$//' | grep -v '^http' | sort -u \
  | while read -r a; do
      url=$(python3 -c "import urllib.parse,sys;print(urllib.parse.urljoin('$BASE',sys.argv[1]))" "$a")
      printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$url")" "$a"
    done | grep -v '^200' || echo "all resolve"
```

## What is deliberately NOT extracted

**The AI Assistant panel** (`Articles.html:697-998`) and **the AssistantPopover coachmark**
(`:999-1027`). Both are `position: fixed` against the content area — the panel top-right at
`z-index: 60`, the coachmark bottom-right at `z-index: 55` (`ControlScreen.css:413-419`, `:428-438`).
That is precisely where `.crs-aside` sits, and the coachmark auto-shows on a timer, so it would
cover the sidebar in every Figma capture. The rail's AI button is kept but left inert.

The listing's own content (`:468-631`), its FilterBar/Datatables CSS links, and
`listing-data*.js` / `ListingScreen.js` are also not extracted — this screen is not a listing.
