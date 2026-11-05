// The book's recurring character: a surveyor with a levelling staff. Loads public/models/surveyor.glb when it exists
// (Tripo/Meshy → Blender → glb); until then, and on any failure, a procedural stand-in from props.js.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { surveyor } from './props.js';
import { SPEC } from '../sign/spec.js';

let model = null, tried = false;

/** Try to load the real model once. Resolves to true when a glb is in place. */
export async function initHero(url = `${import.meta.env.BASE_URL}models/surveyor.glb`) {   // base-aware: works at / and under /repo/ on GitHub Pages
  if (tried) return !!model; tried = true;
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (!head.ok || !/model|octet|gltf/.test(head.headers.get('content-type') || '')) return false;
    const gltf = await new GLTFLoader().loadAsync(url);
    const root = gltf.scene;
    // normalise: feet at y = 0, centred, 1.7 m tall in metres
    const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
    const k = SPEC.props.figure.height / size.y;
    root.position.set(-centre.x * k, -box.min.y * k, -centre.z * k); root.scale.setScalar(k);
    root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material && 'roughness' in o.material) o.material.roughness = Math.max(.35, o.material.roughness); } });
    const wrap = new THREE.Group(); wrap.add(root); model = wrap;
    console.info('[hero] surveyor.glb loaded, triangles:', countTris(root));
    return true;
  } catch (e) { console.info('[hero] using the procedural surveyor:', e.message); return false; }
}
function countTris(o) { let n = 0; o.traverse(m => { if (m.isMesh) n += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; }); return Math.round(n); }

/** A hero instance at s world-cm per metre, feet at the origin, facing +z. */
export function makeHero(s, { staff = true, staffH = 1.5 } = {}) {
  let g;
  if (model) { g = model.clone(true); g.scale.setScalar(s); if (staff) g.add(surveyor(1, { staff: true, staffOnly: true, staffH })); }
  else g = surveyor(s, { staff, staffH });
  g.userData.hero = true; return g;
}
export const heroLoaded = () => !!model;
