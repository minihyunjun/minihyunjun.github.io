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

// 왼팔 위(rows 5-6, cols 1-11) + 오른팔 아래(rows 7-8, cols 3-13)
const _F_WALK_A = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,2,1,1,1,2,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

// 오른팔 위(rows 5-6, cols 3-13) + 왼팔 아래(rows 7-8, cols 1-11)
const _F_WALK_B = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,2,1,1,1,2,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

// 숨쉬기 프레임: 머리+팔+몸통 1픽셀 아래로, 다리 고정 (몸통이 상단 다리 row를 덮어서 다리 1px 짧아 보이는 효과)
const _F_BREATHE = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
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
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

export const SPRITES = {
  gary: { p: ['', '#4ade80', '#1a1a1a'], frames: { idle: _F_IDLE, blink: _F_BLINK, walk_a: _F_WALK_A, walk_b: _F_WALK_B, breathe: _F_BREATHE } },
  judy: { p: ['', '#c084fc', '#1a1a1a'], frames: { idle: _F_IDLE, blink: _F_BLINK, walk_a: _F_WALK_A, walk_b: _F_WALK_B, breathe: _F_BREATHE } },
  nick:  { p: ['', '#fb923c', '#1a1a1a'], frames: { idle: _F_IDLE, blink: _F_BLINK, walk_a: _F_WALK_A, walk_b: _F_WALK_B, breathe: _F_BREATHE } },
};

function _draw(canvas, sp, frameName, xOff = 0, yOff = 0) {
  const frame = sp.frames[frameName];
  if (!frame) return;
  const ctx = canvas.getContext('2d');
  const sc = canvas.height / 16;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate((1 + xOff) * sc, yOff * sc);
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

  // 팔이 교차로 오르내리는 워킹 시퀀스
  const fwdSeq = [[1,'walk_a'],[2,'walk_b'],[2,'walk_a'],[1,'walk_b'],[0,'idle']];
  const bckSeq = [[-1,'walk_a'],[-2,'walk_b'],[-2,'walk_a'],[-1,'walk_b'],[0,'idle']];

  let phase = 'idle';
  let moveSeq = null;
  let moveIdx = 0;
  let idleTicks = 0;
  let breathTick = 0;
  let breathCycles = 0;
  let breathing = false;

  function nextIdleTicks() { return 30 + Math.floor(Math.random() * 25); }
  let targetTicks = nextIdleTicks();

  _draw(el, sp, 'idle', 0);

  const initDelay = Math.floor(Math.random() * 4000);
  setTimeout(() => {
    _animTimers[id] = setInterval(() => {
      if (phase === 'idle') {
        idleTicks++;

        // 숨쉬기: breathing 중이면 down/normal 반복
        if (breathing) {
          breathTick++;
          // 2틱마다 down↔normal 전환 (2 × 120ms = 240ms)
          const downPhase = Math.floor(breathTick / 2) % 2 === 0;
          _draw(el, sp, downPhase ? 'breathe' : 'idle', 0);
          if (breathTick >= breathCycles * 4) {
            breathing = false;
            _draw(el, sp, 'idle', 0);
          }
          return;
        }

        // 눈 깜빡임
        if (Math.random() < 0.02) {
          _draw(el, sp, 'blink', 0);
          setTimeout(() => { if (phase === 'idle' && !breathing) _draw(el, sp, 'idle', 0); }, 100);
          return;
        }

        // 숨쉬기 시작 (약 3~5초에 한 번)
        if (Math.random() < 0.025) {
          breathing = true;
          breathTick = 0;
          breathCycles = 1 + Math.floor(Math.random() * 2); // 1~2 사이클
          return;
        }

        // 걷기 시작
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
    }, 120); // 160ms → 120ms 로 부드럽게
  }, initDelay);
}

export function clearAllAnims() {
  Object.values(_animTimers).forEach(clearInterval);
}
