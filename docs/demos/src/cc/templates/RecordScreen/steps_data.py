# Article 626347 "Affino 9.0.11.24 - The Autonomy Update" — steps read from the Hub
# (article_steps, 2026-09-25). Titles and opening sentences are the real text; every step is
# Type Content, Float None, no design frame, no lookup, no images, Live, created by Markus Karlsson
# 20 Jul 2026 15:36 — as the live View screen shows.
ARTICLE = "Affino 9.0.11.24 - The Autonomy Update"
STEPS = [
 ("Agent Access - Let Trusted AI Agents Operate Affino for You, in the Browser and Beyond", "The headline of 9.0.11.24 - and the reason it is The Autonomy Update - is Agent Access: trusted AI agents can now operate Affino for you, signing in and working across your sites and your platform without a person having to drive every step."),
 ("Awards & Events - A Smoother Run From Entry to Judging to Event Day", "Awards and events get a substantial operational lift in 9.0.11.24, making the whole cycle - from entry, through judging, to the event itself - smoother to run and better presented to entrants and attendees."),
 ("Commercial Flexibility - Sell for Different Entities and Under Different Terms From One Store", "The biggest commercial step in 9.0.11.24 is the ability to run several commercial entities through a single store, and to sell each product under its own terms."),
 ("Upgrade Guidance", "This is a priority update. More than one hundred platform and infrastructure updates land alongside this release, including important security hardening across member-facing forms, sessions, and the editing layer."),
 ("AI and Intelligence", "The headline AI-related story in this release is Agent Access - the new secure sign-in that lets trusted agents operate a site as a real member - covered in its own section above."),
 ("Marketing", "Marketing gets a focused workflow polish in this release. Tracked campaign links are quicker to copy from the UTM Link Builder, and campaign group lookup behaves more reliably when teams are browsing longer lists."),
 ("Content and Publishing", "Content and Publishing gets a media and editing pass in this release, with better control over assets and galleries and steadier everyday publishing."),
 ("Commerce", "Commerce gets the largest structural upgrade in 9.0.11.24. Invoice Profiles now connect Product Lines, catalogue items, and pro forma orders, giving teams a cleaner way to manage billing identity, payment, address, and terms details."),
 ("Automation", "Automation is more useful where Affino connects to the systems around it. Zapier credential copying, richer Article Published payloads, and the Customer Signal terminology sweep reduce setup friction."),
 ("Subscriptions", "Subscription operations are more accurate and less prone to edge-case friction in this release. Magic Link access dates now have clearer validation."),
 ("Messaging", "Messaging workflows are clearer and more predictable in this release. Campaign sender handling, template-driven scheduling, and a more resilient Template Builder make communication setup easier."),
 ("CRM and Contacts", "CRM and Contacts gets a practical operations upgrade in 9.0.11.24. Opportunity Topics, much faster exports, clickable external IDs, and more forgiving imports all improve the management workflows teams use every day."),
 ("Analytics", "Analytics is stronger where reporting and search visibility meet daily operations. Crawl-budget controls, HTTPS click tracking, and improved bot detection protect reporting quality and search behaviour."),
 ("Security and Privacy", "Security and Privacy has two focused but important changes in this release. CSRF protection and SameSite cookie handling strengthen member-facing forms and session behaviour."),
 ("Events", "The headline Events story is the awards and attendee workflow lift covered above. Beyond that, shortlist judging, award introduction screens, event theming, and attendee exports all become more useful."),
 ("Platform, Security & Performance", "This release makes Affino steadier under load and easier to operate day to day. A refreshed Control Centre homepage and clearer login guidance improve the operator experience."),
 ("Removed", "There are no confirmed removals to call out in this release."),
 ("Integration Updates", "The main integration changes in 9.0.11.24 sit in the area sections above. These items are the connection points most likely to matter to teams using Affino alongside external systems."),
 ("Component Changes", "Component and library changes in this release strengthen security and reliability at the framework layer."),
 ("Help Guides", "These guides cover the headline features and the changes most likely to affect your day-to-day work, grouped by area. New and updated guides are published alongside the release."),
 ("Help Guides", "These guides expand on the changes in this release."),
]
# Step 1's full body (as HTML) for the expanded / inspector views — the real text, to the point
# the Hub response carried it.
STEP1_HTML = """<p>The headline of 9.0.11.24 - and the reason it is <strong>The Autonomy Update</strong> - is <strong>Agent Access</strong>: trusted AI agents can now operate Affino for you, signing in and working across your sites and your platform without a person having to drive every step.</p>
<h4>Operate your sites in the browser, as a real member</h4>
<p>Agent Access issues a genuine, signed, single-use member login, so an agent can sign in to your site and move through it exactly as a real member would - browsing, navigating, and completing member journeys in a real browser. Page views, journeys, and conversions behave just as they do for a signed-in person, which makes it ideal for automating and verifying live journeys end to end.</p>
<h4>Work across your platform too, alongside the toolkit you already have</h4>
<p>Browser operation sits alongside the programmatic control Affino already offers. The Affino MCP toolkit lets agents manage the platform itself - CRM, content, media, forums and more - as an attributed member of your team, and the Zapier integration moves data in and out across thousands of apps.</p>
<h4>Works with your preferred agent tools</h4>
<p>Agent Access is open to any capable agent client, so your team can use whatever they already work with - Claude Cowork, Codex, the ChatGPT app, or an equivalent agent platform - to reach directly into Affino.</p>
<h4>Locked down, layer by layer</h4>
<p>Agent Access is built to be secured tightly, and the controls stack. You combine an <strong>Access Profile</strong> and a <strong>Bot Access Profile</strong> - which can restrict an agent by <strong>IP address</strong> or <strong>user agent</strong> - with <strong>Agent Access Keys</strong> that carry the credential and can be rotated or revoked.</p>"""
STEP2_HTML = """<p>Awards and events get a substantial operational lift in 9.0.11.24, making the whole cycle - from entry, through judging, to the event itself - smoother to run and better presented to entrants and attendees.</p>
<h4>Cleaner judging</h4>
<p>Shortlist judging now has its own dedicated route, so you can send judges straight to the right stage without shortlist and final judging blurring together. Rounds stay distinct, and judges see exactly the screen they need.</p>
<h4>What's included:</h4>
<ul><li><strong>Shortlist judging screen</strong> - judges can be sent to a dedicated shortlist judging screen.</li><li><strong>Award introduction categories</strong> - Awards can show category lists, expandable detail, breakpoint columns, and entry prices.</li><li><strong>Category icons</strong> - award categories can carry icons on the introduction screen.</li></ul>"""
