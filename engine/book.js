// The book: a back board, a cover leaf and one leaf per spread. Leaves pivot on the spine (the z axis at x = 0).
// Spread p shows the back of leaf p-1 on the left and the front of leaf p on the right. p = 0 is the closed book.
import * as THREE from 'three';
import { PAGE_W, PAGE_H } from './page.js';

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const LIFT = 7;   // cm the free edge of a turning leaf curls by, at the vertical

/**
 * Make a page material bend: the free edge (x far from the spine) lifts by uBend · t² in leaf space.
 * axis: which geometry axis is the leaf's +y ('y' for the body box, 'z' for the front plane, '-z' for the back plane).
 * dir: +1 when geometry +x points away from the spine, -1 when it points toward it (the back plane is rotated).
 */
function bendable(mat, axis, dir) {
  const u = { value: 0 };
  mat.onBeforeCompile = sh => {
    sh.uniforms.uBend = u; sh.uniforms.uW = { value: PAGE_W }; sh.uniforms.uDir = { value: dir };
    const target = axis === 'y' ? 'transformed.y +=' : axis === 'z' ? 'transformed.z +=' : 'transformed.z -=';
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uBend; uniform float uW; uniform float uDir;');
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float bt = clamp((uDir * position.x + uW * 0.5) / uW, 0.0, 1.0); ${target} uBend * bt * bt;`);
  };
  mat.customProgramCacheKey = () => 'bend' + axis + dir;
  return u;
}

export class Book {
  /** textures: { cover, insideCover, insideBack, spreads: [ null, {left, right} ... ] (index 1..N) } */
  constructor(textures) {
    this.group = new THREE.Group();
    this.N = textures.spreads.length - 1;            // spreads 1..N
    this.p = 0; this.target = 0; this.turning = null;
    this.thick = .12; this.curl = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const board = new THREE.MeshStandardMaterial({ color: '#0d1118', roughness: .55, metalness: .05 });
    const edge = new THREE.MeshStandardMaterial({ color: '#cfd6e0', roughness: .9 });   // page edges: pale paper
    const blue = new THREE.MeshStandardMaterial({ color: '#2d6fd6', roughness: .75 });   // coloured fore-edge

    const base = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W * 2 + 1.2, .6, PAGE_H + 1.2), board);
    base.position.set(0, -.3, 0); base.receiveShadow = true; base.castShadow = true; this.group.add(base);
    const spineH = this.N * this.thick + .9;
    const spine = new THREE.Mesh(new THREE.BoxGeometry(1.2, spineH, PAGE_H + 1.2), board);
    spine.position.set(0, spineH / 2 - .3, 0); this.group.add(spine);

    this.leaves = []; this.leftPages = [];      // leftPages: { mesh, full, quiet } for setLeftQuiet
    for (let i = 0; i <= this.N; i++) {
      const pivot = new THREE.Group();
      const isCover = i === 0;
      const front = isCover ? textures.cover : textures.spreads[i].right;
      const back = i === this.N ? textures.insideBack : textures.spreads[i + 1].left;
      const leaf = new THREE.Group(); let bend = [];
      if (isCover) {
        const cover = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W + .6, .6, PAGE_H + 1.2),
          [board, board, new THREE.MeshStandardMaterial({ map: front, roughness: .6 }), board, board, board]);
        cover.position.set((PAGE_W + .6) / 2, 0, 0); cover.castShadow = true; cover.receiveShadow = true; leaf.add(cover);
        // the inside of the cover is spread 1's left page, so the first lesson's text is actually read; the "about"
        // copy lives on the back page instead
        const ic = this.flat(textures.spreads[1].left, PAGE_W / 2, -.306, true); leaf.add(ic);
        this.leftPages.push({ mesh: ic, full: textures.spreads[1].left, quiet: textures.spreads[1].leftQuiet });
      } else {
        // front page on top, back page underneath, the paper block between them; all three bend while turning
        const f = this.flat(front, PAGE_W / 2, this.thick * .5 + .004, false, 24), b = this.flat(back, PAGE_W / 2, -this.thick * .5 - .004, true, 24);
        leaf.add(f, b);
        if (i < this.N) this.leftPages.push({ mesh: b, full: back, quiet: textures.spreads[i + 1].leftQuiet });
        const bodyMats = [blue.clone(), edge.clone(), edge.clone(), edge.clone(), blue.clone(), edge.clone()];
        const body = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W, this.thick * .9, PAGE_H, 24, 1, 1), bodyMats);
        body.position.set(PAGE_W / 2, 0, 0); body.castShadow = true; body.receiveShadow = true; leaf.add(body);
        bend = [bendable(f.material, 'z', 1), bendable(b.material, '-z', -1), ...bodyMats.map(m => bendable(m, 'y', 1))];
      }
      pivot.add(leaf); this.group.add(pivot);
      this.leaves.push({ pivot, leaf, i, bend });
    }
    this.layout(0, 0);
  }
  flat(tex, cx, y, flip = false, segs = 1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W, PAGE_H, segs, 1), new THREE.MeshStandardMaterial({ map: tex, roughness: .85, metalness: 0 }));
    m.rotation.x = flip ? Math.PI / 2 : -Math.PI / 2; if (flip) m.rotation.z = Math.PI;
    m.position.set(cx, y, 0); m.receiveShadow = true; return m;
  }
  /** p = spread whose stacks we lay out, a = angle of the turning leaf (0 right → π left) */
  layout(p, a, turningIndex = -1) {
    for (const { pivot, i, bend } of this.leaves) {
      const turned = i < p;
      const curl = i === turningIndex && this.curl ? LIFT * Math.sin(a) : 0;
      for (const u of bend) u.value = curl;
      // right stack: leaf 1 on top, leaf N at the bottom; left stack: leaf 1 at the bottom. The cover (0.6 thick) rests on
      // leaf 1 when closed and drops under the turned leaves when open.
      const t = this.thick;
      const y = i === 0 ? (turned ? .62 - .3 + .02 : .62 + t * (this.N - 1) + t * .5 + .31)
        : turned ? .62 + t * i : .62 + t * (this.N - i);
      pivot.position.y = y;
      pivot.rotation.z = i === turningIndex ? a : turned ? Math.PI : 0;
      if (i === turningIndex) pivot.position.y += Math.sin(a) * 4;   // lift while turning
    }
  }
  /** quiet = true shows each left page's kicker-and-title twin (the reading panel carries the words); false, the full print */
  setLeftQuiet(quiet) { for (const p of this.leftPages) { const t = quiet && p.quiet ? p.quiet : p.full; if (p.mesh.material.map !== t) { p.mesh.material.map = t; p.mesh.material.needsUpdate = true; } } }
  /** y of the page surface the hologram of spread p stands on (p = 0: the closed cover) */
  pageTopAt(p) { const t = this.thick; return p === 0 ? .62 + t * (this.N - 1) + t * .5 + .62 : .62 + t * (this.N - p) + t * .5 + .01; }
  /** target N + 1 turns the last leaf too: the back page (inside back) on the left, the bare board on the right */
  goTo(target, duration = 1.05) {
    target = THREE.MathUtils.clamp(target, 0, this.N + 1);
    if (target === this.p && !this.turning) return;
    const steps = Math.abs(target - this.p);
    this.target = target; this.duration = steps > 1 ? Math.max(.28, 1.2 / steps) : duration;   // a long jump riffles quickly
    if (!this.turning) this.next();
  }
  next() {
    if (this.target === this.p) { this.turning = null; return; }
    const dir = Math.sign(this.target - this.p);
    const idx = dir > 0 ? this.p : this.p - 1;           // forward turns leaf p; back turns leaf p-1
    this.turning = { idx, dir, t: 0, from: this.p, to: this.p + dir };
  }
  update(dt) {
    const T = this.turning; if (!T) return false;
    T.t = Math.min(1, T.t + dt / (this.duration ?? 1.05));
    const k = ease(T.t), a = T.dir > 0 ? Math.PI * k : Math.PI * (1 - k);
    this.layout(T.dir > 0 ? T.from : T.to, a, T.idx);
    if (T.t >= 1) { this.p = T.to; this.layout(this.p, 0); this.turning = null; this.next(); }
    return true;
  }
  get busy() { return !!this.turning; }
}
