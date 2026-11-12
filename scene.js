// ClearPlan-style particle morphs — a dot field inside the hero stage ONLY.
// On load the dots drift from a scattered cloud into a growth chart.
// As you scroll, they disperse and re-form into a new shape per section.
// Motion is scroll-scrubbed: stop scrolling and the dots settle and freeze.
// Nothing moves behind page text; the canvas lives in its own stage box.
(function () {
  var stage = document.getElementById('hero-stage');
  var canvas = document.getElementById('dots');
  if (!stage || !canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var labelEl = document.getElementById('stage-label');
  var segEls = Array.prototype.slice.call(document.querySelectorAll('#stage-segs span'));

  // ---------- Shape builders: each returns normalized [x,y] point lists ----------
  function grid(x0, y0, x1, y1, step) {
    var pts = [];
    for (var x = x0; x <= x1; x += step) for (var y = y0; y <= y1; y += step) pts.push([x, y]);
    return pts;
  }
  function line(x0, y0, x1, y1, n, thick) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      pts.push([x, y]);
      if (thick) pts.push([x, y + thick]);
    }
    return pts;
  }
  function ring(cx, cy, r, n, thick) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      if (thick) pts.push([cx + Math.cos(a) * (r - thick), cy + Math.sin(a) * (r - thick)]);
    }
    return pts;
  }
  function fromDrawing(drawFn) {
    // Draw a shape on an offscreen canvas and sample its filled pixels.
    var S = 220, off = document.createElement('canvas'); off.width = S; off.height = S;
    var o = off.getContext('2d'); o.fillStyle = '#000'; o.strokeStyle = '#000'; o.lineWidth = 10;
    drawFn(o, S);
    var data;
    try { data = o.getImageData(0, 0, S, S).data; } catch (e) { return []; }
    var pts = [];
    for (var y = 0; y < S; y += 5) for (var x = 0; x < S; x += 5) {
      if (data[(y * S + x) * 4 + 3] > 120) pts.push([0.08 + (x / S) * 0.84, 0.08 + (y / S) * 0.84]);
    }
    return pts;
  }
  function chart() {
    var pts = [], bars = [[0.16, 0.34], [0.37, 0.5], [0.58, 0.66], [0.79, 0.84]];
    bars.forEach(function (b) { pts = pts.concat(grid(b[0], 0.88 - b[1], b[0] + 0.12, 0.88, 0.045)); });
    pts = pts.concat(line(0.14, 0.6, 0.9, 0.16, 34, 0.035));                       // trend line
    pts = pts.concat(line(0.9, 0.16, 0.8, 0.18, 6), line(0.9, 0.16, 0.88, 0.26, 6)); // arrowhead
    return pts;
  }
  function badge() { // quality: ring + checkmark
    var pts = ring(0.5, 0.5, 0.33, 110, 0.045);
    pts = pts.concat(line(0.34, 0.52, 0.47, 0.65, 14, 0.04), line(0.47, 0.65, 0.68, 0.37, 22, 0.04));
    return pts;
  }
  function blocks() { // skills: 3x3 clusters
    var pts = [];
    for (var gx = 0; gx < 3; gx++) for (var gy = 0; gy < 3; gy++)
      pts = pts.concat(grid(0.18 + gx * 0.27, 0.18 + gy * 0.27, 0.32 + gx * 0.27, 0.32 + gy * 0.27, 0.045));
    return pts;
  }
  function rocket() {
    var pts = fromDrawing(function (o, S) { o.font = '170px serif'; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText('🚀', S / 2, S / 2 + 8); });
    if (pts.length < 80) { // fallback: a star
      pts = [];
      for (var a = 0; a < 5; a++) {
        var ang = -Math.PI / 2 + a * (Math.PI * 2 / 5);
        pts = pts.concat(line(0.5, 0.5, 0.5 + Math.cos(ang) * 0.34, 0.5 + Math.sin(ang) * 0.34, 16, 0.04));
      }
      pts = pts.concat(ring(0.5, 0.5, 0.1, 30));
    }
    return pts;
  }
  function steps() {
    var pts = [], hs = [0.22, 0.42, 0.62, 0.82];
    hs.forEach(function (h, i) { pts = pts.concat(grid(0.13 + i * 0.2, 0.9 - h, 0.28 + i * 0.2, 0.9, 0.045)); });
    return pts;
  }
  function chat() {
    var pts = fromDrawing(function (o, S) {
      o.beginPath();
      if (o.roundRect) o.roundRect(28, 38, 164, 108, 22); else o.rect(28, 38, 164, 108);
      o.fill();
      o.beginPath(); o.moveTo(62, 140); o.lineTo(62, 182); o.lineTo(108, 140); o.closePath(); o.fill();
    });
    [[0.36, 0.42], [0.5, 0.42], [0.64, 0.42]].forEach(function (d) { pts.push(d); });
    return pts.length > 60 ? pts : badge();
  }
  function envelope() {
    var pts = grid(0.14, 0.26, 0.86, 0.74, 0.05).filter(function (p) {
      var edge = p[0] < 0.19 || p[0] > 0.81 || p[1] < 0.31 || p[1] > 0.69;
      var flap = Math.abs(p[1] - (0.26 + Math.abs(p[0] - 0.5) * 0.55)) < 0.045;
      return edge || flap;
    });
    return pts;
  }

  var SHAPES = [
    { name: 'Growth — stores & sales 📈', pts: chart() },
    { name: 'Quality — tested & checked ✓', pts: badge() },
    { name: 'Skills — building blocks', pts: blocks() },
    { name: 'Projects — shipped & live 🚀', pts: rocket() },
    { name: 'Experience — step by step', pts: steps() },
    { name: 'Services — let’s talk 💬', pts: chat() },
    { name: 'Contact — say hello ✉️', pts: envelope() }
  ];
  var ANCHOR_IDS = [null, 'about', 'skills', 'projects', 'experience', 'services', 'contact'];

  // ---------- Dots ----------
  var COLORS = ['#26304d', '#6d4aff', '#0899c4', '#d98a06', '#26304d', '#6d4aff'];
  var W = 0, H = 0, dots = [], N = 0;
  function buildDots() {
    N = W < 520 ? 420 : 680;
    dots = [];
    for (var i = 0; i < N; i++) {
      dots.push({
        x: Math.random() * W, y: Math.random() * H, // start as a scattered cloud (intro)
        sx: 0, sy: 0, r: 1.4 + Math.random() * 1.5,
        c: COLORS[i % COLORS.length], delay: Math.random() * 0.55
      });
    }
  }
  function targetFor(dot, shapeIdx, i) {
    var pts = SHAPES[shapeIdx].pts;
    var p = pts[i % pts.length];
    return [p[0] * W, p[1] * H];
  }

  // ---------- Scroll state (scrubbed) ----------
  var anchors = [];
  function measure() {
    W = stage.clientWidth; H = stage.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    anchors = ANCHOR_IDS.map(function (id) {
      if (!id) return 0;
      var el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45 : 0;
    });
    if (!dots.length) buildDots();
  }
  function scrollState() {
    var y = window.scrollY;
    var i = 0;
    while (i < anchors.length - 1 && y > anchors[i + 1]) i++;
    var t = 0;
    if (i < anchors.length - 1) {
      var span = Math.max(anchors[i + 1] - anchors[i], 1);
      t = Math.min(Math.max((y - anchors[i]) / span, 0), 1);
    }
    return { i: i, t: t };
  }
  function updateUI(state) {
    var active = state.t > 0.5 ? state.i + 1 : state.i;
    if (labelEl) labelEl.textContent = SHAPES[active].name;
    segEls.forEach(function (el, k) {
      var fill = k < state.i ? 1 : (k === state.i ? state.t : 0);
      el.style.setProperty('--fill', fill.toFixed(2));
      el.classList.toggle('done', fill >= 1);
    });
  }

  var lastState = { i: -1, t: -1 };
  function frame() {
    requestAnimationFrame(frame);
    var st = scrollState();
    updateUI(st);
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var a = targetFor(d, st.i, i);
      var b = targetFor(d, Math.min(st.i + 1, SHAPES.length - 1), i);
      // Per-dot delayed morph + a scatter "cloud" moment mid-transition (ClearPlan feel)
      var lt = Math.min(Math.max((st.t - d.delay * 0.4) / Math.max(1 - d.delay * 0.4, 0.01), 0), 1);
      var ease = lt * lt * (3 - 2 * lt);
      var txp = a[0] + (b[0] - a[0]) * ease;
      var typ = a[1] + (b[1] - a[1]) * ease;
      var scatter = Math.sin(Math.min(Math.max(st.t, 0), 1) * Math.PI) * 26;
      txp += Math.sin(i * 12.9898) * scatter; typ += Math.cos(i * 78.233) * scatter;
      d.x += (txp - d.x) * 0.055; d.y += (typ - d.y) * 0.055; // soft damping = slow drift, settles still
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fillStyle = d.c; ctx.globalAlpha = 0.88; ctx.fill();
    }
    ctx.globalAlpha = 1;
    lastState = st;
  }

  if (reduced) {
    measure();
    // One static frame in the first shape
    ctx.clearRect(0, 0, W, H);
    dots.forEach(function (d, i) { var p = targetFor(d, 0, i); ctx.beginPath(); ctx.arc(p[0], p[1], d.r, 0, Math.PI * 2); ctx.fillStyle = d.c; ctx.fill(); });
    if (labelEl) labelEl.textContent = SHAPES[0].name;
    return;
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  frame();
})();
