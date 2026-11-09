# Affino Seating Planner — facts for the portfolio case study

Source: the figmaTest design-system repo and its project memory. Unknowns are marked.

## Brief

- **What it is:** a Seating Planner module for Affino's Control Centre (Control › CRM › Events), not a standalone app. It's a general-purpose table-seating tool for any event: conference, dinner, gala, awards or member event. A seat can hold a registered attendee or a CRM contact (sponsor, VIP, guest speaker, host).
- **How it arrived:** Affino's spec team handed it over one screen at a time, as Hub tasks plus their own rough prototype.
- **What existed before:** only that rough spec prototype. Nothing equivalent was in the design system.

## Mark's role

- Lead product designer, working with Claude Code.
- Each screen went from a code-first prototype, to Figma at desktop and mobile widths, to tokenised Figma component sets, to production components built from Figma.
- Mark made the design calls, invited better alternatives to the rough mock ("rough mock, suggest better"), and approved the token, Figma and naming decisions.

## What was built

- **Screen:** the Seating Planner, inside the Control Centre app shell.
- **Patterns:** EventPicker, SeatingHeader, TableListing, TableDetail, Unassigned.
- **Components:** TableCard, TableType, AttendeeCard, RoomCard, FullBadge, SeatingToast.
- **Flow:** event → plans (rooms) → tables → seats.
- **Features:**
  - room and plan cards with a seats-free bar
  - table cards with a capacity bar split by role (Attendee, VIP, Speaker, Sponsor, Host) and tier pills
  - a table detail panel listing the seats
  - an Unassigned tray with search
  - drag to seat, plus an "Only free seats" filter
  - create, copy, edit and delete plans and tables
  - room layout and export
  - undo toasts
- **Mobile** is supported.
- **Interface:** a worklist view became the main interface on 31 July 2026.

## Key design decisions

- **Colour discipline.** The mock used three colour languages, with gold meaning three different things. Reworked so brand colour means selection only, and role colours mean people.
- **Tier labels.** A tier always carries a text label, never colour alone (WCAG 1.4.1), so it still reads in a black-and-white PDF export. Users pick tier colours at runtime, and the pill derives its fill, border and text from one colour.
- **Mobile inverts rather than shrinks.** Drag doesn't work on touch, so "tap an empty seat → Assign → pick a person" is the main path on every screen size. Drag is a desktop extra, which also helps keyboard users. The seat panel and unassigned list become sheets on mobile, and the plan chips become a horizontal scroll strip.
- **Extensible shell.** Each sub-task plugs into one central registry, so new features went live without changing the shell. The New plan popup proved it.
- **Layout follows the column, not the window.** A docked menu shrinks the content area with no window resize. A real bug drove this: on a 2,239px-wide window the column was only 820px, and the layout broke.
- **One role-colour palette.** Two alternatives (Muted and Radix Soft) were explored, then removed.

## Constraints

- Built on the Affino Design System: plain HTML and CSS, design tokens only, Lucide icons, WCAG 2.1 AA.
- Front end only. Data is mocked, and the backend work is flagged for Affino's developers.
- Tables hold 6–12 seats each, with 10 as the default.
- **Demo event:** "The Card & Payments Awards 2026", 183 attendees, 4 rooms (the Main Ballroom has 13 tables), Grosvenor House, London.
- Limits on event size beyond that: not known.

## Outcomes

- Shipped as a working front-end build, with a client-safe standalone preview: https://prblm-mark.github.io/affino-seating-planner/ (opens in dark mode by default).
- Also in the internal demo site: https://prblm-mark.github.io/figmaTest/src/cc/templates/SeatingPlanner/SeatingPlanner.html
- Project memory marks it as parked since 31 July 2026, with refinements queued.
- **Not known:** whether it went live in the Affino product, client usage, and any feedback or results.

## Figma

Master design-system file `Lus07xi8pPXLN87sQIyrEt`.

- Prototypes page `2025:803`; EventPicker component set `3108:6662`.
- Screens:
  - No Event: desktop `3515:175956`, mobile `3515:213358`
  - Select Event: `3515:176032`
  - No Plan: `3515:176082`
  - Create Plan: `3515:212885`
  - Full-width layout: `3808:125109`
  - Sticky scroll: `3615:110611`
- AttendeeCard: `3474:89292`.
- Node `382:9520` in file `crhu1DP7LixvfA5zu68zUS` isn't referenced anywhere in this repo.
