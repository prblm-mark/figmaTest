# Article 10007 — live field inventory (sf.affino.com)

Read 2026-09-29 from `/control/standard-item-edit?Action=change&StandardItemCode=10007` (logged-in
session, read only — nothing edited or saved). Source of truth for filling the RecordScreen
framework with a real article's full field set. Legacy markup: each section is a
`.LiveEditDividerTabLableClass` + `.DividerArea` of `.LiveEditFormClass` rows. Input `name`s are
the live field names. "✓" = checked; quoted = current value.

**Record:** "Future of ancient Scottish trees protected at Aberdeenshire's Drum Estate [slideshow]" ·
Presentation Style **Review Article** · Section **Home** · Category Topic **Culture** · Article Type
**SF Plus** · Creator **Mark Foster** · Publish 07/08/2026 13:19 → 07/08/2126 13:19 · Live ✓ ·
Syndication ✓ · Slideshow ✓ · Full Width Article ✓.

| Section | Field (`name`) | Control | 10007 value |
|---|---|---|---|
| Presentation Style | Presentation Style (`StandardTemplateCode`) | template picker | Review Article |
| Navigation | Section (`StandardSectionCode`) | lookup [Select] | Home |
| | Sort Order (`SO`) | lookup [Select] + text | — |
| | Multi Display (`MultiDisplay`) | multi-select lookup [Select] | Topics |
| | Priority (`Priority`) | select (blank, 1…30) | — |
| Introduction | Title (`Title`) * | text | Future of ancient Scottish trees… [slideshow] |
| | Screen Name (`ScreenName`) | text (slug, validated) | future-of-ancient-scottish-trees-… |
| | Alternative Title (`Title2`) | text | — |
| | Thumbnail (`ImageThumb` + `AltThumb`) | image picker + alt text | — |
| | Alternative Thumbnail (`ImageThumb2` + `AltThumb2`) | image picker + alt text | — |
| | Teaser (`Teaser`) | textarea | "As the Easter bank holiday weekend approaches…" (205 ch) |
| | Call to Action (`CallToAction`) | text | — |
| | Location (`Location`) | text | — |
| | Launch Date (`LaunchDate`) | date [Clear] | — |
| Topics | Category Topic (`CategoryTaxonomyCategoryCode`) | select (7) | Culture |
| | Topics and Keywords | multi-select [Select] | — |
| SEO | Page Title (`PageTitle`) | text | — |
| | Page Description (`PageDescription`) | textarea | — |
| Main Body | Main Image (`ImageMain`, `AltMain`, `CaptionMain`, `AlignMain`, width) | image + alt + caption + align L/C/R + width | "sf review ph", Center, 100% |
| | Label Image (`ImageLabel`, `AltLabel`) | image + alt | — |
| | Audio Version (MP3) (`AudioMediaFileItemCode`) | media file picker | — |
| | Introduction (`Introduction`) | rich text | — |
| | Intro Image | image + alt + caption + align + width | Left?, 33% |
| | Image Top | image + alt + caption + align + width | "sf review ph", 33% |
| | Main Body (`Text1`) | rich text (HTML) | Lorem … (1,967 ch) |
| | Image 1 … Image 6 | image + alt + caption + align + width | Image 1 "sf standard ph", 100%; others 100% |
| | Text 2 / Text 3 / Text 4 | rich text | Text 2 has 2,145 ch (HTML) |
| | Base Image · Background Image | image pickers | — |
| Geo Targeting | Geo Targeting Type (`GeoBlockingType`) | select (4) | None |
| | Countries (`Countries`) | multi-select [Select] | — |
| Review | Quote (`QuotationText`) | textarea | = teaser text (205 ch) |
| | Rating (`EditorialRating`) | select (6) | — |
| | Show Images As Slideshow (`SlideshowImagesYN`) | checkbox | ✓ |
| | Full Width Article (`FullWidthArticleYN`) | checkbox | ✓ |
| Review – Verdict | Name · Item Reviewed (select) · Details · Score · Verdict · Pros · Cons | text / select / textareas | — |
| Advanced | External Article ID | text | — |
| | Article Type | select (2) | SF Plus |
| | Sponsored Article | checkbox | — |
| | Sponsor · Sponsor Link | text | — |
| | Sponsor Open Link Option | select (3) | New Tab |
| | Step By Step Title · Info Box Title | text | — |
| | Info Box Text | textarea | — |
| | Info Box Auto Bullets | checkbox | — |
| | Multimedia | [button] picker | — |
| | Credits | textarea | — |
| Social | Shareline 1–3 | text | — |
| Security | Content Security Right | select | — |
| Publication | Creator | lookup + text | Mark Foster |
| | Account | lookup + text | — |
| | Publish Start · Publish End · Embargo End | datetime | 07/08/2026 13:19 · 07/08/2126 13:19 · — |
| | Syndication · Live · Private · Hide From Search Results · Exclude From AI Index · Moderated | checkboxes | Syndication ✓, Live ✓ |

Image width options: 100%, 75%, 66%, 50%, 33%, 25%. Image alignment: Left / Center / Right.

## New FieldRow types this needs (vs the current kit)
Checkbox (single + group), Date / Datetime, Lookup (value + Select button), Image-with-options
(alt, caption, alignment, width), Rich text (HTML), Media file picker, Rating select. Most map to
existing DS components (Checkbox, DatePicker/TimePicker, Input, Select, RadioGroup, MediaPicker).
