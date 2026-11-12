# Noman.3D — Muhammad Noman Shahid Portfolio

An animated 3D portfolio built with **Three.js (WebGL)**.

- Full-screen WebGL scene: glowing colour-changing core with orbiting skill spheres, 3 torus rings, 2,600-star field, dust particles, and 42 floating geometric shapes
- The scene **reacts to your mouse** (parallax + hero rotation) and to **scroll** (camera dolly, colour journey violet → cyan → amber → emerald, shape-field rotation)
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
