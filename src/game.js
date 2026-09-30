import * as THREE from 'three';

/* =====================================================================
   CONFIG
   ===================================================================== */
const W = 7;
const TARGET_LEN = 600;
const LUT_STEP = 0.5;
const ROAD_STEP = 1;
const GRAV = -28;
const GAP0 = 266;
const GAP1 = 376;
const CP_S = [0, 120, 260, 380];
const GROUND_Y = -22;
const BALL_MAX = 6;
const FIXED = 1 / 60;

const RAW = [
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

const ROSTER = [
  { name: '小赤', hex: '#e23b3b', color: 0xe23b3b, hat: 'cap', player: true, speedMul: 1 },
  { name: '小兔寶', hex: '#ff7eb6', color: 0xff7eb6, hat: 'bunny', speedMul: 0.934, reaction: 0.11, mistakeRate: 0.055, dashAggression: 0.32, preferredLane: -1.55 },
  { name: '南瓜仔', hex: '#ff8c32', color: 0xff8c32, hat: 'horn', speedMul: 0.888, reaction: 0.18, mistakeRate: 0.10, dashAggression: 0.16, preferredLane: 1.75 },
  { name: '糖糖', hex: '#ff5aa8', color: 0xff5aa8, hat: 'flower', speedMul: 0.992, reaction: 0.09, mistakeRate: 0.04, dashAggression: 0.46, preferredLane: 0.25 },
  { name: '星星妹', hex: '#ffd23a', color: 0xffd23a, hat: 'crown', speedMul: 0.948, reaction: 0.13, mistakeRate: 0.07, dashAggression: 0.30, preferredLane: -0.35 },
  { name: '蘑菇叔', hex: '#d84a4a', color: 0xd84a4a, hat: 'mushroom', speedMul: 0.905, reaction: 0.24, mistakeRate: 0.13, dashAggression: 0.15, preferredLane: 2.15 },
  { name: '雪球', hex: '#8fd0f5', color: 0x8fd0f5, hat: 'tophat', speedMul: 0.872, reaction: 0.20, mistakeRate: 0.11, dashAggression: 0.14, preferredLane: -2.15 },
  { name: '豆豆', hex: '#6ad85a', color: 0x6ad85a, hat: 'sprout', speedMul: 0.912, reaction: 0.15, mistakeRate: 0.08, dashAggression: 0.22, preferredLane: 0.95 },
];

const STRONG = { speedMul: 1.05, reaction: 0.05, mistakeRate: 0, dashAggression: 0.92, preferredLane: 0.1 };

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
  if (s < 120) return 1;
  if (s < 260) return 2;
  if (s < 380) return 3;
  return 4;
}
function inGap(s) { return s > GAP0 && s < GAP1; }

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
let trackLength = TARGET_LEN;
let lutN = 0;
let lutPX, lutPY, lutPZ, lutTX, lutTY, lutTZ, lutRX, lutRZ;
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
let ballTimer = 1;
let ballIntro = false;
let blockMesh, ballMesh, padMesh, shadowMesh;
let podium, confetti, confData;

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
  const pts = RAW.map((p) => new THREE.Vector3(p[0] * scale, p[1], p[2] * scale));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
}
function buildTrack() {
  let scale = 1;
  let curve = makeCurve(1);
  for (let i = 0; i < 8; i++) {
    const len = curve.getLength();
    if (Math.abs(len - TARGET_LEN) < 0.4) break;
    scale *= TARGET_LEN / len;
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
  GEO.head = new THREE.SphereGeometry(0.40, 12, 8);
  GEO.eye = new THREE.SphereGeometry(0.055, 6, 4);
  GEO.cheek = new THREE.SphereGeometry(0.075, 6, 4);
  GEO.torso = new THREE.CylinderGeometry(0.20, 0.24, 0.40, 8);
  GEO.belly = new THREE.BoxGeometry(0.28, 0.22, 0.14);
  GEO.arm = new THREE.CylinderGeometry(0.065, 0.075, 0.38, 6);
  GEO.leg = new THREE.CylinderGeometry(0.085, 0.095, 0.4, 6);
  GEO.shoe = new THREE.BoxGeometry(0.15, 0.08, 0.24);
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

  MAT.ball = new THREE.MeshBasicMaterial({ vertexColors: true });
  MAT.white = toon(0xffffff);
  MAT.eye = toon(0x1b1b1b);
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
function buildRoad(s0, s1) {
  // Trim | body | crisp lane line | body. Line verts are isolated so white
  // does not flood the center of the ribbon.
  const xs = [-3.5, -3.15, -3.12, -1.46, -1.24, -1.02, -0.98, 0.98, 1.02, 1.24, 1.46, 3.12, 3.15, 3.5];
  const SURF = xs.length;
  const ROW = SURF + 4;
  const LINE = { 4: 1, 5: 1, 8: 1, 9: 1 };
  const TRIM = { 0: 1, 1: 1, 12: 1, 13: 1 };
  const rows = [];
  for (let s = s0; s <= s1 + 1e-3; s += ROAD_STEP) rows.push(Math.min(s, s1));
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
    const sec = sectionAt(s);
    const alt = (Math.floor(s / 6) & 1) === 0;
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
    toWorld(s, x, y, vD);
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
  const geo = new THREE.SphereGeometry(430, 24, 16);
  const pa = geo.attributes.position;
  const col = new Float32Array(pa.count * 3);
  const top = new THREE.Color(0x2f7dff);
  const mid = new THREE.Color(0x9ad8ff);
  const hor = new THREE.Color(0xffd0e8);
  const bot = new THREE.Color(0xc9e8ff);
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
  const sun = new THREE.Mesh(new THREE.SphereGeometry(16, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff4b8, fog: false }));
  sun.position.set(-90, 150, -40);
  scene.add(sun);
}
function buildGround() {
  const geo = new THREE.CircleGeometry(980, 28);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, toon(0x69c85c));
  mesh.position.y = GROUND_Y;
  worldRoot.add(mesh);
}
function nearFeature(s) {
  if (Math.abs(s - 16) < 3.2) return true;
  if (Math.abs(s - 120) < 2.6) return true;
  if (Math.abs(s - 260) < 2.6) return true;
  if (Math.abs(s - 380) < 2.6) return true;
  if (s > trackLength - 7) return true;
  return false;
}
function buildDecor() {
  const postPos = [];
  for (let s = 4; s < trackLength - 2; s += 6) {
    if (inGap(s) || s > GAP0 - 1 && s < GAP1 + 1) continue;
    if (nearFeature(s)) continue;
    postPos.push([s, -3.62], [s, 3.62]);
  }
  const postMesh = makeInst(GEO.post, MAT.vc, postPos.length);
  qA.identity();
  postPos.forEach((p, i) => {
    toWorld(p[0], p[1], 0.58, vD);
    setInst(postMesh, i, vD, qA, 1, 1, 1);
  });
  postMesh.instanceMatrix.needsUpdate = true;

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

  const hillN = 26;
  const hillMesh = makeInst(GEO.hill, toon(0xffffff), hillN);
  const hillCols = [0x7dce6a, 0x8ed67a, 0x63b85a, 0xa4d86a];
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
    const y = (i % 5 === 0 && s > GAP0 && s < GAP1) ? -8 : 10 + (i % 4) * 3.5;
    toWorld(s, side, y, vD);
    qA.setFromAxisAngle(WORLD_UP, i);
    const sc = 2.2 + (i % 3) * 0.8;
    setInst(cloudMesh, i, vD, qA, sc, sc * 0.85, sc);
  }
  cloudMesh.instanceMatrix.needsUpdate = true;

  // distant floating islets in the gap
  const floatN = 6;
  const floatMesh = makeInst(GEO.island, MAT.vc, floatN);
  for (let i = 0; i < floatN; i++) {
    const s = GAP0 + 12 + i * 16;
    toWorld(s, (i % 2 === 0 ? -1 : 1) * (12 + i), -6 - (i % 3), vD);
    qA.identity();
    setInst(floatMesh, i, vD, qA, 3.2, 1.4, 2.6);
  }
  floatMesh.instanceMatrix.needsUpdate = true;

  // castles
  addCastleAt(trackLength * 0.08, 26, 1.7);
  addCastleAt(trackLength * 0.96, -18, 2.1);
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
function buildObstacles() {
  // hurdles
  const rowS = [136, 150, 164, 178, 192, 206, 220, 234, 248];
  const gapAt = { 2: 1, 5: 3, 7: 0 };
  const lanes = [-2.625, -0.875, 0.875, 2.625];
  rowS.forEach((s, ri) => {
    const gaps = gapAt[ri] == null ? [] : [gapAt[ri]];
    const row = { s, gaps, lanes: [] };
    lanes.forEach((x, li) => {
      if (gaps.indexOf(li) >= 0) return;
      const h = { s, x, half: 0.98, id: hurdles.length }; // 0.875 lane half-width + runner radius (no gap between adjacent bars)
      hurdles.push(h);
      row.lanes.push(h);
    });
    hurdleRows.push(row);
  });
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

  // boost pads
  [[30, -1.15], [58, 1.25], [86, 0], [112, -1.2]].forEach((p) => {
    pads.push({ s: p[0], x: p[1], hs: 1.55, hx: 1.15 });
  });
  padMesh = makeInst(GEO.pad, MAT.pad, pads.length);
  pads.forEach((p, i) => layoutPad(p, i, 1));
  padMesh.instanceMatrix.needsUpdate = true;

  // blocks — long decks (~8 m) with ~1.7 m gaps. A full jump travels ~5.4 m
  // at base speed, so each deck is long enough to catch that landing.
  const blanes = [-2.15, 0, 2.15];
  const colors = [0xffe14a, 0xff9a3c, 0x7de8b0, 0xff8ec8];
  const exitLip = GAP1 - 1.65;
  const decks = [];
  let cursor = GAP0 + 1.65;
  while (cursor + 6.2 < exitLip) {
    const room = exitLip - cursor;
    const span = room < 8.6 + 1.75 + 6.2 ? room : 8.6;
    decks.push({ near: cursor, far: cursor + span, i: decks.length });
    if (span < 8.5) break;
    cursor += span + 1.75;
  }
  decks.forEach((deck) => {
    // Even decks are a full floor so runners can change lanes. Odd decks drop one lane.
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
        blocks.push({
          id: blocks.length, s, x: blanes[li], kind,
          phase: deck.i * 0.9 + li * 1.4 + s * 0.02,
          half: 1.1, offX: 0, top: 0, tilt: 0,
          solid: true, hidden: false, flash: false,
          color: colors[(deck.i + li) % 4],
        });
      }
    }
  });
  blockMesh = makeInst(GEO.block, toon(0xffffff), blocks.length);
  blocks.forEach((b, i) => blockMesh.setColorAt(i, colA.set(b.color)));
  blockMesh.instanceColor.needsUpdate = true;
  updateBlocks(0);
  syncBlocks();

  // balls
  for (let i = 0; i < BALL_MAX; i++) balls.push({ alive: false, s: 0, x: 0, spin: 0 });
  ballMesh = makeInst(GEO.ball, MAT.ball, BALL_MAX);

  // hammers
  const hammerSpecs = [
    { s: 494, phase: 0.2, omega: 1.25, amp: 1.02 },
    { s: 524, phase: 2.1, omega: 1.45, amp: 1.0 },
    { s: 552, phase: 4.0, omega: 1.15, amp: 1.05 },
  ];
  hammerSpecs.forEach((hs) => hammers.push(buildHammer(hs)));

  // springs + walls relative to the finish so they stay on the track
  const sp1 = trackLength - 40;
  const sp2 = trackLength - 20;
  springs.push(buildSpring(sp1, 0));
  springs.push(buildSpring(sp2, 0));
  walls.push(buildWall(sp1 + 6.1));
  walls.push(buildWall(sp2 + 6.1));

  buildArch(16, 'start');
  buildArch(120, 'cp');
  buildArch(260, 'cp');
  buildArch(380, 'cp');
  buildArch(trackLength - 0.4, 'goal');

  shadowMesh = makeInst(GEO.blob, MAT.blob, runners.length + BALL_MAX);
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
function updateBlocks(t) {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    b.offX = 0; b.top = 0; b.tilt = 0; b.solid = true; b.hidden = false; b.flash = false;
    if (b.kind === 'bob') b.top = Math.sin(t * 1.7 + b.phase) * 0.5;
    else if (b.kind === 'wobble') {
      b.tilt = Math.sin(t * 1.35 + b.phase) * 0.28;
      b.offX = Math.sin(t * 1.15 + b.phase) * 0.38;
      b.top = Math.sin(t * 1.35 + b.phase) * 0.1;
    } else if (b.kind === 'vanish') {
      const cyc = (t + b.phase) % 3;
      if (cyc > 1.8) { b.solid = false; b.hidden = true; }
      else if (cyc > 1.4) b.flash = true;
    }
  }
}
function syncBlocks() {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    toWorld(b.s, b.x + b.offX, b.top - 0.28, vD);
    basisAt(b.s, 0, vA, vB, vC);
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
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (!b.alive) continue;
    b.s += -9 * dt;
    b.spin += dt * 2.4;
    if (b.s < GAP1 - 4) b.alive = false;
  }
  let lead = -1;
  const list = activeRunners();
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (r.finished || r.dnf || r.respawnT > 0) continue;
    if (r.s > 384 && r.s < trackLength - 32 && r.s > lead) lead = r.s;
  }
  if (lead < 0) return;
  if (!ballIntro) {
    ballIntro = true;
    // First balls sit just past checkpoint 4, inside the chase view.
    spawnBallAt(Math.min(trackLength - 36, Math.max(lead + 14, 396)), 0);
    spawnBallAt(Math.min(trackLength - 30, Math.max(lead + 24, 412)), -2.15);
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
    const bx = b.x + b.offX;
    const ds = b.s - r.s;
    const dx = bx - r.x;
    const d = ds * ds + dx * dx;
    if (d < bestD) { bestD = d; best = b; }
  }
  if (!best) return;
  r.s = best.s;
  r.x = best.x + best.offX;
}
function queryGround(s, x) {
  if (!inGap(s)) {
    if (Math.abs(x) <= W * 0.5 + 0.08) return { h: 0, carrier: null };
    return null;
  }
  let best = null;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b.solid) continue;
    if (Math.abs(b.s - s) > 1.8) continue;
    const bx = b.x + b.offX;
    if (Math.abs(s - b.s) <= b.half + 0.02 && Math.abs(x - bx) <= b.half + 0.02) {
      if (!best || b.top > best.h) best = { h: b.top, carrier: b };
    }
  }
  return best;
}

/* =====================================================================
   RUNNER MODEL
   ===================================================================== */
function addHat(head, type, color) {
  const mat = toon(color);
  if (type === 'cap') {
    const brim = new THREE.Mesh(GEO.brim, MAT.white);
    brim.position.y = 0.16;
    const crown = new THREE.Mesh(GEO.cap, mat);
    crown.position.y = 0.3;
    head.add(brim, crown);
  } else if (type === 'bunny') {
    const e1 = new THREE.Mesh(GEO.ear, MAT.pink);
    e1.position.set(-0.14, 0.5, 0.02);
    e1.rotation.z = 0.18;
    const e2 = e1.clone();
    e2.position.x = 0.14;
    e2.rotation.z = -0.18;
    head.add(e1, e2);
  } else if (type === 'horn') {
    const h = new THREE.Mesh(GEO.horn, toon(0x5f8f32));
    h.position.y = 0.46;
    head.add(h);
  } else if (type === 'flower') {
    const center = new THREE.Mesh(GEO.flowerC, toon(0xffe14a));
    center.position.y = 0.48;
    head.add(center);
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(GEO.petal, toon(0xff5aa8));
      const a = (i / 5) * Math.PI * 2;
      p.position.set(Math.cos(a) * 0.16, 0.48, Math.sin(a) * 0.16);
      head.add(p);
    }
  } else if (type === 'crown') {
    const band = new THREE.Mesh(GEO.band, toon(0xffd23a));
    band.position.y = 0.32;
    head.add(band);
    for (let i = 0; i < 4; i++) {
      const sp = new THREE.Mesh(GEO.spike, toon(0xffd23a));
      const a = (i / 4) * Math.PI * 2;
      sp.position.set(Math.cos(a) * 0.2, 0.48, Math.sin(a) * 0.2);
      head.add(sp);
    }
  } else if (type === 'mushroom') {
    const cap = new THREE.Mesh(GEO.mcap, MAT.vc);
    cap.position.y = 0.28;
    cap.scale.set(0.55, 0.5, 0.55);
    head.add(cap);
  } else if (type === 'tophat') {
    const brim = new THREE.Mesh(GEO.brim, toon(0x243044));
    brim.position.y = 0.2;
    brim.scale.set(0.85, 1, 0.85);
    const crown = new THREE.Mesh(GEO.topCrown, toon(0x243044));
    crown.position.y = 0.5;
    const band = new THREE.Mesh(GEO.hatband, toon(0x8fd0f5));
    band.position.y = 0.32;
    head.add(brim, crown, band);
  } else if (type === 'sprout') {
    const stem = new THREE.Mesh(GEO.stem, toon(0x2f8a3a));
    stem.position.y = 0.42;
    const l1 = new THREE.Mesh(GEO.leaf, toon(0x6ad85a));
    l1.position.set(-0.08, 0.52, 0);
    l1.rotation.z = 0.9;
    const l2 = l1.clone();
    l2.position.x = 0.08;
    l2.rotation.z = -0.9;
    head.add(stem, l1, l2);
  }
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
    head.position.y = 0.92;
    body.add(head);
    head.add(new THREE.Mesh(GEO.head, skin));
    const eyeL = new THREE.Mesh(GEO.eye, MAT.eye);
    eyeL.position.set(-0.13, 0.05, 0.34);
    const eyeR = new THREE.Mesh(GEO.eye, MAT.eye);
    eyeR.position.set(0.13, 0.05, 0.34);
    head.add(eyeL, eyeR);
    const ckL = new THREE.Mesh(GEO.cheek, MAT.cheek);
    ckL.position.set(-0.2, -0.08, 0.3);
    ckL.scale.set(1, 0.65, 0.45);
    const ckR = new THREE.Mesh(GEO.cheek, MAT.cheek);
    ckR.position.set(0.2, -0.08, 0.3);
    ckR.scale.set(1, 0.65, 0.45);
    head.add(ckL, ckR);
    addHat(head, def.hat, def.color);
    const torso = new THREE.Mesh(GEO.torso, skin);
    torso.position.y = 0.58;
    body.add(torso);
    const belly = new THREE.Mesh(GEO.belly, MAT.white);
    belly.position.set(0, 0.55, 0.16);
    body.add(belly);
    const back = new THREE.Mesh(GEO.belly, MAT.white);
    back.position.set(0, 0.55, -0.16);
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
    const armL = pivotLimb(GEO.arm, 0.66, -0.46);
    const armR = pivotLimb(GEO.arm, 0.66, 0.46);
    const legL = pivotLimb(GEO.leg, 0.42, -0.16);
    const legR = pivotLimb(GEO.leg, 0.42, 0.16);
    const shoeL = new THREE.Mesh(GEO.shoe, MAT.white);
    shoeL.position.set(0, -0.42, 0.06);
    legL.add(shoeL);
    const shoeR = new THREE.Mesh(GEO.shoe, MAT.white);
    shoeR.position.set(0, -0.42, 0.06);
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
      marker.position.y = 1.78;
      marker.rotation.x = Math.PI;
      root.add(marker);
    } else {
      root.add(makeNameSprite(def.name));
    }
    scene.add(root);
    const profile = def.player ? null : {
      speedMul: def.speedMul, reaction: def.reaction, mistakeRate: def.mistakeRate,
      dashAggression: def.dashAggression, preferredLane: def.preferredLane,
    };
    const r = {
      id, name: def.name, hex: def.hex, isPlayer: !!def.player, profile, speedMul: def.speedMul,
      root, ring, spark, marker,
      parts: { body, armL, armR, legL, legR, sweat, lines },
      brain: { dashT: 0, dashCd: 0.3 + id * 0.2, jumped: new Set(), dropped: false, honest: 0, falls: 0, knocks: 0, carefulSec: 0 },
      s: 0, x: 0, y: 0, vs: 0, vx: 0, vy: 0,
      grounded: true, jumpsUsed: 0, dashGauge: 1,
      exhaustedT: 0, knockT: 0, boostT: 0, landDashT: 0, respawnT: 0,
      dashBuffer: 0, sinceLand: 1, boostCd: 0, springCd: 0,
      finished: false, finishTime: null, dnf: false, checkpointIndex: 0,
      phase: id, flipT: 0, ringT: 0, carrier: null, carryOff: 0,
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
  r.carrier = null; r.carryOff = 0; r.steer = 0; r.dashHeld = false; r.jumpEdge = false; r.dashEdge = false;
  r.rank = r.id + 1;
  r.brain.dashT = 0;
  r.brain.dashCd = 0.4 + r.id * 0.15;
  r.brain.jumped = new Set();
  r.brain.dropped = false;
  r.brain.honest = 0;
  r.brain.falls = 0;
  r.brain.knocks = 0;
  r.brain.carefulSec = 0;
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
function syncRunners(dt) {
  const list = runners;
  const soloHide = mode === 'solo' && screen !== 'menu';
  const podiumMode = screen === 'results' && mode === 'vs';
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (soloHide && !r.isPlayer) { r.root.visible = false; continue; }
    if (!podiumMode) {
      const yaw = clamp(r.vx * 0.055, -0.4, 0.4);
      toWorld(r.s, r.x, r.y, r.root.position);
      basisAt(r.s, yaw, vA, vB, vC);
      mA.makeBasis(vA, vB, vC);
      r.root.quaternion.setFromRotationMatrix(mA);
    }
    if (r.respawnT > 0) r.root.visible = Math.sin((worldT + menuT) * 28) > -0.15;
    else r.root.visible = true;
    applyPose(r, poseOf(r));
    if (r.marker) {
      r.marker.position.y = 1.72 + Math.sin((worldT + menuT) * 4) * 0.08;
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
        tag.position.y = 1.85;
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
  const cp = CP_S[r.checkpointIndex] || 0;
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
  r.carrier = null; r.carryOff = 0;
  if (r.isPlayer) { toast('跌落！+2 秒'); sfx('respawn'); }
}
function clampLane(r) {
  if (r.finished || r.dnf) return;
  if (!inGap(r.s)) {
    const lim = W * 0.5 - 0.4;
    if (r.x > lim) { r.x = lim; if (r.vx > 0) r.vx = 0; }
    if (r.x < -lim) { r.x = -lim; if (r.vx < 0) r.vx = 0; }
  } else {
    if (r.x > 8) { r.x = 8; r.vx = 0; }
    if (r.x < -8) { r.x = -8; r.vx = 0; }
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
  if (racing && target > 0 && !r.isPlayer && packLeadS - r.s > 25) {
    const u = clamp((packLeadS - r.s - 25) / 50, 0, 1);
    target *= 1.03 + 0.03 * u;
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

  const prevY = r.y;
  if (r.grounded && r.carrier) {
    r.x += r.carrier.offX - r.carryOff;
    r.carryOff = r.carrier.offX;
  }
  if (r.grounded) {
    const g = queryGround(r.s, r.x);
    if (g && Math.abs(r.y - g.h) < 1.6) {
      r.y = g.h; r.vy = 0; r.carrier = g.carrier;
      r.carryOff = g.carrier ? g.carrier.offX : 0;
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
      r.carryOff = g.carrier ? g.carrier.offX : 0;
      onLand(r);
    }
  }
  if (r.grounded && r.knockT <= 0 && r.vs > 0.3) r.phase += dt * (7 + r.vs * 1.15);

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
function supportFar(r) {
  if (r.s <= GAP0) return GAP0;
  if (r.s >= GAP1) return trackLength;
  let edge = r.s;
  if (r.carrier && r.carrier.solid !== false) edge = Math.max(edge, r.carrier.s + r.carrier.half);
  for (let n = 0; n < 8; n++) {
    let next = edge;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b.solid) continue;
      const bx = b.x + b.offX;
      if (Math.abs(bx - r.x) > b.half + 0.08) continue;
      const near = b.s - b.half;
      const far = b.s + b.half;
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
    for (let i = r.checkpointIndex + 1; i < CP_S.length; i++) {
      if (r.s >= CP_S[i]) {
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
  if (r.s > GAP0 - 18 && r.s < GAP1 + 2) {
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
  const safe = (sec === 1 && r.s > 18) || (sec === 4 && !ballClose && r.s < trackLength - 28) || (sec === 4 && r.s > trackLength - 16);
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
  const blocksCam = player.s > GAP0 - 10 && player.s < GAP1 + 8;
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
  g.fillStyle = '#e23b3b';
  g.beginPath(); g.arc(64, 70, 46, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c81e3a';
  g.fillRect(22, 28, 84, 22);
  g.fillStyle = '#fff';
  g.fillRect(18, 46, 92, 8);
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(48, 72, 8, 0, 7); g.fill();
  g.beginPath(); g.arc(80, 72, 8, 0, 7); g.fill();
  g.fillStyle = '#1a1a1a';
  g.beginPath(); g.arc(48, 73, 4, 0, 7); g.fill();
  g.beginPath(); g.arc(80, 73, 4, 0, 7); g.fill();
  g.fillStyle = '#ffb3c7';
  g.beginPath(); g.arc(34, 88, 7, 0, 7); g.fill();
  g.beginPath(); g.arc(94, 88, 7, 0, 7); g.fill();
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
  CP_S.forEach((s) => {
    const t = document.createElement('i');
    t.className = 'tick';
    t.dataset.s = String(s);
    bar.appendChild(t);
  });
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
}
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
  $('best').textContent = b == null ? '最佳時間：未有紀錄' : '最佳時間：' + fmt(b);
}
function loadBest() {
  try {
    const v = localStorage.getItem('talesdash3d_best');
    if (v == null || v === '') return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  } catch (e) { return null; }
}
function saveBest(t) {
  try { localStorage.setItem('talesdash3d_best', String(t)); } catch (e) { /* ignore */ }
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
    syncBalls();
  } else if (screen === 'menu') {
    syncPads(menuT);
    syncBlocks();
  }
  syncRunners(visDt);
  if (screen !== 'results' || mode !== 'vs') syncShadows();
  updateCamera(screen === 'paused' ? 0 : visDt);
  updateHUD();
  renderer.render(scene, camera);
  lastTri = renderer.info.render.triangles;
  requestAnimationFrame(frame);
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
  scene.add(new THREE.HemisphereLight(0xfff4ea, 0x6fbf62, 0.95));
  const dir = new THREE.DirectionalLight(0xfff7e8, 1.25);
  dir.position.set(-40, 90, 24);
  scene.add(dir);
  worldRoot = new THREE.Group();
  scene.add(worldRoot);
  initGeos();
  buildTrack();
  buildSky();
  buildGround();
  buildRoad(0, GAP0);
  buildRoad(GAP1, trackLength);
  buildRunners();
  buildDecor();
  buildObstacles();
  buildPodium();
  buildHUD();
  bindInput();
  placeMenu();
  updateBestLabel();
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
    start: (m) => startRace(m === 'solo' ? 'solo' : 'vs'),
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
      r.checkpointIndex = 0;
      for (let i = 0; i < CP_S.length; i++) if (r.s >= CP_S[i]) r.checkpointIndex = i;
      if (inGap(r.s)) snapOntoBlock(r);
      const g = queryGround(r.s, r.x);
      if (g) { r.y = g.h; r.grounded = true; r.jumpsUsed = 0; }
      else { r.y = 1.6; r.grounded = false; r.jumpsUsed = 1; }
      if (r.s >= CP_S[3] && r.s < trackLength - 24) ensureBallsAhead(r.s);
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
      r.s = (GAP0 + GAP1) * 0.5;
      r.x = 6.3;
      r.y = 3;
      r.vy = 0;
      r.vs = 8;
      r.grounded = false;
      r.jumpsUsed = 2;
      r.respawnT = 0;
      r.knockT = 0;
      r.finished = false;
      r.dnf = false;
      r.checkpointIndex = 2;
      camSnap = true;
    },
    pause: () => doPause(),
    resume: () => doResume(),
  };
}

init();
