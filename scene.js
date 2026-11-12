// Three.js AVATAR scene — contained inside the hero stage box only.
// No full-page background animation: the page stays clean and readable,
// and the wow effect lives in its own stage where the avatar performs.
import * as THREE from 'three';

const stage = document.getElementById('avatar-stage');
const canvas = document.getElementById('webgl');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!stage || !canvas) throw new Error('avatar stage missing');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  canvas.style.display = 'none'; // CSS/robot fallback inside the stage stays visible
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 1.2, 11.5);
camera.lookAt(0, 0.4, 0);

scene.add(new THREE.AmbientLight(0xffffff, 1.15));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(4, 8, 6); key.castShadow = true; scene.add(key);
const rimViolet = new THREE.PointLight(0x7c5cff, 60, 30); rimViolet.position.set(-6, 3, -3); scene.add(rimViolet);
const rimCyan = new THREE.PointLight(0x22d3ee, 50, 30); rimCyan.position.set(6, -1, 3); scene.add(rimCyan);

const M = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.15, ...opts });
const skin = M(0xf2c29b), shirt = M(0x6d4aff), shirtDark = M(0x4c32b8), pants = M(0x26304d),
      white = M(0xffffff), dark = M(0x1c2440, { roughness: 0.25, metalness: 0.4 }),
      glowCyan = M(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.4 });

// ---------- Avatar ----------
const avatar = new THREE.Group();

// Hover platform
const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.35, 0.35, 40), M(0xe8ecff, { roughness: 0.3, metalness: 0.35 }));
platform.position.y = -2.55; platform.receiveShadow = true; avatar.add(platform);
const platformRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.07, 12, 60), glowCyan);
platformRing.rotation.x = Math.PI / 2; platformRing.position.y = -2.42; avatar.add(platformRing);

// Legs + shoes (dangling, hovering bot style)
[-0.55, 0.55].forEach(x => {
  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.55, 6, 14), pants);
  leg.position.set(x, -1.75, 0); leg.castShadow = true; avatar.add(leg);
  const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), white);
  shoe.scale.set(1, 0.62, 1.35); shoe.position.set(x, -2.22, 0.14); shoe.castShadow = true; avatar.add(shoe);
});

// Body
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.98, 0.85, 8, 22), shirt);
body.position.y = -0.55; body.castShadow = true; avatar.add(body);
const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 18), glowCyan);
chestCore.position.set(0, -0.35, 0.92); avatar.add(chestCore);
const belt = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.09, 10, 32), shirtDark);
belt.rotation.x = Math.PI / 2; belt.position.y = -1.12; avatar.add(belt);

// Head group (looks at your mouse)
const headG = new THREE.Group(); headG.position.y = 1.05; avatar.add(headG);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 26), skin);
head.castShadow = true; headG.add(head);
// Hair cap
const hair = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.46), dark);
hair.position.y = 0.1; headG.add(hair);
// Eyes + smile
[-0.32, 0.32].forEach(x => {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), dark);
  eye.position.set(x, 0.06, 0.86); headG.add(eye);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), white);
  spark.position.set(x + 0.03, 0.12, 0.93); headG.add(spark);
});
const smile = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 8, 24, Math.PI), dark);
smile.position.set(0, -0.28, 0.84); smile.rotation.z = Math.PI; smile.rotation.x = -0.15; headG.add(smile);
// Blush
[-0.58, 0.58].forEach(x => {
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), M(0xf5a3a3, { emissive: 0xf5a3a3, emissiveIntensity: 0.25 }));
  b.scale.set(1, 0.6, 0.3); b.position.set(x, -0.16, 0.8); headG.add(b);
});
// Headphones (SQA / creator vibe) + glowing ear cups
const band = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 10, 32, Math.PI), dark);
band.position.y = 0.12; headG.add(band);
[-1.0, 1.0].forEach(x => {
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 20), x < 0 ? M(0x7c5cff) : M(0x0899c4));
  cup.rotation.z = Math.PI / 2; cup.position.set(x, -0.05, 0); headG.add(cup);
});
// Antenna with pulsing tip
const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), dark);
antenna.position.set(0.45, 1.05, 0); antenna.rotation.z = -0.25; headG.add(antenna);
const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), M(0xf5b544, { emissive: 0xf5b544, emissiveIntensity: 1.2 }));
antennaTip.position.set(0.52, 1.34, 0); headG.add(antennaTip);

// Left arm (resting, slight sway)
const armL = new THREE.Group(); armL.position.set(-1.0, 0.05, 0); avatar.add(armL);
const armLMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.62, 6, 14), shirt);
armLMesh.position.y = -0.5; armLMesh.castShadow = true; armL.add(armLMesh);
const handL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), skin);
handL.position.y = -1.0; armL.add(handL);
armL.rotation.z = 0.35;

// Right arm (WAVING — pivot at the shoulder)
const armR = new THREE.Group(); armR.position.set(1.0, 0.05, 0); avatar.add(armR);
const armRMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.62, 6, 14), shirt);
armRMesh.position.y = 0.5; armRMesh.castShadow = true; armR.add(armRMesh);
const handR = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12), skin);
handR.position.y = 1.02; armR.add(handR);
armR.rotation.z = -0.5; // raised up

scene.add(avatar);

// Orbiting skill shapes around the avatar (inside the stage only)
const orbiters = [];
const orbDefs = [
  [new THREE.BoxGeometry(0.42, 0.42, 0.42), 0x7c5cff], [new THREE.SphereGeometry(0.26, 16, 16), 0x0899c4],
  [new THREE.OctahedronGeometry(0.32), 0xd98a06], [new THREE.TorusGeometry(0.26, 0.1, 10, 20), 0xdb2777],
  [new THREE.ConeGeometry(0.28, 0.5, 6), 0x059669], [new THREE.TetrahedronGeometry(0.34), 0x2563eb]
];
orbDefs.forEach(([geo, color], i) => {
  const m = new THREE.Mesh(geo, M(color, { emissive: color, emissiveIntensity: 0.25 }));
  m.userData = { angle: (i / orbDefs.length) * Math.PI * 2, speed: 0.25 + (i % 3) * 0.06, r: 3.15 + (i % 2) * 0.35 };
  scene.add(m); orbiters.push(m);
});
// Two tilted orbit rings
const rings = [[3.3, 0x0899c4, 0.42], [3.75, 0x7c5cff, -0.3]].map(([r, color, rx]) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 90), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
  ring.rotation.x = Math.PI / 2 + rx; scene.add(ring); return ring;
});
// Sparse sparkles INSIDE the stage (behind avatar, never behind page text)
{
  const n = 160, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const palette = [0x6d4aff, 0x0899c4, 0xd98a06, 0xdb2777].map(c => new THREE.Color(c));
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 11; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = -2 - Math.random() * 3;
    const c = palette[i % palette.length]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false })));
}

// ---------- Interaction: the avatar watches your mouse (stage only) ----------
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
  mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;

  // Performance: hover-bob, wave, look-at-mouse
  avatar.position.y = Math.sin(t * 1.4) * 0.16;
  avatar.rotation.y = mx * 0.38;
  headG.rotation.y = mx * 0.55;
  headG.rotation.x = my * 0.3;
  headG.rotation.z = Math.sin(t * 0.9) * 0.04;
  armR.rotation.z = -0.5 + Math.sin(t * 2.6) * 0.38;        // the wave 👋
  armR.rotation.x = Math.sin(t * 2.6 + 1) * 0.12;
  armL.rotation.z = 0.35 + Math.sin(t * 1.4) * 0.06;
  antennaTip.scale.setScalar(1 + Math.sin(t * 3.2) * 0.25);
  chestCore.scale.setScalar(1 + Math.sin(t * 2.2) * 0.18);
  platformRing.rotation.z = t * 0.25;

  orbiters.forEach((o, i) => {
    const a = o.userData.angle + t * o.userData.speed;
    o.position.set(Math.cos(a) * o.userData.r, Math.sin(t * 0.8 + i) * 0.5 + 0.2, Math.sin(a) * o.userData.r * 0.45);
    o.rotation.x = t * 0.6 + i; o.rotation.y = t * 0.8;
  });
  rings.forEach((r, i) => { r.rotation.z = t * (0.1 + i * 0.05) * (i ? -1 : 1); });

  renderer.render(scene, camera);
}
if (reduced) {
  armR.rotation.z = -0.7; renderer.render(scene, camera);
} else { animate(); }
