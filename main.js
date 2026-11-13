// Content interactions: showcase category filter.
// Panel rotation and the animated/full mode toggle live in scene.js.
(function () {

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
