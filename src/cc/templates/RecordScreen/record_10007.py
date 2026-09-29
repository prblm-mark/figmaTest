"""Article 10007 on the record-screen framework — every field the live edit screen has.

Read 2026-09-29 from sf.affino.com `/control/standard-item-edit?Action=change&StandardItemCode=10007`
(read only). Inventory + provenance: article-10007-fields.md. The point is coverage: does the
View / Edit framework hold a REAL article's full field set, not just the Figma draft's six sections?

ONE table drives both screens: each field is (label, view kind, view value, edit kind, edit value,
options). Values are the live record's; empty live fields render "-" on View and empty controls on
Edit. The body copy on this record is lorem ipsum on the live site too — kept, with its real block
structure (paragraphs, a blockquote, an H3 and an H2 in Text 2).

New row kinds used here are code-first and flagged for Figma (record_markup: rich, checkbox, date,
datetime, lookup, image, file).
"""
import record_markup as m

TITLE = "Future of ancient Scottish trees protected at Aberdeenshire's Drum Estate [slideshow]"
TEASER = ("As the Easter bank holiday weekend approaches, our thoughts might turn to sprucing up the garden, "
          "wondering how not to eat our own bodyweight in chocolate eggs and who will be whipping up the roast dinner.")

_LOREM_A = ("Lorem dolor sit amet, consectetur adipiscing elit. Ut pretium pretium tempor. Ut eget imperdiet neque. "
            "In volutpat ante semper diam molestie, et aliquam erat laoreet. Sed sit amet arcu aliquet, molestie justo "
            "at, auctor nunc. Phasellus ligula ipsum, volutpat eget semper id, viverra eget nibh. Ut eget imperdiet "
            "neque. In volutpat ante semper diam molestie, et aliquam erat laoreet. Sed sit amet arcu aliquet, "
            "molestie justo at, auctor nunc.")
_LOREM_B = ("Phasellus ligula ipsum, volutpat eget semper id, viverra eget nibh. Lorem ipsum dolor sit amet, "
            "consectetur adipiscing elit. Ut pretium pretium tempor. Ut eget imperdiet neque. In volutpat ante semper "
            "diam molestie, et aliquam erat laoreet. Sed sit amet arcu aliquet, molestie justo at, auctor nunc. "
            "Phasellus ligula ipsum, volutpat eget semper id, viverra eget nibh.")
# Text1: three paragraphs (440 / 572 / 906 ch live). Text2: P P BLOCKQUOTE P H3 H2 P (live structure).
MAIN_BODY = [("p", _LOREM_A), ("p", _LOREM_B + " " + _LOREM_A[:120]), ("p", _LOREM_A + " " + _LOREM_B)]
TEXT_2 = [("p", _LOREM_A), ("p", _LOREM_B),
          ("blockquote", "Sed sit amet arcu aliquet, molestie justo at, auctor nunc. Lorem ipsum dolor sit amet, "
                         "consectetur adipiscing elit."),
          ("p", _LOREM_B), ("h3", "Take a deeper dive"),
          ("h2", "How should governance evolve when AI pilots transition to production?"), ("p", _LOREM_A)]

WIDTHS = "Width"


def _img(alt, align="Center", width="100%", caption=""):
    """A present image: View shows MediaMeta (alt caption + details), Edit the picker + its options."""
    rows = [("Alt text", alt or "-"), ("Caption", caption or "-"), ("Alignment", align), ("Width", width)]
    return ("media", rows, "image", {"src": True, "alt": alt, "caption": caption, "align": align, "width": width})


def _no_img(align="Center", width="100%"):
    return ("text", "-", "image", {"align": align, "width": width})


def _yn(on, label=None):
    return ("text", "Yes" if on else "No", "checkbox", on, label)


# (label, view_kind, view_value, edit_kind, edit_value[, checkbox label / options])
SECTIONS = [
    ("Presentation Style", [
        ("Presentation Style", "text", "Review Article", "select", "Review Article"),
    ]),
    ("Navigation", [
        ("Section", "tags", ["Home"], "lookup", "Home"),
        ("Sort Order", "text", "-", "lookup", ""),
        ("Multi Display", "tags", ["Topics"], "tagbox", ["Topics"], "modal-multi-display"),
        ("Priority", "text", "-", "select", ""),
    ]),
    ("Introduction", [
        ("Title", "text", TITLE, "input", TITLE, {"required": True}),
        ("Screen Name", "text", "future-of-ancient-scottish-trees-protected-at-aberdeenshires-drum-estate-slideshow",
         "input", "future-of-ancient-scottish-trees-protected-at-aberdeenshires-drum-estate-slideshow",
         {"help": "Used in the article URL."}),
        ("Alternative Title", "text", "-", "input", ""),
        ("Thumbnail",) + _no_img(),
        ("Alternative Thumbnail",) + _no_img(),
        ("Teaser", "paragraph", TEASER, "textarea", TEASER),
        ("Call to Action", "text", "-", "input", ""),
        ("Location", "text", "-", "input", ""),
        ("Launch Date", "text", "-", "date", ""),
    ]),
    ("Topics", [
        ("Category Topic", "tags", ["Culture"], "select", "Culture"),
        ("Topics and Keywords", "text", "-", "tagbox", [], "modal-topics"),
    ]),
    ("SEO", [
        ("Page Title", "text", "-", "input", ""),
        ("Page Description", "text", "-", "textarea", ""),
    ]),
    ("Main Body", [
        ("Main Image",) + _img("sf review ph", "Center", "100%"),
        ("Label Image",) + _no_img(),
        ("Audio Version (MP3)", "text", "-", "file", ""),
        ("Introduction", "text", "-", "rich", []),
        ("Intro Image",) + _no_img("Left", "33%"),
        ("Image Top",) + _img("sf review ph", "Center", "33%"),
        ("Main Body", "rich", MAIN_BODY, "rich", MAIN_BODY),
        ("Image 1",) + _img("sf standard ph", "Center", "100%"),
        ("Image 2",) + _no_img(),
        ("Text 2", "rich", TEXT_2, "rich", TEXT_2),
        ("Image 3",) + _no_img(),
        ("Image 4",) + _no_img(),
        ("Text 3", "text", "-", "rich", []),
        ("Image 5",) + _no_img(),
        ("Image 6",) + _no_img(),
        ("Text 4", "text", "-", "rich", []),
        ("Base Image",) + _no_img(),
        ("Background Image",) + _no_img(),
    ]),
    ("Geo Targeting", [
        ("Geo Targeting Type", "text", "None", "select", "None"),
        ("Countries", "text", "-", "tagbox", [], "modal-countries"),
    ]),
    ("Review", [
        ("Quote", "paragraph", TEASER, "textarea", TEASER),
        ("Rating", "text", "-", "select", ""),
        ("Show Images As Slideshow",) + _yn(True),
        ("Full Width Article",) + _yn(True),
    ]),
    ("Review - Verdict", [
        ("Name", "text", "-", "input", ""),
        ("Item Reviewed", "text", "-", "select", ""),
        ("Details", "text", "-", "textarea", ""),
        ("Score", "text", "-", "input", ""),
        ("Verdict", "text", "-", "textarea", ""),
        ("Pros", "text", "-", "textarea", ""),
        ("Cons", "text", "-", "textarea", ""),
    ]),
    ("Advanced", [
        ("External Article ID", "text", "-", "input", ""),
        ("Article Type", "text", "SF Plus", "select", "SF Plus"),
        ("Sponsored Article",) + _yn(False),
        ("Sponsor", "text", "-", "input", ""),
        ("Sponsor Link", "text", "-", "input", ""),
        ("Sponsor Open Link Option", "text", "New Tab", "select", "New Tab"),
        ("Step By Step Title", "text", "-", "input", ""),
        ("Info Box Title", "text", "-", "input", ""),
        ("Info Box Text", "text", "-", "textarea", ""),
        ("Info Box Auto Bullets",) + _yn(False),
        ("Multimedia", "text", "-", "file", ""),
        ("Credits", "text", "-", "textarea", ""),
    ]),
    ("Social", [(f"Shareline {i}", "text", "-", "input", "") for i in (1, 2, 3)]),
    ("Security", [
        ("Content Security Right", "text", "-", "select", ""),
    ]),
    ("Publication", [
        ("Creator", "text", "Mark Foster", "lookup", "Mark Foster"),
        ("Account", "text", "-", "lookup", ""),
        ("Publish Start", "text", "07/08/2026 13:19", "datetime", "07 Aug 2026 13:19"),
        ("Publish End", "text", "07/08/2126 13:19", "datetime", "07 Aug 2126 13:19"),
        ("Embargo End", "text", "-", "datetime", ""),
        ("Syndication",) + _yn(True),
        ("Live",) + _yn(True),
        ("Private",) + _yn(False),
        ("Hide From Search Results",) + _yn(False),
        ("Exclude From AI Index",) + _yn(False),
        ("Moderated",) + _yn(False),
    ]),
]

COUNTRIES_SOURCE = [("United Kingdom", "", "Countries", "Affino"), ("Ireland", "", "Countries", "Affino"),
                    ("United States", "", "Countries", "Affino"), ("Canada", "", "Countries", "Affino"),
                    ("Australia", "", "Countries", "Affino"), ("Germany", "", "Countries", "Affino")]


def _view(f):
    return m.view_row(f[0], f[1], f[2])


def _edit(f):
    label, _, _, kind, value = f[:5]
    extra = f[5] if len(f) > 5 else None
    if kind == "tagbox":
        return m.edit_row(label, "tagbox", tags=value, modal=extra)
    if kind == "checkbox":
        return m.edit_row(label, "checkbox", value, help_text=extra)
    opts = extra if isinstance(extra, dict) else {}
    return m.edit_row(label, kind, value, required=opts.get("required", False), help_text=opts.get("help"))


def view_sections():
    return "".join(m.record_section(t, [_view(f) for f in fields], "view") for t, fields in SECTIONS)


def edit_sections():
    return "".join(m.record_section(t, [_edit(f) for f in fields], "edit") for t, fields in SECTIONS)


def modals():
    return (m.multi_select_modal("modal-multi-display", "Select Multi Display", m.SECTIONS_SOURCE)
            + m.multi_select_modal("modal-topics", "Select Topics and Keywords", m.TOPICS_SOURCE)
            + m.multi_select_modal("modal-countries", "Select Countries", COUNTRIES_SOURCE))


FIELD_COUNT = sum(len(f) for _, f in SECTIONS)
