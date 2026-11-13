# Muhammad Noman Shahid — Professional Portfolio

A premium personal portfolio built **strictly from my CV** — no invented companies, dates, certifications, achievements, or project links.

**Content (from the CV):** SQL & SQA Associate at Mercury Sols (full-time, Sep 2026 – Present) · eBay Store Management & E-commerce Operations (part-time, remote) · Facilitation Officer at Pakistan Revenue Automation Ltd. (2020–2024) · YouTube Content Manager, Whizzy Marketing (2019–2020) · Digital Marketing Associate, Zaman IT Networks (2017–2019) · BS Information Technology, GC University Faisalabad.

**11 sections:** Introduction · Professional Summary · Technical Skills · Professional Experience · SQL & Database Expertise · SQA · eBay & E-commerce · Projects & Work Showcase (CV work only, contribution stated, **no external project links**) · Education · Strengths & Services · Hire Me / Contact.

**Signature interaction — globe-like 3D rotation:** in Animated mode every section is a full-screen panel; scrolling, swiping, arrow keys, the dot indicators, the menu, or Prev/Next rotates the current panel away around a vertical axis while the next rotates in (CSS 3D transforms + perspective, transitions locked while running). Wheel input scrolls a panel's own content first and only rotates at its top/bottom edge.

**Animation-free mode:** the "📄 View Full Profile Without Animations" button at the top switches to one continuous, normally scrollable page with all sections visible, and back via "Return to Animated Experience". A visitor's system `prefers-reduced-motion` starts the site in full mode automatically.

**Hire Me:** Fiverr button links to the real profile (fiverr.com/m_noman_shahid). PeoplePerHour and LinkedIn buttons are present but inactive until the actual profile links are provided — no fake or placeholder URLs are used.

## Run locally
Any static server, e.g. `npx serve .` — then open the printed URL. No build step; the only external asset is Google Fonts.

## Files
- `index.html` — content & structure
- `style.css` — all styling
- `scene.js` — the globe-like panel rotation engine + animated/full mode toggle (no libraries)
- `main.js` — section menu + showcase category filter
