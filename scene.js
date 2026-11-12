// Three.js ABSTRACT SCULPTURE — contained inside the hero stage box only.
// No characters, no avatars, nothing behind the page text: a clean rotating
// geometric sculpture (torus knot + core + rings + orbiters) that tilts
// gently toward your mouse inside its own stage.
import * as THREE from 'three';

const stage = document.getElementById('hero-stage');
const canvas = document.getElementById('webgl');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!stage || !canvas) throw new Error('hero stage missing');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  canvas.style.display = 'none'; // ◆ fallback inside the stage stays visible
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0.6, 11.5);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(4, 8, 6); scene.add(key);
const rimViolet = new THREE.PointLight(0x7c5cff, 70, 30); rimViolet.position.set(-6, 3, -2); scene.add(rimViolet);
const rimCyan = new THREE.PointLight(0x22d3ee, 60, 30); rimCyan.position.set(6, -2, 3); scene.add(rimCyan);

const sculpture = new THREE.Group(); scene.add(sculpture);

// Centre: metallic torus knot + glowing faceted core
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.45, 0.42, 180, 28),
  new THREE.MeshStandardMaterial({ color: 0x6d4aff, roughness: 0.22, metalness: 0.75 })
);
sculpture.add(knot);
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.72, 0),
  new THREE.MeshStandardMaterial({ color: 0xf5b544, roughness: 0.3, metalness: 0.4, emissive: 0xd98a06, emissiveIntensity: 0.5, flatShading: true })
);
sculpture.add(core);
const coreWire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.95, 1),
  new THREE.MeshBasicMaterial({ color: 0x0899c4, wireframe: true, transparent: true, opacity: 0.4 })
);
sculpture.add(coreWire);

// Rings around the sculpture
const rings = [[2.6, 0x0899c4, 0.45], [3.05, 0x7c5cff, -0.32], [3.5, 0xd98a06, 0.85]].map(([r, color, rx]) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 10, 110), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65 }));
  ring.rotation.x = Math.PI / 2 + rx; sculpture.add(ring); return ring;
});

// Orbiting shapes
const orbiters = [];
[[new THREE.BoxGeometry(0.4, 0.4, 0.4), 0x7c5cff], [new THREE.SphereGeometry(0.25, 16, 16), 0x0899c4],
 [new THREE.OctahedronGeometry(0.31), 0xd98a06], [new THREE.TorusGeometry(0.25, 0.1, 10, 20), 0xdb2777],
 [new THREE.ConeGeometry(0.27, 0.5, 6), 0x059669], [new THREE.TetrahedronGeometry(0.33), 0x2563eb]
].forEach(([geo, color], i) => {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5, emissive: color, emissiveIntensity: 0.25 }));
  m.userData = { angle: (i / 6) * Math.PI * 2, speed: 0.22 + (i % 3) * 0.05, r: 3.0 + (i % 2) * 0.4 };
  sculpture.add(m); orbiters.push(m);
});

// Hover platform + glowing ring beneath
const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.15, 0.28, 40), new THREE.MeshStandardMaterial({ color: 0xe8ecff, roughness: 0.3, metalness: 0.35 }));
platform.position.y = -2.9; sculpture.add(platform);
const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.06, 10, 60), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.2 }));
glowRing.rotation.x = Math.PI / 2; glowRing.position.y = -2.78; sculpture.add(glowRing);

// Sparse sparkles INSIDE the stage only
{
  const n = 130, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const palette = [0x6d4aff, 0x0899c4, 0xd98a06, 0xdb2777].map(c => new THREE.Color(c));
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 11; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = -2.5 - Math.random() * 3;
    const c = palette[i % palette.length]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false })));
}

// Mouse tilt — only while the pointer is over the stage
let tx = 0, ty = 0, mx = 0, my = 0;
stage.addEventListener('pointermove', e => {
  const r = stage.getBoundingClientRect();
  tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
}, { passive: true });
stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;

  knot.rotation.x = t * 0.22; knot.rotation.y = t * 0.3;
  core.rotation.y = -t * 0.4; coreWire.rotation.y = t * 0.25; coreWire.rotation.x = t * 0.12;
  core.scale.setScalar(1 + Math.sin(t * 2) * 0.07);
  rings.forEach((r, i) => { r.rotation.z = t * (0.1 + i * 0.05) * (i % 2 ? -1 : 1); });
  orbiters.forEach((o, i) => {
    const a = o.userData.angle + t * o.userData.speed;
    o.position.set(Math.cos(a) * o.userData.r, Math.sin(t * 0.8 + i) * 0.45, Math.sin(a) * o.userData.r * 0.45);
    o.rotation.x = t * 0.6 + i; o.rotation.y = t * 0.8;
  });
  glowRing.rotation.z = t * 0.25;
  sculpture.position.y = Math.sin(t * 1.1) * 0.14;
  sculpture.rotation.y = mx * 0.35;
  sculpture.rotation.x = my * 0.18;

  renderer.render(scene, camera);
}
if (reduced) { renderer.render(scene, camera); } else { animate(); }
