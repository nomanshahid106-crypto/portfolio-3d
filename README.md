# Noman.3D — Muhammad Noman Shahid Portfolio

A portfolio with **ClearPlan-style animation**: calm, professional motion that never hurts readability.

- Clean, static light background — nothing moves behind the text
- **Signature:** a dot-particle artwork inside the hero stage. On load the dots drift from a cloud into a growth chart; as you scroll they disperse and re-form per section — Growth chart → Quality badge ✓ → Skill blocks → Rocket 🚀 → Experience steps → Chat bubble → Envelope — driven by scroll position (stop scrolling and they settle still), with a shape label and a 6-segment progress track under the stage, just like ClearPlan's
- Quiet **staggered fade-and-rise** reveals for every section and grid, hand-drawn **scribble accents** (oval around "For You", double underline under "Live") that draw themselves once when the heading appears
- Deliberately minimal interaction feedback: no typing effect, no card tilt/lift — only a soft shadow/border tint on hover, colour change on interactive rows
- Sections: Hero with animated counters, About, Skills (animated bars), Live Projects (filterable), Experience timeline, Services, Contact
- Real projects with live links: Counterly, MarketPulse, PropMatch, LoveLink, CallAgent, Office 3D Walk (+ PromptCam & DocVault mobile apps)
- Mobile responsive, hamburger menu, `prefers-reduced-motion` support (dots render as one static shape)

## Run locally
Any static server, e.g. `npx serve .` — then open the printed URL. No build step and no CDN libraries: everything runs from the files in this repo.

## Files
- `index.html` — content & structure
- `style.css` — all styling
- `scene.js` — the scroll-scrubbed dot-particle morph artwork (2D canvas, no libraries)
- `main.js` — UI behaviour (typing, counters, tilt, filters)
