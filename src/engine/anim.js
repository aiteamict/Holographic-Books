// A small animation queue for the spreads: tweens, timed callbacks and "drive this object along this path".
import * as THREE from 'three';

export const smooth = t => t * t * (3 - 2 * t);
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const linear = t => t;

export class Anims {
  constructor() { this.list = []; }
  /** spec: { dur, delay = 0, ease = smooth, update(k, t), done(), tag } → handle with .cancel() */
  add(spec) { const a = { t: -(spec.delay || 0), ease: smooth, ...spec, cancel() { a.dead = true; } }; this.list.push(a); return a; }
  /** run fn after `delay` seconds */
  after(delay, fn, tag) { return this.add({ dur: 0, delay, update() {}, done: fn, tag }); }
  /** cancel every animation carrying this tag */
  stop(tag) { for (const a of this.list) if (a.tag === tag) a.dead = true; }
  clear() { for (const a of this.list) a.dead = true; }
  tick(dt) {
    for (const a of this.list) {
      if (a.dead) continue; a.t += dt; if (a.t < 0) continue;
      const k = a.dur > 0 ? Math.min(1, a.t / a.dur) : 1;
      a.update?.(a.ease(k), a.t);
      if (k >= 1) { a.dead = true; a.done?.(); }
    }
    this.list = this.list.filter(a => !a.dead);
  }
  get busy() { return this.list.some(a => !a.dead); }
}

/** Tween a numeric property of an object. */
export const tween = (anims, obj, key, to, dur, { ease = smooth, delay, done, tag } = {}) => { const from = obj[key]; return anims.add({ dur, delay, ease, tag, update: k => { obj[key] = from + (to - from) * k; }, done }); };

/** Uniform scale pop around the object's current scale: 1 → peak → 1. */
export const pulse = (anims, obj, peak = 1.15, dur = .35, tag) => { const base = obj.scale.clone(); return anims.add({ dur, tag, ease: linear, update: k => { const s = 1 + (peak - 1) * Math.sin(k * Math.PI); obj.scale.copy(base).multiplyScalar(s); }, done: () => obj.scale.copy(base) }); };

/**
 * Drive `obj` (nose along +z) through `points` over `dur` seconds, turning to face the way it goes.
 * opts: ease, onProgress(k, pos), onPass: [{ at: 0..1 fraction of the path, fn(pos) }], done, tag
 */
export function drive(anims, obj, points, dur, { ease = smooth, onProgress, onPass = [], done, tag } = {}) {
  const P = points.map(p => p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(...p));
  const seg = [], cum = [0]; for (let i = 1; i < P.length; i++) { seg.push(P[i].distanceTo(P[i - 1])); cum.push(cum[i - 1] + seg[i - 1]); }
  const total = cum[cum.length - 1] || 1; const fired = new Set(); const tmp = new THREE.Vector3();
  const at = s => { const d = s * total; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const f = seg[i - 1] ? (d - cum[i - 1]) / seg[i - 1] : 0; return { pos: tmp.copy(P[i - 1]).lerp(P[i], f), dir: P[i].clone().sub(P[i - 1]).normalize() }; };
  obj.visible = true;
  return anims.add({ dur, ease, tag, update: k => {
    const { pos, dir } = at(k); obj.position.copy(pos); if (dir.lengthSq() > 0) obj.rotation.y = Math.atan2(dir.x, dir.z);
    onProgress?.(k, pos); for (const p of onPass) if (!fired.has(p) && k >= p.at) { fired.add(p); p.fn(pos); }
  }, done });
}
