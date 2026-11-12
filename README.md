# Noman.3D — Muhammad Noman Shahid Portfolio

An animated 3D portfolio built with **Three.js (WebGL)**.

- Clean, static light background — no animation behind the text, so all content stays fully readable
- The wow effect is a **contained Three.js avatar stage** in the hero: a 3D cartoon avatar (headphones, glowing chest core, antenna) that hovers, **waves**, and **turns its head to follow your mouse** inside its box, with orbiting skill shapes and rings around it
- Plus small local animations that never cover data: a waving SVG mini-avatar in About, a waving hand in Contact, floating badges on the stage, typed hero roles, animated counters / skill bars, and 3D-tilt cards
- Sections: Hero with typed roles + animated counters, About, Skills (animated bars + 3D-tilt cards), Live Projects (filterable, 3D tilt), Experience timeline, Services, Contact
- Real projects with live links: Counterly, MarketPulse, PropMatch, LoveLink, CallAgent, Office 3D Walk (+ PromptCam & DocVault mobile apps)
- Mobile responsive, hamburger menu, `prefers-reduced-motion` support, CSS gradient fallback if WebGL/CDN is unavailable

## Run locally
Any static server, e.g. `npx serve .` — then open the printed URL. Three.js loads from the jsDelivr CDN (internet required for the 3D scene).

## Files
- `index.html` — content & structure
- `style.css` — all styling
- `scene.js` — Three.js / WebGL scene (ES module)
- `main.js` — UI behaviour (typing, counters, tilt, filters)
