// Globe-like 3D panel rotation engine.
// Animated mode: each section is a full-screen panel. Navigating rotates the
// current panel away around a vertical axis (like a face of a globe turning)
// while the next panel rotates in. Transitions are locked while running so a
// visitor can never trigger two at once.
// Full-profile mode: all panels stack in one normal, scrollable page.
// The visitor's reduced-motion preference starts the site in full mode.
(function () {
  var body = document.body;
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var dotsNav = document.getElementById('dots');
  var countEl = document.getElementById('panel-count');
  var toggleBtn = document.getElementById('mode-toggle');
  var current = 0, busy = false, mode = 'animated';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ANIM_MS = 880;

  // Build dot indicators
  var dotBtns = panels.map(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Go to section: ' + p.dataset.title);
    b.innerHTML = '<span class="tip">' + (i + 1) + '. ' + p.dataset.title + '</span>';
    b.addEventListener('click', function () { goTo(i); });
    dotsNav.appendChild(b);
    return b;
  });

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function syncChrome() {
    dotBtns.forEach(function (b, i) {
      b.classList.toggle('current', i === current);
      if (i === current) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    countEl.textContent = pad(current + 1) + ' / ' + pad(panels.length);
  }

  function goTo(target) {
    if (mode !== 'animated') { // full mode: plain anchor scroll
      panels[target].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      current = target; syncChrome();
      return;
    }
    if (busy || target === current || target < 0 || target >= panels.length) return;
    busy = true;
    var dir = target > current ? 'next' : 'prev';
    var from = panels[current], to = panels[target];
    to.scrollTop = 0;
    var inner = to.querySelector('.panel-inner'); if (inner) inner.scrollTop = 0;
    to.classList.add(dir === 'next' ? 'pre-next' : 'pre-prev');
    // force reflow so the entering transition starts from the pre position
    void to.offsetWidth;
    from.classList.remove('active');
    from.classList.add(dir === 'next' ? 'leaving-next' : 'leaving-prev');
    to.classList.remove('pre-next', 'pre-prev');
    to.classList.add(dir === 'next' ? 'entering-next' : 'entering-prev');
    current = target; syncChrome();
    setTimeout(function () {
      from.classList.remove('leaving-next', 'leaving-prev');
      to.classList.remove('entering-next', 'entering-prev');
      to.classList.add('active');
      busy = false;
    }, ANIM_MS);
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Expose for menu / hero buttons (handled in main.js too)
  window.__portfolioGoTo = goTo;
  document.querySelectorAll('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function (ev) { ev.preventDefault(); goTo(parseInt(el.dataset.goto, 10)); });
  });

  // Wheel: scroll inside the panel first; only rotate at its top/bottom edge
  var wheelLockUntil = 0;
  window.addEventListener('wheel', function (ev) {
    if (mode !== 'animated' || busy) return;
    var inner = panels[current].querySelector('.panel-inner');
    if (!inner) return;
    var atTop = inner.scrollTop <= 2;
    var atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
    if (ev.deltaY > 4 && atBottom) { ev.preventDefault(); if (Date.now() > wheelLockUntil) { wheelLockUntil = Date.now() + 300; next(); } }
    else if (ev.deltaY < -4 && atTop) { ev.preventDefault(); if (Date.now() > wheelLockUntil) { wheelLockUntil = Date.now() + 300; prev(); } }
  }, { passive: false });

  // Touch swipe
  var touchY = null;
  window.addEventListener('touchstart', function (ev) { touchY = ev.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', function (ev) {
    if (mode !== 'animated' || busy || touchY === null) return;
    var dy = touchY - ev.changedTouches[0].clientY; touchY = null;
    var inner = panels[current].querySelector('.panel-inner');
    var atTop = inner.scrollTop <= 2, atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
    if (dy > 60 && atBottom) next(); else if (dy < -60 && atTop) prev();
  }, { passive: true });

  // Keyboard
  window.addEventListener('keydown', function (ev) {
    if (mode !== 'animated') return;
    if (ev.key === 'ArrowDown' || ev.key === 'PageDown' || ev.key === 'ArrowRight') { ev.preventDefault(); next(); }
    else if (ev.key === 'ArrowUp' || ev.key === 'PageUp' || ev.key === 'ArrowLeft') { ev.preventDefault(); prev(); }
    else if (ev.key === 'Home') { ev.preventDefault(); goTo(0); }
    else if (ev.key === 'End') { ev.preventDefault(); goTo(panels.length - 1); }
  });

  // ---------- Mode toggle ----------
  function setMode(m) {
    mode = m;
    if (m === 'full') {
      body.classList.remove('animated-mode'); body.classList.add('full-mode');
      panels.forEach(function (p) { p.classList.remove('active', 'leaving-next', 'leaving-prev', 'entering-next', 'entering-prev', 'pre-next', 'pre-prev'); });
      toggleBtn.textContent = '✨ Return to Animated Experience';
      toggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      body.classList.remove('full-mode'); body.classList.add('animated-mode');
      panels.forEach(function (p, i) { p.classList.toggle('active', i === current); });
      toggleBtn.textContent = '📄 View Full Profile Without Animations';
      toggleBtn.setAttribute('aria-pressed', 'false');
      window.scrollTo(0, 0);
    }
    syncChrome();
  }
  toggleBtn.addEventListener('click', function () { setMode(mode === 'animated' ? 'full' : 'animated'); });

  // Full mode: keep "current" in sync with scroll position for the menu
  var fullTick = false;
  window.addEventListener('scroll', function () {
    if (mode !== 'full' || fullTick) return;
    fullTick = true;
    requestAnimationFrame(function () {
      fullTick = false;
      var best = 0, bestDist = Infinity;
      panels.forEach(function (p, i) { var d = Math.abs(p.getBoundingClientRect().top - 70); if (d < bestDist) { bestDist = d; best = i; } });
      if (best !== current) { current = best; syncChrome(); }
    });
  }, { passive: true });

  // Init
  panels[0].classList.add('active');
  syncChrome();
  if (reduced) setMode('full'); // respect system reduced-motion preference
})();
