"""Add step screens — Content Step (StepType=1) and Dynamic Form Step (StepType=2).

Code-first (designer, 2026-09-30; Figma build to follow). The field set, order, required flags,
defaults and option lists are the live screen's own: affino.com AfcLiveEdit/FormDef/
StepByStepFormDef.cfm (the qLiveEdit rows, their Tab + FieldSortOrder) and the option queries in
AfcLiveEdit/Display/LiveEditStepByStepForm.cfm, read 2026-09-30. The four legacy tabs are four
stacked RecordSections, as on Article Edit (designer).

Which fields a Dynamic Form Step keeps is the file's own list (sDynamicFormStepFields):
Title, Show Title, Sort Order, Step Width, Step Float, Top Divider, Main Column Width, Background
Color, Publish Start / End, Live — plus Dynamic Form, which only it has. Everything else is
Content-only. The type is fixed once saved.
"""
import record_markup as m

# LiveEditStepByStepForm.cfm option queries
STEP_WIDTH = ["100%", "75%", "66%", "50%", "33%", "25%"]
STEP_FLOAT = ["No Float", "Left", "Right"]
IMAGE_ALIGN = ["Left", "Right", "Above"]
MULTIMEDIA_ALIGN = ["Above", "Below"]
OPEN_LINK = ["New Tab", "Current Tab"]
# ContentType WHERE TypeCode = 1 on affino.com: one row ("Quote"), read 2026-09-30.
CONTENT_TYPE = ["None", "Quote"]
# DynamicFormItem, displayed "Name [code]" as the live select does; affino.com's live forms
# (forms_list 2026-09-30), less its PYTEST / QA / MK Test debris.
DYNAMIC_FORMS = [
    ("Affino Innovation Briefing 2023 Feedback Survey", 62), ("Affino Innovation Briefing 2025 Feedback Survey", 68),
    ("Affino Innovation Briefing Event Feedback Survey", 57), ("Affino Subscription Dashboard Survey", 63),
    ("AI Plugins Form", 67), ("AI Webinar Sign-up Form", 64), ("Ask a Question", 46), ("Do Not Profile Me", 51),
    ("Forget Me", 50), ("Free AI Advisory Consultation for Charities", 468), ("Get a Free Demo", 38),
    ("Make an Appointment", 37), ("Notification of Data Security Breach", 52), ("Partner Application Form", 45),
    ("Register Your Attendance for the November 16th Affino Innovation Briefing 2023", 61),
    ("Register Your Attendance for the November 17th Affino Innovation Briefing 2022", 60),
    ("Register Your Attendance for the November 25th Affino Innovation Briefing 2021", 59),
    ("Register Your Attendance for the November 6th Affino Innovation Briefing 2024", 65),
    ("Report a Bug", 43), ("Report Inappropriate Content", 41), ("Request a call", 66),
]


def sections(step_type, position):
    """step_type: "content" | "form". position: the default Sort Order (steps + 1)."""
    r = m.edit_row
    form = step_type == "form"
    title = "Dynamic form step" if form else "Content step"
    main = []
    if form:
        main.append(r("Dynamic Form", "select", "Select...", required=True,
                      options=[f"{n} [{c}]" for n, c in DYNAMIC_FORMS]))
    main += [
        r("Title", "input", required=True),
        r("Show Title", "checkbox", True),
        r("Sort Order", "lookup", required=True, modal="modal-step-sort", placeholder=position),
    ]
    if not form:
        main += [
            r("Step Image", "media"),
            r("Alt Step Image", "input"),
            r("Caption Text", "input"),
            r("Image Align", "select", "Left", options=IMAGE_ALIGN),
            r("Presentation Image", "media"),
            r("Step Text", "rich"),
            r("Content Type", "select", "None", options=CONTENT_TYPE),
            r("Step Text Color", "color"),
            r("Link", "input"),
            r("Open Link Option", "select", "New Tab", options=OPEN_LINK),
        ] + [r(f"Multimedia {i}", "multimedia") for i in range(1, 7)] + [
            r("Multimedia Align", "select", "Above", options=MULTIMEDIA_ALIGN),
        ]
    layout = [r("Step Width", "select", "100%", required=True, options=STEP_WIDTH),
              r("Step Float", "select", "No Float", options=STEP_FLOAT)]
    if not form:
        layout.append(r("Design Frame", "checkbox"))
    layout += [r("Top Divider", "checkbox"), r("Use Main Column Width [Feature Article]", "checkbox")]
    background = [r("Background Color", "color")]
    if not form:
        background += [r("Background Image", "media"), r("Background CSS", "textarea"),
                       r("Background Parallax Scrolling", "checkbox")]
    publication = [r("Publish Start", "datetime"), r("Publish End", "datetime"), r("Live", "checkbox", True)]
    return "".join([
        m.record_section(title, main, "edit"),
        m.record_section("Layout", layout, "edit"),
        m.record_section("Background", background, "edit"),
        m.record_section("Publication", publication, "edit"),
    ])
