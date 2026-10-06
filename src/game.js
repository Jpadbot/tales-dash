import * as THREE from 'three';

/* =====================================================================
   CONFIG
   ===================================================================== */
const W = 7;
const LUT_STEP = 0.5;
const GRAV = -28;
const GROUND_Y = -22;
const BALL_MAX = 6;
const FIXED = 1 / 60;
const HURDLE_X = [-2.625, -0.875, 0.875, 2.625];
const LEVEL_NAME = ['', '簡單', '普通', '困難'];

const FOREST_RAW = [
  [0, 0.15, 0],
  [4, 0.45, 48],
  [16, 1.05, 96],
  [28, 1.7, 150],
  [14, 2.35, 205],
  [-8, 1.7, 258],
  [-26, 0.85, 312],
  [-18, 0.35, 368],
  [2, 0.9, 424],
  [22, 1.75, 478],
  [14, 2.45, 528],
  [-4, 1.55, 572],
  [6, 0.7, 628],
];

const MAPS = [
  {
    id: 'forest',
    name: '童話森林',
    difficulty: 1,
    ui: '#ff4d8d',
    raw: FOREST_RAW,
    targetLen: 600,
    blockStyle: 'forest',
    cps: [0, 120, 260, 380],
    gaps: [{ s0: 266, s1: 376 }],
    danger: { s: 321, x: 6.3 },
    hurdles: [
      { s: 136 }, { s: 150 }, { s: 164, gaps: [1] }, { s: 178 }, { s: 192 },
      { s: 206, gaps: [3] }, { s: 220 }, { s: 234, gaps: [0] }, { s: 248 },
    ],
    pads: [[30, -1.15], [58, 1.25], [86, 0], [112, -1.2]],
    hammers: [
      { s: 494, phase: 0.2, omega: 1.25, amp: 1.02 },
      { s: 524, phase: 2.1, omega: 1.45, amp: 1.0 },
      { s: 552, phase: 4.0, omega: 1.15, amp: 1.05 },
    ],
    balls: { from: 384, kill: 372, introA: 396, introB: 412, introX: -2.15 },
    finale: [-40, -20],
    theme: {
      decor: 'forest', road: 'forest',
      clear: 0x9ad8ff, bg: 0x9ad8ff, fog: 0xd7f3ff, fogNear: 90, fogFar: 260,
      ground: 0x69c85c, hemiSky: 0xfff4ea, hemiGround: 0x6fbf62, sun: 0xfff4b8,
      skyTop: 0x2f7dff, skyMid: 0x9ad8ff, skyHor: 0xffd0e8, skyBot: 0xc9e8ff,
      postA: 0xff3355, postB: 0xffffff,
    },
  },
  {
    id: 'candy',
    name: '糖果樂園',
    difficulty: 2,
    ui: '#ff5c9a',
    raw: [
      [0, 0.3, 0], [12, 1.8, 55], [26, 4.6, 115], [16, 6.6, 175],
      [-6, 3.6, 240], [-28, 1.5, 305], [-12, 3.2, 370], [10, 5.8, 440],
      [30, 3.4, 510], [14, 1.5, 580], [-8, 2.8, 650], [4, 0.6, 720], [8, 0.25, 790],
    ],
    targetLen: 780,
    blockStyle: 'move',
    cps: [0, 155, 350, 500, 608],
    gaps: [{ s0: 628, s1: 724 }],
    narrows: [{ s0: 252, s1: 332, x: 0, half: 1.02, intro: 14, outro: 10 }],
    forks: [{
      s0: 368, sShortExit: 452, sMerge: 498,
      shortX: -3.2, shortHalf: 1.02, longX: 2.4, longHalf: 1.85,
      diverge: 18, converge: 14, rotorS: 418, tileS: [432, 444],
    }],
    tileZones: [{ s0: 516, s1: 588, colors: [0xff8ec4, 0xffe14a, 0x7dface] }],
    danger: { s: 292, x: 3.55 },
    hurdles: [
      { s: 176 }, { s: 196, gaps: [1] }, { s: 216 }, { s: 236, gaps: [3] },
    ],
    pads: [[36, -1.05], [74, 1.15], [112, 0], [140, -0.7]],
    rotors: [{ s: 742, x: 0, halfLen: 3.15, omega: 1.02, phase: 0.6, pivotY: 1.08, color: 0xfff6ea, cap: 0xff4d8d }],
    hammers: [],
    balls: null,
    finale: [-30, -14],
    theme: {
      decor: 'candy', road: 'candy', narrow: 'cookie',
      clear: 0xffc4df, bg: 0xffc4df, fog: 0xffd6ea, fogNear: 70, fogFar: 230,
      ground: 0x9be7c4, hemiSky: 0xfff0f6, hemiGround: 0x7dcea8, sun: 0xfff6c0,
      skyTop: 0xff8ec8, skyMid: 0xffd0ea, skyHor: 0xfff3c4, skyBot: 0xffe4f2,
      postA: 0xff4d8d, postB: 0xffffff,
    },
  },
  {
    id: 'snow',
    name: '雪花山谷',
    difficulty: 3,
    ui: '#7eb6ff',
    raw: [
      [0, 0.4, 0], [-10, 3.2, 70], [-24, 7.6, 145], [-4, 9.6, 220],
      [22, 5.4, 300], [36, 2.0, 380], [8, 0.8, 460], [-18, 4.2, 545],
      [-32, 8.2, 630], [-6, 4.4, 715], [20, 1.6, 800], [30, 4.2, 885],
      [8, 1.4, 960], [-4, 0.35, 1040],
    ],
    targetLen: 1020,
    blockStyle: 'move',
    cps: [0, 140, 230, 350, 462, 572, 745],
    gaps: [{ s0: 760, s1: 875 }],
    narrows: [{ s0: 248, s1: 338, x: 0, half: 0.98, intro: 12, outro: 10 }],
    forks: [{
      s0: 590, sShortExit: 700, sMerge: 740,
      shortX: -3.3, shortHalf: 1.0, longX: 2.5, longHalf: 1.8,
      diverge: 18, converge: 16, rotorS: 662, tileS: [676, 689],
    }],
    tileZones: [{ s0: 478, s1: 560, colors: [0xe7f4ff, 0xffffff, 0xb7dcff] }],
    danger: { s: 292, x: 3.6 },
    hurdles: [
      { s: 156 }, { s: 172, gaps: [2] }, { s: 188 }, { s: 204, gaps: [0] }, { s: 220 },
    ],
    pads: [[42, 0], [86, 1.2], [124, -0.9]],
    rotors: [
      { s: 372, x: 0, halfLen: 3.2, omega: 1.12, phase: 0.4, pivotY: 1.08, color: 0xf4fbff, cap: 0x8fd0ff },
      { s: 408, x: 0, halfLen: 3.2, omega: 1.12, phase: 1.8, pivotY: 1.08, color: 0xf4fbff, cap: 0xb9e4ff },
      { s: 444, x: 0, halfLen: 3.2, omega: 1.05, phase: 2.7, pivotY: 1.08, color: 0xf4fbff, cap: 0x7ec8ff },
    ],
    hammers: [
      { s: 905, phase: 0.3, omega: 1.3, amp: 1.04 },
      { s: 942, phase: 2.0, omega: 1.18, amp: 1.02 },
    ],
    balls: { from: 900, kill: 878, introA: 912, introB: 930, introX: -2.15 },
    finale: [-40, -18],
    theme: {
      decor: 'snow', road: 'snow', narrow: 'ice',
      clear: 0xd5e9ff, bg: 0xd5e9ff, fog: 0xe7f2ff, fogNear: 48, fogFar: 200,
      ground: 0xe7eef6, hemiSky: 0xf7fbff, hemiGround: 0xb7c9d8, sun: 0xffffff,
      skyTop: 0x8ec6ff, skyMid: 0xd7ecff, skyHor: 0xf4f8ff, skyBot: 0xd5e4f2,
      postA: 0xffffff, postB: 0x9fd0ff,
    },
  },
];

const ROSTER = [
  { name: '小赤', hex: '#e23b3b', color: 0xe23b3b, hat: 'bunny', hair: 'fringe', player: true, speedMul: 1 },
  { name: '小兔寶', hex: '#ff7eb6', color: 0xff7eb6, hat: 'floppy', hair: 'bow', speedMul: 0.934, reaction: 0.11, mistakeRate: 0.055, dashAggression: 0.32, preferredLane: -1.55, fork: 'long' },
  { name: '南瓜仔', hex: '#ff8c32', color: 0xff8c32, hat: 'bear', speedMul: 0.888, reaction: 0.18, mistakeRate: 0.10, dashAggression: 0.16, preferredLane: 1.75, fork: 'long' },
  { name: '糖糖', hex: '#ff5aa8', color: 0xff5aa8, hat: 'bow', hair: 'buns', speedMul: 0.992, reaction: 0.09, mistakeRate: 0.04, dashAggression: 0.46, preferredLane: 0.25, fork: 'short' },
  { name: '星星妹', hex: '#ffd23a', color: 0xffd23a, hat: 'chick', speedMul: 0.948, reaction: 0.13, mistakeRate: 0.07, dashAggression: 0.30, preferredLane: -0.35, fork: 'long' },
  { name: '蘑菇叔', hex: '#d84a4a', color: 0xd84a4a, hat: 'mushroom', speedMul: 0.905, reaction: 0.24, mistakeRate: 0.13, dashAggression: 0.15, preferredLane: 2.15, fork: 'long' },
  { name: '雪球', hex: '#8fd0f5', color: 0x8fd0f5, hat: 'beanie', speedMul: 0.872, reaction: 0.20, mistakeRate: 0.11, dashAggression: 0.14, preferredLane: -2.15, fork: 'long' },
  { name: '豆豆', hex: '#6ad85a', color: 0x6ad85a, hat: 'cat', hair: 'sprout', speedMul: 0.912, reaction: 0.15, mistakeRate: 0.08, dashAggression: 0.22, preferredLane: 0.95, fork: 'long' },
];

const STRONG = { speedMul: 1.05, reaction: 0.05, mistakeRate: 0, dashAggression: 0.92, preferredLane: 0.1, fork: 'long' };

const GRID = [
  { s: 6.5, x: -0.7 },
  { s: 6.5, x: 0.7 },
  { s: 6.5, x: -2.15 },
  { s: 6.5, x: 2.15 },
  { s: 3.3, x: -2.15 },
  { s: 3.3, x: -0.7 },
  { s: 3.3, x: 0.7 },
  { s: 3.3, x: 2.15 },
];

/* =====================================================================
   UTIL
   ===================================================================== */
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const vC = new THREE.Vector3();
const vD = new THREE.Vector3();
const qA = new THREE.Quaternion();
const qB = new THREE.Quaternion();
const mA = new THREE.Matrix4();
const dummy = new THREE.Object3D();
const colA = new THREE.Color();
const S1 = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, h: 0 };
const S2 = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, h: 0 };

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
let raceSalt = 0; // per-race variation of AI mistakes (set in startRace)
let fixedSeed = null; // __td.seed(n) makes races reproducible for tests
function hash01(a, b) {
  const n = Math.sin(a * 127.1 + b * 311.7 + raceSalt * 0.6180339) * 43758.5453123;
  return n - Math.floor(n);
}
let rngS = 1;
function rng() {
  rngS = (Math.imul(rngS, 1664525) + 1013904223) | 0;
  return (rngS >>> 0) / 4294967296;
}
function fmt(t) {
  if (t == null || !isFinite(t)) return '未完成';
  t = Math.max(0, t);
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t * 100) % 100);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(cs).padStart(2, '0');
}
function rankLabel(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return n + 'th';
}
function sectionAt(s) {
  const cps = checkpoints;
  let sec = 1;
  for (let i = 1; i < cps.length; i++) if (s >= cps[i]) sec = i + 1;
  return sec;
}
function gapAt(s) {
  for (let i = 0; i < gaps.length; i++) {
    const g = gaps[i];
    if (s > g.s0 && s < g.s1) return g;
  }
  return null;
}
function inGap(s) { return !!gapAt(s); }
function nearGapEdge(s, m) {
  for (let i = 0; i < gaps.length; i++) {
    const g = gaps[i];
    if (s > g.s0 - m && s < g.s1 + m) return true;
  }
  return false;
}
function narrowAt(s) {
  for (let i = 0; i < narrows.length; i++) {
    const n = narrows[i];
    if (s >= n.s0 && s <= n.s1) return n;
  }
  return null;
}
function narrowHalfAt(n, s) {
  const intro = n.intro || 12;
  const outro = n.outro || 10;
  if (s < n.s0 + intro) return lerp(3.5, n.half, clamp((s - n.s0) / intro, 0, 1));
  if (s > n.s1 - outro) return lerp(3.5, n.half, clamp((n.s1 - s) / outro, 0, 1));
  return n.half;
}
function forkAt(s) {
  for (let i = 0; i < forks.length; i++) {
    const f = forks[i];
    if (s >= f.s0 && s < f.sMerge) return f;
  }
  return null;
}
function forkBandGeom(fork, s, kind) {
  const div = fork.diverge || 18;
  const u = clamp((s - fork.s0) / div, 0, 1);
  const conv = fork.converge || 14;
  let m = 1;
  const back = fork.sMerge - s;
  if (back < conv) m = clamp(back / conv, 0, 1);
  if (kind === 'short') {
    if (s < fork.s0 || s > fork.sShortExit) return null;
    return { kind: 'short', x: fork.shortX * u, half: lerp(3.5, fork.shortHalf, u) };
  }
  if (s < fork.s0 || s >= fork.sMerge) return null;
  const mid = lerp(3.5, fork.longHalf, u);
  return { kind: 'long', x: fork.longX * u * m, half: lerp(mid, 3.5, 1 - m) };
}
function bandsAt(s) {
  const nar = narrowAt(s);
  if (nar) return [{ kind: 'narrow', x: nar.x, half: narrowHalfAt(nar, s) }];
  const fork = forkAt(s);
  if (!fork) return null;
  const bands = [];
  const sh = forkBandGeom(fork, s, 'short');
  const lg = forkBandGeom(fork, s, 'long');
  if (sh) bands.push(sh);
  if (lg) bands.push(lg);
  return bands.length ? bands : null;
}
function tileZoneAt(s) {
  for (let i = 0; i < tileZones.length; i++) {
    const z = tileZones[i];
    if (s >= z.s0 && s <= z.s1) return z;
  }
  return null;
}
function cpIndexAt(s) {
  let idx = 0;
  for (let i = 0; i < checkpoints.length; i++) if (s >= checkpoints[i]) idx = i;
  return idx;
}
function blockX(b) { return b.x + (b.offX || 0); }
function blockS(b) { return b.s + (b.offS || 0); }

function canvasTex(draw, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* =====================================================================
   STATE
   ===================================================================== */
let renderer, scene, camera, worldRoot, gradMap;
let hemiLight, dirLight, skyMesh = null, sunMesh = null;
let mapDef = MAPS[0];
let mapIndex = 0;
let trackLength = 600;
let roadStep = 1;
let lutN = 0;
let lutPX, lutPY, lutPZ, lutTX, lutTY, lutTZ, lutRX, lutRZ;
let gaps = MAPS[0].gaps;
let checkpoints = MAPS[0].cps;
let narrows = [];
let forks = [];
let tileZones = [];
let runners = [];
let player = null;
let blocks = [];
let hurdles = [];
let hurdleRows = [];
let pads = [];
let hammers = [];
let springs = [];
let walls = [];
let balls = [];
let tiles = [];
let rotors = [];
let ballTimer = 1;
let ballIntro = false;
let blockMesh = null, ballMesh = null, padMesh = null, shadowMesh = null, tileMesh = null;
let podium, confetti, confData;
let closeupId = null;

let screen = 'menu';
let mode = null;
let pausedFrom = 'race';
let raceTime = 0;
let worldT = 0;
let menuT = 0;
let resultsT = 0;
let countT = 0;
let countLabel = '';
let c10 = null;
let timeOver = false;
let timeOverHold = 0;
let resultsDelay = 0;
let resultsShown = false;
let autopilot = false;
let timeScale = 1;
let packLeadS = 0;
let acc = 0;
let lastNow = 0;
let fps = 60;
let lastTri = 0;
let camSnap = true;
let rotateDismissed = false;
const camFwd = new THREE.Vector3(0, 0, 1);
const lookHold = new THREE.Vector3();
const camBlend = { back: 5, up: 3.6, ahead: 2.2, look: 0.55 };
const projPt = new THREE.Vector3();
const projFwd = new THREE.Vector3();
const rankBuf = [];

const keys = { left: false, right: false, dash: false };
const pointers = { steerId: null, originX: 0, originY: 0, dx: 0, jumpIds: new Set(), dashIds: new Set() };
const human = { jumpQueue: 0, dashEdge: false };
let audioCtx = null;
let toastStamp = '';
let toastAt = 0;

const $= (id) => document.getElementById(id);

/* =====================================================================
   TRACK
   ===================================================================== */
function makeCurve(scale) {
  const raw = mapDef.raw;
  const pts = raw.map((p) => new THREE.Vector3(p[0] * scale, p[1], p[2] * scale));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
}
function buildTrack() {
  const target = mapDef.targetLen;
  let scale = 1;
  let curve = makeCurve(1);
  for (let i = 0; i < 8; i++) {
    const len = curve.getLength();
    if (Math.abs(len - target) < 0.4) break;
    scale *= target / len;
    curve = makeCurve(scale);
  }
  trackLength = curve.getLength();
  lutN = Math.floor(trackLength / LUT_STEP) + 1;
  lutPX = new Float32Array(lutN);
  lutPY = new Float32Array(lutN);
  lutPZ = new Float32Array(lutN);
  lutTX = new Float32Array(lutN);
  lutTY = new Float32Array(lutN);
  lutTZ = new Float32Array(lutN);
  lutRX = new Float32Array(lutN);
  lutRZ = new Float32Array(lutN);
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const right = new THREE.Vector3();
  const prev = new THREE.Vector3();
  let hasPrev = false;
  for (let i = 0; i < lutN; i++) {
    const s = Math.min(trackLength, i * LUT_STEP);
    const u = trackLength > 0 ? s / trackLength : 0;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    if (t.lengthSq() < 1e-8) t.set(0, 0, 1);
    t.normalize();
    // right = forward × up. Tangent (0,0,-1) → right (1,0,0). Do not seed prev
    // with a world axis: the first sample would flip the whole ribbon.
    right.crossVectors(t, WORLD_UP);
    right.y = 0;
    if (right.lengthSq() < 1e-8) {
      if (hasPrev) right.copy(prev);
      else right.set(1, 0, 0);
    } else right.normalize();
    if (hasPrev && right.dot(prev) < 0) right.multiplyScalar(-1);
    prev.copy(right);
    hasPrev = true;
    lutPX[i] = p.x; lutPY[i] = p.y; lutPZ[i] = p.z;
    lutTX[i] = t.x; lutTY[i] = t.y; lutTZ[i] = t.z;
    lutRX[i] = right.x; lutRZ[i] = right.z;
  }
}
function sampleInto(s, o) {
  if (s < 0) s = 0;
  const maxS = (lutN - 1) * LUT_STEP;
  if (s >= maxS) {
    const i = lutN - 1;
    const extra = s - maxS;
    o.px = lutPX[i] + lutTX[i] * extra;
    o.py = lutPY[i] + lutTY[i] * extra;
    o.pz = lutPZ[i] + lutTZ[i] * extra;
    o.tx = lutTX[i]; o.ty = lutTY[i]; o.tz = lutTZ[i];
    o.rx = lutRX[i]; o.ry = 0; o.rz = lutRZ[i];
    o.h = o.py;
    return o;
  }
  const f = s / LUT_STEP;
  const i = f | 0;
  const u = f - i;
  const j = i + 1 < lutN ? i + 1 : i;
  o.px = lutPX[i] + (lutPX[j] - lutPX[i]) * u;
  o.py = lutPY[i] + (lutPY[j] - lutPY[i]) * u;
  o.pz = lutPZ[i] + (lutPZ[j] - lutPZ[i]) * u;
  o.tx = lutTX[i] + (lutTX[j] - lutTX[i]) * u;
  o.ty = lutTY[i] + (lutTY[j] - lutTY[i]) * u;
  o.tz = lutTZ[i] + (lutTZ[j] - lutTZ[i]) * u;
  o.rx = lutRX[i] + (lutRX[j] - lutRX[i]) * u;
  o.rz = lutRZ[i] + (lutRZ[j] - lutRZ[i]) * u;
  let tl = Math.hypot(o.tx, o.ty, o.tz) || 1;
  o.tx /= tl; o.ty /= tl; o.tz /= tl;
  o.ry = 0;
  let rl = Math.hypot(o.rx, o.rz) || 1;
  o.rx /= rl; o.rz /= rl;
  o.h = o.py;
  return o;
}
function toWorld(s, x, y, out) {
  const o = sampleInto(s, S2);
  out.set(o.px + o.rx * x, o.py + y, o.pz + o.rz * x);
  return out;
}
function basisAt(s, yaw, right, up, fwd) {
  const o = sampleInto(s, S1);
  fwd.set(o.tx, o.ty, o.tz);
  if (yaw) {
    // Positive yaw turns the nose toward +track x (screen-right).
    fwd.x += o.rx * yaw;
    fwd.z += o.rz * yaw;
    if (fwd.lengthSq() < 1e-8) fwd.set(o.tx, o.ty, o.tz);
    else fwd.normalize();
  }
  // Model +X = worldUp × forward (= −screen-right) so makeBasis(right, up, fwd)
  // is a proper rotation: face (+Z) along travel, head (+Y) up.
  right.crossVectors(WORLD_UP, fwd);
  right.y = 0;
  if (right.lengthSq() < 1e-8) right.set(-o.rx, 0, -o.rz);
  else right.normalize();
  if (right.x * o.rx + right.z * o.rz > 0) right.negate();
  up.crossVectors(fwd, right);
  if (up.lengthSq() < 1e-8) up.copy(WORLD_UP);
  else up.normalize();
}
function placeOnTrack(obj, s, x, y) {
  toWorld(s, x, y, obj.position);
  basisAt(s, 0, vA, vB, vC);
  mA.makeBasis(vA, vB, vC);
  obj.quaternion.setFromRotationMatrix(mA);
}

/* =====================================================================
   MATERIALS / GEOMETRY
   ===================================================================== */
const GEO = {};
const MAT = {};

function toon(color, opts) {
  opts = opts || {};
  return new THREE.MeshToonMaterial({
    color: color,
    gradientMap: gradMap,
    vertexColors: !!opts.vertexColors,
    transparent: !!opts.transparent,
    opacity: opts.opacity == null ? 1 : opts.opacity,
    side: opts.side || THREE.FrontSide,
    depthWrite: opts.depthWrite !== false,
    map: opts.map || null,
  });
}
function makeGradient() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 1;
  const g = c.getContext('2d');
  const cols = ['#6d6d86', '#a7a7be', '#e6e6f0', '#ffffff'];
  for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(i, 0, 1, 1); }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}
function stripeColorGeo(geo, bands, c1, c2) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pa = g.attributes.position;
  const col = new Float32Array(pa.count * 3);
  const a = new THREE.Color(c1);
  const b = new THREE.Color(c2);
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pa.count; i++) {
    const y = pa.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const h = (maxY - minY) || 1;
  for (let i = 0; i < pa.count; i++) {
    const y = pa.getY(i);
    const band = Math.floor(((y - minY) / h) * bands);
    const c = band % 2 === 0 ? a : b;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
function spottedCap() {
  const g = new THREE.SphereGeometry(0.72, 8, 6).toNonIndexed();
  const pa = g.attributes.position;
  const col = new Float32Array(pa.count * 3);
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
    const spot = y > 0.05 && (Math.sin(x * 8.5) + Math.cos(z * 7.5) > 1.25);
    if (spot) { col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1; }
    else { col[i * 3] = 0.86; col[i * 3 + 1] = 0.18; col[i * 3 + 2] = 0.24; }
    pa.setY(i, y * 0.62);
  }
  pa.needsUpdate = true;
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
function candyBallGeo() {
  const g = new THREE.SphereGeometry(1.6, 16, 12).toNonIndexed();
  const pa = g.attributes.position;
  const col = new Float32Array(pa.count * 3);
  const cols = [0xff2468, 0xffe226, 0xff6a00, 0x14d6c4, 0xff3d9a, 0x7CFF3A, 0x3aa0ff, 0xff4ad4]
    .map((h) => new THREE.Color(h));
  for (let i = 0; i < pa.count; i++) {
    const ang = Math.atan2(pa.getZ(i), pa.getX(i));
    const band = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * cols.length) % cols.length;
    const c = cols[band];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
function mergeParts(parts) {
  let count = 0;
  const geos = parts.map((p) => (p.geo.index ? p.geo.toNonIndexed() : p.geo));
  geos.forEach((g) => { count += g.attributes.position.count; });
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  let o = 0;
  parts.forEach((p, pi) => {
    const g = geos[pi];
    const pa = g.attributes.position;
    const na = g.attributes.normal;
    c.set(p.color);
    const sx = p.sx || 1, sy = p.sy || 1, sz = p.sz || 1;
    for (let i = 0; i < pa.count; i++) {
      pos[o] = pa.getX(i) * sx + (p.x || 0);
      pos[o + 1] = pa.getY(i) * sy + (p.y || 0);
      pos[o + 2] = pa.getZ(i) * sz + (p.z || 0);
      let nx = na.getX(i) / sx, ny = na.getY(i) / sy, nz = na.getZ(i) / sz;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nor[o] = nx / nl; nor[o + 1] = ny / nl; nor[o + 2] = nz / nl;
      col[o] = c.r; col[o + 1] = c.g; col[o + 2] = c.b;
      o += 3;
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}
function initGeos() {
  gradMap = makeGradient();
  GEO.head = new THREE.SphereGeometry(0.39, 12, 9);
  GEO.eyeWhite = new THREE.SphereGeometry(0.09, 8, 6);
  GEO.pupil = new THREE.SphereGeometry(0.042, 6, 4);
  GEO.glint = new THREE.SphereGeometry(0.018, 4, 3);
  GEO.eye = GEO.pupil;
  GEO.cheek = new THREE.SphereGeometry(0.07, 6, 4);
  GEO.smile = new THREE.TorusGeometry(0.07, 0.016, 3, 8, Math.PI);
  GEO.smile.rotateZ(Math.PI);
  GEO.mouthO = new THREE.SphereGeometry(0.045, 6, 4);
  GEO.torso = new THREE.SphereGeometry(0.27, 10, 8);
  GEO.belly = new THREE.SphereGeometry(0.12, 6, 4);
  GEO.arm = new THREE.CylinderGeometry(0.055, 0.06, 0.28, 6);
  GEO.hand = new THREE.SphereGeometry(0.055, 6, 4);
  GEO.leg = new THREE.CylinderGeometry(0.07, 0.075, 0.32, 6);
  GEO.shoe = new THREE.SphereGeometry(0.09, 6, 4);
  GEO.earIn = new THREE.SphereGeometry(0.035, 5, 4);
  GEO.bow = new THREE.SphereGeometry(0.08, 6, 4);
  GEO.star = new THREE.OctahedronGeometry(0.11, 0);
  GEO.xbar = new THREE.BoxGeometry(0.1, 0.02, 0.02);
  GEO.sweat = new THREE.SphereGeometry(0.045, 5, 4);
  GEO.line = new THREE.BoxGeometry(0.05, 0.05, 0.42);
  GEO.ring = new THREE.RingGeometry(0.34, 0.55, 18);
  GEO.ring.rotateX(-Math.PI / 2);
  GEO.spark = new THREE.SphereGeometry(0.45, 8, 6);
  GEO.marker = new THREE.ConeGeometry(0.13, 0.28, 6);
  GEO.brim = new THREE.CylinderGeometry(0.48, 0.48, 0.055, 10);
  GEO.cap = new THREE.CylinderGeometry(0.26, 0.30, 0.2, 8);
  GEO.ear = new THREE.CylinderGeometry(0.07, 0.045, 0.46, 6);
  GEO.horn = new THREE.ConeGeometry(0.09, 0.34, 6);
  GEO.flowerC = new THREE.SphereGeometry(0.1, 6, 4);
  GEO.petal = new THREE.SphereGeometry(0.09, 5, 4);
  GEO.band = new THREE.CylinderGeometry(0.30, 0.32, 0.12, 8);
  GEO.spike = new THREE.ConeGeometry(0.07, 0.2, 5);
  GEO.topCrown = new THREE.CylinderGeometry(0.2, 0.22, 0.46, 8);
  GEO.hatband = new THREE.CylinderGeometry(0.23, 0.23, 0.08, 8);
  GEO.stem = new THREE.CylinderGeometry(0.035, 0.045, 0.16, 5);
  GEO.leaf = new THREE.ConeGeometry(0.09, 0.22, 5);
  GEO.mcap = spottedCap();
  GEO.post = stripeColorGeo(new THREE.CylinderGeometry(0.1, 0.12, 1.15, 6), 6, 0xff3355, 0xffffff);
  GEO.stalk = new THREE.CylinderGeometry(0.16, 0.2, 0.85, 6);
  GEO.pop = new THREE.SphereGeometry(0.42, 8, 6);
  GEO.cloud = mergeParts([
    { geo: new THREE.SphereGeometry(1, 6, 4), x: 0, y: 0.1, color: 0xffffff, sx: 1.3, sy: 0.8, sz: 1 },
    { geo: new THREE.SphereGeometry(1, 6, 4), x: -0.9, y: 0, color: 0xfff6fb, sx: 0.8, sy: 0.6, sz: 0.7 },
    { geo: new THREE.SphereGeometry(1, 6, 4), x: 0.95, y: 0, color: 0xf3f8ff, sx: 0.85, sy: 0.62, sz: 0.75 },
  ]);
  GEO.island = mergeParts([
    { geo: new THREE.CylinderGeometry(1, 1.15, 0.45, 7), y: -0.1, color: 0xc48b62 },
    { geo: new THREE.SphereGeometry(1, 7, 5), y: 0.15, color: 0x7dce6a, sx: 1.15, sy: 0.38, sz: 1.15 },
  ]);
  GEO.hill = new THREE.SphereGeometry(1, 8, 6);
  GEO.block = new THREE.BoxGeometry(2.2, 0.56, 2.2);
  GEO.bar = stripeColorGeo(new THREE.BoxGeometry(1.62, 0.16, 0.22), 6, 0xe31c3d, 0xffffff);
  GEO.hpost = new THREE.CylinderGeometry(0.07, 0.08, 0.82, 5);
  GEO.ball = candyBallGeo();
  GEO.pad = new THREE.PlaneGeometry(2.3, 3.1);
  GEO.blob = new THREE.PlaneGeometry(1.5, 1.5);
  GEO.blob.rotateX(-Math.PI / 2);
  GEO.box = new THREE.BoxGeometry(1, 1, 1);
  GEO.tile = new THREE.BoxGeometry(1, 0.28, 1);
  GEO.crystal = new THREE.OctahedronGeometry(0.7, 0);
  GEO.pine = mergeParts([
    { geo: new THREE.CylinderGeometry(0.12, 0.16, 0.4, 5), y: 0.15, color: 0x6b4634 },
    { geo: new THREE.ConeGeometry(0.7, 0.9, 6), y: 0.7, color: 0x1d6b45 },
    { geo: new THREE.ConeGeometry(0.55, 0.75, 6), y: 1.15, color: 0x228055 },
    { geo: new THREE.ConeGeometry(0.38, 0.6, 6), y: 1.55, color: 0x2f9460 },
  ]);
  GEO.snowman = mergeParts([
    { geo: new THREE.SphereGeometry(0.42, 7, 5), y: 0.35, color: 0xf7fbff },
    { geo: new THREE.SphereGeometry(0.3, 7, 5), y: 0.9, color: 0xffffff },
    { geo: new THREE.SphereGeometry(0.2, 6, 4), y: 1.3, color: 0xf4f8ff },
  ]);
  GEO.scoop = new THREE.SphereGeometry(0.32, 7, 5);
  GEO.cone = new THREE.ConeGeometry(0.28, 0.55, 6);

  MAT.ball = new THREE.MeshBasicMaterial({ vertexColors: true });
  MAT.white = toon(0xffffff);
  MAT.glint = new THREE.MeshBasicMaterial({ color: 0xffffff });
  MAT.eye = toon(0x1b1b1b);
  MAT.mouth = toon(0x5a2840);
  MAT.cheek = toon(0xff9bb8);
  MAT.pink = toon(0xff8ec4);
  MAT.sweat = toon(0xb7e6ff);
  MAT.line = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  MAT.marker = new THREE.MeshBasicMaterial({ color: 0xffe14a });
  MAT.vc = toon(0xffffff, { vertexColors: true });
  MAT.road = toon(0xffffff, { vertexColors: true });
  const blobTex = canvasTex((g) => {
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    grd.addColorStop(0, 'rgba(30,16,40,0.42)');
    grd.addColorStop(1, 'rgba(30,16,40,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  }, 64, 64);
  MAT.blob = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
  const chev = canvasTex((g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#fff6c8';
    g.lineWidth = 14;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (let i = 0; i < 3; i++) {
      const y = 28 + i * 34;
      g.beginPath();
      g.moveTo(24, y + 22);
      g.lineTo(w / 2, y);
      g.lineTo(w - 24, y + 22);
      g.stroke();
    }
  }, 128, 128);
  MAT.pad = new THREE.MeshBasicMaterial({
    map: chev, color: 0xffd24a, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
  });
  if (blobTex) blobTex.userData.shared = true;
  if (chev) chev.userData.shared = true;
  Object.keys(GEO).forEach((k) => { if (GEO[k]) GEO[k].userData.shared = true; });
  Object.keys(MAT).forEach((k) => { if (MAT[k]) MAT[k].userData.shared = true; });
}
function makeInst(geo, mat, n, parent) {
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
  mesh.count = n;
  mesh.frustumCulled = false;
  (parent || worldRoot).add(mesh);
  return mesh;
}
function setInst(mesh, i, pos, quat, sx, sy, sz) {
  dummy.position.copy(pos);
  dummy.quaternion.copy(quat || qA.identity());
  dummy.scale.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}

/* =====================================================================
   WORLD / DECOR
   ===================================================================== */
function buildRoad(s0, s1, opt) {
  // Trim | body | crisp lane line | body. Line verts are isolated so white
  // does not flood the center of the ribbon.
  opt = opt || {};
  const halfFn = opt.halfFn || function () { return 3.5; };
  const xFn = opt.xFn || function () { return 0; };
  const yLift = opt.yLift || 0;
  const palette = opt.palette || null;
  const xs = [-3.5, -3.15, -3.12, -1.46, -1.24, -1.02, -0.98, 0.98, 1.02, 1.24, 1.46, 3.12, 3.15, 3.5];
  const SURF = xs.length;
  const ROW = SURF + 4;
  const LINE = { 4: 1, 5: 1, 8: 1, 9: 1 };
  const TRIM = { 0: 1, 1: 1, 12: 1, 13: 1 };
  const rows = [];
  for (let s = s0; s <= s1 + 1e-3; s += roadStep) rows.push(Math.min(s, s1));
  if (rows.length && rows[rows.length - 1] < s1 - 0.05) rows.push(s1);
  const n = rows.length;
  if (n < 2) return;
  const pos = new Float32Array(n * ROW * 3);
  const col = new Float32Array(n * ROW * 3);
  const idx = [];
  const COL = {
    pink: new THREE.Color(0xff3d7a),
    cream: new THREE.Color(0xffe0a8),
    teal: new THREE.Color(0x12b5a4),
    mint: new THREE.Color(0x3ee0b8),
    lemon: new THREE.Color(0xffd000),
    orange: new THREE.Color(0xff7a12),
    white: new THREE.Color(0xffffff),
    trimCream: new THREE.Color(0xfff4dc),
    trimGold: new THREE.Color(0xffe27a),
    skirtPink: new THREE.Color(0xc2185b),
    skirtTeal: new THREE.Color(0x0b6e66),
    skirtOrange: new THREE.Color(0xd46508),
  };
  function paintAt(s) {
    const alt = (Math.floor(s / 6) & 1) === 0;
    if (palette === 'cookie') {
      return alt
        ? { body: new THREE.Color(0xf0c48a), trim: new THREE.Color(0xfff6ea), skirt: new THREE.Color(0xa56a3a), solid: false }
        : { body: new THREE.Color(0xd89455), trim: new THREE.Color(0xffe7c4), skirt: new THREE.Color(0x8a552c), solid: false };
    }
    if (palette === 'ice') {
      return alt
        ? { body: new THREE.Color(0xf7fbff), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x9ec4e4), solid: true }
        : { body: new THREE.Color(0xc5e4ff), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x7eafd4), solid: true };
    }
    if (palette === 'short') {
      return alt
        ? { body: new THREE.Color(0xff6aa8), trim: new THREE.Color(0xfff0c0), skirt: new THREE.Color(0xc2185b), solid: false }
        : { body: new THREE.Color(0xffe14a), trim: new THREE.Color(0xfff6ea), skirt: new THREE.Color(0xe09000), solid: false };
    }
    if (palette === 'long') {
      return alt
        ? { body: new THREE.Color(0x7dface), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x0b8a72), solid: true }
        : { body: new THREE.Color(0xcfffe8), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x14967c), solid: true };
    }
    if (palette === 'candy' || (palette == null && mapDef.theme.road === 'candy')) {
      return alt
        ? { body: new THREE.Color(0xff8ec4), trim: new THREE.Color(0xfff6ea), skirt: new THREE.Color(0xe05088), solid: false }
        : { body: new THREE.Color(0x9af0d4), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x1aa888), solid: true };
    }
    if (palette === 'snow' || (palette == null && mapDef.theme.road === 'snow')) {
      return alt
        ? { body: new THREE.Color(0xf7fbff), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x9ebbd4), solid: true }
        : { body: new THREE.Color(0xcfe6ff), trim: new THREE.Color(0xffffff), skirt: new THREE.Color(0x7aa4c8), solid: true };
    }
    const sec = sectionAt(s);
    if (sec === 4) {
      return alt
        ? { body: COL.lemon, trim: COL.trimGold, skirt: COL.skirtOrange, solid: false }
        : { body: COL.orange, trim: COL.trimGold, skirt: COL.skirtOrange, solid: false };
    }
    if (sec >= 2) {
      return alt
        ? { body: COL.teal, trim: COL.white, skirt: COL.skirtTeal, solid: true }
        : { body: COL.mint, trim: COL.white, skirt: COL.skirtTeal, solid: true };
    }
    return alt
      ? { body: COL.pink, trim: COL.trimCream, skirt: COL.skirtPink, solid: false }
      : { body: COL.cream, trim: COL.trimCream, skirt: COL.skirtPink, solid: false };
  }
  function setV(vi, s, x, y, c) {
    const half = halfFn(s);
    const xx = (x / 3.5) * half + xFn(s);
    toWorld(s, xx, y + yLift, vD);
    pos[vi * 3] = vD.x; pos[vi * 3 + 1] = vD.y; pos[vi * 3 + 2] = vD.z;
    col[vi * 3] = c.r; col[vi * 3 + 1] = c.g; col[vi * 3 + 2] = c.b;
  }
  for (let r = 0; r < n; r++) {
    const s = rows[r];
    const paint = paintAt(s);
    const dashOn = Math.floor(s / 1.75) % 2 === 0;
    const base = r * ROW;
    for (let c = 0; c < SURF; c++) {
      let color = paint.body;
      if (TRIM[c]) color = paint.trim;
      else if (LINE[c] && (paint.solid || dashOn)) color = COL.white;
      setV(base + c, s, xs[c], 0, color);
    }
    const sk = SURF;
    setV(base + sk, s, xs[0], 0, paint.trim);
    setV(base + sk + 1, s, xs[0], -0.58, paint.skirt);
    setV(base + sk + 2, s, xs[SURF - 1], 0, paint.trim);
    setV(base + sk + 3, s, xs[SURF - 1], -0.58, paint.skirt);
    if (r < n - 1) {
      const a = base;
      const b = (r + 1) * ROW;
      for (let c = 0; c < SURF - 1; c++) {
        const i0 = a + c;
        // Cols run along +right, rows along +forward. This order faces +up
        // (the opposite order faces the void once right = forward × up).
        idx.push(i0, i0 + 1, b + c, i0 + 1, b + c + 1, b + c);
      }
      idx.push(a + sk, b + sk, a + sk + 1, a + sk + 1, b + sk, b + sk + 1);
      idx.push(a + sk + 2, a + sk + 3, b + sk + 2, a + sk + 3, b + sk + 3, b + sk + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  worldRoot.add(new THREE.Mesh(g, MAT.road));
}
function buildSky() {
  const th = mapDef.theme;
  const geo = new THREE.SphereGeometry(430, 24, 16);
  const pa = geo.attributes.position;
  const col = new Float32Array(pa.count * 3);
  const top = new THREE.Color(th.skyTop);
  const mid = new THREE.Color(th.skyMid);
  const hor = new THREE.Color(th.skyHor);
  const bot = new THREE.Color(th.skyBot);
  for (let i = 0; i < pa.count; i++) {
    const y = pa.getY(i) / 430;
    if (y > 0.12) colA.copy(mid).lerp(top, clamp((y - 0.12) / 0.88, 0, 1));
    else if (y > -0.08) colA.copy(hor).lerp(mid, clamp((y + 0.08) / 0.2, 0, 1));
    else colA.copy(bot).lerp(hor, clamp((y + 1) / 0.92, 0, 1));
    col[i * 3] = colA.r; col[i * 3 + 1] = colA.g; col[i * 3 + 2] = colA.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false,
  }));
  mesh.frustumCulled = false;
  scene.add(mesh);
  skyMesh = mesh;
  const sun = new THREE.Mesh(new THREE.SphereGeometry(16, 12, 8), new THREE.MeshBasicMaterial({ color: th.sun, fog: false }));
  sun.position.set(-90, 150, -40);
  scene.add(sun);
  sunMesh = sun;
}
function buildGround() {
  const geo = new THREE.CircleGeometry(980, 28);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, toon(mapDef.theme.ground));
  mesh.position.y = GROUND_Y;
  worldRoot.add(mesh);
}
function nearFeature(s) {
  if (Math.abs(s - 16) < 3.2) return true;
  for (let i = 1; i < checkpoints.length; i++) {
    if (Math.abs(s - checkpoints[i]) < 2.6) return true;
  }
  if (s > trackLength - 7) return true;
  return false;
}
function buildDecor() {
  const postPos = [];
  const postStep = mapDef.targetLen > 900 ? 8 : 6;
  const postGeo = mapDef.theme.decor === 'forest'
    ? GEO.post
    : stripeColorGeo(new THREE.CylinderGeometry(0.1, 0.12, 1.15, 6), 6, mapDef.theme.postA, mapDef.theme.postB);
  for (let s = 4; s < trackLength - 2; s += postStep) {
    if (nearGapEdge(s, 1)) continue;
    if (nearFeature(s)) continue;
    if (narrowAt(s) || forkAt(s) || tileZoneAt(s)) continue;
    postPos.push([s, -3.62], [s, 3.62]);
  }
  const postMesh = makeInst(postGeo, MAT.vc, Math.max(1, postPos.length));
  postMesh.count = postPos.length;
  qA.identity();
  postPos.forEach((p, i) => {
    toWorld(p[0], p[1], 0.58, vD);
    setInst(postMesh, i, vD, qA, 1, 1, 1);
  });
  postMesh.instanceMatrix.needsUpdate = true;

  if (mapDef.theme.decor === 'forest') {
  const sites = [];
  for (let s = 14; s < trackLength; s += 16) {
    const side = (Math.floor(s / 16) % 2 === 0) ? 1 : -1;
    const dist = 8.2 + (Math.floor(s) % 5);
    sites.push({ s, x: side * dist, kind: (Math.floor(s / 16) % 3 === 0) ? 'pop' : 'mush' });
    if (Math.floor(s) % 32 === 0) sites.push({ s: s + 6, x: -side * (dist + 2.4), kind: 'pop' });
  }
  const mushStalk = [];
  const mushCap = [];
  const pops = [];
  const islands = [];
  sites.forEach((st) => {
    islands.push(st);
    if (st.kind === 'mush') { mushStalk.push(st); mushCap.push(st); }
    else pops.push(st);
  });
  const islMesh = makeInst(GEO.island, MAT.vc, islands.length);
  islands.forEach((st, i) => {
    toWorld(st.s, st.x, -0.35, vD);
    qA.identity();
    const sc = 1.6 + (i % 3) * 0.35;
    setInst(islMesh, i, vD, qA, sc, 1, sc);
  });
  islMesh.instanceMatrix.needsUpdate = true;

  const stalkMesh = makeInst(GEO.stalk, toon(0xfff1d2), mushStalk.length);
  const capMesh = makeInst(GEO.mcap, MAT.vc, mushCap.length);
  mushStalk.forEach((st, i) => {
    toWorld(st.s, st.x, 0.35, vD);
    qA.identity();
    setInst(stalkMesh, i, vD, qA);
    toWorld(st.s, st.x, 1.05, vD);
    setInst(capMesh, i, vD, qA, 1, 1, 1);
  });
  stalkMesh.instanceMatrix.needsUpdate = true;
  capMesh.instanceMatrix.needsUpdate = true;

  const popColors = [0xff5d8a, 0xffe14a, 0x7de8c0, 0xb388ff, 0xff9a3c];
  const popMesh = makeInst(GEO.pop, toon(0xffffff), pops.length);
  pops.forEach((st, i) => {
    toWorld(st.s, st.x, 1.55, vD);
    qA.identity();
    setInst(popMesh, i, vD, qA);
    popMesh.setColorAt(i, colA.set(popColors[i % popColors.length]));
  });
  popMesh.instanceMatrix.needsUpdate = true;
  if (popMesh.instanceColor) popMesh.instanceColor.needsUpdate = true;
  const stickMesh = makeInst(new THREE.CylinderGeometry(0.08, 0.1, 1.15, 5), toon(0xfff6ea), pops.length);
  pops.forEach((st, i) => {
    toWorld(st.s, st.x, 0.7, vD);
    qA.identity();
    setInst(stickMesh, i, vD, qA);
  });
  stickMesh.instanceMatrix.needsUpdate = true;
  } else if (mapDef.theme.decor === 'candy') {
    buildCandyProps();
  } else {
    buildSnowProps();
  }

  const hillN = mapDef.targetLen > 900 ? 18 : 22;
  const hillMesh = makeInst(GEO.hill, toon(0xffffff), hillN);
  const hillCols = mapDef.theme.decor === 'snow'
    ? [0xf4f8ff, 0xd5e6f5, 0xeef6ff, 0xc5d8ea]
    : mapDef.theme.decor === 'candy'
      ? [0xffb7d8, 0xffe0a8, 0xb6f3da, 0xffc4e4]
      : [0x7dce6a, 0x8ed67a, 0x63b85a, 0xa4d86a];
  for (let i = 0; i < hillN; i++) {
    const s = (i / hillN) * trackLength;
    const side = i % 2 === 0 ? 1 : -1;
    const dist = 22 + (i % 5) * 6;
    toWorld(s, side * dist, 0, vD);
    vD.y = GROUND_Y + 4 + (i % 4) * 2;
    qA.identity();
    const scx = 8 + (i % 4) * 3;
    const scy = 5 + (i % 3) * 2;
    setInst(hillMesh, i, vD, qA, scx, scy, scx * 0.85);
    hillMesh.setColorAt(i, colA.set(hillCols[i % hillCols.length]));
  }
  hillMesh.instanceMatrix.needsUpdate = true;
  hillMesh.instanceColor.needsUpdate = true;

  const cloudN = 14;
  const cloudMesh = makeInst(GEO.cloud, MAT.vc, cloudN);
  for (let i = 0; i < cloudN; i++) {
    const s = (i * 47) % trackLength;
    const side = (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 5);
    const y = (i % 5 === 0 && inGap(s)) ? -8 : 10 + (i % 4) * 3.5;
    toWorld(s, side, y, vD);
    qA.setFromAxisAngle(WORLD_UP, i);
    const sc = 2.2 + (i % 3) * 0.8;
    setInst(cloudMesh, i, vD, qA, sc, sc * 0.85, sc);
  }
  cloudMesh.instanceMatrix.needsUpdate = true;

  // distant floating islets in each gap
  let floatN = 0;
  for (let gi = 0; gi < gaps.length; gi++) floatN += 6;
  if (floatN > 0) {
    const floatMesh = makeInst(GEO.island, MAT.vc, floatN);
    let fi = 0;
    for (let gi = 0; gi < gaps.length; gi++) {
      const g0 = gaps[gi].s0;
      for (let i = 0; i < 6; i++) {
        const s = g0 + 12 + i * 16;
        toWorld(s, (i % 2 === 0 ? -1 : 1) * (12 + i), -6 - (i % 3), vD);
        qA.identity();
        setInst(floatMesh, fi++, vD, qA, 3.2, 1.4, 2.6);
      }
    }
    floatMesh.instanceMatrix.needsUpdate = true;
  }

  if (mapDef.theme.decor === 'forest') {
    addCastleAt(trackLength * 0.08, 26, 1.7);
    addCastleAt(trackLength * 0.96, -18, 2.1);
  } else if (mapDef.theme.decor === 'candy') {
    addCandyLandmark(trackLength * 0.12, 18, 1.5);
    addCandyLandmark(trackLength * 0.9, -16, 1.8);
  } else {
    addSnowLandmark(trackLength * 0.1, 20, 1.6);
    addSnowLandmark(trackLength * 0.92, -14, 1.9);
  }
}
function buildCandyProps() {
  const pops = [];
  const creams = [];
  const drops = [];
  for (let s = 18; s < trackLength - 8; s += 18) {
    const side = (Math.floor(s / 18) % 2 === 0) ? 1 : -1;
    const dist = 7.6 + (Math.floor(s) % 4);
    const kind = Math.floor(s / 18) % 3;
    if (kind === 0) pops.push({ s: s, x: side * dist });
    else if (kind === 1) creams.push({ s: s, x: side * dist });
    else drops.push({ s: s, x: side * dist });
    if (Math.floor(s) % 54 === 0) pops.push({ s: s + 8, x: -side * (dist + 2.2) });
  }
  const popColors = [0xff5d8a, 0xffe14a, 0x7de8c0, 0xb388ff, 0xff9a3c];
  if (pops.length) {
    const popMesh = makeInst(GEO.pop, toon(0xffffff), pops.length);
    const stickMesh = makeInst(new THREE.CylinderGeometry(0.07, 0.09, 1.2, 5), toon(0xfff6ea), pops.length);
    pops.forEach((st, i) => {
      qA.identity();
      toWorld(st.s, st.x, 1.55, vD);
      setInst(popMesh, i, vD, qA);
      popMesh.setColorAt(i, colA.set(popColors[i % popColors.length]));
      toWorld(st.s, st.x, 0.62, vD);
      setInst(stickMesh, i, vD, qA);
    });
    popMesh.instanceMatrix.needsUpdate = true;
    if (popMesh.instanceColor) popMesh.instanceColor.needsUpdate = true;
    stickMesh.instanceMatrix.needsUpdate = true;
  }
  if (creams.length) {
    const coneMesh = makeInst(GEO.cone, toon(0xffe0b0), creams.length);
    const scoopMesh = makeInst(GEO.scoop, toon(0xffffff), creams.length);
    const scoop2 = makeInst(GEO.scoop, toon(0xffffff), creams.length);
    const cols = [0xff8ec4, 0x7dface, 0xffe14a];
    creams.forEach((st, i) => {
      qA.identity();
      toWorld(st.s, st.x, 0.28, vD);
      setInst(coneMesh, i, vD, qA, 1.35, 1.7, 1.35);
      toWorld(st.s, st.x, 1.0, vD);
      setInst(scoopMesh, i, vD, qA, 1.15, 1.15, 1.15);
      scoopMesh.setColorAt(i, colA.set(cols[i % 3]));
      toWorld(st.s, st.x, 1.45, vD);
      setInst(scoop2, i, vD, qA, 0.82, 0.82, 0.82);
      scoop2.setColorAt(i, colA.set(cols[(i + 1) % 3]));
    });
    coneMesh.instanceMatrix.needsUpdate = true;
    scoopMesh.instanceMatrix.needsUpdate = true;
    scoop2.instanceMatrix.needsUpdate = true;
    if (scoopMesh.instanceColor) scoopMesh.instanceColor.needsUpdate = true;
    if (scoop2.instanceColor) scoop2.instanceColor.needsUpdate = true;
  }
  if (drops.length) {
    const dropMesh = makeInst(GEO.scoop, toon(0xffffff), drops.length);
    drops.forEach((st, i) => {
      toWorld(st.s, st.x, 0.42, vD);
      qA.identity();
      setInst(dropMesh, i, vD, qA, 1.45, 1.05, 1.45);
      dropMesh.setColorAt(i, colA.set(popColors[(i + 2) % popColors.length]));
    });
    dropMesh.instanceMatrix.needsUpdate = true;
    if (dropMesh.instanceColor) dropMesh.instanceColor.needsUpdate = true;
  }
}
function buildSnowProps() {
  const pines = [];
  const men = [];
  const crystals = [];
  for (let s = 22; s < trackLength - 10; s += 26) {
    const side = (Math.floor(s / 26) % 2 === 0) ? 1 : -1;
    const dist = 8.4 + (Math.floor(s) % 4);
    const k = Math.floor(s / 26) % 3;
    if (k === 0) pines.push({ s: s, x: side * dist });
    else if (k === 1) men.push({ s: s, x: side * dist });
    else crystals.push({ s: s, x: side * (dist - 0.6) });
    if (Math.floor(s) % 78 === 0) pines.push({ s: s + 9, x: -side * (dist + 3.2) });
  }
  if (pines.length) {
    const mesh = makeInst(GEO.pine, MAT.vc, pines.length);
    pines.forEach((st, i) => {
      toWorld(st.s, st.x, 0, vD);
      qA.setFromAxisAngle(WORLD_UP, i * 0.7);
      const sc = 1.25 + (i % 3) * 0.22;
      setInst(mesh, i, vD, qA, sc, sc, sc);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  if (men.length) {
    const mesh = makeInst(GEO.snowman, MAT.vc, men.length);
    men.forEach((st, i) => {
      toWorld(st.s, st.x, 0, vD);
      qA.identity();
      setInst(mesh, i, vD, qA, 1.3, 1.3, 1.3);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  if (crystals.length) {
    const mesh = makeInst(GEO.crystal, toon(0xffffff), crystals.length);
    const cols = [0xd7f0ff, 0xffffff, 0xb7dcff, 0xeaf6ff];
    crystals.forEach((st, i) => {
      toWorld(st.s, st.x, 0.75, vD);
      qA.setFromAxisAngle(WORLD_UP, i * 0.4);
      setInst(mesh, i, vD, qA, 0.85, 1.35, 0.85);
      mesh.setColorAt(i, colA.set(cols[i % cols.length]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
}
function addCandyLandmark(s, x, sc) {
  const g = new THREE.Group();
  placeOnTrack(g, s, x, 0);
  g.position.y = GROUND_Y;
  g.scale.setScalar(sc);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.5, 0.55, 8), toon(0xffe0b0));
  base.position.y = 0.35;
  g.add(base);
  [[0.2, 0xff8ec4, 2.1], [1.15, 0x7dface, 1.45], [1.95, 0xffe14a, 0.95]].forEach((p) => {
    const scoop = new THREE.Mesh(GEO.scoop, toon(p[1]));
    scoop.position.y = p[0] + 0.7;
    scoop.scale.setScalar(p[2]);
    g.add(scoop);
  });
  const cherry = new THREE.Mesh(GEO.pop, toon(0xff3355));
  cherry.position.y = 3.9;
  cherry.scale.setScalar(0.42);
  g.add(cherry);
  worldRoot.add(g);
}
function addSnowLandmark(s, x, sc) {
  const g = new THREE.Group();
  placeOnTrack(g, s, x, 0);
  g.position.y = GROUND_Y;
  g.scale.setScalar(sc);
  const pine = new THREE.Mesh(GEO.pine, MAT.vc);
  pine.position.set(-1.5, 0, 0);
  pine.scale.setScalar(1.7);
  const man = new THREE.Mesh(GEO.snowman, MAT.vc);
  man.position.set(1.25, 0, 0.2);
  man.scale.setScalar(1.55);
  const cry = new THREE.Mesh(GEO.crystal, toon(0xd7f4ff));
  cry.position.set(0.1, 1.3, -1.3);
  cry.scale.set(1.05, 1.7, 1.05);
  g.add(pine, man, cry);
  worldRoot.add(g);
}
function addCastleAt(s, x, sc) {
  const g = new THREE.Group();
  placeOnTrack(g, s, x, 0);
  g.position.y = GROUND_Y;
  g.scale.setScalar(sc);
  const wall = toon(0xfff6ea);
  const roof = toon(0xff5a7a);
  const keep = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 2.6), wall);
  keep.position.y = 2.4;
  g.add(keep);
  const cyl = new THREE.CylinderGeometry(0.55, 0.66, 3.4, 8);
  const cone = new THREE.ConeGeometry(0.85, 1.35, 8);
  [[-1.9, -1.3], [1.9, -1.3], [-1.9, 1.3], [1.9, 1.3]].forEach((t) => {
    const c = new THREE.Mesh(cyl, wall);
    c.position.set(t[0], 2.8, t[1]);
    const r = new THREE.Mesh(cone, roof);
    r.position.set(t[0], 5.0, t[1]);
    g.add(c, r);
  });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.05, 0.2), toon(0x6b4634));
  door.position.set(0, 1.5, 1.35);
  g.add(door);
  worldRoot.add(g);
}
function bannerTex(text, c1, c2) {
  return canvasTex((g, w, h) => {
    g.fillStyle = c1;
    g.fillRect(0, 0, w, h);
    g.fillStyle = c2;
    for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h);
    g.fillStyle = '#3a2463';
    g.font = 'bold 54px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 2);
  }, 512, 96);
}
function flagTex(color) {
  return canvasTex((g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff';
    g.fillRect(0, 0, w, h * 0.22);
    g.fillRect(0, h * 0.78, w, h * 0.22);
  }, 64, 40);
}
function buildArch(s, kind) {
  const root = new THREE.Group();
  placeOnTrack(root, s, 0, 0);
  const goal = kind === 'goal';
  const start = kind === 'start';
  const cp = kind === 'cp';
  // GOAL banner bottom stays above the chase camera (portrait up ≈ 4.6, plus 1.5 m).
  // Checkpoint beams sit at ≥ 6.6 m so they never cross the view like a wall.
  const span = goal ? 5.5 : cp ? 4.25 : 3.9;
  const bannerBottom = goal ? 10.0 : 0;
  const bannerH = goal ? 1.7 : start ? 0.78 : 0.72;
  const beamY = goal ? bannerBottom + bannerH + 0.22 : cp ? 6.7 : 3.5;
  const h = beamY;
  const radTop = goal ? 0.38 : cp ? 0.16 : 0.26;
  const radBot = goal ? 0.48 : cp ? 0.2 : 0.32;
  const pillarGeo = stripeColorGeo(
    new THREE.CylinderGeometry(radTop, radBot, h, 8),
    8,
    cp ? 0x14c8b8 : 0xff4477,
    0xffffff,
  );
  const mat = MAT.vc;
  [-span, span].forEach((x) => {
    const p = new THREE.Mesh(pillarGeo, mat);
    p.position.set(x, h / 2, 0);
    root.add(p);
    if (goal) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.78, 1.35, 8), toon(0xff5a7a));
      cone.position.set(x, h + 0.62, 0);
      root.add(cone);
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.08), toon(0x8fd0f5));
      win.position.set(x, h * 0.55, 0.4);
      root.add(win);
    }
  });
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(span * 2 + (goal ? 0.7 : 0.35), goal ? 0.32 : 0.16, goal ? 0.32 : 0.16),
    toon(goal ? 0xfff6ea : cp ? 0xffe27a : 0xffe14a),
  );
  beam.position.y = h;
  root.add(beam);
  const label = goal ? 'GOAL' : start ? 'START' : '';
  if (label || cp) {
    const tex = bannerTex(
      label,
      goal ? '#1c1c1c' : cp ? '#14c8b8' : '#ff4d8d',
      goal ? '#f4f4f4' : cp ? '#fff4b0' : '#ffe9f3',
    );
    const bw = goal ? 9.2 : cp ? 4.4 : 3.4;
    // two single-sided planes (back to back) so the label never reads mirrored
    const bgeo = new THREE.PlaneGeometry(bw, bannerH);
    const bmat = new THREE.MeshBasicMaterial({ map: tex });
    [0, Math.PI].forEach((ry) => {
      const plane = new THREE.Mesh(bgeo, bmat);
      plane.position.y = goal ? bannerBottom + bannerH / 2 : h - bannerH * 0.72;
      plane.rotation.y = ry;
      plane.position.z = ry ? 0.01 : -0.01;
      root.add(plane);
    });
  }
  const fmat = new THREE.MeshBasicMaterial({
    map: flagTex(goal ? '#ffd24a' : start ? '#7de8c0' : '#8fd0f5'),
    side: THREE.DoubleSide,
  });
  [-span, span].forEach((x, i) => {
    const poleH = goal ? 1.15 : 0.85;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, poleH, 4), toon(0xffffff));
    pole.position.set(x, h + poleH * 0.5, 0);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), fmat);
    flag.position.set(x + (i === 0 ? -0.32 : 0.32), h + poleH * 0.72, 0);
    root.add(pole, flag);
  });
  if (goal) {
    const fin = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.7), new THREE.MeshBasicMaterial({
      map: bannerTex('', '#111', '#f2f2f2'), transparent: true, depthWrite: false,
    }));
    fin.position.y = 0.05;
    fin.rotation.x = -Math.PI / 2;
    root.add(fin);
  }
  worldRoot.add(root);
}

/* =====================================================================
   OBSTACLES
   ===================================================================== */
function pushBlock(s, x, kind, phase, color, amp, omega) {
  blocks.push({
    id: blocks.length, s, x, kind,
    phase, half: 1.1, offX: 0, offS: 0, top: 0, tilt: 0,
    solid: true, hidden: false, flash: false, color,
    amp: amp || 0, omega: omega || 0,
  });
}
function buildForestBlocks() {
  const g0 = gaps[0].s0;
  const g1 = gaps[0].s1;
  const blanes = [-2.15, 0, 2.15];
  const colors = [0xffe14a, 0xff9a3c, 0x7de8b0, 0xff8ec8];
  const exitLip = g1 - 1.65;
  const decks = [];
  let cursor = g0 + 1.65;
  while (cursor + 6.2 < exitLip) {
    const room = exitLip - cursor;
    const span = room < 8.6 + 1.75 + 6.2 ? room : 8.6;
    decks.push({ near: cursor, far: cursor + span, i: decks.length });
    if (span < 8.5) break;
    cursor += span + 1.75;
  }
  decks.forEach((deck) => {
    const omit = (deck.i % 2 === 1 && deck.far < exitLip - 0.2) ? (deck.i % 3) : -1;
    for (let s = deck.near + 1.1; s <= deck.far - 1.05; s += 2.15) {
      for (let li = 0; li < 3; li++) {
        if (li === omit) continue;
        let kind = 'static';
        if (deck.i > 0 && deck.far < exitLip - 0.2) {
          if (deck.i % 4 === 1 && li === 0) kind = 'bob';
          else if (deck.i % 4 === 2 && li === 2) kind = 'wobble';
          else if (deck.i % 4 === 3 && li === 1) kind = 'vanish';
        }
        pushBlock(s, blanes[li], kind, deck.i * 0.9 + li * 1.4 + s * 0.02, colors[(deck.i + li) % 4], 0, 0);
      }
    }
  });
}
function buildMoveBlocks() {
  const g = gaps[0];
  const g0 = g.s0;
  const g1 = g.s1;
  const blanes = [-2.15, 0, 2.15];
  const candy = mapDef.id === 'candy';
  const colors = candy
    ? [0xff8ec4, 0xffe14a, 0x7dface, 0xffb347]
    : [0xe7f4ff, 0xffffff, 0xb7dcff, 0xd7e6f5];
  const exitLip = g1 - 1.65;
  const decks = [];
  let cursor = g0 + 1.65;
  const span0 = candy ? 8.2 : 8.0;
  const gapW = candy ? 1.85 : 1.8;
  while (cursor + 5.6 < exitLip) {
    const room = exitLip - cursor;
    const span = room < span0 + gapW + 5.6 ? room : span0;
    decks.push({ near: cursor, far: cursor + span, i: decks.length });
    if (span < span0 - 0.2) break;
    cursor += span + gapW;
  }
  const ampX = candy ? 1.05 : 1.15;
  decks.forEach((deck) => {
    const omit = -1;
    for (let s = deck.near + 1.05; s <= deck.far - 1.0; s += 2.15) {
      for (let li = 0; li < 3; li++) {
        if (li === omit) continue;
        let kind = 'static';
        let amp = 0;
        let omega = 0;
        if (deck.i > 0 && deck.far < exitLip - 0.2) {
          const m = deck.i % 4;
          if (m === 1 && li !== 1) { kind = 'moveX'; amp = ampX; omega = candy ? 0.8 : 0.95; }
          else if (m === 2 && li === 1) { kind = 'moveS'; amp = candy ? 0.55 : 0.6; omega = 0.85; }
          else if (m === 3 && li === 1) kind = 'vanish';
          else if (m === 0 && li === 0) { kind = 'moveX'; amp = ampX * 0.65; omega = 0.7; }
        }
        pushBlock(s, blanes[li], kind, deck.i * 0.7 + li * 1.6, colors[(deck.i + li) % 4], amp, omega);
      }
    }
  });
}
function makeTile(s, x, phase, zone, color, half, always) {
  return {
    s, x, phase, zone: !!zone, color, half: half || 1.05,
    hs: 1.15, period: 2.5, on: 1.9, top: 0.16, always: !!always,
    offX: 0, offS: 0, solid: true, hidden: false, flash: false, kind: 'tile',
  };
}
function buildTileZone(z) {
  const lanes = [-2.2, 0, 2.2];
  const colors = z.colors || [0xff8ec4, 0xffe14a, 0x7dface];
  const period = 2.5;
  const gate = z.s0 + 1.05;
  for (let li = 0; li < lanes.length; li++) {
    tiles.push(makeTile(gate, lanes[li], 0, true, colors[li % colors.length], 1.05, true));
  }
  for (let s = z.s0 + 3.3; s <= z.s1 - 2.5; s += 2.4) {
    for (let li = 0; li < 3; li++) {
      tiles.push(makeTile(s, lanes[li], (li * period) / 3, true, colors[li % colors.length], 1.05, false));
    }
  }
  // Solid lip so the row spacing cannot leave a cliff before the road returns.
  const lip = z.s1 - 1.05;
  for (let li = 0; li < 3; li++) {
    tiles.push(makeTile(lip, lanes[li], 0, true, colors[li % colors.length], 1.05, true));
  }
}
function buildRotor(rs) {
  const root = new THREE.Group();
  placeOnTrack(root, rs.s, rs.x || 0, 0);
  const pivotY = rs.pivotY || 1.08;
  const half = rs.halfLen || 3.15;
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), toon(rs.cap || 0xff4d8d));
  hub.position.y = pivotY;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.16, 0.18), toon(rs.color || 0xfff6ea));
  const capL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 4), toon(rs.cap || 0xff4d8d));
  capL.position.set(-half, 0, 0);
  const capR = capL.clone();
  capR.position.x = half;
  const spin = new THREE.Group();
  spin.position.y = pivotY;
  spin.add(bar, capL, capR);
  root.add(hub, spin);
  worldRoot.add(root);
  return {
    s: rs.s, x: rs.x || 0, halfLen: half, omega: rs.omega || 1, phase: rs.phase || 0,
    pivotY, spin, short: !!rs.short, angle: 0,
  };
}
function addForkSign(s, x, text, color) {
  const g = new THREE.Group();
  placeOnTrack(g, s, x, 0);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.3, 5), toon(0xfff6ea));
  pole.position.y = 0.65;
  const tex = canvasTex((ctx, w, h) => {
    ctx.fillStyle = color;
    roundRect(ctx, 8, 18, w - 16, h - 36, 18);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  }, 256, 128);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.68), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  board.position.y = 1.42;
  g.add(pole, board);
  worldRoot.add(g);
}
function buildObstacles() {
  hurdles.length = 0;
  hurdleRows.length = 0;
  pads.length = 0;
  blocks.length = 0;
  hammers.length = 0;
  springs.length = 0;
  walls.length = 0;
  tiles.length = 0;
  rotors.length = 0;

  (mapDef.hurdles || []).forEach((rowSpec) => {
    const gapsL = rowSpec.gaps ? rowSpec.gaps.slice() : [];
    const row = { s: rowSpec.s, gaps: gapsL, lanes: [] };
    HURDLE_X.forEach((x, li) => {
      if (gapsL.indexOf(li) >= 0) return;
      const h = { s: rowSpec.s, x, half: 0.98, id: hurdles.length };
      hurdles.push(h);
      row.lanes.push(h);
    });
    hurdleRows.push(row);
  });
  if (hurdles.length) {
    const barMesh = makeInst(GEO.bar, MAT.vc, hurdles.length);
    const hpMesh = makeInst(GEO.hpost, toon(0xfff6ea), hurdles.length * 2);
    hurdles.forEach((h, i) => {
      toWorld(h.s, h.x, 0.86, vD);
      basisAt(h.s, 0, vA, vB, vC);
      mA.makeBasis(vA, vB, vC);
      qA.setFromRotationMatrix(mA);
      setInst(barMesh, i, vD, qA);
      [-0.72, 0.72].forEach((dx, k) => {
        toWorld(h.s, h.x + dx, 0.41, vD);
        qB.identity();
        setInst(hpMesh, i * 2 + k, vD, qB);
      });
    });
    barMesh.instanceMatrix.needsUpdate = true;
    hpMesh.instanceMatrix.needsUpdate = true;
  }

  (mapDef.pads || []).forEach((p) => {
    pads.push({ s: p[0], x: p[1], hs: 1.55, hx: 1.15 });
  });
  padMesh = makeInst(GEO.pad, MAT.pad, Math.max(1, pads.length));
  padMesh.count = pads.length;
  pads.forEach((p, i) => layoutPad(p, i, 1));
  padMesh.instanceMatrix.needsUpdate = true;

  if (gaps.length) {
    if (mapDef.blockStyle === 'forest') buildForestBlocks();
    else buildMoveBlocks();
  }
  blockMesh = makeInst(GEO.block, toon(0xffffff), Math.max(1, blocks.length));
  blockMesh.count = blocks.length;
  blocks.forEach((b, i) => blockMesh.setColorAt(i, colA.set(b.color)));
  if (blockMesh.instanceColor) blockMesh.instanceColor.needsUpdate = true;

  if (balls.length === 0) {
    for (let i = 0; i < BALL_MAX; i++) balls.push({ alive: false, s: 0, x: 0, spin: 0 });
  } else {
    for (let i = 0; i < balls.length; i++) balls[i].alive = false;
  }
  ballMesh = makeInst(GEO.ball, MAT.ball, BALL_MAX);

  (mapDef.hammers || []).forEach((hs) => hammers.push(buildHammer(hs)));
  (mapDef.rotors || []).forEach((rs) => rotors.push(buildRotor(rs)));
  for (let fi = 0; fi < forks.length; fi++) {
    const f = forks[fi];
    if (f.rotorS) {
      rotors.push(buildRotor({
        s: f.rotorS, x: f.shortX, halfLen: 1.35, omega: 1.05, phase: 0.4,
        pivotY: 1.08, color: 0xfff6ea, cap: 0xff4d8d, short: true,
      }));
    }
    const tileS = f.tileS || [];
    for (let ti = 0; ti < tileS.length; ti++) {
      tiles.push(makeTile(tileS[ti], f.shortX, 0.4 + ti * 0.85, false, 0xff8ec4, 0.95));
    }
  }
  for (let zi = 0; zi < tileZones.length; zi++) buildTileZone(tileZones[zi]);

  const fin = mapDef.finale || [-40, -20];
  for (let i = 0; i < fin.length; i++) {
    const s = trackLength + fin[i];
    springs.push(buildSpring(s, 0));
    walls.push(buildWall(s + 6.1));
  }

  buildArch(16, 'start');
  for (let i = 1; i < checkpoints.length; i++) buildArch(checkpoints[i], 'cp');
  buildArch(trackLength - 0.4, 'goal');

  for (let fi = 0; fi < forks.length; fi++) {
    const f = forks[fi];
    addForkSign(f.s0 + 3, f.shortX * 0.45, '近路', '#ff4d8d');
    addForkSign(f.s0 + 3, f.longX * 0.45, '穩路', '#14c8b8');
  }

  if (tiles.length) {
    tileMesh = makeInst(GEO.tile, toon(0xffffff), tiles.length);
    tiles.forEach((t, i) => tileMesh.setColorAt(i, colA.set(t.color)));
    if (tileMesh.instanceColor) tileMesh.instanceColor.needsUpdate = true;
  } else tileMesh = null;

  shadowMesh = makeInst(GEO.blob, MAT.blob, runners.length + BALL_MAX);
  updateBlocks(0);
  updateRotors(0);
  updateTiles(0);
  syncBlocks();
  syncTiles();
}
function layoutPad(p, i, pulse) {
  toWorld(p.s, p.x, 0.07, vD);
  basisAt(p.s, 0, vA, vB, vC);
  vA.negate(); // plane +X = screen-right; +Y (chevron) = forward; +Z = up
  mA.makeBasis(vA, vC, vB);
  qA.setFromRotationMatrix(mA);
  setInst(padMesh, i, vD, qA, pulse, pulse, 1);
}
function buildHammer(hs) {
  const root = new THREE.Group();
  placeOnTrack(root, hs.s, 0, 0);
  const pivotY = 3.75;
  const len = 3.3;
  [-3.35, 3.35].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, pivotY, 6), toon(0xfff3ea));
    post.position.set(x, pivotY / 2, 0);
    root.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.16, 0.16), toon(0xffd24a));
  beam.position.y = pivotY;
  root.add(beam);
  const arm = new THREE.Group();
  arm.position.y = pivotY;
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.12, len, 0.12), toon(0x8d6bff));
  stick.position.y = -len / 2;
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.7, 8), toon(0xff5d8a));
  head.rotation.z = Math.PI / 2;
  head.position.y = -len;
  arm.add(stick, head);
  root.add(arm);
  worldRoot.add(root);
  return { s: hs.s, phase: hs.phase, omega: hs.omega, amp: hs.amp, pivotY, len, arm, headX: 0, headY: 1, angle: 0 };
}
function buildSpring(s, x) {
  const g = new THREE.Group();
  placeOnTrack(g, s, x, 0);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.5), toon(0xff5d8a));
  base.position.y = 0.08;
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 6, 10), toon(0xffe14a));
  coil.rotation.x = Math.PI / 2;
  coil.position.y = 0.28;
  const coil2 = coil.clone();
  coil2.position.y = 0.48;
  coil2.scale.set(0.75, 0.75, 0.75);
  g.add(base, coil, coil2);
  worldRoot.add(g);
  return { s, x, group: g, coil, squash: 0 };
}
function buildWall(s) {
  const g = new THREE.Group();
  placeOnTrack(g, s, 0, 0);
  const wall = new THREE.Mesh(stripeColorGeo(new THREE.BoxGeometry(W + 0.2, 2.25, 0.38), 8, 0xff4477, 0xfff6ea), MAT.vc);
  wall.position.y = 1.12;
  g.add(wall);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.16, 0.5), toon(0xffe14a));
  cap.position.y = 2.3;
  g.add(cap);
  worldRoot.add(g);
  return { s };
}
function motionAt(b, t) {
  const o = { offX: 0, offS: 0, top: 0, tilt: 0, solid: true, hidden: false, flash: false };
  if (b.kind === 'bob') o.top = Math.sin(t * 1.7 + b.phase) * 0.5;
  else if (b.kind === 'wobble') {
    o.tilt = Math.sin(t * 1.35 + b.phase) * 0.28;
    o.offX = Math.sin(t * 1.15 + b.phase) * 0.38;
    o.top = Math.sin(t * 1.35 + b.phase) * 0.1;
  } else if (b.kind === 'vanish') {
    const cyc = (t + b.phase) % 3;
    if (cyc > 1.8) { o.solid = false; o.hidden = true; }
    else if (cyc > 1.4) o.flash = true;
  } else if (b.kind === 'moveX') {
    o.offX = Math.sin(t * (b.omega || 0.9) + b.phase) * (b.amp || 1);
  } else if (b.kind === 'moveS') {
    o.offS = Math.sin(t * (b.omega || 0.9) + b.phase) * (b.amp || 0.7);
  }
  return o;
}
function updateBlocks(t) {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const o = motionAt(b, t);
    b.offX = o.offX; b.offS = o.offS; b.top = o.top; b.tilt = o.tilt;
    b.solid = o.solid; b.hidden = o.hidden; b.flash = o.flash;
  }
}
function syncBlocks() {
  if (!blockMesh || !blocks.length) return;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const bs = blockS(b);
    toWorld(bs, blockX(b), b.top - 0.28, vD);
    basisAt(bs, 0, vA, vB, vC);
    mA.makeBasis(vA, vB, vC);
    qA.setFromRotationMatrix(mA);
    qB.setFromAxisAngle(Z_AXIS, b.tilt);
    qA.multiply(qB);
    const sc = b.hidden ? 0.001 : (b.flash ? 1.08 : 1);
    setInst(blockMesh, i, vD, qA, sc, sc, sc);
    blockMesh.setColorAt(i, colA.set(b.flash ? 0xffffff : b.color));
  }
  blockMesh.instanceMatrix.needsUpdate = true;
  if (blockMesh.instanceColor) blockMesh.instanceColor.needsUpdate = true;
}
function tileMotion(tile, t) {
  if (tile.always) return { solid: true, hidden: false, flash: false };
  const per = tile.period || 2.5;
  const on = tile.on || 1.9;
  const cyc = (t + tile.phase) % per;
  if (cyc > on) return { solid: false, hidden: true, flash: false };
  if (cyc > on - 0.4) return { solid: true, hidden: false, flash: true };
  return { solid: true, hidden: false, flash: false };
}
function updateTiles(t) {
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const o = tileMotion(tile, t);
    tile.solid = o.solid; tile.hidden = o.hidden; tile.flash = o.flash;
  }
}
function syncTiles() {
  if (!tileMesh || !tiles.length) return;
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    toWorld(tile.s, tile.x, tile.hidden ? -2 : 0.02, vD);
    basisAt(tile.s, 0, vA, vB, vC);
    mA.makeBasis(vA, vB, vC);
    qA.setFromRotationMatrix(mA);
    const sc = tile.hidden ? 0.001 : (tile.flash ? 1.06 : 1);
    setInst(tileMesh, i, vD, qA, (tile.half || 1.05) * 2 * sc, 1, (tile.hs || 1.15) * 2 * sc);
    tileMesh.setColorAt(i, colA.set(tile.flash ? 0xffffff : tile.color));
  }
  tileMesh.instanceMatrix.needsUpdate = true;
  if (tileMesh.instanceColor) tileMesh.instanceColor.needsUpdate = true;
}
function updateRotors(t) {
  for (let i = 0; i < rotors.length; i++) {
    const rot = rotors[i];
    rot.angle = t * rot.omega + rot.phase;
    if (rot.spin) rot.spin.rotation.z = rot.angle;
  }
}
function updateHammers(t) {
  for (let i = 0; i < hammers.length; i++) {
    const h = hammers[i];
    const A = Math.sin(t * h.omega + h.phase) * h.amp;
    h.angle = A;
    // Group local +X is −track x, so the head's track offset is the opposite of local x.
    h.headX = -Math.sin(A) * h.len;
    h.headY = h.pivotY - Math.cos(A) * h.len;
    h.arm.rotation.z = A;
  }
}
function updateBalls(dt) {
  if (screen !== 'race') return;
  const spec = mapDef.balls;
  if (!spec) {
    for (let i = 0; i < balls.length; i++) balls[i].alive = false;
    return;
  }
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (!b.alive) continue;
    b.s += -9 * dt;
    b.spin += dt * 2.4;
    if (b.s < spec.kill) b.alive = false;
  }
  let lead = -1;
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (r.finished || r.dnf || r.respawnT > 0) continue;
    if (r.s > spec.from && r.s < trackLength - 32 && r.s > lead) lead = r.s;
  }
  if (lead < 0) return;
  if (!ballIntro) {
    ballIntro = true;
    spawnBallAt(Math.min(trackLength - 36, Math.max(lead + 14, spec.introA)), 0);
    spawnBallAt(Math.min(trackLength - 30, Math.max(lead + 24, spec.introB)), spec.introX);
    ballTimer = 2.1;
    return;
  }
  ballTimer -= dt;
  if (ballTimer <= 0) {
    ballTimer = 2.3;
    const lanes = [-2.15, 0, 2.15];
    spawnBallAt(Math.min(trackLength - 30, lead + 14 + rng() * 8), lanes[(rng() * 3) | 0]);
  }
}
function spawnBallAt(s, x) {
  let slot = null;
  for (let i = 0; i < balls.length; i++) if (!balls[i].alive) { slot = balls[i]; break; }
  if (!slot) return null;
  slot.alive = true;
  slot.s = s;
  slot.x = x;
  slot.spin = rng() * 6;
  return slot;
}
function ensureBallsAhead(s) {
  const spec = mapDef.balls;
  if (!spec) return;
  if (s < spec.from || s > trackLength - 24) return;
  let ahead = 0;
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (b.alive && b.s > s + 4 && b.s < s + 32) ahead++;
  }
  if (ahead > 0) return;
  spawnBallAt(Math.min(trackLength - 28, s + 15), 0);
  spawnBallAt(Math.min(trackLength - 24, s + 23), 2.15);
  ballIntro = true;
  ballTimer = 2.1;
}
function syncBalls() {
  if (!ballMesh) return;
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (!b.alive) {
      vD.set(0, -40, 0);
      qA.identity();
      setInst(ballMesh, i, vD, qA, 0.001, 0.001, 0.001);
      continue;
    }
    toWorld(b.s, b.x, 1.6, vD);
    basisAt(b.s, 0, vA, vB, vC);
    mA.makeBasis(vA, vB, vC);
    qA.setFromRotationMatrix(mA);
    qB.setFromAxisAngle(vA, b.spin);
    qA.multiply(qB);
    setInst(ballMesh, i, vD, qA, 1, 1, 1);
  }
  ballMesh.instanceMatrix.needsUpdate = true;
}
function syncPads(t) {
  if (!padMesh || !pads.length) return;
  for (let i = 0; i < pads.length; i++) {
    const pulse = 1 + Math.sin(t * 6 + i) * 0.07;
    layoutPad(pads[i], i, pulse);
  }
  padMesh.instanceMatrix.needsUpdate = true;
}
function snapOntoBlock(r) {
  if (queryGround(r.s, r.x)) return;
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b.solid) continue;
    const bx = blockX(b);
    const bs = blockS(b);
    const ds = bs - r.s;
    const dx = bx - r.x;
    const d = ds * ds + dx * dx;
    if (d < bestD) { bestD = d; best = b; }
  }
  if (!best) return;
  r.s = blockS(best);
  r.x = blockX(best);
}
function tileCovering(s, x) {
  let best = null;
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (Math.abs(tile.s - s) > (tile.hs || 1.15) + 0.02) continue;
    if (Math.abs(tile.x - x) > (tile.half || 1.05) + 0.02) continue;
    if (!best || (tile.solid && !best.solid)) best = tile;
  }
  return best;
}
function bandSupport(s, x) {
  const bands = bandsAt(s);
  if (!bands) {
    if (Math.abs(x) <= W * 0.5 + 0.08) return { h: 0, carrier: null };
    return null;
  }
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i];
    if (Math.abs(x - b.x) <= b.half + 0.08) {
      return { h: b.kind === 'short' ? 0.05 : 0, carrier: null };
    }
  }
  return null;
}
function queryGround(s, x) {
  if (inGap(s)) {
    let best = null;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b.solid) continue;
      const bs = blockS(b);
      if (Math.abs(bs - s) > 1.8) continue;
      const bx = blockX(b);
      if (Math.abs(s - bs) <= b.half + 0.02 && Math.abs(x - bx) <= b.half + 0.02) {
        if (!best || b.top > best.h) best = { h: b.top, carrier: b };
      }
    }
    return best;
  }
  const cover = tileCovering(s, x);
  if (cover) {
    if (cover.solid) return { h: cover.top, carrier: cover };
    return null;
  }
  if (tileZoneAt(s)) return null;
  return bandSupport(s, x);
}

/* =====================================================================
   RUNNER MODEL
   ===================================================================== */
function addEarPair(head, flop, len) {
  [-1, 1].forEach((side) => {
    const e = new THREE.Mesh(GEO.ear, MAT.pink);
    e.position.set(side * 0.16, flop ? 0.28 : 0.46, 0.02);
    e.rotation.z = flop ? side * -1.15 : side * -0.16;
    e.scale.set(1, len || 1, 1);
    const inn = new THREE.Mesh(GEO.earIn, toon(0xffd0e0));
    inn.position.set(0, 0.05, 0.03);
    e.add(inn);
    head.add(e);
  });
}
function addBow(head, y, sc, x) {
  const L = new THREE.Mesh(GEO.bow, toon(0xff4d8d));
  L.position.set((x || 0) - 0.1 * sc, y, 0.04);
  L.scale.set(1.15 * sc, 0.72 * sc, 0.55 * sc);
  const R = L.clone();
  R.position.x = (x || 0) + 0.1 * sc;
  const C = new THREE.Mesh(GEO.flowerC, toon(0xffe14a));
  C.position.set(x || 0, y, 0.08);
  C.scale.setScalar(0.55 * sc);
  head.add(L, R, C);
}
function addHat(head, type) {
  if (type === 'bunny') addEarPair(head, false, 1.05);
  else if (type === 'floppy') {
    addEarPair(head, true, 1.15);
    addBow(head, 0.22, 0.7, 0.22);
  } else if (type === 'bear') {
    [-1, 1].forEach((side) => {
      const e = new THREE.Mesh(GEO.flowerC, toon(0x5a3a28));
      e.position.set(side * 0.3, 0.28, 0);
      e.scale.setScalar(1.35);
      const inn = new THREE.Mesh(GEO.earIn, toon(0xffb7c8));
      inn.position.set(0, 0, 0.06);
      inn.scale.setScalar(1.4);
      e.add(inn);
      head.add(e);
    });
  } else if (type === 'bow') addBow(head, 0.42, 1.35, 0);
  else if (type === 'chick') {
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(GEO.spike, toon(0xff4455));
      c.position.set((i - 1) * 0.12, 0.4, 0.02);
      c.scale.set(1, 1.15, 1);
      head.add(c);
    }
  } else if (type === 'mushroom') {
    const cap = new THREE.Mesh(GEO.mcap, MAT.vc);
    cap.position.y = 0.3;
    cap.scale.set(0.62, 0.55, 0.62);
    head.add(cap);
  } else if (type === 'beanie') {
    const cap = new THREE.Mesh(GEO.cap, toon(0x3a78c8));
    cap.position.y = 0.32;
    cap.scale.set(1.25, 1.35, 1.25);
    const band = new THREE.Mesh(GEO.hatband, toon(0xfff6ea));
    band.position.y = 0.2;
    band.scale.set(1.15, 1, 1.15);
    const pom = new THREE.Mesh(GEO.hand, MAT.white);
    pom.position.y = 0.52;
    pom.scale.setScalar(1.15);
    head.add(cap, band, pom);
  } else if (type === 'cat') {
    [-1, 1].forEach((side) => {
      const e = new THREE.Mesh(GEO.spike, toon(0x2f8a3a));
      e.position.set(side * 0.22, 0.36, 0);
      e.scale.set(1.2, 1.25, 0.7);
      e.rotation.z = side * -0.15;
      const inn = new THREE.Mesh(GEO.earIn, MAT.pink);
      inn.position.y = -0.02;
      e.add(inn);
      head.add(e);
    });
  }
}
function addHair(head, type) {
  if (type === 'fringe') {
    const f = new THREE.Mesh(GEO.belly, toon(0xfff6ea));
    f.position.set(0, 0.2, 0.28);
    f.scale.set(1.45, 0.38, 0.45);
    head.add(f);
  } else if (type === 'bow') addBow(head, 0.12, 0.65, 0.3);
  else if (type === 'buns') {
    [-1, 1].forEach((side) => {
      const bun = new THREE.Mesh(GEO.scoop, toon(0xff8ec4));
      bun.position.set(side * 0.32, 0.14, -0.06);
      bun.scale.setScalar(0.85);
      head.add(bun);
    });
  } else if (type === 'sprout') {
    const stem = new THREE.Mesh(GEO.stem, toon(0x2f8a3a));
    stem.position.y = 0.46;
    const l1 = new THREE.Mesh(GEO.leaf, toon(0x6ad85a));
    l1.position.set(-0.08, 0.56, 0);
    l1.rotation.z = 0.9;
    const l2 = l1.clone();
    l2.position.x = 0.08;
    l2.rotation.z = -0.9;
    head.add(stem, l1, l2);
  }
}
function makeDizzy(x) {
  const g = new THREE.Group();
  g.position.set(x, 0.05, 0.36);
  const a = new THREE.Mesh(GEO.xbar, MAT.eye);
  a.rotation.z = 0.75;
  const b = new THREE.Mesh(GEO.xbar, MAT.eye);
  b.rotation.z = -0.75;
  g.add(a, b);
  g.visible = false;
  return g;
}
function makeNameSprite(text) {
  const tex = canvasTex((g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,20,60,0.55)';
    roundRect(g, 8, 10, w - 16, h - 18, 16);
    g.fill();
    g.fillStyle = '#fff';
    g.font = 'bold 42px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2);
  }, 256, 64);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  spr.scale.set(1.7, 0.42, 1);
  spr.position.y = 1.85;
  return spr;
}
function buildRunners() {
  ROSTER.forEach((def, id) => {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    const skin = toon(def.color);
    const head = new THREE.Group();
    head.position.y = 1.18;
    body.add(head);
    head.add(new THREE.Mesh(GEO.head, skin));
    const whiteL = new THREE.Mesh(GEO.eyeWhite, MAT.white);
    whiteL.position.set(-0.14, 0.06, 0.3);
    const whiteR = new THREE.Mesh(GEO.eyeWhite, MAT.white);
    whiteR.position.set(0.14, 0.06, 0.3);
    const pupilL = new THREE.Mesh(GEO.pupil, MAT.eye);
    pupilL.position.set(-0.14, 0.04, 0.37);
    const pupilR = new THREE.Mesh(GEO.pupil, MAT.eye);
    pupilR.position.set(0.14, 0.04, 0.37);
    const glintL = new THREE.Mesh(GEO.glint, MAT.glint);
    glintL.position.set(-0.11, 0.08, 0.4);
    const glintR = new THREE.Mesh(GEO.glint, MAT.glint);
    glintR.position.set(0.17, 0.08, 0.4);
    head.add(whiteL, whiteR, pupilL, pupilR, glintL, glintR);
    const ckL = new THREE.Mesh(GEO.cheek, MAT.cheek);
    ckL.position.set(-0.24, -0.08, 0.28);
    ckL.scale.set(1.05, 0.7, 0.45);
    const ckR = new THREE.Mesh(GEO.cheek, MAT.cheek);
    ckR.position.set(0.24, -0.08, 0.28);
    ckR.scale.set(1.05, 0.7, 0.45);
    const smile = new THREE.Mesh(GEO.smile, MAT.mouth);
    smile.position.set(0, -0.14, 0.33);
    const mouthO = new THREE.Mesh(GEO.mouthO, MAT.mouth);
    mouthO.position.set(0, -0.13, 0.36);
    mouthO.scale.set(1, 1.15, 0.55);
    mouthO.visible = false;
    const dizzyL = makeDizzy(-0.14);
    const dizzyR = makeDizzy(0.14);
    const star = new THREE.Mesh(GEO.star, MAT.marker);
    star.position.set(0.32, 0.5, 0.05);
    star.visible = false;
    head.add(ckL, ckR, smile, mouthO, dizzyL, dizzyR, star);
    addHat(head, def.hat);
    addHair(head, def.hair);
    const torso = new THREE.Mesh(GEO.torso, skin);
    torso.position.y = 0.52;
    body.add(torso);
    const belly = new THREE.Mesh(GEO.belly, MAT.white);
    belly.position.set(0, 0.48, 0.18);
    body.add(belly);
    const back = new THREE.Mesh(GEO.belly, MAT.white);
    back.position.set(0, 0.5, -0.16);
    body.add(back);
    function pivotLimb(geo, y, x) {
      const pivot = new THREE.Group();
      pivot.position.set(x, y, 0);
      const m = new THREE.Mesh(geo, skin);
      m.position.y = -geo.parameters.height / 2;
      pivot.add(m);
      body.add(pivot);
      return pivot;
    }
    const armL = pivotLimb(GEO.arm, 0.62, -0.32);
    const armR = pivotLimb(GEO.arm, 0.62, 0.32);
    const legL = pivotLimb(GEO.leg, 0.34, -0.12);
    const legR = pivotLimb(GEO.leg, 0.34, 0.12);
    const handL = new THREE.Mesh(GEO.hand, skin);
    handL.position.y = -0.28;
    armL.add(handL);
    const handR = new THREE.Mesh(GEO.hand, skin);
    handR.position.y = -0.28;
    armR.add(handR);
    const shoeL = new THREE.Mesh(GEO.shoe, MAT.white);
    shoeL.position.set(0, -0.3, 0.05);
    shoeL.scale.set(1.05, 0.75, 1.25);
    legL.add(shoeL);
    const shoeR = new THREE.Mesh(GEO.shoe, MAT.white);
    shoeR.position.set(0, -0.3, 0.05);
    shoeR.scale.set(1.05, 0.75, 1.25);
    legR.add(shoeR);
    const sweat = new THREE.Mesh(GEO.sweat, MAT.sweat);
    sweat.position.set(0.22, 0.12, 0.28);
    sweat.visible = false;
    head.add(sweat);
    const lines = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ln = new THREE.Mesh(GEO.line, MAT.line);
      ln.position.set((i - 1.5) * 0.18, 0.55, -0.45);
      lines.add(ln);
    }
    lines.visible = false;
    root.add(lines);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(GEO.ring, ringMat);
    ring.visible = false;
    ring.position.y = 0.06;
    root.add(ring);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.65, depthWrite: false });
    const spark = new THREE.Mesh(GEO.spark, sparkMat);
    spark.visible = false;
    spark.position.y = 0.7;
    root.add(spark);
    let marker = null;
    if (def.player) {
      marker = new THREE.Mesh(GEO.marker, MAT.marker);
      marker.position.y = 2.05;
      marker.rotation.x = Math.PI;
      root.add(marker);
    } else {
      root.add(makeNameSprite(def.name));
    }
    scene.add(root);
    const profile = def.player ? null : {
      speedMul: def.speedMul, reaction: def.reaction, mistakeRate: def.mistakeRate,
      dashAggression: def.dashAggression, preferredLane: def.preferredLane,
      fork: def.fork || 'long',
    };
    const r = {
      id, name: def.name, hex: def.hex, isPlayer: !!def.player, profile, speedMul: def.speedMul,
      root, ring, spark, marker,
      parts: {
        body, armL, armR, legL, legR, sweat, lines,
        smile, mouthO, pupilL, pupilR, glintL, glintR, whiteL, whiteR, dizzyL, dizzyR, star,
      },
      brain: { dashT: 0, dashCd: 0.3 + id * 0.2, jumped: new Set(), dropped: false, honest: 0, falls: 0, knocks: 0, carefulSec: 0, forkAt: -1, forkChoice: null, forkFalls: 0 },
      s: 0, x: 0, y: 0, vs: 0, vx: 0, vy: 0,
      grounded: true, jumpsUsed: 0, dashGauge: 1,
      exhaustedT: 0, knockT: 0, boostT: 0, landDashT: 0, respawnT: 0,
      dashBuffer: 0, sinceLand: 1, boostCd: 0, springCd: 0,
      finished: false, finishTime: null, dnf: false, checkpointIndex: 0,
      phase: id, flipT: 0, ringT: 0, carrier: null, carryOff: 0, carryOffX: 0, carryOffS: 0, squashT: 0,
      steer: 0, dashHeld: false, jumpEdge: false, dashEdge: false, rank: id + 1,
    };
    runners.push(r);
    if (r.isPlayer) player = r;
  });
}
function resetRunner(r, s, x, air) {
  r.s = s; r.x = x; r.y = air ? 18 : 0;
  r.vs = 0; r.vx = 0; r.vy = 0;
  r.grounded = !air;
  r.jumpsUsed = air ? 2 : 0;
  r.dashGauge = 1;
  r.exhaustedT = 0; r.knockT = 0; r.boostT = 0; r.landDashT = 0; r.respawnT = 0;
  r.dashBuffer = 0; r.sinceLand = 1; r.boostCd = 0; r.springCd = 0;
  r.finished = false; r.finishTime = null; r.dnf = false;
  r.checkpointIndex = 0; r.phase = r.id; r.flipT = 0; r.ringT = 0;
  r.carrier = null; r.carryOff = 0; r.carryOffX = 0; r.carryOffS = 0; r.squashT = 0;
  r.steer = 0; r.dashHeld = false; r.jumpEdge = false; r.dashEdge = false;
  r.rank = r.id + 1;
  r.brain.dashT = 0;
  r.brain.dashCd = 0.4 + r.id * 0.15;
  r.brain.jumped = new Set();
  r.brain.dropped = false;
  r.brain.honest = 0;
  r.brain.falls = 0;
  r.brain.knocks = 0;
  r.brain.carefulSec = 0;
  r.brain.forkAt = -1;
  r.brain.forkChoice = null;
  r.brain.forkFalls = 0;
  r.brain.fallLog = [];
  r.brain.knockLog = [];
  r.brain.missed = {};
  r.brain.hammerSide = {};
  r.root.visible = true;
}
function placeMenu() {
  const xs = [-2.3, -1.15, 0, 1.15, 2.3, -1.7, 0.45, 1.75];
  runners.forEach((r, i) => {
    resetRunner(r, 10 + (i % 2) * 2.2, xs[i], false);
    r.speedMul = r.profile ? r.profile.speedMul : 1;
  });
}
function activeRunners() {
  if (mode === 'solo' && screen !== 'menu') return [player];
  return runners;
}
function poseOf(r) {
  if (screen === 'menu') return 'wave';
  if (screen === 'results' && mode === 'vs') return 'cheer';
  if (r.knockT > 0) return 'knock';
  if (!r.grounded) return 'air';
  if (r.exhaustedT > 0) return 'tired';
  if (r.dnf) return 'tired';
  if (r.finished && r.vs < 4.2) return 'cheer';
  if (r.vs > 0.45) return 'run';
  if (r.finished || screen === 'results') return 'cheer';
  return 'idle';
}
function applyPose(r, kind) {
  const p = r.parts;
  const t = worldT + menuT + resultsT;
  p.body.rotation.set(0, 0, 0);
  p.body.position.y = 0;
  p.armL.rotation.set(0, 0, 0);
  p.armR.rotation.set(0, 0, 0);
  p.legL.rotation.set(0, 0, 0);
  p.legR.rotation.set(0, 0, 0);
  p.sweat.visible = false;
  p.lines.visible = false;
  if (kind === 'knock') {
    const u = 1 - clamp(r.knockT / 0.9, 0, 1);
    if (u < 0.7) {
      p.body.rotation.x = -Math.PI * 0.92 * (u / 0.7);
      p.body.rotation.z = Math.sin(u * 22) * 0.45;
      p.body.position.y = Math.sin(u * Math.PI) * 0.22;
    } else {
      const w = (u - 0.7) / 0.3;
      p.body.rotation.x = -Math.PI * 0.92 * (1 - w);
    }
    p.legL.rotation.x = 0.5;
    p.legR.rotation.x = -0.4;
    return;
  }
  if (kind === 'air') {
    p.armL.rotation.z = 2.15;
    p.armR.rotation.z = -2.15;
    p.legL.rotation.x = -1.05;
    p.legR.rotation.x = -1.05;
    if (r.flipT > 0) p.body.rotation.x = (1 - r.flipT / 0.35) * Math.PI * 2;
    return;
  }
  if (kind === 'wave' || kind === 'cheer') {
    const s = Math.sin(t * (kind === 'cheer' ? 7 : 3.4) + r.id);
    p.armR.rotation.z = -2.15;
    p.armR.rotation.x = s * 0.45;
    p.armL.rotation.z = kind === 'cheer' ? 1.15 : 0.25;
    p.body.position.y = Math.abs(s) * 0.04;
    return;
  }
  if (kind === 'tired') {
    p.body.rotation.x = 0.5;
    p.body.rotation.z = Math.sin(t * 7 + r.id) * 0.08;
    const sw = Math.sin(t * 5) * 0.3;
    p.legL.rotation.x = sw;
    p.legR.rotation.x = -sw;
    p.armL.rotation.x = 0.7;
    p.armR.rotation.x = 0.7;
    p.sweat.visible = r.exhaustedT > 0;
    p.sweat.position.y = 0.2 - ((t * 1.3) % 1) * 0.45;
    return;
  }
  const fast = r.landDashT > 0 || r.boostT > 0 || (r.dashHeld && r.dashGauge > 0 && r.exhaustedT <= 0);
  const amp = fast ? 1.02 : 0.87;
  const sw = Math.sin(r.phase) * amp;
  p.legL.rotation.x = sw;
  p.legR.rotation.x = -sw;
  p.armL.rotation.x = -sw * 0.85;
  p.armR.rotation.x = sw * 0.85;
  p.armL.rotation.z = -0.7;
  p.armR.rotation.z = 0.7;
  p.body.position.y = Math.abs(Math.sin(r.phase)) * (fast ? 0.07 : 0.05);
  p.body.rotation.x = fast ? 0.42 : 0.08;
  p.body.rotation.z = clamp(-r.vx * 0.045, -0.3, 0.3);
  if (fast && r.grounded) {
    p.lines.visible = true;
    const ch = p.lines.children;
    for (let i = 0; i < ch.length; i++) {
      ch[i].position.z = -0.35 - ((t * (fast ? 9 : 4) + i * 0.23) % 1) * 0.9;
    }
  }
}
function applyFace(r, kind) {
  const p = r.parts;
  if (!p.smile) return;
  const excited = r.boostT > 0 || r.landDashT > 0 || (r.dashHeld && r.dashGauge > 0 && r.exhaustedT <= 0);
  const dizzy = kind === 'knock';
  p.smile.visible = !dizzy && !excited;
  p.mouthO.visible = !dizzy && excited;
  p.pupilL.visible = !dizzy;
  p.pupilR.visible = !dizzy;
  p.glintL.visible = !dizzy;
  p.glintR.visible = !dizzy;
  p.whiteL.visible = !dizzy;
  p.whiteR.visible = !dizzy;
  p.dizzyL.visible = dizzy;
  p.dizzyR.visible = dizzy;
  p.star.visible = dizzy;
  if (dizzy) {
    const t = worldT + menuT + resultsT;
    p.star.rotation.z = t * 9;
    p.star.rotation.y = t * 4;
  }
}
function applySquash(r, kind) {
  const b = r.parts.body;
  b.scale.set(1, 1, 1);
  if (kind === 'knock') return;
  if (kind === 'air') {
    if (r.vy > 1) b.scale.set(0.9, 1.14, 0.9);
    else if (r.vy < -1) b.scale.set(1.08, 0.86, 1.08);
    return;
  }
  if (kind === 'run' || kind === 'tired') {
    const s = 1 + Math.sin(r.phase * 2) * (kind === 'tired' ? 0.03 : 0.07);
    const xz = 1 / Math.sqrt(Math.max(0.55, s));
    b.scale.set(xz, s, xz);
  }
  if (r.squashT > 0) {
    const u = clamp(r.squashT / 0.16, 0, 1);
    b.scale.set(1 + 0.14 * u, 1 - 0.2 * u, 1 + 0.14 * u);
  }
}
function syncRunners(dt) {
  const list = runners;
  const soloHide = mode === 'solo' && screen !== 'menu';
  const podiumMode = screen === 'results' && mode === 'vs';
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (soloHide && !r.isPlayer && closeupId !== r.id) { r.root.visible = false; continue; }
    if (!podiumMode) {
      const yaw = clamp(r.vx * 0.055, -0.4, 0.4);
      toWorld(r.s, r.x, r.y, r.root.position);
      basisAt(r.s, yaw, vA, vB, vC);
      mA.makeBasis(vA, vB, vC);
      r.root.quaternion.setFromRotationMatrix(mA);
    }
    if (r.respawnT > 0) r.root.visible = Math.sin((worldT + menuT) * 28) > -0.15;
    else r.root.visible = true;
    const pose = poseOf(r);
    applyPose(r, pose);
    applySquash(r, pose);
    applyFace(r, pose);
    if (r.marker) {
      r.marker.position.y = 2.05 + Math.sin((worldT + menuT) * 4) * 0.08;
      r.marker.visible = screen !== 'results';
    }
    const tag = r.root.children.find((c) => c.isSprite);
    if (tag) {
      if (podiumMode) {
        tag.visible = r.rank >= 1 && r.rank <= 3;
        tag.position.y = 2.05;
      } else {
        const ds = player ? r.s - player.s : 8;
        tag.visible = ds > -0.5 && ds < 24;
        tag.position.y = 2.15;
      }
    }
    if (r.ringT > 0) {
      r.ringT -= dt;
      r.ring.visible = true;
      const u = 1 - clamp(r.ringT / 0.45, 0, 1);
      const sc = 0.55 + u * 1.7;
      r.ring.scale.set(sc, sc, sc);
      r.ring.material.opacity = Math.max(0, 0.95 - u);
      r.ring.material.color.set(r.boostT > 0 ? 0xffe14a : 0xfff6d0);
    } else r.ring.visible = false;
    r.spark.visible = r.respawnT > 0;
    if (r.respawnT > 0) {
      const u = 1 - r.respawnT / 2;
      r.spark.scale.setScalar(0.35 + u * 2.4);
      r.spark.material.opacity = 0.75 * (1 - u * 0.45);
    }
  }
}
function syncShadows() {
  if (!shadowMesh) return;
  const list = runners;
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (!r.root.visible && !(screen === 'results' && mode === 'vs')) {
      vD.set(0, -30, 0);
      qA.identity();
      setInst(shadowMesh, n++, vD, qA, 0.001, 0.001, 0.001);
      continue;
    }
    const gnd = queryGround(r.s, r.x);
    const o = sampleInto(r.s, S1);
    const sh = gnd ? gnd.h : (GROUND_Y - o.py);
    toWorld(r.s, r.x, sh + 0.05, vD);
    qA.identity();
    const lift = Math.max(0, r.y - (gnd ? gnd.h : 0));
    const sc = clamp(1.15 - lift * 0.04, 0.35, 1.35);
    setInst(shadowMesh, n++, vD, qA, sc, 1, sc);
  }
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (!b.alive) {
      vD.set(0, -30, 0);
      qA.identity();
      setInst(shadowMesh, n++, vD, qA, 0.001, 0.001, 0.001);
      continue;
    }
    toWorld(b.s, b.x, 0.06, vD);
    qA.identity();
    setInst(shadowMesh, n++, vD, qA, 1.8, 1, 1.8);
  }
  shadowMesh.instanceMatrix.needsUpdate = true;
}

/* =====================================================================
   PHYSICS
   ===================================================================== */
function profileOf(r) {
  if (r.isPlayer) return autopilot ? STRONG : null;
  return r.profile;
}
function exhaust(r) {
  if (r.exhaustedT > 0) return;
  r.exhaustedT = 1.5;
  r.dashGauge = 0;
  r.landDashT = 0;
  if (r.isPlayer) { toast('力竭！'); flashVignette(); sfx('exhaust'); }
}
function triggerLandDash(r) {
  if (r.exhaustedT > 0 || r.knockT > 0 || r.respawnT > 0 || r.finished) return;
  r.landDashT = 0.8;
  r.vs = Math.max(r.vs, 12.5);
  r.ringT = 0.45;
  if (r.isPlayer) { toast('完美著地！'); sfx('land'); }
}
function onLand(r) {
  r.jumpsUsed = 0;
  r.sinceLand = 0;
  r.flipT = 0;
  r.squashT = 0.16;
  const buffered = r.dashBuffer > 0;
  r.dashBuffer = 0;
  if (r.knockT > 0 || r.respawnT > 0 || r.finished) return;
  if (buffered && r.exhaustedT <= 0) { triggerLandDash(r); return; }
  const prof = profileOf(r);
  if (prof && r.exhaustedT <= 0) {
    if (rng() < (0.32 + prof.dashAggression * 0.5) * (1 - prof.mistakeRate)) triggerLandDash(r);
  }
}
function tryJump(r) {
  if (r.knockT > 0 || r.respawnT > 0 || r.finished || r.dnf) return;
  const tired = r.exhaustedT > 0;
  if (r.grounded) {
    r.vy = tired ? 4.2 : 9.5;
    r.grounded = false;
    r.jumpsUsed = tired ? 2 : 1;
    r.carrier = null;
    if (r.isPlayer) sfx('jump');
    return;
  }
  if (!tired && r.jumpsUsed < 2) {
    r.vy = 8.5;
    r.jumpsUsed = 2;
    r.flipT = 0.35;
    if (r.isPlayer) sfx('jump');
    return;
  }
  if (r.vy <= 0) r.vy = Math.max(-30, r.vy - 6);
}
function knock(r, push, why) {
  if (r.knockT > 0 || r.finished || r.dnf || r.respawnT > 0) return;
  r.knockT = 0.9;
  r.vs = 0;
  r.vx = (push || 0) * 4.5;
  r.landDashT = 0;
  if (r.brain) {
    r.brain.jumped.clear();
    r.brain.honest = (r.brain.honest || 0) + 1;
    r.brain.knocks = (r.brain.knocks || 0) + 1;
    if (screen === 'race') {
      if (!r.brain.knockLog) r.brain.knockLog = [];
      if (r.brain.knockLog.length < 8) r.brain.knockLog.push((why || '?') + '@' + Math.round(r.s));
    }
  }
  if (r.isPlayer) sfx('knock');
}
function doRespawn(r) {
  if (r.brain) {
    r.brain.falls = (r.brain.falls || 0) + 1;
    if (screen === 'race') {
      if (!r.brain.fallLog) r.brain.fallLog = [];
      if (r.brain.fallLog.length < 6) r.brain.fallLog.push(Math.round(r.s) + '@' + r.x.toFixed(1));
    }
    if (!r.isPlayer) r.brain.carefulSec = sectionAt(r.s);
    r.brain.jumped.clear();
  }
  const cp = checkpoints[r.checkpointIndex] || 0;
  let s = cp + 2.2 + (r.id % 3) * 0.7;
  if (s > trackLength - 8) s = cp;
  r.s = s;
  r.x = r.profile ? clamp(r.profile.preferredLane, -2.1, 2.1) : 0;
  r.y = 0;
  r.vs = 0; r.vx = 0; r.vy = 0;
  r.grounded = true;
  r.jumpsUsed = 0;
  r.knockT = 0;
  r.respawnT = 2;
  r.landDashT = 0;
  r.boostT = 0;
  r.carrier = null; r.carryOff = 0; r.carryOffX = 0; r.carryOffS = 0;
  if (r.brain) { r.brain.forkAt = -1; r.brain.forkChoice = null; }
  if (r.isPlayer) { toast('跌落！+2 秒'); sfx('respawn'); }
}
function looseLane(s) {
  return inGap(s) || !!narrowAt(s) || !!forkAt(s) || !!tileZoneAt(s);
}
function clampLane(r) {
  if (r.finished || r.dnf) return;
  if (!looseLane(r.s)) {
    const lim = W * 0.5 - 0.4;
    if (r.x > lim) { r.x = lim; if (r.vx > 0) r.vx = 0; }
    if (r.x < -lim) { r.x = -lim; if (r.vx < 0) r.vx = 0; }
  } else {
    if (r.x > 8) { r.x = 8; r.vx = 0; }
    if (r.x < -8) { r.x = -8; r.vx = 0; }
  }
}
function forkChoiceOf(r, f) {
  const prof = profileOf(r);
  let kind = 'long';
  const falls = r.brain ? (r.brain.falls || 0) : 0;
  if (prof && prof.fork === 'short' && falls < 1) kind = 'short';
  if (r.brain) {
    if (r.brain.forkAt === f.s0 && r.brain.forkChoice && r.brain.forkFalls === falls) return r.brain.forkChoice;
    r.brain.forkAt = f.s0;
    r.brain.forkChoice = kind;
    r.brain.forkFalls = falls;
  }
  return kind;
}
function railOne(r) {
  if (r.finished || r.dnf || r.respawnT > 0) return;
  const ai = !r.isPlayer || autopilot;
  if (!ai) return;
  const nar = narrowAt(r.s);
  if (nar) {
    const lim = Math.max(0.05, narrowHalfAt(nar, r.s) - 0.12);
    const cx = nar.x || 0;
    if (r.x > cx + lim) { r.x = cx + lim; if (r.vx > 0) r.vx = 0; }
    if (r.x < cx - lim) { r.x = cx - lim; if (r.vx < 0) r.vx = 0; }
  }
  const f = forkAt(r.s);
  if (f) {
    const band = forkBandGeom(f, r.s, forkChoiceOf(r, f));
    if (band) {
      const lim = Math.max(0.08, band.half - 0.12);
      if (r.x > band.x + lim) { r.x = band.x + lim; if (r.vx > 0) r.vx *= 0.2; }
      if (r.x < band.x - lim) { r.x = band.x - lim; if (r.vx < 0) r.vx *= 0.2; }
    }
  }
}
function railRunners() {
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) railOne(list[i]);
}
function applyForkWarp(r) {
  const f = forkAt(r.s);
  if (!f) return;
  if (r.s < f.sShortExit - 1.2 || r.s > f.sShortExit + 0.35) return;
  const sh = forkBandGeom(f, Math.min(r.s, f.sShortExit - 0.05), 'short');
  if (!sh) return;
  if (Math.abs(r.x - sh.x) <= sh.half + 0.25) {
    r.s = f.sMerge + 0.4;
    r.x = 0;
    r.vx = 0;
    r.carrier = null;
    r.carryOff = 0;
    r.carryOffX = 0;
    r.carryOffS = 0;
  }
}
function stepRunner(r, dt) {
  const jump = r.jumpEdge; r.jumpEdge = false;
  const dashE = r.dashEdge; r.dashEdge = false;
  if (r.dnf) { r.vs = 0; r.vx = 0; return; }
  if (r.finished) {
    const past = r.s - trackLength;
    const coast = 6.2;
    const slow = past < coast ? 3.0 * (1 - past / coast) : 0;
    r.vs += clamp(slow - r.vs, -7 * dt, 10 * dt);
    if (r.vs < 0.05) r.vs = 0;
    r.s += r.vs * dt;
    r.x *= Math.max(0, 1 - dt * 1.4);
    r.vx = 0; r.y = 0; r.vy = 0; r.grounded = true;
    if (r.vs > 0.4) r.phase += dt * (6 + r.vs);
    return;
  }
  if (r.respawnT > 0) {
    r.respawnT -= dt;
    r.vs = 0; r.vx = 0; r.vy = 0;
    r.grounded = true; r.y = 0;
    return;
  }
  if (r.exhaustedT > 0) r.exhaustedT -= dt;
  if (r.knockT > 0) r.knockT -= dt;
  if (r.boostT > 0) r.boostT -= dt;
  if (r.landDashT > 0) r.landDashT -= dt;
  if (r.dashBuffer > 0) r.dashBuffer -= dt;
  if (r.boostCd > 0) r.boostCd -= dt;
  if (r.springCd > 0) r.springCd -= dt;
  if (r.squashT > 0) r.squashT -= dt;
  r.sinceLand += dt;

  if (dashE) {
    let usedLand = false;
    if (!r.grounded) r.dashBuffer = 0.15;
    else if (r.sinceLand <= 0.15 && r.knockT <= 0 && r.exhaustedT <= 0) {
      triggerLandDash(r);
      usedLand = true;
    }
    if (!usedLand && r.dashGauge <= 0 && r.exhaustedT <= 0 && r.landDashT <= 0 && r.knockT <= 0) exhaust(r);
  }
  if (jump) tryJump(r);

  const racing = screen === 'race';
  if (r.exhaustedT > 0) {
    /* gauge stays empty until the penalty ends and dash is released */
  } else if (r.dashHeld && r.knockT <= 0 && r.landDashT <= 0) {
    if (r.dashGauge > 0) {
      r.dashGauge -= 0.33 * dt;
      if (r.dashGauge <= 0) exhaust(r);
    }
  } else {
    const regen = 0.08 * (1 + 0.25 * ((r.rank || 1) - 1));
    r.dashGauge = Math.min(1, r.dashGauge + regen * dt);
  }

  let target = 8 * r.speedMul;
  const dashing = r.dashHeld && r.exhaustedT <= 0 && r.dashGauge > 0 && r.knockT <= 0;
  if (!racing || r.knockT > 0) target = 0;
  else if (r.exhaustedT > 0) target = 4 * Math.min(1, r.speedMul);
  else if (r.boostT > 0) target = 14;
  else if (r.landDashT > 0) target = 12.5;
  else if (dashing) target = 11.5;
  // Mild catch-up for AI well behind the leader. Never applied to the player.
  // Keep the pack inside the 10s finish window. Never applied to the player.
  if (racing && target > 0 && !r.isPlayer && packLeadS - r.s > 15) {
    const u = clamp((packLeadS - r.s - 15) / 70, 0, 1);
    let mul = 1.1 + 0.05 * u;
    const hazardRoad = inGap(r.s) || !!narrowAt(r.s) || !!forkAt(r.s) || !!tileZoneAt(r.s);
    if (!hazardRoad && packLeadS - r.s > 40) mul += mapDef.id === 'snow' ? 0.1 : 0.04;
    target *= mul;
  }
  r.vs += clamp(target - r.vs, -12 * dt, 12 * dt);
  if (r.vs < 0) r.vs = 0;

  if (r.knockT > 0) r.vx *= Math.max(0, 1 - 6 * dt);
  else {
    const want = clamp(r.steer || 0, -1, 1) * 6;
    r.vx += clamp(want - r.vx, -30 * dt, 30 * dt);
  }
  r.s += r.vs * dt;
  r.x += r.vx * dt;
  if (r.s < 0) { r.s = 0; r.vs = 0; }
  clampLane(r);
  railOne(r);

  const prevY = r.y;
  if (r.grounded && r.carrier) {
    const ox = r.carrier.offX || 0;
    const os = r.carrier.offS || 0;
    r.x += ox - (r.carryOffX || 0);
    r.s += os - (r.carryOffS || 0);
    r.carryOff = ox;
    r.carryOffX = ox;
    r.carryOffS = os;
  }
  if (r.grounded) {
    const g = queryGround(r.s, r.x);
    if (g && Math.abs(r.y - g.h) < 1.6) {
      r.y = g.h; r.vy = 0; r.carrier = g.carrier;
      r.carryOff = g.carrier ? (g.carrier.offX || 0) : 0;
      r.carryOffX = r.carryOff;
      r.carryOffS = g.carrier ? (g.carrier.offS || 0) : 0;
    } else {
      r.grounded = false; r.carrier = null;
    }
  }
  if (!r.grounded) {
    r.vy += GRAV * dt;
    if (r.vy < -30) r.vy = -30;
    r.y += r.vy * dt;
    const g = queryGround(r.s, r.x);
    if (g && prevY >= g.h - 0.25 && r.y <= g.h + 0.08 && r.vy <= 0.02) {
      r.y = g.h; r.vy = 0; r.grounded = true; r.carrier = g.carrier;
      r.carryOff = g.carrier ? (g.carrier.offX || 0) : 0;
      r.carryOffX = r.carryOff;
      r.carryOffS = g.carrier ? (g.carrier.offS || 0) : 0;
      onLand(r);
    }
  }
  if (r.grounded && r.knockT <= 0 && r.vs > 0.3) r.phase += dt * (7 + r.vs * 1.15);

  applyForkWarp(r);
  if (r.y < -6) doRespawn(r);
  if (racing && !r.finished && r.s >= trackLength) {
    r.finished = true;
    r.finishTime = raceTime;
    r.dnf = false;
    if (r.isPlayer) sfx('goal');
  }
}
function collideRunners() {
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (a.respawnT > 0 || b.respawnT > 0 || a.dnf || b.dnf) continue;
      // A stunned runner is not a wall. An idle player bouncing on a hurdle
      // must not pin the rest of the pack in place.
      if (a.knockT > 0 || b.knockT > 0) continue;
      const ds = b.s - a.s;
      const dx = b.x - a.x;
      const dist = Math.hypot(ds, dx) || 0.0001;
      if (dist >= 0.9) continue;
      const overlap = 0.9 - dist;
      const nx = dx / dist;
      const ns = ds / dist;
      const lat = Math.abs(nx) < 0.15 ? (a.x <= b.x ? -1 : 1) : Math.sign(nx);
      a.x -= lat * overlap * 0.55;
      b.x += lat * overlap * 0.55;
      a.s -= ns * overlap * 0.12;
      b.s += ns * overlap * 0.12;
      if (a.vs > b.vs + 0.35 && a.s <= b.s + 0.2) {
        b.vx += (b.x >= a.x ? 1 : -1) * 2.4;
        const mix = 0.06;
        const av = a.vs, bv = b.vs;
        a.vs = av * (1 - mix) + bv * mix;
        b.vs = bv * (1 - mix) + av * mix;
      } else if (b.vs > a.vs + 0.35 && b.s <= a.s + 0.2) {
        a.vx += (a.x >= b.x ? 1 : -1) * 2.4;
        const mix = 0.06;
        const av = a.vs, bv = b.vs;
        a.vs = av * (1 - mix) + bv * mix;
        b.vs = bv * (1 - mix) + av * mix;
      }
      clampLane(a); clampLane(b);
    }
  }
}
function gapNear(s) {
  let best = null;
  let bestD = 1e9;
  for (let i = 0; i < gaps.length; i++) {
    const g = gaps[i];
    let d = 0;
    if (s < g.s0) d = g.s0 - s;
    else if (s > g.s1) d = s - g.s1;
    if (d < bestD) { bestD = d; best = g; }
  }
  return best;
}
function supportFar(r) {
  const g = gapNear(r.s);
  if (!g) return trackLength;
  if (r.s <= g.s0) return g.s0;
  if (r.s >= g.s1) return trackLength;
  let edge = r.s;
  if (r.carrier && r.carrier.solid !== false && r.carrier.half) edge = Math.max(edge, blockS(r.carrier) + r.carrier.half);
  for (let n = 0; n < 8; n++) {
    let next = edge;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b.solid) continue;
      const bx = blockX(b);
      if (Math.abs(bx - r.x) > b.half + 0.08) continue;
      const bs = blockS(b);
      const near = bs - b.half;
      const far = bs + b.half;
      if (near <= edge + 0.4 && far > next) next = far;
    }
    if (next <= edge + 0.02) break;
    edge = next;
  }
  return edge;
}
function hazards() {
  const list = activeRunners();
  for (let ri = 0; ri < list.length; ri++) {
    const r = list[ri];
    if (r.finished || r.dnf || r.respawnT > 0) continue;
    if (r.knockT <= 0 && r.y < 0.9) {
      for (let i = 0; i < hurdles.length; i++) {
        const h = hurdles[i];
        if (h.s < r.s - 1 || h.s > r.s + 1) continue;
        if (Math.abs(r.s - h.s) < 0.36 && Math.abs(r.x - h.x) < h.half) {
          knock(r, 0, 'hurdle');
          r.s = h.s - 2.4;
          break;
        }
      }
    }
    if (r.knockT <= 0 && r.y < 2.45) {
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (Math.abs(r.s - w.s) < 0.42 && Math.abs(r.x) < W * 0.5) {
          knock(r, 0, 'wall');
          let back = w.s - 0.8;
          for (let k = 0; k < springs.length; k++) {
            const sp = springs[k];
            if (sp.s < w.s && w.s - sp.s < 12) back = Math.min(back, sp.s - 1.4);
          }
          r.s = back;
          r.vs = 0;
          break;
        }
      }
    }
    if (r.knockT <= 0) {
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (!b.alive) continue;
        if (Math.abs(r.s - b.s) < 1.65 && Math.abs(r.x - b.x) < 1.45 && r.y < 2.35) {
          knock(r, Math.sign(r.x - b.x) || 1, 'ball');
          break;
        }
      }
    }
    if (r.knockT <= 0) {
      for (let i = 0; i < hammers.length; i++) {
        const h = hammers[i];
        if (Math.abs(r.s - h.s) < 0.72 && Math.abs(r.x - h.headX) < 1.05 && h.headY < 1.88 && r.y < h.headY + 0.5) {
          const dir = Math.cos(worldT * h.omega + h.phase) >= 0 ? 1 : -1;
          knock(r, dir, 'hammer');
          break;
        }
      }
    }
    if (r.knockT <= 0) {
      for (let i = 0; i < rotors.length; i++) {
        const rot = rotors[i];
        if (Math.abs(r.s - rot.s) > 0.55) continue;
        const th = rot.angle;
        const px = r.x - rot.x;
        const py = (r.y + 0.72) - rot.pivotY;
        const dist = px * Math.sin(th) + py * Math.cos(th);
        const along = -px * Math.cos(th) + py * Math.sin(th);
        if (Math.abs(dist) < 0.36 && Math.abs(along) < rot.halfLen + 0.05) {
          knock(r, Math.sign(px) || 1, 'rotor');
          r.s = rot.s - 3.2;
          break;
        }
      }
    }
    if (r.grounded && r.boostCd <= 0 && r.knockT <= 0) {
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        if (Math.abs(r.s - p.s) < p.hs && Math.abs(r.x - p.x) < p.hx) {
          r.boostT = 1.2;
          r.vs = Math.max(r.vs, 14);
          r.boostCd = 1;
          r.ringT = Math.max(r.ringT, 0.35);
          if (r.isPlayer) { toast('加速！'); sfx('boost'); }
          break;
        }
      }
    }
    if (r.grounded && r.springCd <= 0 && r.knockT <= 0) {
      for (let i = 0; i < springs.length; i++) {
        const sp = springs[i];
        if (Math.abs(r.s - sp.s) < 0.85 && Math.abs(r.x - sp.x) < 1.45) {
          r.vy = 13;
          r.grounded = false;
          r.jumpsUsed = 1;
          r.vs = Math.max(r.vs, 12);
          r.boostT = Math.max(r.boostT, 0.45);
          r.springCd = 0.7;
          sp.squash = 1;
          if (r.isPlayer) sfx('spring');
          break;
        }
      }
    }
    for (let i = r.checkpointIndex + 1; i < checkpoints.length; i++) {
      if (r.s >= checkpoints[i]) {
        r.checkpointIndex = i;
        if (r.isPlayer) { toast('檢查點'); sfx('cp'); }
      }
    }
  }
  for (let i = 0; i < springs.length; i++) {
    if (springs[i].squash > 0) {
      springs[i].squash = Math.max(0, springs[i].squash - 0.05);
      const sc = 1 - springs[i].squash * 0.35;
      springs[i].coil.scale.set(1, sc, 1);
    }
  }
}
function updatePackLead() {
  let lead = 0;
  for (let i = 0; i < runners.length; i++) {
    if (!runners[i].dnf && runners[i].s > lead) lead = runners[i].s;
  }
  packLeadS = lead;
}
function computeRanks() {
  rankBuf.length = 0;
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) rankBuf.push(list[i]);
  rankBuf.sort((a, b) => {
    const af = a.finished && !a.dnf;
    const bf = b.finished && !b.dnf;
    if (af && bf) return a.finishTime - b.finishTime;
    if (af) return -1;
    if (bf) return 1;
    return b.s - a.s;
  });
  for (let i = 0; i < rankBuf.length; i++) rankBuf[i].rank = i + 1;
}

/* =====================================================================
   AI
   ===================================================================== */
function thinkMovingGap(r, g0, g1, setT, prof) {
  const far = supportFar(r);
  const distEdge = far - r.s;
  const lanes = [-2.15, 0, 2.15];
  const pred = (b) => motionAt(b, worldT + Math.max(0, (b.s - r.s) / Math.max(4.5, r.vs)));
  const covered = (s, x) => {
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const o = pred(b);
      if (!o.solid) continue;
      if (Math.abs(b.s + o.offS - s) <= b.half && Math.abs(b.x + o.offX - x) <= b.half) return true;
    }
    return false;
  };
  const hereFull = lanes.every((x) => covered(r.s + 0.2, x));
  let aim = null;
  let aimScore = 1e9;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const o = pred(b);
    if (!o.solid) continue;
    const near = b.s + o.offS - b.half;
    if (near < far + 0.35 || near > far + 3.6) continue;
    const bx = b.x + o.offX;
    const reach = hereFull ? 4 : 2.4;
    if (Math.abs(bx - r.x) > reach) continue;
    let score = Math.abs(bx - r.x);
    if (o.flash || b.kind === 'vanish') score += 3;
    if (b.kind === 'moveX') score += 0.35;
    if (score < aimScore) { aimScore = score; aim = bx; }
  }
  const hangS = r.s + Math.max(2.4, r.vs * 0.5);
  const landT = worldT + Math.max(0.2, (hangS - r.s) / Math.max(4.5, r.vs));
  const landOk = (x) => {
    if ((hangS <= g0 + 0.15 || hangS >= g1 - 0.2) && Math.abs(x) <= 3.05) return true;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const o = motionAt(b, landT);
      if (!o.solid || o.flash) continue;
      if (Math.abs(b.s + o.offS - hangS) > b.half + 0.15) continue;
      if (Math.abs(b.x + o.offX - x) <= b.half) return true;
    }
    return false;
  };
  if (aim == null || !landOk(aim)) {
    const lanes2 = [-2.15, 0, 2.15];
    let bestX = null;
    let bestD = 1e9;
    for (let li = 0; li < lanes2.length; li++) {
      if (!landOk(lanes2[li])) continue;
      const d = Math.abs(lanes2[li] - r.x);
      if (d < bestD) { bestD = d; bestX = lanes2[li]; }
    }
    if (bestX != null) aim = bestX;
  }
  const falls = r.brain.falls || 0;
  const edge = Math.floor(far);
  if (!r.brain.missed) r.brain.missed = {};
  const depth = clamp((far - g0) / Math.max(1, g1 - g0), 0, 1);
  const gapP = (falls >= 1 || depth > 0.35) ? 0 : aiMistakeRate(r) * 0.35;
  const mistake = hash01(r.id + 9 + falls * 19 + (r.brain.honest || 0), edge) < gapP;
  if (mistake) r.brain.missed[edge] = 1;
  if (aim == null && r.s > g1 - 16) aim = 0;
  if (aim == null) aim = r.x;
  const key = Math.floor(far);
  if (distEdge > 3.2) r.brain.jumped.delete(key);
  const maxEdge = Math.min(2.15, Math.max(1.0, r.vs * 0.5 - 0.7));
  const inWindow = distEdge < maxEdge && distEdge > 0.2;
  const hopKey = key + 10000;
  const lateHop = distEdge < 0.75 && distEdge > 0.1 && !mistake && !r.brain.jumped.has(hopKey) && landOk(aim);
  const jump = !mistake && landOk(aim) && ((inWindow && !r.brain.jumped.has(key)) || lateHop);
  if (inWindow && landOk(aim)) r.brain.jumped.add(key);
  if (lateHop) r.brain.jumped.add(hopKey);
  setT(6, aim, jump);
}
function aiMistakeRate(r) {
  let m = r.profile ? r.profile.mistakeRate : 0;
  if (r.brain && r.brain.carefulSec === sectionAt(r.s)) m *= 0.5;
  return m;
}
function thinkAI(r, dt) {
  const prof = profileOf(r);
  if (!prof) return;
  if (screen === 'countdown') {
    r.steer = clamp((prof.preferredLane * 0.25 - r.x) / 3, -1, 1);
    r.dashHeld = false;
    return;
  }
  if (r.respawnT > 0 || r.knockT > 0 || r.finished || r.dnf) {
    r.steer = 0; r.dashHeld = false;
    return;
  }
  let targetX = prof.preferredLane + Math.sin(worldT * 0.33 + r.id * 2.2) * 0.55;
  let wantJump = false;
  let pri = 1;
  const setT = (p, x, jump) => {
    if (p >= pri) { pri = p; targetX = x; if (jump) wantJump = true; }
  };
  // don't bunch
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (o === r || o.respawnT > 0) continue;
    const ds = o.s - r.s;
    if (ds > -0.2 && ds < 2.6 && Math.abs(o.x - r.x) < 0.75) {
      setT(2, r.x + (r.x >= o.x ? 1.25 : -1.25), false);
    }
  }
  const gAp = gaps.length ? gaps[0] : null;
  const GAP0 = gAp ? gAp.s0 : 1e9;
  const GAP1 = gAp ? gAp.s1 : -1;
  // hurdles
  if (r.s > 118 && r.s < GAP0 - 6) {
    for (let i = 0; i < hurdleRows.length; i++) {
      const row = hurdleRows[i];
      const ds = row.s - r.s;
      if (ds < 0.3 || ds > 14) continue;
      if (row.gaps.length) {
        let gx = [-2.625, -0.875, 0.875, 2.625][row.gaps[0]];
        for (let g = 0; g < row.gaps.length; g++) {
          const x = [-2.625, -0.875, 0.875, 2.625][row.gaps[g]];
          if (Math.abs(x - r.x) < Math.abs(gx - r.x)) gx = x;
        }
        if (hash01(r.id + 5 + (r.brain.honest || 0), row.s) < aiMistakeRate(r)) gx = -gx;
        const slide = Math.abs(gx - r.x);
        if (slide < ds * 0.85 + 0.35) setT(5, gx, false);
        else if (ds < Math.max(2.2, r.vs * 0.38) && !r.brain.jumped.has(row.s)) {
          r.brain.jumped.add(row.s);
          setT(5, r.x, true);
        } else setT(5, gx, false);
      } else {
        const ideal = Math.max(2.15, r.vs * 0.4);
        let trigger = ideal - prof.reaction * r.vs * 0.85;
        // Stay near the top of the jump as the bar passes. A big reaction
        // used to drop the trigger so far that slow runners landed on the bar.
        const hang = Math.max(2.05, r.vs * 0.32);
        if (trigger < hang) trigger = hang;
        if (hash01(r.id + 3 + (r.brain.honest || 0), row.s) < aiMistakeRate(r)) trigger *= 0.28;
        if (ds < trigger && !r.brain.jumped.has(row.s)) {
          wantJump = true;
          r.brain.jumped.add(row.s);
          pri = Math.max(pri, 5);
        }
      }
      break;
    }
  }
  // blocks: steer onto a lane, jump near the lip of the current deck
  if (mapDef.blockStyle !== 'forest' && gAp && r.s > GAP0 - 18 && r.s < GAP1 + 2) {
    thinkMovingGap(r, GAP0, GAP1, setT, prof);
  } else if (r.s > GAP0 - 18 && r.s < GAP1 + 2) {
    const far = supportFar(r);
    const distEdge = far - r.s;
    const lanes = [-2.15, 0, 2.15];
    const covered = (s, x) => {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (!b.solid) continue;
        if (Math.abs(b.s - s) <= b.half && Math.abs(b.x + b.offX - x) <= b.half) return true;
      }
      return false;
    };
    const hereFull = lanes.every((x) => covered(r.s + 0.2, x));
    let aim = null;
    let aimScore = 1e9;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b.solid) continue;
      const near = b.s - b.half;
      if (near < far + 0.45 || near > far + 3.4) continue;
      const bx = b.x + b.offX;
      if (!hereFull && Math.abs(bx - r.x) > 1.25) continue;
      let score = Math.abs(bx - r.x) + (hereFull ? Math.abs(bx - prof.preferredLane) * 0.35 : 0);
      if (b.kind === 'vanish') score += 4;
      if (score < aimScore) { aimScore = score; aim = bx; }
    }
    const falls = r.brain.falls || 0;
    const edge = Math.floor(far);
    if (!r.brain.missed) r.brain.missed = {};
    let seenFall = falls >= 2 || !!r.brain.missed[edge];
    const flog = r.brain.fallLog;
    if (flog) for (let k = 0; k < flog.length; k++) if (Math.abs(flog[k] - far) < 18) seenFall = true;
    const depth = clamp((far - GAP0) / (GAP1 - GAP0), 0, 1);
    const gapP = (seenFall || depth > 0.55) ? 0 : aiMistakeRate(r) * 0.85;
    const mistake = hash01(r.id + 9 + falls * 19 + (r.brain.honest || 0), edge) < gapP;
    if (mistake) r.brain.missed[edge] = 1;
    if (aim == null && r.s > GAP1 - 16) aim = 0;
    if (aim == null) aim = r.x;
    {
      const key = Math.floor(far);
      if (distEdge > 3.2) r.brain.jumped.delete(key);
      const maxEdge = Math.min(2.05, Math.max(0.9, r.vs * 0.52 - 0.85));
      const inWindow = distEdge < maxEdge && distEdge > 0.22;
      const hopKey = key + 10000;
      const lateHop = distEdge < 0.7 && distEdge > 0.12 && !mistake && !r.brain.jumped.has(hopKey);
      const jump = !mistake && ((inWindow && !r.brain.jumped.has(key)) || lateHop);
      if (inWindow) r.brain.jumped.add(key);
      if (lateHop) r.brain.jumped.add(hopKey);
      setT(6, aim, jump);
    }
  }
  let tileLook = false;
  for (let i = 0; i < tileZones.length; i++) {
    const z = tileZones[i];
    if (r.s > z.s0 - 12 && r.s < z.s1 + 1) tileLook = true;
  }
  if (tileLook) {
    const lanes = [-2.2, 0, 2.2];
    let bestLane = r.x;
    let bestScore = 1e9;
    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];
      let score = Math.abs(lane - r.x) * 0.35;
      for (let ti = 0; ti < tiles.length; ti++) {
        const tile = tiles[ti];
        if (!tile.zone) continue;
        const ds = tile.s - r.s;
        if (ds < -0.8 || ds > 9) continue;
        if (Math.abs(tile.x - lane) > (tile.half || 1) + 0.05) continue;
        const fut = tileMotion(tile, worldT + ds / Math.max(4.5, r.vs));
        if (!fut.solid) score += 30;
        else if (fut.flash) score += 6;
      }
      if (score < bestScore) { bestScore = score; bestLane = lane; }
    }
    let jump = false;
    for (let ti = 0; ti < tiles.length; ti++) {
      const tile = tiles[ti];
      const ds = tile.s - r.s;
      if (ds < -0.2 || ds > 2.8) continue;
      if (Math.abs(tile.x - r.x) > (tile.half || 1) + 0.15) continue;
      const fut = tileMotion(tile, worldT + Math.max(0, ds) / Math.max(4.5, r.vs));
      if (fut.flash || !fut.solid) {
        const key = 200000 + ti;
        if (!r.brain.jumped.has(key)) { r.brain.jumped.add(key); jump = true; }
      }
    }
    setT(7, bestLane, jump);
  }
  for (let fi = 0; fi < forks.length; fi++) {
    const f = forks[fi];
    if (r.s < f.s0 - 14 || r.s >= f.sMerge) continue;
    const kind = forkChoiceOf(r, f);
    const lookS = clamp(Math.max(r.s, f.s0 + 0.4), f.s0, f.sMerge - 0.3);
    let band = forkBandGeom(f, lookS, kind);
    if (!band) band = forkBandGeom(f, Math.min(f.s0 + (f.diverge || 18), (kind === 'short' ? f.sShortExit : f.sMerge) - 0.3), kind);
    if (band) setT(7, band.x, false);
  }
  let rotorNear = false;
  for (let i = 0; i < rotors.length; i++) {
    const rot = rotors[i];
    const ds = rot.s - r.s;
    if (ds > -1 && ds < 8) rotorNear = true;
    if (ds < 0.2 || ds > 14) continue;
    if (rot.short) {
      let f = null;
      for (let k = 0; k < forks.length; k++) {
        if (r.s > forks[k].s0 - 16 && r.s < forks[k].sMerge) f = forks[k];
      }
      if (!f || forkChoiceOf(r, f) !== 'short') continue;
    }
    const tArr = ds / Math.max(5, r.vs);
    const ang = (worldT + tArr) * rot.omega + rot.phase;
    const dangerous = Math.abs(Math.cos(ang)) > 0.55;
    const key = 300000 + Math.round(rot.s * 10);
    if (ds > 6) r.brain.jumped.delete(key);
    if (dangerous) {
      const trigger = Math.max(2.1, r.vs * 0.32);
      if (ds < trigger && r.vs > 5.2 && !r.brain.jumped.has(key)) {
        r.brain.jumped.add(key);
        setT(8, rot.x, true);
      } else setT(8, rot.x, false);
    } else {
      const side = (r.id % 2 === 0 ? 0.74 : -0.74);
      setT(8, rot.x + side, false);
    }
  }
  if (!rotorNear) {
    let nar = null;
    for (let i = 0; i < narrows.length; i++) {
      const n = narrows[i];
      if (r.s >= n.s0 - 18 && r.s <= n.s1) nar = n;
    }
    // A hurdle still ahead of the bridge outranks the early center-line.
    // Otherwise the bridge aim pulls a runner out of a side gap and into the bar.
    let hurdleBefore = false;
    if (nar) {
      for (let i = 0; i < hurdleRows.length; i++) {
        const row = hurdleRows[i];
        const ds = row.s - r.s;
        if (ds > 0.15 && ds < 16 && row.s < nar.s0 + 0.5) hurdleBefore = true;
      }
    }
    if (nar && !hurdleBefore) setT(9, nar.x || 0, false);
  }
  // hammers — latch a side so the swing doesn't make them weave into the head
  for (let i = 0; i < hammers.length; i++) {
    const h = hammers[i];
    const ds = h.s - r.s;
    if (ds <= 0 || ds > 16) continue;
    if (!r.brain.hammerSide) r.brain.hammerSide = {};
    const key = h.s;
    if (r.brain.hammerSide[key] == null && ds < 13) {
      const tArr = ds / Math.max(5, r.vs);
      const A = Math.sin((worldT + tArr) * h.omega + h.phase) * h.amp;
      const hx = -Math.sin(A) * h.len;
      r.brain.hammerSide[key] = hx >= 0 ? -2.45 : 2.45;
    }
    if (r.brain.hammerSide[key] != null) setT(8, r.brain.hammerSide[key], false);
  }
  // springs
  for (let i = 0; i < springs.length; i++) {
    const sp = springs[i];
    const ds = sp.s - r.s;
    if (ds > 0 && ds < 16) setT(9, sp.x, false);
  }
  // balls — clearest lane, spread by id. A close ball outranks hammers and springs.
  {
    const lanes = [-2.55, 0, 2.55];
    let threatS = 0;
    let best = r.x;
    let bestScore = -1e9;
    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];
      let score = 0;
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (!b.alive) continue;
        const ds = b.s - r.s;
        if (ds <= 0.3 || ds > 30) continue;
        if (!threatS || b.s < threatS) threatS = b.s;
        const dx = Math.abs(lane - b.x);
        const soon = clamp(1 - ds / 30, 0, 1);
        score += dx + (dx < 1.7 ? -8 * soon : 0);
      }
      const prefer = lanes[(r.id + 1) % 3];
      if (Math.abs(lane - prefer) < 0.1) score += 0.35;
      if (score > bestScore) { bestScore = score; best = lane; }
    }
    if (threatS) {
      const soonest = threatS - r.s;
      let springDs = 1e9;
      for (let i = 0; i < springs.length; i++) {
        const ds = springs[i].s - r.s;
        if (ds > 0 && ds < springDs) springDs = ds;
      }
      const late = hash01(r.id + 11 + (r.brain.knocks || 0), Math.floor(threatS)) < aiMistakeRate(r) * 0.85;
      const ballFirst = soonest < springDs - 0.4;
      if (!late) setT(ballFirst && soonest < 14 ? 10 : 7, best, false);
    }
  }
  if (r.grounded && r.carrier && r.carrier.kind === 'vanish' && r.carrier.flash) {
    targetX = r.x >= 0 ? -2.15 : 2.15;
  }
  r.steer = clamp((targetX - r.x) / 1.3, -1, 1);
  if (wantJump) r.jumpEdge = true;

  // dash on straights
  const sec = sectionAt(r.s);
  const ballClose = balls.some((b) => b.alive && b.s > r.s && b.s - r.s < 16 && Math.abs(b.x - r.x) < 2);
  let safe = (sec === 1 && r.s > 18) || (sec === 4 && !ballClose && r.s < trackLength - 28) || (sec === 4 && r.s > trackLength - 16);
  if (mapDef.id !== 'forest') {
    let hazard = inGap(r.s) || !!narrowAt(r.s) || !!forkAt(r.s) || !!tileZoneAt(r.s) || ballClose;
    if (!hazard) {
      for (let i = 0; i < hurdleRows.length; i++) {
        const ds = hurdleRows[i].s - r.s;
        if (ds > 0 && ds < 14) hazard = true;
      }
    }
    if (!hazard) {
      for (let i = 0; i < rotors.length; i++) {
        const ds = rotors[i].s - r.s;
        if (ds > -1 && ds < 14) hazard = true;
      }
    }
    if (!hazard) {
      for (let i = 0; i < hammers.length; i++) {
        const ds = hammers[i].s - r.s;
        if (ds > 0 && ds < 14) hazard = true;
      }
    }
    safe = r.s > 18 && !hazard && r.s < trackLength - 18;
  }
  if (r.brain.dashT > 0) {
    r.brain.dashT -= dt;
    r.dashHeld = true;
  } else {
    r.dashHeld = false;
    r.brain.dashCd -= dt;
    if (r.brain.dashCd <= 0 && safe && r.dashGauge > 0.4 && r.exhaustedT <= 0) {
      if (rng() < prof.dashAggression) r.brain.dashT = 0.7 + rng() * 0.5;
      r.brain.dashCd = 1.3 + rng() * 0.8;
    }
  }
}

/* =====================================================================
   CAMERA
   ===================================================================== */
function updateCamera(dt) {
  if (!camera) return;
  if (closeupId != null && runners[closeupId]) {
    const r = runners[closeupId];
    const portraitCU = (camera.aspect || 1) < 1;
    if (screen === 'results' && mode === 'vs') {
      const yaw = r.root.rotation.y;
      vC.copy(r.root.position);
      vA.set(vC.x + Math.sin(yaw) * 2.35, vC.y + 1.22, vC.z + Math.cos(yaw) * 2.35);
      vD.set(vC.x, vC.y + 1.15, vC.z);
    } else {
      toWorld(r.s, r.x, r.y + 1.15, vC);
      const o = sampleInto(r.s, S1);
      vA.set(vC.x + o.tx * 2.45 + o.rx * 0.12, vC.y + 0.18, vC.z + o.tz * 2.45 + o.rz * 0.12);
      vD.set(vC.x, vC.y, vC.z);
    }
    camera.position.copy(vA);
    camera.lookAt(vD);
    camera.fov = portraitCU ? 34 : 30;
    camera.updateProjectionMatrix();
    camSnap = false;
    return;
  }
  const aspect = camera.aspect || 1;
  const portrait = aspect < 1;
  let targetFov = portrait ? 76 : 65;
  const dashing = player && ((player.dashHeld && player.dashGauge > 0 && player.exhaustedT <= 0) || player.landDashT > 0 || player.boostT > 0);
  if (dashing && (screen === 'race' || screen === 'countdown')) targetFov += portrait ? 3 : 7;
  const k = camSnap || dt <= 0 ? 1 : (1 - Math.exp(-6 * dt));
  const kL = camSnap || dt <= 0 ? 1 : (1 - Math.exp(-8 * dt));

  if (screen === 'menu') {
    toWorld(18, 0, 1.3, vD);
    const ang = menuT * 0.18;
    vA.set(vD.x + Math.sin(ang) * 16, vD.y + 5.6, vD.z + Math.cos(ang) * 13);
    camera.position.lerp(vA, camSnap ? 1 : 1 - Math.exp(-2.2 * Math.max(dt, 0.001)));
    camera.lookAt(vD);
    const fv = portrait ? 74 : 58;
    camera.fov += (fv - camera.fov) * 0.08;
    camera.updateProjectionMatrix();
    camSnap = false;
    return;
  }
  if (screen === 'results' && mode === 'vs') {
    if (portrait) {
      // Podium sits in the top half; the results table covers the bottom half.
      vA.set(0, 5.35, 17.6);
      vB.set(0, 1.7, 0);
      targetFov = 56;
    } else {
      // Look to the right of the podium so the top 3 land in the left half.
      vA.set(-0.35, 4.05, 13.4);
      vB.set(4.15, 1.85, -0.15);
      targetFov = 44;
    }
    const kk = camSnap ? 1 : 1 - Math.exp(-3 * Math.max(dt, 0.001));
    camera.position.lerp(vA, kk);
    lookHold.lerp(vB, kk);
    camera.lookAt(lookHold);
    camera.fov += (targetFov - camera.fov) * (camSnap ? 1 : 0.12);
    camera.updateProjectionMatrix();
    camSnap = false;
    return;
  }
  if (!player) return;
  const follow = (screen === 'countdown' && player.y > 2.2) ? 0.85 : 0.5;
  let blocksCam = false;
  for (let gi = 0; gi < gaps.length; gi++) {
    const g = gaps[gi];
    const tail = mapDef.blockStyle === 'forest' ? 8 : 10;
    if (player.s > g.s0 - 10 && player.s < g.s1 + tail) blocksCam = true;
  }
  let back;
  let upH;
  let ahead;
  let lookUp;
  if (portrait) {
    if (blocksCam) { back = 7.2; upH = 5.6; ahead = 1.6; lookUp = 2.5; }
    else { back = 7.0; upH = 4.6; ahead = 2.5; lookUp = 2.0; }
  } else if (blocksCam) {
    back = 5.6; upH = 5.4; ahead = 1.2; lookUp = 1.0;
  } else {
    back = 5.0; upH = 3.6; ahead = 2.2; lookUp = 0.95;
  }
  const bk = camSnap ? 1 : 1 - Math.exp(-3 * Math.max(dt, 0.001));
  camBlend.back = lerp(camBlend.back, back, bk);
  camBlend.up = lerp(camBlend.up, upH, bk);
  camBlend.ahead = lerp(camBlend.ahead, ahead, bk);
  camBlend.look = lerp(camBlend.look, lookUp, bk);

  vB.set(0, 0, 0);
  for (let i = 0; i <= 4; i++) {
    const o = sampleInto(player.s + i, S1);
    vB.x += o.tx; vB.y += o.ty; vB.z += o.tz;
  }
  vB.multiplyScalar(0.2);
  if (mapDef.id !== 'forest') vB.y *= 0.4;
  if (vB.lengthSq() < 1e-6) vB.set(0, 0, 1);
  else vB.normalize();
  if (camSnap) camFwd.copy(vB);
  else camFwd.lerp(vB, 1 - Math.exp(-8 * Math.max(dt, 0.001))).normalize();

  toWorld(player.s, player.x, player.y * follow, vC);
  vA.copy(vC).addScaledVector(camFwd, -camBlend.back);
  vA.y += camBlend.up;
  vD.copy(vC).addScaledVector(camFwd, camBlend.ahead);
  vD.y += camBlend.look;

  const celebrate = player.finished && (screen === 'race' || screen === 'paused' || (screen === 'results' && mode !== 'vs'));
  if (celebrate) {
    const age = Math.max(0, raceTime - (player.finishTime || raceTime));
    const u = clamp(age / 1.2, 0, 1);
    const ease = u * u * (3 - 2 * u);
    const o = sampleInto(player.s, S1);
    toWorld(player.s, player.x, player.y, vC);
    const front = portrait ? 6.0 : 5.5;
    const side = portrait ? 1.15 : 2.3;
    const lookX = vD.x, lookY = vD.y, lookZ = vD.z;
    // orbit around the runner (behind -> right side -> front-side) instead of a straight
    // line, so the camera never passes through the runner or its hat mid-swing
    const th0 = Math.PI, th1 = Math.atan2(side, front);
    const th = th0 + (th1 - th0) * ease;
    const rad = lerp(camBlend.back, Math.hypot(front, side), ease);
    const px = vC.x + (o.tx * Math.cos(th) + o.rx * Math.sin(th)) * rad;
    const py = vC.y + lerp(camBlend.up, 1.65, ease);
    const pz = vC.z + (o.tz * Math.cos(th) + o.rz * Math.sin(th)) * rad;
    const qx = vC.x + o.tx * -1.4 + o.rx * side * 0.12;
    const qy = vC.y + 2.35;
    const qz = vC.z + o.tz * -1.4 + o.rz * side * 0.12;
    vA.set(px, py, pz);
    vD.set(lookX + (qx - lookX) * ease, lookY + (qy - lookY) * ease, lookZ + (qz - lookZ) * ease);
    targetFov = lerp(targetFov, portrait ? 70 : 68, ease);
  }

  camera.position.lerp(vA, k);
  lookHold.lerp(vD, kL);
  camera.lookAt(lookHold);
  camera.fov += (targetFov - camera.fov) * (camSnap ? 1 : 1 - Math.exp(-4 * Math.max(dt, 0.001)));
  camera.updateProjectionMatrix();
  camSnap = false;
}

/* =====================================================================
   HUD
   ===================================================================== */
const GAUGE_C = 2 * Math.PI * 44;
let racerRows = [];
let iconEls = [];
function drawPortrait() {
  const c = $('portrait');
  const g = c.getContext('2d');
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = '#ffb7c8';
  g.beginPath(); g.ellipse(46, 28, 8, 22, -0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(82, 28, 8, 22, 0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffd0e0';
  g.beginPath(); g.ellipse(46, 30, 4, 12, -0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(82, 30, 4, 12, 0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e23b3b';
  g.beginPath(); g.arc(64, 74, 40, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(50, 70, 12, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(80, 70, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1a1a1a';
  g.beginPath(); g.arc(52, 72, 6, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(82, 72, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(49, 68, 2.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(79, 68, 2.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ff9bb8';
  g.beginPath(); g.arc(36, 86, 7, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(92, 86, 7, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a2840';
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.beginPath(); g.arc(64, 90, 10, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
}
function buildHUD() {
  drawPortrait();
  const racers = $('racers');
  racerRows = runners.map(() => {
    const row = document.createElement('div');
    row.className = 'rrow';
    const dot = document.createElement('i');
    dot.className = 'rdot';
    const name = document.createElement('span');
    row.appendChild(dot);
    row.appendChild(name);
    racers.appendChild(row);
    return { row, dot, name };
  });
  const bar = $('bar');
  iconEls = runners.map((r) => {
    const d = document.createElement('div');
    d.className = 'picon' + (r.isPlayer ? ' me' : '');
    d.style.background = r.hex;
    if (r.isPlayer) {
      const m = document.createElement('span');
      m.className = 'mk';
      m.textContent = '▼';
      d.appendChild(m);
    }
    bar.appendChild(d);
    return d;
  });
  refreshTicks();
}
function refreshTicks() {
  const bar = $('bar');
  if (!bar) return;
  const old = bar.querySelectorAll('.tick');
  for (let i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  for (let i = 0; i < checkpoints.length; i++) {
    const t = document.createElement('i');
    t.className = 'tick';
    t.dataset.s = String(checkpoints[i]);
    bar.insertBefore(t, bar.firstChild);
  }
}
function starsText(d) {
  let s = '';
  for (let i = 1; i <= 3; i++) s += i <= d ? '★' : '☆';
  return s;
}
function refreshMapCard() {
  const card = $('map-card');
  if (!card) return;
  $('map-name').textContent = mapDef.name;
  $('map-stars').textContent = starsText(mapDef.difficulty);
  $('map-level').textContent = LEVEL_NAME[mapDef.difficulty] || '';
  card.style.setProperty('--map-color', mapDef.ui);
}
function bestKey() { return 'talesdash3d_best_' + mapDef.id; }
function toast(text) {
  const now = performance.now();
  if (text === toastStamp && now - toastAt < 450) return;
  toastStamp = text; toastAt = now;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('toasts').appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
}
function flashVignette() {
  const v = $('vignette');
  v.classList.remove('on');
  void v.offsetWidth;
  v.classList.add('on');
}
function updateBestLabel() {
  const b = loadBest();
  const name = mapDef.name;
  $('best').textContent = b == null ? (name + ' 最佳：未有紀錄') : (name + ' 最佳：' + fmt(b));
}
function loadBest() {
  try {
    let v = localStorage.getItem(bestKey());
    if ((v == null || v === '') && mapDef.id === 'forest') v = localStorage.getItem('talesdash3d_best');
    if (v == null || v === '') return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  } catch (e) { return null; }
}
function saveBest(t) {
  try { localStorage.setItem(bestKey(), String(t)); } catch (e) { /* ignore */ }
}
function updateHUD() {
  const racingUI = screen === 'race' || screen === 'countdown' || screen === 'paused';
  $('hud').hidden = !racingUI;
  $('touch').hidden = !(screen === 'race' || screen === 'countdown');
  if (!racingUI || !player) return;
  const rankEl = $('rank');
  if (mode === 'solo') {
    rankEl.textContent = '單人';
    rankEl.classList.add('solo');
  } else {
    rankEl.textContent = rankLabel(player.rank || 1);
    rankEl.classList.remove('solo');
  }
  $('time').textContent = 'TIME ' + fmt(raceTime);
  const fg = $('gauge-fg');
  const g = clamp(player.dashGauge, 0, 1);
  fg.style.strokeDasharray = GAUGE_C.toFixed(2);
  fg.style.strokeDashoffset = ((1 - g) * GAUGE_C).toFixed(2);
  fg.classList.toggle('out', player.exhaustedT > 0);
  fg.classList.toggle('low', player.exhaustedT <= 0 && g < 0.15);
  $('btn-dash').classList.toggle('dim', player.exhaustedT > 0 || g <= 0);
  const showList = mode === 'vs';
  $('racers').style.display = showList ? 'flex' : 'none';
  if (showList) {
    const sorted = runners.slice().sort((a, b) => a.rank - b.rank);
    for (let i = 0; i < sorted.length; i++) {
      const row = racerRows[i];
      const r = sorted[i];
      row.dot.style.background = r.hex;
      row.name.textContent = r.name;
      row.row.classList.toggle('me', r.isPlayer);
    }
  }
  const frac = clamp(player.s / trackLength, 0, 1);
  $('fill').style.width = (frac * 100).toFixed(2) + '%';
  const ticks = $('bar').querySelectorAll('.tick');
  ticks.forEach((t) => { t.style.left = (clamp(parseFloat(t.dataset.s) / trackLength, 0, 1) * 100) + '%'; });
  for (let i = 0; i < runners.length; i++) {
    const r = runners[i];
    const el = iconEls[i];
    const show = mode === 'vs' || r.isPlayer;
    el.style.display = show ? 'block' : 'none';
    if (!show) continue;
    el.style.left = (clamp(r.s / trackLength, 0, 1) * 100) + '%';
  }
  // countdown / banners
  const banner = $('banner');
  let text = '';
  let cls = '';
  if (screen === 'countdown') { text = countLabel; cls = ''; }
  else if (screen === 'race' && raceTime < 0.7) { text = '開跑！'; cls = 'go'; }
  else if (timeOver && screen === 'race') { text = 'TIME OVER'; cls = 'over'; }
  else if (player.finished && screen === 'race' && (raceTime - player.finishTime) < 1.8) { text = 'GOAL!'; cls = 'goal'; }
  if (!text) banner.hidden = true;
  else { banner.hidden = false; banner.textContent = text; banner.className = cls; }
  const c10El = $('c10');
  if (mode === 'vs' && c10 != null && !timeOver && (screen === 'race' || screen === 'paused')) {
    c10El.hidden = false;
    c10El.textContent = String(Math.max(1, Math.ceil(c10)));
  } else c10El.hidden = true;
}
function showJoy(x, y) {
  const joy = $('joy');
  joy.hidden = false;
  joy.style.left = x + 'px';
  joy.style.top = y + 'px';
}
function moveJoy(dx, dy) {
  const k = $('joy-knob');
  k.style.transform = 'translate(' + clamp(dx, -36, 36) + 'px,' + clamp(dy, -36, 36) + 'px)';
}
function hideJoy() { $('joy').hidden = true; }
function clearToasts() {
  const box = $('toasts');
  if (box) box.textContent = '';
}

/* =====================================================================
   INPUT
   ===================================================================== */
function releasePointers() {
  pointers.steerId = null;
  pointers.dx = 0;
  pointers.jumpIds.clear();
  pointers.dashIds.clear();
  keys.dash = false;
  human.dashEdge = false;
  hideJoy();
}
function readHuman(r) {
  let s = 0;
  if (keys.left) s -= 1;
  if (keys.right) s += 1;
  if (pointers.steerId != null) s += clamp(pointers.dx / 60, -1, 1);
  r.steer = clamp(s, -1, 1);
  r.dashHeld = keys.dash || pointers.dashIds.size > 0;
  if (human.jumpQueue > 0) { r.jumpEdge = true; human.jumpQueue--; }
  if (human.dashEdge) { r.dashEdge = true; human.dashEdge = false; }
}
function isJumpCode(code) {
  return code === 'Space' || code === 'ControlLeft' || code === 'ControlRight' || code === 'ArrowUp' || code === 'KeyW';
}
function isDashCode(code) {
  return code === 'KeyZ' || code === 'KeyX' || code === 'ShiftLeft' || code === 'ShiftRight';
}
function bindInput() {
  const steer = $('steer-catch');
  steer.addEventListener('pointerdown', (e) => {
    if (screen !== 'race' && screen !== 'countdown') return;
    unlockAudio();
    pointers.steerId = e.pointerId;
    pointers.originX = e.clientX;
    pointers.originY = e.clientY;
    pointers.dx = 0;
    showJoy(e.clientX, e.clientY);
    moveJoy(0, 0);
    steer.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  steer.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointers.steerId) return;
    pointers.dx = e.clientX - pointers.originX;
    moveJoy(pointers.dx, e.clientY - pointers.originY);
    e.preventDefault();
  });
  const endSteer = (e) => {
    if (e.pointerId !== pointers.steerId) return;
    pointers.steerId = null;
    pointers.dx = 0;
    hideJoy();
  };
  steer.addEventListener('pointerup', endSteer);
  steer.addEventListener('pointercancel', endSteer);

  const jumpBtn = $('btn-jump');
  jumpBtn.addEventListener('pointerdown', (e) => {
    if (screen !== 'race' && screen !== 'countdown') return;
    e.preventDefault();
    unlockAudio();
    pointers.jumpIds.add(e.pointerId);
    human.jumpQueue++;
    jumpBtn.setPointerCapture(e.pointerId);
  });
  const endJump = (e) => pointers.jumpIds.delete(e.pointerId);
  jumpBtn.addEventListener('pointerup', endJump);
  jumpBtn.addEventListener('pointercancel', endJump);

  const dashBtn = $('btn-dash');
  dashBtn.addEventListener('pointerdown', (e) => {
    if (screen !== 'race' && screen !== 'countdown') return;
    e.preventDefault();
    unlockAudio();
    pointers.dashIds.add(e.pointerId);
    human.dashEdge = true;
    dashBtn.setPointerCapture(e.pointerId);
  });
  const endDash = (e) => pointers.dashIds.delete(e.pointerId);
  dashBtn.addEventListener('pointerup', endDash);
  dashBtn.addEventListener('pointercancel', endDash);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (isJumpCode(e.code)) {
      if (!e.repeat) { human.jumpQueue++; unlockAudio(); }
      e.preventDefault();
    }
    if (isDashCode(e.code)) {
      if (!e.repeat) { keys.dash = true; human.dashEdge = true; unlockAudio(); }
      e.preventDefault();
    }
    if (e.code === 'KeyP' || e.code === 'Escape') { togglePause(); e.preventDefault(); }
    if (e.code === 'Enter') { onEnter(); e.preventDefault(); }
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Space') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (isDashCode(e.code)) keys.dash = false;
  });
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('blur', () => {
    keys.left = keys.right = keys.dash = false;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) doPause(); });
  $('btn-solo').addEventListener('click', () => startRace('solo'));
  $('btn-vs').addEventListener('click', () => startRace('vs'));
  $('map-prev').addEventListener('click', () => { if (screen === 'menu') stepMap(-1); });
  $('map-next').addEventListener('click', () => { if (screen === 'menu') stepMap(1); });
  $('pause-btn').addEventListener('click', () => doPause());
  $('btn-resume').addEventListener('click', () => doResume());
  $('btn-retry').addEventListener('click', () => startRace(mode || 'vs'));
  $('btn-menu').addEventListener('click', () => showMenu());
  $('btn-again').addEventListener('click', () => startRace(mode || 'solo'));
  $('btn-results-menu').addEventListener('click', () => showMenu());
  $('rotate').addEventListener('click', () => { rotateDismissed = true; $('rotate').hidden = true; });
}
function onEnter() {
  if (screen === 'menu') startRace('solo');
  else if (screen === 'results') startRace(mode || 'solo');
  else if (screen === 'paused') doResume();
}
function resize() {
  const vv = window.visualViewport;
  const w = vv ? vv.width : window.innerWidth;
  const h = vv ? vv.height : window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  $('rotate').hidden = rotateDismissed || !(h > w + 20);
}

/* =====================================================================
   AUDIO
   ===================================================================== */
function unlockAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function beepAt(t, freq, dur, type, vol) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function sfx(name) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  if (name === 'count') beepAt(t, 620, 0.1, 'square', 0.05);
  else if (name === 'go') {
    beepAt(t, 523, 0.09, 'square', 0.06);
    beepAt(t + 0.1, 784, 0.16, 'square', 0.07);
  } else if (name === 'jump') beepAt(t, 540, 0.08, 'square', 0.04);
  else if (name === 'land') {
    beepAt(t, 880, 0.08, 'square', 0.05);
    beepAt(t + 0.07, 1320, 0.12, 'square', 0.05);
  } else if (name === 'boost') {
    beepAt(t, 420, 0.08, 'sawtooth', 0.04);
    beepAt(t + 0.06, 680, 0.12, 'square', 0.05);
  } else if (name === 'knock') beepAt(t, 110, 0.18, 'sawtooth', 0.06);
  else if (name === 'respawn') beepAt(t, 320, 0.2, 'sine', 0.06);
  else if (name === 'spring') beepAt(t, 500, 0.1, 'square', 0.05);
  else if (name === 'cp') beepAt(t, 740, 0.09, 'square', 0.04);
  else if (name === 'exhaust') beepAt(t, 90, 0.2, 'sawtooth', 0.05);
  else if (name === 'goal') {
    beepAt(t, 523, 0.1, 'square', 0.06);
    beepAt(t + 0.11, 659, 0.1, 'square', 0.06);
    beepAt(t + 0.22, 784, 0.22, 'square', 0.07);
  } else if (name === 'over') beepAt(t, 180, 0.25, 'sawtooth', 0.05);
}

/* =====================================================================
   PODIUM / CONFETTI
   ===================================================================== */
const PODIUM_DECK = 0.46;
const PODIUM_STEPS = [
  { n: '1', x: 0, h: 2.55, w: 2.5, d: 2.05, candy: 0xfff6ea, trim: 0xffc400, face: '#ffd24a', ink: '#7a4e00' },
  { n: '2', x: -2.72, h: 1.82, w: 2.32, d: 1.95, candy: 0xf7fbff, trim: 0xc5d2e2, face: '#d5deea', ink: '#3a4658' },
  { n: '3', x: 2.72, h: 1.28, w: 2.32, d: 1.95, candy: 0xffefe4, trim: 0xe08a45, face: '#f0a06a', ink: '#6e3810' },
];
const PODIUM_FLANK = [
  { x: -5.85, z: -0.55 },
  { x: -5.15, z: -2.45 },
  { x: -4.25, z: -3.7 },
  { x: 5.15, z: -2.45 },
  { x: 5.85, z: -0.55 },
];
function podiumFaceTex(label, bg, ink) {
  return canvasTex((g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = ink;
    g.lineWidth = 26;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.font = '900 220px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 28;
    g.strokeText(label, w / 2, h / 2 + 12);
    g.fillStyle = '#ffffff';
    g.fillText(label, w / 2, h / 2 + 12);
  }, 256, 256);
}
function buildPodium() {
  podium = new THREE.Group();
  podium.visible = false;
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(7.15, 7.45, 0.36, 48), toon(0xff9ed2));
  disc.position.y = 0.18;
  const discTop = new THREE.Mesh(new THREE.CylinderGeometry(6.55, 6.55, 0.1, 48), toon(0xfff3f8));
  discTop.position.y = PODIUM_DECK - 0.04;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6.72, 0.11, 8, 48), toon(0xffd24a));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = PODIUM_DECK + 0.02;
  podium.add(disc, discTop, rim);
  for (let i = 0; i < PODIUM_STEPS.length; i++) {
    const st = PODIUM_STEPS[i];
    const body = new THREE.Mesh(new THREE.BoxGeometry(st.w, st.h, st.d), toon(st.candy));
    body.position.set(st.x, PODIUM_DECK + st.h / 2, 0);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(st.w + 0.16, 0.16, st.d + 0.16), toon(st.trim));
    cap.position.set(st.x, PODIUM_DECK + st.h + 0.06, 0);
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(st.w + 0.1, 0.14, st.d + 0.1), toon(st.trim));
    skirt.position.set(st.x, PODIUM_DECK + 0.08, 0);
    const faceH = Math.min(st.h * 0.78, 1.7);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(st.w * 0.84, faceH),
      new THREE.MeshBasicMaterial({ map: podiumFaceTex(st.n, st.face, st.ink) }),
    );
    face.position.set(st.x, PODIUM_DECK + st.h * 0.46, st.d / 2 + 0.03);
    podium.add(body, cap, skirt, face);
  }
  scene.add(podium);

  const n = 80;
  confetti = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.18, 0.04), toon(0xffffff), n);
  confetti.frustumCulled = false;
  confetti.visible = false;
  const colors = [0xff4d8d, 0xffe14a, 0x7de8c0, 0x8fd0f5, 0xb388ff, 0xff9a3c];
  confData = { x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), vz: new Float32Array(n), rot: new Float32Array(n) };
  for (let i = 0; i < n; i++) {
    confetti.setColorAt(i, colA.set(colors[i % colors.length]));
    resetConfettiOne(i, true);
  }
  confetti.instanceColor.needsUpdate = true;
  scene.add(confetti);
}
function resetConfettiOne(i, scatter) {
  confData.x[i] = (rng() - 0.5) * 8;
  confData.y[i] = scatter ? rng() * 5 : 3.2 + rng() * 2;
  confData.z[i] = (rng() - 0.5) * 4;
  confData.vx[i] = (rng() - 0.5) * 1.4;
  confData.vy[i] = 0.8 + rng() * 1.6;
  confData.vz[i] = (rng() - 0.5) * 1.2;
  confData.rot[i] = rng() * 6;
}
function resetConfetti() {
  for (let i = 0; i < confData.x.length; i++) resetConfettiOne(i, true);
}
function updateConfetti(dt) {
  if (!confetti || !confetti.visible) return;
  const n = confData.x.length;
  for (let i = 0; i < n; i++) {
    confData.vy[i] -= dt * 1.8;
    confData.x[i] += confData.vx[i] * dt;
    confData.y[i] += confData.vy[i] * dt;
    confData.z[i] += confData.vz[i] * dt;
    confData.rot[i] += dt * 3;
    if (confData.y[i] < 0) resetConfettiOne(i, false);
    vD.set(confData.x[i], confData.y[i], confData.z[i]);
    qA.setFromEuler(new THREE.Euler(confData.rot[i], confData.rot[i] * 0.7, 0));
    setInst(confetti, i, vD, qA, 1, 1, 1);
  }
  confetti.instanceMatrix.needsUpdate = true;
}

/* =====================================================================
   GAME FLOW
   ===================================================================== */
function updateCountdown(dt) {
  countT += dt;
  let label = '3';
  if (countT >= 0.76) label = '1';
  else if (countT >= 0.38) label = '2';
  if (label !== countLabel) {
    countLabel = label;
    sfx('count');
  }
  if (countT >= 1.13) {
    screen = 'race';
    raceTime = 0;
    sfx('go');
  }
}
function updateRaceRules(dt) {
  if (mode === 'vs') {
    let any = false;
    let all = true;
    for (let i = 0; i < runners.length; i++) {
      if (runners[i].finished) any = true;
      else all = false;
    }
    if (any && c10 == null && !timeOver) c10 = 10;
    if (c10 != null && !timeOver) {
      c10 -= dt;
      if (c10 <= 0) {
        c10 = 0;
        timeOver = true;
        timeOverHold = 1.15;
        for (let i = 0; i < runners.length; i++) {
          if (!runners[i].finished) { runners[i].dnf = true; runners[i].vs = 0; }
        }
        sfx('over');
      }
    }
    if (timeOver) {
      timeOverHold -= dt;
      if (timeOverHold <= 0) showResults();
    } else if (all) {
      resultsDelay += dt;
      if (resultsDelay > 1.15) showResults();
    }
  } else if (player && player.finished) {
    resultsDelay += dt;
    if (resultsDelay > 2) showResults();
  }
}
function simulate(dt) {
  if (screen === 'countdown') updateCountdown(dt);
  if (screen === 'race') {
    raceTime += dt;
    worldT += dt;
  } else if (screen === 'countdown') worldT += dt;
  updateBlocks(worldT);
  updateTiles(worldT);
  updateRotors(worldT);
  updateHammers(worldT);
  updateBalls(dt);
  updatePackLead();
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (r.isPlayer && !autopilot) readHuman(r);
    else thinkAI(r, dt);
    stepRunner(r, dt);
  }
  collideRunners();
  railRunners();
  hazards();
  computeRanks();
  if (screen === 'race') updateRaceRules(dt);
}
function layoutPodium() {
  const sorted = runners.slice().sort((a, b) => a.rank - b.rank);
  sorted.forEach((r, i) => {
    r.root.visible = true;
    let x = 0;
    let y = PODIUM_DECK;
    let z = 0;
    if (i < 3) {
      const st = PODIUM_STEPS[i];
      x = st.x;
      y = PODIUM_DECK + st.h + 0.16;
      z = 0.12;
    } else {
      const f = PODIUM_FLANK[i - 3];
      x = f.x;
      z = f.z;
    }
    r.root.position.set(x, y, z);
    const yaw = i < 3 ? 0 : clamp(-x * 0.07, -0.4, 0.4);
    r.root.rotation.set(0, yaw, 0);
  });
}
function showResults() {
  if (resultsShown) return;
  resultsShown = true;
  screen = 'results';
  resultsT = 0;
  $('results').classList.toggle('vs', mode === 'vs');
  releasePointers();
  $('touch').hidden = true;
  $('pause').hidden = true;
  $('hud').hidden = true;
  $('results').hidden = false;
  const title = $('results-title');
  const extra = $('extra');
  const table = $('results-table');
  const tbody = table.querySelector('tbody');
  if (mode === 'solo') {
    title.textContent = '完成！';
    table.hidden = true;
    const t = player.finishTime;
    const best = loadBest();
    if (best == null || t < best - 1e-4) {
      saveBest(t);
      extra.innerHTML = '時間 ' + fmt(t) + '　<span class="new">新紀錄！</span>';
    } else extra.textContent = '時間 ' + fmt(t) + '　最佳 ' + fmt(best);
    podium.visible = false;
    confetti.visible = false;
    worldRoot.visible = true;
  } else {
    title.textContent = '成績';
    table.hidden = false;
    extra.textContent = '';
    computeRanks();
    const sorted = runners.slice().sort((a, b) => a.rank - b.rank);
    tbody.textContent = '';
    sorted.forEach((r) => {
      const tr = document.createElement('tr');
      if (r.isPlayer) tr.className = 'me';
      const time = (r.finished && !r.dnf) ? fmt(r.finishTime) : '未完成';
      const c1 = document.createElement('td'); c1.textContent = String(r.rank);
      const c2 = document.createElement('td'); c2.textContent = r.name;
      const c3 = document.createElement('td'); c3.textContent = time;
      tr.appendChild(c1); tr.appendChild(c2); tr.appendChild(c3);
      tbody.appendChild(tr);
    });
    worldRoot.visible = false;
    podium.visible = true;
    confetti.visible = true;
    layoutPodium();
    resetConfetti();
    camSnap = true;
  }
  clearToasts();
}
function showMenu() {
  screen = 'menu';
  mode = null;
  c10 = null;
  timeOver = false;
  resultsShown = false;
  worldRoot.visible = true;
  podium.visible = false;
  confetti.visible = false;
  for (let i = 0; i < balls.length; i++) balls[i].alive = false;
  placeMenu();
  $('menu').hidden = false;
  $('pause').hidden = true;
  $('results').hidden = true;
  $('hud').hidden = true;
  $('touch').hidden = true;
  $('banner').hidden = true;
  $('c10').hidden = true;
  releasePointers();
  clearToasts();
  updateBestLabel();
  camSnap = true;
}
function startRace(m) {
  mode = m === 'solo' ? 'solo' : 'vs';
  screen = 'countdown';
  raceTime = 0;
  worldT = 0;
  countT = 0;
  countLabel = '';
  c10 = null;
  timeOver = false;
  timeOverHold = 0;
  resultsDelay = 0;
  resultsShown = false;
  const seed = fixedSeed != null ? fixedSeed : ((Math.random() * 0x7fffffff) | 0);
  rngS = seed ^ 0x1a2b3c;
  raceSalt = fixedSeed != null ? fixedSeed % 1000 : seed % 1000;
  ballTimer = 1.1;
  ballIntro = false;
  for (let i = 0; i < balls.length; i++) balls[i].alive = false;
  human.jumpQueue = 0;
  human.dashEdge = false;
  runners.forEach((r, i) => {
    const use = mode === 'vs' || r.isPlayer;
    if (!use) return;
    const slot = r.isPlayer ? (mode === 'solo' ? { s: 4, x: 0 } : GRID[0]) : GRID[i];
    resetRunner(r, slot.s, slot.x, true);
    if (r.isPlayer) r.speedMul = autopilot ? STRONG.speedMul : 1;
    else r.speedMul = r.profile.speedMul;
  });
  worldRoot.visible = true;
  podium.visible = false;
  confetti.visible = false;
  $('menu').hidden = true;
  $('pause').hidden = true;
  $('results').hidden = true;
  $('hud').hidden = false;
  $('touch').hidden = false;
  clearToasts();
  camSnap = true;
  acc = 0;
  lastNow = performance.now();
}
function doPause() {
  if (screen !== 'race' && screen !== 'countdown') return;
  pausedFrom = screen;
  screen = 'paused';
  releasePointers();
  $('pause').hidden = false;
  $('touch').hidden = true;
}
function doResume() {
  if (screen !== 'paused') return;
  screen = pausedFrom || 'race';
  $('pause').hidden = true;
  $('touch').hidden = false;
  lastNow = performance.now();
  acc = 0;
}
function togglePause() {
  if (screen === 'paused') doResume();
  else doPause();
}
function ensurePlaying() {
  if (screen === 'menu' || screen === 'results' || !player) startRace(mode === 'solo' ? 'solo' : 'vs');
  if (screen === 'countdown' || screen === 'paused') {
    screen = 'race';
    $('pause').hidden = true;
    $('touch').hidden = false;
  }
}
function frame(now) {
  const realDt = Math.min(0.1, Math.max(0, (now - lastNow) / 1000));
  lastNow = now;
  if (realDt > 0) fps += (1 / realDt - fps) * 0.08;
  let simmed = 0;
  if (screen === 'menu') {
    menuT += realDt;
    updateBlocks(menuT);
    updateTiles(menuT);
    updateRotors(menuT);
    updateHammers(menuT);
  } else if (screen === 'results') {
    resultsT += realDt;
    updateConfetti(realDt);
  } else if (screen === 'paused') {
    acc = 0;
  } else {
    acc += realDt * timeScale;
    let steps = 0;
    const maxSteps = 6 * timeScale;
    while (acc >= FIXED && steps < maxSteps) {
      simulate(FIXED);
      acc -= FIXED;
      steps++;
      simmed += FIXED;
    }
    if (steps >= maxSteps) acc = 0;
  }
  const visDt = simmed > 0 ? simmed : realDt;
  if (screen === 'race' || screen === 'countdown') {
    syncPads(worldT);
    syncBlocks();
    syncTiles();
    syncBalls();
  } else if (screen === 'menu') {
    syncPads(menuT);
    syncBlocks();
    syncTiles();
  }
  syncRunners(visDt);
  if (screen !== 'results' || mode !== 'vs') syncShadows();
  updateCamera(screen === 'paused' ? 0 : visDt);
  updateHUD();
  renderer.render(scene, camera);
  lastTri = renderer.info.render.triangles;
  requestAnimationFrame(frame);
}
function disposeObj(obj) {
  if (!obj) return;
  if (obj.geometry && !obj.geometry.userData.shared && !obj.geometry.userData.dead) {
    obj.geometry.dispose();
    obj.geometry.userData.dead = true;
  }
  const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
  for (let i = 0; i < mats.length; i++) {
    const m = mats[i];
    if (!m || m.userData.shared || m.userData.dead) continue;
    if (m.map && !m.map.userData.shared && !m.map.userData.dead) {
      m.map.dispose();
      m.map.userData.dead = true;
    }
    m.dispose();
    m.userData.dead = true;
  }
}
function clearWorld() {
  if (!worldRoot) return;
  const kids = worldRoot.children.slice();
  for (let i = 0; i < kids.length; i++) {
    kids[i].traverse((o) => disposeObj(o));
    worldRoot.remove(kids[i]);
  }
  if (skyMesh) {
    disposeObj(skyMesh);
    scene.remove(skyMesh);
    skyMesh = null;
  }
  if (sunMesh) {
    disposeObj(sunMesh);
    scene.remove(sunMesh);
    sunMesh = null;
  }
  blockMesh = null;
  padMesh = null;
  ballMesh = null;
  shadowMesh = null;
  tileMesh = null;
}
function subtractRange(segs, a, b) {
  const out = [];
  for (let i = 0; i < segs.length; i++) {
    const s0 = segs[i][0];
    const s1 = segs[i][1];
    if (s1 <= a || s0 >= b) { out.push([s0, s1]); continue; }
    if (s0 < a) out.push([s0, a]);
    if (s1 > b) out.push([b, s1]);
  }
  return out;
}
function buildRoads() {
  let segs = [[0, trackLength]];
  for (let i = 0; i < gaps.length; i++) segs = subtractRange(segs, gaps[i].s0, gaps[i].s1);
  for (let i = 0; i < narrows.length; i++) segs = subtractRange(segs, narrows[i].s0, narrows[i].s1);
  for (let i = 0; i < forks.length; i++) segs = subtractRange(segs, forks[i].s0, forks[i].sMerge);
  for (let i = 0; i < tileZones.length; i++) segs = subtractRange(segs, tileZones[i].s0, tileZones[i].s1);
  const roadPal = mapDef.theme.road === 'candy' ? 'candy' : (mapDef.theme.road === 'snow' ? 'snow' : null);
  for (let i = 0; i < segs.length; i++) buildRoad(segs[i][0], segs[i][1], { palette: roadPal });
  for (let i = 0; i < narrows.length; i++) {
    const n = narrows[i];
    buildRoad(n.s0, n.s1, {
      palette: mapDef.theme.narrow || roadPal,
      halfFn: function (s) { return narrowHalfAt(n, s); },
      xFn: function () { return n.x || 0; },
    });
  }
  for (let i = 0; i < forks.length; i++) {
    const f = forks[i];
    let shortSegs = [[f.s0, f.sShortExit]];
    const tileS = f.tileS || [];
    for (let ti = 0; ti < tileS.length; ti++) shortSegs = subtractRange(shortSegs, tileS[ti] - 1.25, tileS[ti] + 1.25);
    for (let si = 0; si < shortSegs.length; si++) {
      buildRoad(shortSegs[si][0], shortSegs[si][1], {
        palette: 'short',
        yLift: 0.05,
        halfFn: function (s) {
          const g = forkBandGeom(f, s, 'short');
          return g ? g.half : 0.2;
        },
        xFn: function (s) {
          const g = forkBandGeom(f, s, 'short');
          return g ? g.x : f.shortX;
        },
      });
    }
    buildRoad(f.s0, f.sMerge, {
      palette: 'long',
      halfFn: function (s) {
        const g = forkBandGeom(f, s, 'long');
        return g ? g.half : 3.5;
      },
      xFn: function (s) {
        const g = forkBandGeom(f, s, 'long');
        return g ? g.x : 0;
      },
    });
  }
}
function applyTheme() {
  const th = mapDef.theme;
  scene.fog = new THREE.Fog(th.fog, th.fogNear, th.fogFar);
  scene.background = new THREE.Color(th.bg);
  renderer.setClearColor(th.clear, 1);
  if (hemiLight) {
    hemiLight.color.set(th.hemiSky);
    hemiLight.groundColor.set(th.hemiGround);
  }
  if (dirLight) dirLight.color.set(th.sun);
}
function loadMap(id) {
  let idx = 0;
  for (let i = 0; i < MAPS.length; i++) if (MAPS[i].id === id) idx = i;
  mapIndex = idx;
  mapDef = MAPS[idx];
  gaps = mapDef.gaps;
  checkpoints = mapDef.cps;
  narrows = mapDef.narrows || [];
  forks = mapDef.forks || [];
  tileZones = mapDef.tileZones || [];
  roadStep = mapDef.targetLen > 900 ? 1.45 : (mapDef.targetLen > 650 ? 1.2 : 1);
  clearWorld();
  blocks = [];
  hurdles = [];
  hurdleRows = [];
  pads = [];
  hammers = [];
  springs = [];
  walls = [];
  tiles = [];
  rotors = [];
  for (let i = 0; i < balls.length; i++) balls[i].alive = false;
  ballIntro = false;
  buildTrack();
  applyTheme();
  buildSky();
  buildGround();
  buildRoads();
  buildDecor();
  buildObstacles();
  if (screen === 'menu' && runners.length) placeMenu();
  refreshMapCard();
  updateBestLabel();
  if ($('bar')) refreshTicks();
  camSnap = true;
}
function stepMap(dir) {
  const n = (mapIndex + dir + MAPS.length) % MAPS.length;
  loadMap(MAPS[n].id);
}
function setMap(id) {
  if (screen !== 'menu') showMenu();
  if (!id || mapDef.id === id) return;
  loadMap(id);
}
function init() {
  const canvas = $('view');
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x9ad8ff, 1);
  renderer.shadowMap.enabled = false;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ad8ff);
  scene.fog = new THREE.Fog(0xd7f3ff, 90, 260);
  camera = new THREE.PerspectiveCamera(65, 1, 0.1, 900);
  camera.position.set(0, 8, -12);
  hemiLight = new THREE.HemisphereLight(0xfff4ea, 0x6fbf62, 0.95);
  scene.add(hemiLight);
  dirLight = new THREE.DirectionalLight(0xfff7e8, 1.25);
  dirLight.position.set(-40, 90, 24);
  scene.add(dirLight);
  worldRoot = new THREE.Group();
  scene.add(worldRoot);
  initGeos();
  buildRunners();
  buildPodium();
  screen = 'menu';
  loadMap('forest');
  buildHUD();
  bindInput();
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
    window.visualViewport.addEventListener('scroll', resize);
  }
  lastNow = performance.now();
  requestAnimationFrame(frame);
  installTestHook();
}

/* =====================================================================
   TEST HOOK
   ===================================================================== */
function installTestHook() {
  window.__td = {
    state: () => {
      const list = screen === 'menu' ? runners : activeRunners();
      return {
        screen,
        mode,
        map: mapDef.id,
        mapName: mapDef.name,
        checkpoints: checkpoints.slice(),
        time: raceTime,
        trackLength,
        section: player ? sectionAt(player.s) : 1,
        countdown10: c10 == null ? null : c10,
        triangles: lastTri,
        fps,
        camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        player: player ? {
          s: player.s, x: player.x, y: player.y, vs: player.vs,
          grounded: !!player.grounded, dash: player.dashGauge,
          knocked: player.knockT > 0, exhausted: player.exhaustedT > 0,
          respawning: player.respawnT > 0, finished: !!player.finished,
        } : { s: 0, x: 0, y: 0, vs: 0, grounded: true, dash: 1, knocked: false, exhausted: false, respawning: false, finished: false },
        runners: list.map((r) => ({
          name: r.name, s: r.s, x: r.x, y: r.y,
          finished: !!r.finished, finishTime: r.finishTime,
          rank: r.rank, isPlayer: !!r.isPlayer, dnf: !!r.dnf,
          falls: r.brain ? (r.brain.falls || 0) : 0,
          knocks: r.brain ? (r.brain.knocks || 0) : 0,
          fallLog: r.brain && r.brain.fallLog ? r.brain.fallLog.join(',') : '',
          knockLog: r.brain && r.brain.knockLog ? r.brain.knockLog.join(',') : '',
        })),
      };
    },
    maps: () => MAPS.map((m) => ({ id: m.id, name: m.name, difficulty: m.difficulty })),
    setMap: (id) => setMap(id),
    start: (m, mapId) => {
      if (mapId && mapId !== mapDef.id) {
        if (screen !== 'menu') showMenu();
        loadMap(mapId);
      }
      startRace(m === 'solo' ? 'solo' : 'vs');
    },
    closeup: (i) => {
      if (i == null) { closeupId = null; camSnap = true; return; }
      const n = i | 0;
      closeupId = (n >= 0 && n < runners.length) ? n : null;
      camSnap = true;
    },
    autopilot: (on) => {
      autopilot = !!on;
      if (player) player.speedMul = autopilot ? STRONG.speedMul : 1;
    },
    timeScale: (n) => { timeScale = clamp(n | 0, 1, 8); },
    seed: (n) => { fixedSeed = n == null ? null : (n | 0); },
    teleport: (s, x) => {
      ensurePlaying();
      const r = player;
      r.s = clamp(+s || 0, 0, trackLength - 0.5);
      r.x = +x || 0;
      r.vx = 0; r.vy = 0; r.vs = 8 * r.speedMul;
      r.knockT = 0; r.respawnT = 0; r.finished = false; r.dnf = false; r.finishTime = null;
      r.checkpointIndex = cpIndexAt(r.s);
      r.carrier = null; r.carryOff = 0; r.carryOffX = 0; r.carryOffS = 0;
      if (inGap(r.s)) snapOntoBlock(r);
      const g = queryGround(r.s, r.x);
      if (g) { r.y = g.h; r.grounded = true; r.jumpsUsed = 0; r.carrier = g.carrier; }
      else { r.y = 1.6; r.grounded = false; r.jumpsUsed = 1; }
      if (mapDef.balls && r.s >= mapDef.balls.from && r.s < trackLength - 24) ensureBallsAhead(r.s);
      camSnap = true;
    },
    camInfo: () => {
      camera.updateMatrixWorld();
      camera.getWorldDirection(projFwd);
      let px = 0, py = 0, pz = 0;
      if (player) {
        toWorld(player.s, player.x, player.y, projPt);
        px = projPt.x; py = projPt.y; pz = projPt.z;
      } else projPt.set(0, 0, 0);
      projPt.project(camera);
      return {
        cam: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        player: { x: px, y: py, z: pz },
        forward: { x: projFwd.x, y: projFwd.y, z: projFwd.z },
        screen: { x: (projPt.x + 1) * 0.5, y: (1 - projPt.y) * 0.5 },
      };
    },
    forceFall: () => {
      ensurePlaying();
      const r = player;
      const d = mapDef.danger || { s: gaps.length ? (gaps[0].s0 + gaps[0].s1) * 0.5 : 40, x: 6.3 };
      r.s = d.s;
      r.x = d.x;
      r.y = 3;
      r.vy = 0;
      r.vs = 8;
      r.grounded = false;
      r.jumpsUsed = 2;
      r.respawnT = 0;
      r.knockT = 0;
      r.finished = false;
      r.dnf = false;
      r.carrier = null;
      r.carryOff = 0; r.carryOffX = 0; r.carryOffS = 0;
      r.checkpointIndex = cpIndexAt(r.s);
      camSnap = true;
    },
    pause: () => doPause(),
    resume: () => doResume(),
  };
}

init();
