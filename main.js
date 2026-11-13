// Content interactions: section menu + showcase category filter.
// Panel rotation and the animated/full mode toggle live in scene.js.
(function () {
  // Menu open/close
  var btn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.hidden; menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('click', function (ev) {
      if (!menu.hidden && !menu.contains(ev.target) && ev.target !== btn) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Showcase filter (categories from the CV: SQL, SQA, Web, Mobile, E-commerce...)
  var chips = document.querySelectorAll('.filters .chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.dataset.filter;
      document.querySelectorAll('.show').forEach(function (card) {
        card.classList.toggle('hide', !(f === 'all' || card.dataset.cat.split(' ').indexOf(f) > -1));
      });
    });
  });
})();
