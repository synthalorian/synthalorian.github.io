/* The Blackshield knight, fixed in the bottom-left corner. Idles by default.
   It is a button: each press (click, Enter or Space) plays his next move once
   (thinking, working, success, error) and then he settles back to idle.
   Frames come from 32x28 strips stepped by CSS (see knight.css). Under
   prefers-reduced-motion the strips are not animated and this script does nothing. */
(function () {
  var btn = document.querySelector('.corner-sprite');
  if (!btn) return;
  var wrap = btn.querySelector('.knight');
  var img = wrap && wrap.querySelector('img');
  if (!img) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;
  var base = '/img/knight/';
  var moves = ['thinking', 'working', 'success', 'error'];
  var ms = { thinking: 1040, working: 680, success: 720, error: 520 };
  var next = 0, timer = 0;

  function set(state) {
    wrap.className = 'knight knight-' + state;
    img.src = base + state + '.png';
    img.width = state === 'success' ? 96 : 128;
  }
  moves.concat(['idle']).forEach(function (m) { new Image().src = base + m + '.png'; });
  btn.addEventListener('click', function () {
    var move = moves[next];
    next = (next + 1) % moves.length;
    clearTimeout(timer);
    set(move);
    var wait = ms[move] * 2; /* two passes, then back to idle */
    timer = setTimeout(function () { set('idle'); }, wait);
  });
})();
