/* Knight A, the Blackshield Company mascot, in the bottom-left corner.
   Idle by default, raises the shield on hover or focus, swings the sword on
   click (Enter/Space work too, it is a button), and falls to thinking after a
   while with no activity. Under prefers-reduced-motion each state holds still
   and he never changes state on his own. */
(function () {
  var btn = document.querySelector('.corner-knight');
  if (!btn) return;
  var img = btn.querySelector('img');
  var base = btn.getAttribute('data-knight-base') || '/assets/img/knight/';
  var files = { idle: 'knight-idle.svg', hover: 'knight-success.svg', swing: 'knight-working.svg', think: 'knight-thinking.svg' };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var state = 'idle', engaged = false, swingTimer = 0, idleTimer = 0;
  var SWING_MS = 1360, IDLE_MS = 25000;

  for (var k in files) { var p = new Image(); p.src = base + files[k]; }

  function show(next) {
    if (next === state) return;
    state = next;
    img.src = base + files[next];
    btn.setAttribute('data-state', next);
  }
  function rest() { show(engaged ? 'hover' : 'idle'); }
  function armIdle() {
    clearTimeout(idleTimer);
    if (reduce && reduce.matches) return;
    idleTimer = setTimeout(function () { if (state === 'idle') show('think'); }, IDLE_MS);
  }
  function activity() {
    if (state === 'think') rest();
    armIdle();
  }
  function engage() { engaged = true; if (state !== 'swing') show('hover'); }
  function disengage() { engaged = false; if (state !== 'swing') show('idle'); }

  btn.addEventListener('pointerenter', engage);
  btn.addEventListener('pointerleave', disengage);
  btn.addEventListener('focus', engage);
  btn.addEventListener('blur', disengage);
  btn.addEventListener('click', function () {
    clearTimeout(swingTimer);
    if (state === 'swing') { state = ''; }
    show('swing');
    swingTimer = setTimeout(rest, SWING_MS);
    armIdle();
  });
  ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (t) {
    window.addEventListener(t, activity, { passive: true });
  });
  armIdle();
})();
