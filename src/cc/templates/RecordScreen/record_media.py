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
VIEW, EDIT = "MediaView.html", "MediaEdit.html"
PA = "MediaViewPageAnalysis.html"
LISTING = "../ListingScreen/MediaItems.html"


def tabs():
    return [("details", "Details", VIEW), ("page-analysis", "Page analysis", PA)]


# Header: one primary (Edit) + one secondary (Live view); the rest of the live toolbar in the kebab
# (designer rule, 2026-09-30). Live toolbar: Live View, Edit, Copy, Add, Go to list, Related Items,
# Meta Information, eCommerce.
KEBAB = [(label, ico, ' href="#" data-backend-todo="media-actions"') for label, ico in [
    ("Copy media item", "copy"), ("Add media item", "plus"), ("Related items", "link"),
    ("Meta information", "info"), ("Monetise", "badge-pound-sterling")]]
KEBAB.append(("Go to list", "list", f' href="{LISTING}" data-keep-width'))
SECONDARY = ("Live view", "external-link", ' data-backend-todo="media-actions"')

POSTER = "https://picsum.photos/seed/media130171/960/540"
THUMB = "https://picsum.photos/seed/media130171/200/200"

MEDIA = {
    "code": "130171", "title": "Affino Innovation Briefing 2026 highlights",
    "file": "AffinoInnovationBriefing2026-highlights.mp4", "type": "MP4 Video", "size": "48.6 MB",
    "dimensions": "1920 px x 1080 px", "runtime": "2m 14s", "style": "Video Presentation Style",
    "album": "Affino Media", "channel": "Affino Media", "zone": "Affino", "multi": ["Athene Forum Media", "Events"],
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


def _retag(html):
    """Contact View's tab builders mark their tables for the contact handover rows."""
    return html.replace('data-backend-todo="contact-', 'data-backend-todo="media-')


# ── View: Details (the live panels, in order) ────────────────────────────────────────────────────
def view_sections(d):
    t = lambda label, v: m.view_row(label, "text", v or "-")
    tags = lambda label, v: m.view_row(label, "tags", v) if v else m.view_row(label, "text", "-")
    yn = lambda label, v: t(label, "Yes" if v else "No")
    sec = m.record_section
    # TODO(backend:RecordScreen) media-record: every Details value is static → the media item (MediaItem + its section, production lookups, security and publication flags)
    return (
        sec("Presentation Style", [t("Presentation Style", d["style"])], "view")
        + sec("Navigation", [t("Album", d["album"]), tags("Multi Display", d["multi"]), t("SO", "0")], "view")
        + sec("Introduction", [t("Title", d["title"]), t("Screen Name", d["screen_name"]), t("Link", "-"),
                               m.view_row("Teaser", "paragraph", d["teaser"]), m.view_row("Introduction", "paragraph", d["intro"])], "view")
        + sec("Main Body", [t("Shareline 1", "-"), t("Shareline 2", "-"), t("Shareline 3", "-"),
                            m.view_row("Main Body", "rich", d["body"]), t("Sponsor Account", "-"), t("Sponsor Link", "-"),
                            t("Sponsor Open Link", "-")], "view")
        + sec("Comments and Ratings", [yn("Hide Comments And Ratings", False)], "view")
        + sec("Keywords", [tags("Keywords", d["keywords"])], "view")
        + sec("SEO", [t("Page Title", d["page_title"]), t("Page Description", d["page_desc"])], "view")
        + sec("Geo-blocking", [t("Geo-blocking Type", "None"), t("Countries", "-")], "view")
        + sec("Details", [t("Language", d["language"]), t("Video Type", d["video_type"]), tags("Genre", d["genre"]),
                          tags("Moods", d["moods"]), t("Version", d["version"]), t("Run Time", d["runtime"]),
                          t("Artists", d["artists"]), t("Rights", d["rights"]), t("Similiar Artists", "-"),  # sic, live label
                          t("Tracks", "-"), t("Lyrics", "-"), t("Access Type", "-"), t("Media Location", "-")], "view")
        + sec("Production Details", [t("Country of Origin", d["country"]), t("Production Date", d["production_date"]),
                                     t("Release Date", d["release_date"]), t("Format", d["format"]),
                                     t("Production Company ID", d["company_id"]), t("Brand", d["brand"]),
                                     t("Official Website", d["website"]), t("Production Company", d["company"]),
                                     t("Producers", d["producers"]), t("Directors", d["directors"]), t("Festivals", "-"),
                                     t("Your Roles", d["roles"])], "view")
        + sec("Search", [t("Additional Search Data", d["search"])], "view")
        # The live eCommerce panel carries the Security and Publication groups under their own dividers;
        # in the kit each is its own section.
        + sec("eCommerce", [t("Article", "-")], "view")
        + sec("Security", [yn("Download", True), t("Usage Number", "-"), t("Content Security Right", d["security"]),
                           yn("Restricted", False), t("Restriction Notes", "-")], "view")
        + sec("Publication", [t("Creator", d["creator"]), t("Account", d["account"]), yn("Live", True), yn("Adult", False),
                              yn("Moderated", False), yn("Syndicate", True), yn("Private", False),
                              t("Publish Start", d["publish_start"]), t("Publish End", d["publish_end"])], "view"))


# ── View: sidebar (the live Main panel: preview, asset controls, file information) ───────────────
def sidebar(d):
    # TODO(backend:RecordScreen) media-preview: the poster and Play are static → the item's player (MultimediaPlayer / DocumentPlayerModule / lightbox image by media type)
    preview = f'''<div class="media-preview" data-backend-todo="media-preview">
            <img class="media-preview__poster" src="{POSTER}" alt="{e(d["title"])}">
            {m.btn("Play", "primary", icon_left="play", icon_only=True, attrs=' data-backend-todo="media-preview"').replace('class="btn', 'class="media-preview__play btn', 1)}
          </div>
          <div class="media-preview__actions">
            {m.btn("Update file", "secondary", "sm", icon_left="upload", attrs=' data-backend-todo="media-assets"')}
            {m.btn("Generate images", "secondary", "sm", icon_left="images", attrs=' data-backend-todo="media-assets"')}
          </div>'''
    info = [("Creator", d["creator"]), ("Artists", d["artists"]), ("Keywords", d["keywords"]), ("Language", d["language"]),
            ("Video Type", d["video_type"]), ("Genre", d["genre"]), ("Release Date", d["release_date"]),
            ("Version", d["version"]), ("Run Time", d["runtime"]), ("Format", d["format"]), ("File Size", d["size"]),
            ("Dimensions", d["dimensions"]), ("Country of Origin", d["country"]), ("Production Date", d["production_date"]),
            ("Production Company", d["company"]), ("Production Company ID", d["company_id"]), ("Brand", d["brand"]),
            ("Official Website", d["website"]), ("Producers", d["producers"]), ("Directors", d["directors"]),
            ("Rights", d["rights"]), ("Date added", d["added"]), ("Updated", d["updated"]), ("Updated By", d["updated_by"]),
            ("Total Downloads", d["downloads"]), ("Your Roles", d["roles"])]
    thumb = m.media_meta(THUMB, rows=[("Alt text", d["title"]), ("File name", "AffinoInnovationBriefing2026-thumb.webp"),
                                      ("Size", "200 px x 200 px · 14 KB")])
    # MP4 Video (type 26) keeps the stills taken when its images were generated; one can be the thumbnail.
    stills = m.record_list([(f"Still {i}", f"1920 px x 1080 px · {kb} KB",
                             m.btn("Set as thumbnail", "tertiary", "xs", attrs=' data-backend-todo="media-assets"'))
                            for i, kb in ((1, 212), (2, 198))], "No additional assets.", todo="media-assets")
    # TODO(backend:RecordScreen) media-sidebar: the file information is static → the item's production and file facts (rows show only when set; hidden by the Media Library Profile's HideFileInfoYN)
    return "".join([
        m.fact_panel("Preview", preview, subtitle=f'{d["type"]} · {d["file"]}'),
        m.fact_panel("File information", m.fact_list(info)),
        m.fact_panel("Thumbnail", f'<div class="media-preview__thumb">{thumb}</div>',
                     action=m.btn("Delete thumbnail", "tertiary", "xs", icon_left="trash-2", icon_only=True,
                                  attrs=' data-backend-todo="media-assets"')),
        m.fact_panel("Additional assets", stills, count=("2", "2 additional assets")),
    ])


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
                               r("Introduction", "rich", [("p", d["intro"])]),
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
        + sec("Details", [r("Language", "select", d["language"], options=["English", "French", "German", "Spanish"]),
                          r("Video Type", "select", d["video_type"],
                            options=["Show-reel", "VideoBook", "Video", "Short Film", "Feature Film", "Documentary",
                                     "Animation", "Viral Video", "Corporate Video", "Music Video", "Commercial",
                                     "Making of", "Pilot", "Series"]),
                          r("Genre", "tagbox", tags=d["genre"], modal="modal-media-genre"),
                          r("Moods", "tagbox", tags=d["moods"], modal="modal-media-moods"),
                          r("Version", "input", d["version"]),
                          # TODO(backend:RecordScreen) media-edit: Run Time is a value + unit select (MediaLibrary_RunTime) live; one input here
                          r("Run Time", "input", d["runtime"]),
                          r("Artists", "textarea", d["artists"]), r("Rights", "textarea", d["rights"]),
                          r("Similiar Artists", "textarea", ""),  # sic, the live label
                          r("Tracks", "textarea", ""), r("Lyrics", "textarea", ""),
                          r("Access Type", "select", "", options=["Free", "Paid"]),
                          r("Media Location", "select", "", options=["Local", "Remote", "Streaming"])])
        + sec("Production Details", [r("Country of Origin", "input", d["country"]),
                                     r("Production Date", "date", d["production_date"]),
                                     r("Release Date", "date", d["release_date"]),
                                     r("Format", "select", d["format"], options=["HD 1080p", "HD 720p", "4K", "SD"]),
                                     r("Production Company ID", "input", d["company_id"]),
                                     r("Brand", "input", d["brand"]), r("Official Website", "input", d["website"]),
                                     r("Production Company", "textarea", d["company"]),
                                     r("Producers", "textarea", d["producers"]), r("Directors", "textarea", d["directors"]),
                                     r("Festivals", "textarea", ""), r("Your Roles", "textarea", d["roles"])])
        + sec("Search", [r("Additional Search Data", "textarea", d["search"])])
        + sec("eCommerce", [r("Article", "lookup", "")])
        + sec("Security", [r("Download", "checkbox", True), r("Usage Number", "input", ""),
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
