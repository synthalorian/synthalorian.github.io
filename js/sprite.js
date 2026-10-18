/* The pixel synthalorian, fixed in the bottom-left corner at every width.
   Idles by default and walks while hovered or focused. It is a button: each
   click (or Enter/Space) plays his next move once (thinking, working,
   success, error, blaster, jetpack) and then he settles back to idle, or to
   walk if the pointer or focus is still on him. One-shot moves are sprite
   sheets stepped by CSS (see .cs-fx), so every play starts on frame 0.
   Under prefers-reduced-motion the <picture> serves the static PNG and this
   script never swaps frames. */
(function () {
  var btn = document.querySelector('.corner-sprite');
  if (!btn) return;
  var img = btn.querySelector('img');
  var fx = btn.querySelector('.cs-fx');
  var base = btn.getAttribute('data-sprite-base') || '/img/sprite/';
  var files = { idle: 'synthalorian-idle-64.gif', walk: 'synthalorian-walk-64.gif' };
  var moves = ['thinking', 'working', 'success', 'error', 'blaster', 'jetpack'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) { btn.setAttribute('aria-label', 'The pixel synthalorian, standing by.'); return; }
  var state = 'idle', engaged = false, playing = '', next = 0;

  function preload() {
    new Image().src = base + files.walk;
    if (!fx) return;
    var px = window.matchMedia('(min-width: 1360px)').matches ? 64 : 32;
    moves.forEach(function (m) { new Image().src = base + 'synthalorian-' + m + '-sheet-' + px + '.png'; });
  }
  if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 3000 });
  else setTimeout(preload, 1200);

  function show(loop) {
    if (loop === state) return;
    state = loop;
    img.src = base + files[loop];
    btn.setAttribute('data-state', loop);
  }
  function rest() { show(engaged ? 'walk' : 'idle'); }
  function stop() {
    playing = '';
    btn.removeAttribute('data-move');
    rest();
  }
  function play() {
    if (!fx) { show('walk'); return; }
    var move = moves[next];
    next = (next + 1) % moves.length;
    btn.removeAttribute('data-move');
    void fx.offsetWidth;            // restart the CSS steps from frame 0
    playing = move;
    btn.setAttribute('data-move', move);
  }
  if (fx) fx.addEventListener('animationend', function () { if (playing) stop(); });

  btn.addEventListener('pointerenter', function () { engaged = true; if (!playing) show('walk'); });
  btn.addEventListener('pointerleave', function () { engaged = false; if (!playing) show('idle'); });
  btn.addEventListener('focus', function () { engaged = true; if (!playing) show('walk'); });
  btn.addEventListener('blur', function () { engaged = false; if (!playing) show('idle'); });
  btn.addEventListener('click', play);
})();
