// 16×16 pixel art sprite data and animation for agent panels.
// Each frame is a flat 256-element array (row-major). Values map to palette index:
//   0 = transparent, 1 = body color, 2 = eye color (#1a1a1a)

const _animTimers = {};

const _F_IDLE = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,2,1,1,1,2,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

const _F_BLINK = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

const _F_WALK1 = [  // 팔 살짝 위(rows 5-6), 다리 cols 3-4, 10-11
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,2,1,1,1,2,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,0,1,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,0,1,1,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

const _F_WALK2 = [  // 팔 idle 위치(rows 6-7), 다리 바깥(3,11) 고정 안쪽 좌(4) 이동
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,2,1,1,1,2,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,0,0,0,0,1,0,1,0,0,0,0,
  0,0,0,1,1,0,0,0,0,1,0,1,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

export const SPRITES = {
  gary: { p: ['', '#4ade80', '#1a1a1a'], frames: { idle: _F_IDLE, blink: _F_BLINK, walk1: _F_WALK1, walk2: _F_WALK2 } },
  judy: { p: ['', '#c084fc', '#1a1a1a'], frames: { idle: _F_IDLE, blink: _F_BLINK, walk1: _F_WALK1, walk2: _F_WALK2 } },
  nick:  { p: ['', '#fb923c', '#1a1a1a'], frames: { idle: _F_IDLE, blink: _F_BLINK, walk1: _F_WALK1, walk2: _F_WALK2 } },
};

function _draw(canvas, sp, frameName, xOff = 0) {
  const frame = sp.frames[frameName];
  if (!frame) return;
  const ctx = canvas.getContext('2d');
  const sc = canvas.height / 16; // height 기준 고정 스케일 (48/16=3)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate((1 + xOff) * sc, 0); // 좌측 1열 버퍼 + 이동량
  frame.forEach((v, i) => {
    if (!sp.p[v]) return;
    ctx.fillStyle = sp.p[v];
    ctx.fillRect((i % 16) * sc, Math.floor(i / 16) * sc, sc, sc);
  });
  ctx.restore();
}

export function startAnim(id) {
  const sp = SPRITES[id];
  const el = document.getElementById('px-' + id);
  if (!sp || !el) return;
  // [xOff, frameName]: 이동하면서 팔도 교대로 흔들림
  const fwdSeq = [[1,'walk1'],[2,'walk2'],[2,'walk1'],[1,'walk2'],[0,'idle']];
  const bckSeq = [[-1,'walk1'],[-2,'walk2'],[-2,'walk1'],[-1,'walk2'],[0,'idle']];
  let phase = 'idle';
  let moveSeq = null;
  let moveIdx = 0;
  let idleTicks = 0;
  function nextIdleTicks() { return 30 + Math.floor(Math.random() * 25); }
  let targetTicks = nextIdleTicks();
  _draw(el, sp, 'idle', 0);
  const initDelay = Math.floor(Math.random() * 4000);
  setTimeout(() => {
    _animTimers[id] = setInterval(() => {
      if (phase === 'idle') {
        idleTicks++;
        if (Math.random() < 0.02) {
          _draw(el, sp, 'blink', 0);
          setTimeout(() => { if (phase === 'idle') _draw(el, sp, 'idle', 0); }, 100);
        }
        if (idleTicks >= targetTicks) {
          phase = 'moving';
          moveSeq = Math.random() < 0.5 ? fwdSeq : bckSeq;
          moveIdx = 0;
          idleTicks = 0;
          targetTicks = nextIdleTicks();
        }
      } else {
        const [xOff, fn] = moveSeq[moveIdx];
        _draw(el, sp, fn, xOff);
        moveIdx++;
        if (moveIdx >= moveSeq.length) phase = 'idle';
      }
    }, 160);
  }, initDelay);
}

export function clearAllAnims() {
  Object.values(_animTimers).forEach(clearInterval);
}
