// Three.js scene — animated 3D background that reacts to mouse + scroll
import * as THREE from 'three';

const canvas = document.getElementById('webgl');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  canvas.style.display = 'none';
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xdfe8ff, 0.012);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 15);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.1));
const lightViolet = new THREE.PointLight(0x7c5cff, 220, 60); lightViolet.position.set(-8, 6, 6); scene.add(lightViolet);
const lightCyan = new THREE.PointLight(0x22d3ee, 180, 60); lightCyan.position.set(9, -4, 5); scene.add(lightCyan);
const lightAmber = new THREE.PointLight(0xf5b544, 90, 50); lightAmber.position.set(0, -10, 3); scene.add(lightAmber);

// ---------- Starfield + dust particles ----------
function makePoints(count, spread, size, colors) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const palette = colors.map(c => new THREE.Color(c));
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6 - 4;
    const c = palette[Math.floor(Math.random() * palette.length)];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true, depthWrite: false });
  return new THREE.Points(geo, mat);
}
const stars = makePoints(2600, 90, 0.15, [0x6d4aff, 0x0899c4, 0xd98a06, 0xdb2777, 0x059669]);
scene.add(stars);
const dust = makePoints(500, 40, 0.07, [0x0899c4, 0x6d4aff]);
scene.add(dust);

// ---------- Hero centrepiece: glowing core + rings + orbiters ----------
const hero = new THREE.Group();
const coreMat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, roughness: 0.25, metalness: 0.65, emissive: 0x3b2a80, emissiveIntensity: 0.45, flatShading: true });
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 0), coreMat);
hero.add(core);
const coreWire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.15, 1), new THREE.MeshBasicMaterial({ color: 0x0899c4, wireframe: true, transparent: true, opacity: 0.45 }));
hero.add(coreWire);

const rings = [];
[[3.1, 0x22d3ee, 0.5, 0.2], [3.8, 0x7c5cff, -0.35, 0.9], [4.5, 0xf5b544, 0.9, -0.4]].forEach(([r, color, rx, rz]) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 12, 140), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 }));
  ring.rotation.set(rx, 0, rz); hero.add(ring); rings.push(ring);
});

// Orbiting "skill" spheres on the outer ring
const orbiters = [];
const orbColors = [0x22d3ee, 0xf5b544, 0x7c5cff, 0x34d399, 0xf472b6, 0xffffff, 0x60a5fa, 0xfacc15];
for (let i = 0; i < 8; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), new THREE.MeshStandardMaterial({ color: orbColors[i], emissive: orbColors[i], emissiveIntensity: 0.55, roughness: 0.3 }));
  s.userData.angle = (i / 8) * Math.PI * 2;
  hero.add(s); orbiters.push(s);
}
hero.position.set(4.6, 0.4, 0);
scene.add(hero);

// ---------- Floating geometry field (the journey) ----------
const field = new THREE.Group();
const shapeMats = [0x7c5cff, 0x22d3ee, 0xf5b544, 0x34d399].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.55, flatShading: true, transparent: true, opacity: 0.92 }));
const shapeGeos = [new THREE.BoxGeometry(1, 1, 1), new THREE.OctahedronGeometry(0.8), new THREE.TetrahedronGeometry(0.9), new THREE.TorusGeometry(0.6, 0.22, 10, 24), new THREE.ConeGeometry(0.6, 1.2, 6)];
const floaters = [];
for (let i = 0; i < 42; i++) {
  const m = new THREE.Mesh(shapeGeos[i % shapeGeos.length], shapeMats[i % shapeMats.length]);
  m.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 26, -Math.random() * 16 - 1);
  const sc = 0.35 + Math.random() * 0.9; m.scale.setScalar(sc);
  m.userData = { baseY: m.position.y, speed: 0.4 + Math.random() * 0.9, phase: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.012 };
  field.add(m); floaters.push(m);
}
scene.add(field);

// Connecting constellation lines
{
  const pts = [];
  for (let i = 0; i < 26; i++) pts.push(new THREE.Vector3((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 18, -6 - Math.random() * 8));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const lines = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x6d4aff, transparent: true, opacity: 0.22 }));
  scene.add(lines);
}

// ---------- Interaction: mouse + scroll ----------
let mx = 0, my = 0, tx = 0, ty = 0, scrollP = 0;
window.addEventListener('pointermove', e => { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
function readScroll() { const h = document.documentElement; scrollP = h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1); }
window.addEventListener('scroll', readScroll, { passive: true }); readScroll();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  hero.position.x = window.innerWidth < 820 ? 0 : 4.6;
  hero.position.y = window.innerWidth < 820 ? 2.6 : 0.4;
});
if (window.innerWidth < 820) { hero.position.set(0, 2.6, 0); }

// Colour journey across the page: violet → cyan → amber → emerald
const journey = [new THREE.Color(0x7c5cff), new THREE.Color(0x22d3ee), new THREE.Color(0xf5b544), new THREE.Color(0x34d399)];
function journeyColor(p) {
  const seg = Math.min(p * (journey.length - 1), journey.length - 1.001);
  const i = Math.floor(seg);
  return journey[i].clone().lerp(journey[i + 1], seg - i);
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  mx += (tx - mx) * 0.045; my += (ty - my) * 0.045;

  // Hero centrepiece
  core.rotation.y = t * 0.25; core.rotation.x = t * 0.12;
  coreWire.rotation.y = -t * 0.16; coreWire.rotation.z = t * 0.08;
  coreMat.color.copy(journeyColor(scrollP));
  rings.forEach((r, i) => { r.rotation.z = t * (0.12 + i * 0.05) * (i % 2 ? -1 : 1); });
  orbiters.forEach((s, i) => {
    const a = s.userData.angle + t * 0.35;
    s.position.set(Math.cos(a) * 4.5, Math.sin(a * 1.0) * 1.15, Math.sin(a) * 4.5 * 0.42);
    s.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.18);
  });
  hero.position.y += Math.sin(t * 0.8) * 0.0016;
  hero.rotation.y = mx * 0.35;

  // Field + stars drift
  floaters.forEach(f => {
    f.position.y = f.userData.baseY + Math.sin(t * f.userData.speed + f.userData.phase) * 0.55;
    f.rotation.x += f.userData.spin; f.rotation.y += f.userData.spin * 1.3;
  });
  stars.rotation.y = t * 0.006 + scrollP * 0.6;
  dust.rotation.y = -t * 0.01;
  field.rotation.y = scrollP * Math.PI * 0.9 + mx * 0.12;

  // Camera: parallax + scroll dolly / descent
  camera.position.x = mx * 1.4;
  camera.position.y = -my * 0.9 - scrollP * 3.2;
  camera.position.z = 15 - scrollP * 4.5;
  camera.lookAt(0, camera.position.y * 0.6, 0);
  hero.position.x = (window.innerWidth < 820 ? 0 : 4.6) - scrollP * 3.4;

  renderer.render(scene, camera);
}
if (reduced) { renderer.render(scene, camera); } else { animate(); }
