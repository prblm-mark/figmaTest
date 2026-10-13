"""Media View + Edit — the record-screen kit filled with a media item (code-first, 2026-10-13).

Structure read from the live Control Centre media screens on affino.com (AfcMediaLibrary/CC):
View = MediaDetail.cfm?MediaScreen=detail (its inline CProperties: panel names, labels and order
verbatim); Edit = the same page with Action=change, rendered by MediaLiveEdit.cfm from
AfcLiveEdit/FormDef/MediaAllElements.cfm (panels, field order, controls, required marks).

How the live screens differ from the other record types, and what was done about it:
- Neither live screen has tabs: both are one stack of collapsible panels. The kit's Details tab carries
  those panels; the live Stats / Recent Viewers / Referring URLs panels become a Page analysis tab
  (Contact / Account View's builder). The live Main panel (preview + the file information box + the
  moderator's asset controls) is the sidebar.
- No per-field help exists. The only help is per panel, from the Media Workflow Profile — shown here as
  the section's description line (verbatim; the SEO line is profiles 2-6, profile 1 has none). So there
  is no Show help switch on this Edit screen.
- Edit labels are SiteTextItem keys whose English values were not readable; the labels below are the
  View screen's verbatim labels for the same fields (the likely values). Option lists marked as
  stand-ins below come from text keys too.

The item is invented (a video, so the Details and Production Details panels — hidden for images —
show). Its Album, channel and zone are real Comrz names; the creator is the listing's invented one.
Conditional live panels not drawn for a video: Permission (documents only), Streaming (only with a
streaming source), Embed (embeds only), Main Image (not for video types).
"""
import record_markup as m
import record_contact as ct

e = m.e
LISTING = "../ListingScreen/MediaItems.html"


def tabs(d):
    return [("details", "Details", d["view"]), ("page-analysis", "Page analysis", d["pa"])]


# Header: one primary (Edit) + one secondary (Live view); the rest of the live toolbar in the kebab
# (designer rule, 2026-09-30). Live toolbar (read 2026-10-13): Live view, eCommerce, Related items,
# Meta, Workflow History, Workflow Inbox, Add, Edit.
KEBAB = [(label, ico, ' href="#" data-backend-todo="media-actions"') for label, ico in [
    ("Add media item", "plus"), ("Copy media item", "copy"), ("Related items", "link"), ("Meta information", "info"),
    ("Monetise", "badge-pound-sterling"), ("Workflow history", "history"), ("Workflow inbox", "inbox")]]
KEBAB.append(("Go to list", "list", f' href="{LISTING}" data-keep-width'))
SECONDARY = ("Live view", "external-link", ' data-backend-todo="media-actions"')


def pic(seed, w, h):
    return f"https://picsum.photos/seed/{seed}/{w}/{h}"


# Every stored version of the item, as the live Main panel lists them under the preview (read from
# media item 130427, 2026-10-13: Thumbnail _MBrowse, Main Image _MPreview, Original). Each opens full
# size in the viewer. (label, file name, dimensions, size, full-size src, card src, actions)
_IMG = "carver-street-hall"
IMAGE = {
    "family": "image", "view": "MediaView.html", "edit": "MediaEdit.html", "pa": "MediaViewPageAnalysis.html",
    "code": "130431", "title": "Carver Street venue main hall", "file": "CarverStreetVenueMainHall.webp",
    "type": "WebP", "size": "186 KB", "dimensions": "1600 px x 880 px", "style": "Media Default Presentation Style",
    "preview": pic(_IMG, 1600, 880),
    "renditions": [
        ("Master file", "CarverStreetVenueMainHall.webp", "1600 px x 880 px", "186 KB", pic(_IMG, 1600, 880), pic(_IMG, 320, 176), ["update"]),
        ("Main Image", "CarverStreetVenueMainHall_MPreview.webp", "400 px x 220 px", "8 KB", pic(_IMG, 400, 220), pic(_IMG, 320, 176), ["delete"]),
        ("Thumbnail", "CarverStreetVenueMainHall_MBrowse.webp", "100 px x 55 px", "1 KB", pic(_IMG, 100, 55), pic(_IMG, 320, 176), ["delete"]),
        # Kept when the upload profile converts JPG / PNG to WebP; read-only.
        ("Original", "Carver Street venue main hall.png", "2600 px x 1430 px", "307 KB", pic(_IMG, 2600, 1430), pic(_IMG, 320, 176), []),
    ],
    "album": "Affino Media", "multi": ["Events"], "creator": "Hannah Cole", "account": "Affino",
    "added": "12 Oct 2026, 10:39", "updated": "-", "updated_by": "-", "downloads": "0",
    "screen_name": "carver-street-venue-main-hall",
    "teaser": "The main hall at the Carver Street venue, set for the Innovation Briefing.", "intro": "",
    "body": [], "keywords": ["Events", "Venue"], "page_title": "", "page_desc": "",
    "search": "", "security": "Non-secured", "publish_start": "12 Oct 2026, 10:39", "publish_end": "12 Oct 2036, 10:39",
    "page_analysis": {"total": "0", "per_day": "0", "year": "0", "viewers": [], "referrers": []},
}

_VID = "media130171"
VIDEO = {
    "family": "video", "view": "MediaViewVideo.html", "edit": "MediaEditVideo.html", "pa": "MediaViewVideoPageAnalysis.html",
    "code": "130171", "title": "Affino Innovation Briefing 2026 highlights",
    "file": "AffinoInnovationBriefing2026-highlights.mp4", "type": "MP4 Video", "size": "48.6 MB",
    "dimensions": "1920 px x 1080 px", "runtime": "2m 14s", "style": "Video Presentation Style",
    "preview": pic(_VID, 1600, 900),
    # No Main Image for video types; an MP4 keeps the stills taken when its images were generated.
    "renditions": [
        ("Video file", "AffinoInnovationBriefing2026-highlights.mp4", "1920 px x 1080 px", "48.6 MB", pic(_VID, 1600, 900), pic(_VID, 320, 180), ["update"]),
        ("Thumbnail", "AffinoInnovationBriefing2026_MBrowse.webp", "100 px x 100 px", "2 KB", pic(_VID, 100, 100), pic(_VID, 320, 180), ["delete"]),
        ("Still 1", "AffinoInnovationBriefing2026_still1.webp", "1920 px x 1080 px", "212 KB", pic(_VID + "s1", 1600, 900), pic(_VID + "s1", 320, 180), ["thumb", "delete"]),
        ("Still 2", "AffinoInnovationBriefing2026_still2.webp", "1920 px x 1080 px", "198 KB", pic(_VID + "s2", 1600, 900), pic(_VID + "s2", 320, 180), ["thumb", "delete"]),
    ],
    "album": "Affino Media", "multi": ["Athene Forum Media", "Events"],
    "creator": "Hannah Cole", "account": "Affino", "added": "21 Sep 2026, 14:06", "updated": "06 Oct 2026, 10:41",
    "updated_by": "Luis Montiel", "downloads": "37",
    "screen_name": "affino-innovation-briefing-2026-highlights",
    "teaser": "Two minutes from the Innovation Briefing: the AI assistant, record screens and the 2027 roadmap.",
    "intro": "Highlights from the Affino Innovation Briefing, filmed at the Carver Street venue on 18 June 2026.",
    "body": [("p", "Markus Karlsson opens the briefing with the year's headline releases, then the product team walks "
                   "through the new Control Centre record screens and the AI assistant."),
             ("p", "The full sessions are available to members in the Affino Media album.")],
    "keywords": ["Affino", "Innovation Briefing", "Control Centre", "AI"],
    "page_title": "Affino Innovation Briefing 2026 highlights | Affino",
    "page_desc": "Watch two minutes of highlights from the Affino Innovation Briefing 2026.",
    "language": "English", "video_type": "Corporate Video", "genre": ["Events", "Technology"], "moods": ["Upbeat"],
    "version": "1.0", "artists": "Markus Karlsson, Luis Montiel", "rights": "© Affino Ltd. All rights reserved.",
    "country": "United Kingdom", "production_date": "18 Jun 2026", "release_date": "21 Sep 2026", "format": "HD 1080p",
    "company": "Affino Ltd", "company_id": "AFF-PROD-0426", "brand": "Affino", "website": "https://www.affino.com",
    "producers": "Hannah Cole", "directors": "Owen Pritchard", "roles": "Producer",
    "search": "innovation briefing 2026 highlights video",
    "security": "Members", "publish_start": "21 Sep 2026, 14:00", "publish_end": "-",
    "page_analysis": {"total": "1,284", "per_day": "56.4", "year": "1,284", "viewers": m.VIEWERS[:3],
                      "referrers": [("https://www.affino.com/news", "212"), ("https://www.linkedin.com/", "96"),
                                    ("https://www.google.com/", "41")]},
}

ITEMS = (IMAGE, VIDEO)


def _retag(html):
    """Contact View's tab builders mark their tables for the contact handover rows."""
    return html.replace('data-backend-todo="contact-', 'data-backend-todo="media-')


# ── View: Main (the live Main panel's left column: preview, asset actions, every stored version) ─
ACTIONS = {
    "update": lambda label: m.btn(f"Update {label.lower()}", "secondary", "xs", icon_left="upload", icon_only=True,
                                  attrs=' data-backend-todo="media-assets"'),
    "delete": lambda label: m.btn(f"Delete {label.lower()}", "secondary", "xs", icon_left="trash-2", icon_only=True,
                                  attrs=' data-backend-todo="media-assets"'),
    "thumb": lambda label: m.btn("Set as thumbnail", "secondary", "xs", attrs=' data-backend-todo="media-assets"'),
}


def _view_attrs(i, label):
    return (f' data-media-view="{i}" data-record-modal-open="modal-media-viewer" aria-haspopup="dialog"'
            f' aria-label="View {e(label)} full size"')


def main_panel(d):
    """The preview, then a card per stored version. The preview and every card open the viewer
    (MediaView.js) on that version: the live screen links the preview to the master file and opens
    each version's thumb in its image popup (showImage), so every version can be seen full size."""
    play = (f'<span class="media-preview__play btn btn--primary btn--icon" aria-hidden="true">{m.icon("play")}</span>'
            if d["family"] == "video" else "")
    first = d["renditions"][0][0]
    # TODO(backend:RecordScreen) media-preview: the preview is a static picture → the item's player by media type (MultimediaPlayer / DocumentPlayerModule / the main image)
    preview = (f'<button type="button" class="media-preview" data-backend-todo="media-preview"{_view_attrs(0, first)}>'
               f'<img class="media-preview__poster" src="{d["preview"]}" alt="{e(d["title"])}">{play}</button>')
    cards = []
    for i, (label, name, dims, size, full, card, acts) in enumerate(d["renditions"]):
        btns = "".join(ACTIONS[a](label) for a in acts)
        tail = f'<div class="media-asset__actions">{btns}</div>' if btns else ""
        cards.append(
            f'<li class="media-asset" data-media-full="{full}" data-media-label="{e(label)}" data-media-name="{e(name)}"'
            f' data-media-meta="{e(dims)} · {e(size)}">'
            f'<button type="button" class="media-asset__thumb"{_view_attrs(i, label)}><img src="{card}" alt="" loading="lazy"></button>'
            f'<div class="media-asset__text"><p class="media-asset__label">{e(label)}</p>'
            f'<p class="media-asset__name" title="{e(name)}">{e(name)}</p>'
            f'<p class="media-asset__meta">{e(dims)} · {e(size)}</p></div>{tail}</li>')
    # TODO(backend:RecordScreen) media-assets: the versions and their actions are static → the item's master, Main Image, Thumbnail, Original and additional assets, and the moderator's asset actions
    actions = (m.btn("Update file", "secondary", "sm", icon_left="upload", attrs=' data-backend-todo="media-assets"')
               + m.btn("Generate images", "secondary", "sm", icon_left="images", attrs=' data-backend-todo="media-assets"'))
    body = (f'<div class="media-main">{preview}<div class="media-preview__actions">{actions}</div>'
            f'<ul class="media-assets" role="list" data-media-assets>{"".join(cards)}</ul></div>')
    # A div body, not view mode's <dl>: this section holds no label / value rows.
    return m.record_section("Main", [body], "edit")


def viewer_modal(d):
    """One modal for every version: title = the version, subline = file name · size, the image fitted
    to the dialog, Previous / Next through the versions, Download (MediaView.js fills it)."""
    label, name, dims, size, full = d["renditions"][0][:5]
    head = m._modal_head("modal-media-viewer", label, f"{name} · {dims} · {size}")
    prev = m.btn("Previous", "secondary", icon_left="chevron-left", icon_only=True, attrs=' data-media-viewer-step="-1"')
    nxt = m.btn("Next", "secondary", icon_left="chevron-right", icon_only=True, attrs=' data-media-viewer-step="1"')
    return (f'<div class="modal-overlay" id="modal-media-viewer" role="presentation" data-media-viewer>'
            f'<div class="modal modal--lg media-viewer" role="dialog" aria-modal="true" aria-labelledby="modal-media-viewer-title">'
            f'{head}<div class="modal__body media-viewer__body"><img class="media-viewer__img" src="{full}" alt="" data-media-viewer-img></div>'
            f'<div class="modal__footer media-viewer__footer">'
            f'<span class="media-viewer__count" data-media-viewer-count aria-live="polite">1 of {len(d["renditions"])}</span>'
            f'{prev}{nxt}<a class="btn btn--primary" href="{full}" download data-media-viewer-download data-backend-todo="media-assets">'
            f'{m.icon("download")}<span>Download</span></a></div></div></div>')


# ── View: Details (the live panels, in order) ────────────────────────────────────────────────────
def view_sections(d):
    t = lambda label, v: m.view_row(label, "text", v or "-")
    tags = lambda label, v: m.view_row(label, "tags", v) if v else m.view_row(label, "text", "-")
    yn = lambda label, v: t(label, "Yes" if v else "No")
    para = lambda label, v: m.view_row(label, "paragraph", v) if v else t(label, "-")
    sec = m.record_section
    g = lambda k: d.get(k, "")
    # Details and Production Details are hidden for images (DocMimeTypeCode 4, 5, 14, 44, 50), as live.
    media_only = "" if d["family"] == "image" else (
        sec("Details", [t("Language", g("language")), t("Video Type", g("video_type")), tags("Genre", g("genre")),
                        tags("Moods", g("moods")), t("Version", g("version")), t("Run Time", g("runtime")),
                        t("Artists", g("artists")), t("Rights", g("rights")), t("Similiar Artists", "-"),  # sic, live label
                        t("Tracks", "-"), t("Lyrics", "-"), t("Access Type", "-"), t("Media Location", "-")], "view")
        + sec("Production Details", [t("Country of Origin", g("country")), t("Production Date", g("production_date")),
                                     t("Release Date", g("release_date")), t("Format", g("format")),
                                     t("Production Company ID", g("company_id")), t("Brand", g("brand")),
                                     t("Official Website", g("website")), t("Production Company", g("company")),
                                     t("Producers", g("producers")), t("Directors", g("directors")), t("Festivals", "-"),
                                     t("Your Roles", g("roles"))], "view"))
    # TODO(backend:RecordScreen) media-record: every Details value is static → the media item (MediaItem + its section, production lookups, security and publication flags)
    return (
        main_panel(d)
        + sec("Presentation Style", [t("Presentation Style", d["style"])], "view")
        + sec("Navigation", [t("Album", d["album"]), tags("Multi Display", d["multi"]), t("SO", "0")], "view")
        + sec("Introduction", [t("Title", d["title"]), t("Screen Name", d["screen_name"]), t("Link", "-"),
                               para("Teaser", d["teaser"]), para("Introduction", d["intro"])], "view")
        + sec("Main Body", [t("Shareline 1", "-"), t("Shareline 2", "-"), t("Shareline 3", "-"),
                            m.view_row("Main Body", "rich", d["body"]) if d["body"] else t("Main Body", "-"),
                            t("Sponsor Account", "-"), t("Sponsor Link", "-"), t("Sponsor Open Link", "-")], "view")
        + sec("Comments and Ratings", [yn("Hide Comments And Ratings", False)], "view")
        + sec("Keywords", [tags("Keywords", d["keywords"])], "view")
        + sec("SEO", [t("Page Title", d["page_title"]), t("Page Description", d["page_desc"])], "view")
        + sec("Geo-blocking", [t("Geo-blocking Type", "None"), t("Countries", "-")], "view")
        + media_only
        + sec("Search", [t("Additional Search Data", d["search"])], "view")
        # The live eCommerce panel carries the Security and Publication groups under their own dividers;
        # in the kit each is its own section.
        + sec("eCommerce", [t("Article", "-")], "view")
        + sec("Security", [yn("Download", True), t("Usage Number", "0"), t("Content Security Right", d["security"]),
                           yn("Restricted", False), t("Restriction Notes", "-")], "view")
        + sec("Publication", [t("Creator", d["creator"]), t("Account", d["account"]), yn("Live", True), yn("Adult", False),
                              yn("Moderated", False), yn("Syndicate", True), yn("Private", False),
                              t("Publish Start", d["publish_start"]), t("Publish End", d["publish_end"])], "view"))


# ── View: sidebar (the live Main panel's right-hand box: file information) ──────────────────────
def sidebar(d):
    rows = [("Creator", d["creator"]), ("Artists", d.get("artists")), ("Keywords", d["keywords"]),
            ("Language", d.get("language")), ("Video Type", d.get("video_type")), ("Genre", d.get("genre")),
            ("Release Date", d.get("release_date")), ("Version", d.get("version")), ("Run Time", d.get("runtime")),
            ("Format", d.get("format") or d["type"]), ("File Size", d["size"]), ("Dimensions", d["dimensions"]),
            ("Country of Origin", d.get("country")), ("Production Date", d.get("production_date")),
            ("Production Company", d.get("company")), ("Production Company ID", d.get("company_id")),
            ("Brand", d.get("brand")), ("Official Website", d.get("website")), ("Producers", d.get("producers")),
            ("Directors", d.get("directors")), ("Rights", d.get("rights")), ("Date added", d["added"]),
            ("Updated", d["updated"]), ("Updated By", d["updated_by"]), ("Total Downloads", d["downloads"]),
            ("Your Roles", d.get("roles"))]
    # Rows render only when set, as live.
    info = [(k, v) for k, v in rows if v and v != "-"]
    # TODO(backend:RecordScreen) media-sidebar: the file information is static → the item's production and file facts (rows show only when set; hidden by the Media Library Profile's HideFileInfoYN)
    return m.fact_panel("File information", m.fact_list(info), subtitle=f'{d["type"]} · {d["file"]}')


TAB_PAGES = {"page-analysis": lambda d: _retag(ct.page_analysis(d)).replace("Profile page", "Media page")
             .replace("The contact's public profile page", "The media item's public page")}


# ── Edit (MediaAllElements.cfm, change mode) ─────────────────────────────────────────────────────
# Panel help is the Media Workflow Profile's, verbatim (typos kept). Required: Presentation Style,
# Album, Title (the def's Required column).
HELP = {
    "Navigation": "Select the Album and other Albums that you'd like the item(s) to be added to",
    "Introduction": "Add a Teaser and link. The teaser will be shown in listings.",
    "Keywords": "Add a Keyword Tags separated by commas that describs this item",
    "SEO": "Add Screen Name for article for the SEO friendly URL",
    "Security": "Select Key Security for the media item",
    "Publication": "Select key Publication information",
}


# TODO(backend:RecordScreen) media-edit: values, option lists and lookups are static → the media item + option sources; Save writes the form
def edit_sections(d):
    r = m.edit_row
    sec = lambda title, rows: m.record_section(title, rows, "edit", description=HELP.get(title))
    # TODO(backend:RecordScreen) media-edit: option lists for Sponsor Open Link, Geo-blocking Type, Access Type, Media Location and Format are stand-ins → their SiteTextItem / LookupItem sources
    g = lambda k: d.get(k, "")
    # Details and Production Details are hidden for images, as live.
    media_only = "" if d["family"] == "image" else (
        sec("Details", [r("Language", "select", g("language"), options=["English", "French", "German", "Spanish"]),
                          r("Video Type", "select", g("video_type"),
                            options=["Show-reel", "VideoBook", "Video", "Short Film", "Feature Film", "Documentary",
                                     "Animation", "Viral Video", "Corporate Video", "Music Video", "Commercial",
                                     "Making of", "Pilot", "Series"]),
                          r("Genre", "tagbox", tags=g("genre"), modal="modal-media-genre"),
                          r("Moods", "tagbox", tags=g("moods"), modal="modal-media-moods"),
                          r("Version", "input", g("version")),
                          # TODO(backend:RecordScreen) media-edit: Run Time is a value + unit select (MediaLibrary_RunTime) live; one input here
                          r("Run Time", "input", g("runtime")),
                          r("Artists", "textarea", g("artists")), r("Rights", "textarea", g("rights")),
                          r("Similiar Artists", "textarea", ""),  # sic, the live label
                          r("Tracks", "textarea", ""), r("Lyrics", "textarea", ""),
                          r("Access Type", "select", "", options=["Free", "Paid"]),
                          r("Media Location", "select", "", options=["Local", "Remote", "Streaming"])])
        + sec("Production Details", [r("Country of Origin", "input", g("country")),
                                     r("Production Date", "date", g("production_date")),
                                     r("Release Date", "date", g("release_date")),
                                     r("Format", "select", g("format"), options=["HD 1080p", "HD 720p", "4K", "SD"]),
                                     r("Production Company ID", "input", g("company_id")),
                                     r("Brand", "input", g("brand")), r("Official Website", "input", g("website")),
                                     r("Production Company", "textarea", g("company")),
                                     r("Producers", "textarea", g("producers")), r("Directors", "textarea", g("directors")),
                                     r("Festivals", "textarea", ""), r("Your Roles", "textarea", g("roles"))]))
    return (
        # Live draws a thumbnail picker of the three styles (StyleSelector); a select here.
        sec("Presentation Style", [r("Presentation Style", "select", d["style"], required=True,
                                     options=["Media Default Presentation Style", "Video Presentation Style",
                                              "Podcast Presentation Style"])])
        + sec("Navigation", [r("Album", "lookup", d["album"], required=True, modal="modal-media-album"),
                             r("Multi Display", "tagbox", tags=d["multi"], modal="modal-media-sections"),
                             r("SO", "select", "0", options=[str(i) for i in range(0, 51)])])
        + sec("Introduction", [r("Title", "input", d["title"], required=True),
                               r("Screen Name", "input", d["screen_name"]),
                               r("Link", "input", ""),
                               r("Teaser", "textarea", d["teaser"]),
                               r("Introduction", "rich", [("p", d["intro"])] if d["intro"] else []),
                               # Read-only after creation: the credit is burnt into the image at upload.
                               r("Copyright", "static", "")])
        + sec("Main Body", [r("Shareline 1", "input", ""), r("Shareline 2", "input", ""), r("Shareline 3", "input", ""),
                            r("Main Body", "rich", d["body"]),
                            r("Sponsor Account", "lookup", ""),
                            r("Sponsor Link", "input", ""),
                            r("Sponsor Open Link", "select", "Same window", options=["Same window", "New window"])])
        + sec("Comments and Ratings", [r("Hide Comments And Ratings", "checkbox", False)])
        + sec("Keywords", [r("Keywords", "tagbox", tags=d["keywords"], modal="modal-media-keywords")])
        + sec("SEO", [r("Page Title", "input", d["page_title"]), r("Page Description", "textarea", d["page_desc"])])
        + sec("Geo-blocking", [r("Geo-blocking Type", "select", "None",
                                 options=["None", "Only these countries", "All except these countries"]),
                               r("Countries", "tagbox", tags=[], modal="modal-media-countries")])
        + media_only
        + sec("Search", [r("Additional Search Data", "textarea", d["search"])])
        + sec("eCommerce", [r("Article", "lookup", "")])
        + sec("Security", [r("Download", "checkbox", True), r("Usage Number", "input", "0"),
                           r("Content Security Right", "select", d["security"], options=["Members", "Subscribers", "Staff"]),
                           r("Restricted", "checkbox", False), r("Restriction Notes", "textarea", "")])
        + sec("Publication", [r("Creator", "lookup", d["creator"]), r("Account", "lookup", d["account"]),
                              r("Live", "checkbox", True), r("Adult", "checkbox", False), r("Moderated", "checkbox", False),
                              r("Syndicate", "checkbox", True), r("Private", "checkbox", False),
                              r("Publish Start", "datetime", d["publish_start"]), r("Publish End", "datetime", "")]))


def edit_modals(d):
    src = lambda names, group: [(n, "", group, "Affino") for n in names]
    sections = ["Affino Media", "Athene Forum Media", "Events", "The Payment Fintech Club", "Charity Digital Forum Media"]
    return (m.single_select_modal("modal-media-album", "Select Album", [(n, "Media", "Affino Media", "Affino") for n in sections])
            + m.multi_select_modal("modal-media-sections", "Select Sections", src(sections, "Sections"))
            + m.multi_select_modal("modal-media-keywords", "Select Keywords", src(d["keywords"] + ["Events", "Webinar"], "Keywords"))
            + m.multi_select_modal("modal-media-countries", "Select Countries",
                                   src(["United Kingdom", "Ireland", "United States", "Germany", "France"], "Countries"))
            + m.multi_select_modal("modal-media-genre", "Select Genre", src(["Events", "Technology", "Business", "Education"], "Genre"))
            + m.multi_select_modal("modal-media-moods", "Select Moods", src(["Upbeat", "Calm", "Inspiring"], "Moods"))
            + m.delete_confirm_modal("modal-delete", "media item", d["title"]))
