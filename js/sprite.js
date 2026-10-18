/* The pixel synthalorian in the bottom-left corner. Idles by default and
   walks while hovered, focused, or for a moment after a click (it is a
   button, so Enter/Space work too). Under prefers-reduced-motion the
   <picture> serves the static PNG and this script never swaps frames. */
(function () {
  var btn = document.querySelector('.corner-sprite');
  if (!btn) return;
  var img = btn.querySelector('img');
  var base = btn.getAttribute('data-sprite-base') || '/img/sprite/';
  var files = { idle: 'synthalorian-idle-64.gif', walk: 'synthalorian-walk-64.gif' };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;
  var state = 'idle', engaged = false, timer = 0;
  new Image().src = base + files.walk;
  function show(next) {
    if (next === state) return;
    state = next;
    img.src = base + files[next];
    btn.setAttribute('data-state', next);
  }
  function rest() { show(engaged ? 'walk' : 'idle'); }
  function engage() { engaged = true; show('walk'); }
  function disengage() { engaged = false; clearTimeout(timer); show('idle'); }
  btn.addEventListener('pointerenter', engage);
  btn.addEventListener('pointerleave', disengage);
  btn.addEventListener('focus', engage);
  btn.addEventListener('blur', disengage);
  btn.addEventListener('click', function () {
    clearTimeout(timer);
    show('walk');
    timer = setTimeout(rest, 1440);
  });
})();
