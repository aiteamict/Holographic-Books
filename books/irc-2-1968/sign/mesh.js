// The sign as a 3D object. World units are centimetres; the spec is in millimetres, so /10 everywhere.
import * as THREE from 'three';
import { SPEC } from './spec.js';
import { drawFace, drawBack, drawDefinitionPlate } from './face.js';

const mm = v => v / 10;

export function faceTexture(number, opts) {
  const c = document.createElement('canvas'); c.width = 900; c.height = 1200;
  const layout = drawFace(c, number, opts);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return { texture: t, canvas: c, layout };
}
export function defPlateTexture(kind, opts) {
  const c = document.createElement('canvas'); c.width = 600; c.height = 500;
  drawDefinitionPlate(c, kind, opts);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
let backTex;
function backTexture() {
  if (backTex) return backTex;
  const c = document.createElement('canvas'); c.width = 225; c.height = 300; drawBack(c);
  backTex = new THREE.CanvasTexture(c); backTex.colorSpace = THREE.SRGBColorSpace; return backTex;
}

/**
 * makeSign({ number, kind, post, defPlate, scale }) → { group, plate, post, def, setNumber, setKind, setBands }
 * The group's origin is at ground level under the post; the shield top is at 225 cm (Plate 2).
 */
export function makeSign({ number = '42', kind = 'ahead', post = true, defPlate = true, scale = 1, faceOpts, shadows = scale >= .06 } = {}) {
  const group = new THREE.Group();
  const { plate: P, post: PO, defPlate: D, colours } = SPEC;
  const steel = new THREE.MeshStandardMaterial({ color: colours.back.hex, roughness: .6, metalness: .3 });

  // shield plate: a thin box, face texture on +z, grey on every other side
  const face = faceTexture(number, faceOpts);
  const faceMat = new THREE.MeshStandardMaterial({ map: face.texture, roughness: .42, metalness: .08 });
  const backMat = new THREE.MeshStandardMaterial({ map: backTexture(), roughness: .7, metalness: .2 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(mm(P.w), mm(P.h), .3), [steel, steel, steel, steel, faceMat, backMat]);
  plate.position.set(0, mm(PO.topOfShield) - mm(P.h) / 2, mm(PO.w) / 2 + .3);
  plate.userData.part = 'plate';
  group.add(plate);

  // definition plate under it
  let def = null;
  if (defPlate) {
    const dm = new THREE.MeshStandardMaterial({ map: defPlateTexture(kind), roughness: .42, metalness: .08 });
    def = new THREE.Mesh(new THREE.BoxGeometry(mm(D.w), mm(D.h), .3), [steel, steel, steel, steel, dm, backMat]);
    def.position.set(0, mm(PO.topOfShield - P.h - PO.gapToDefPlate) - mm(D.h) / 2, mm(PO.w) / 2 + .3);
    def.userData.part = 'def';
    group.add(def);
  }

  // post: 75 × 75 mm, painted in 25 cm bands, lowest black (cl. 6). One box with a striped texture: one draw call.
  let postMesh = null, bandTex = null;
  const H = mm(PO.topOfShield) - mm(SPEC.holes.fromTop), band = mm(colours.postBands.h), nBands = Math.ceil(H / band);
  const bandTexture = lowestBlack => {
    const c = document.createElement('canvas'); c.width = 4; c.height = nBands * 32; const x = c.getContext('2d');
    for (let i = 0; i < nBands; i++) { x.fillStyle = ((i % 2 === 0) === lowestBlack) ? '#141414' : '#e9e9e4'; x.fillRect(0, c.height - (i + 1) * 32, 4, 32); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; return t;
  };
  if (post) {
    bandTex = bandTexture(true);
    const top = new THREE.MeshStandardMaterial({ color: '#e9e9e4', roughness: .55 }), side = new THREE.MeshStandardMaterial({ map: bandTex, roughness: .55 });
    postMesh = new THREE.Mesh(new THREE.BoxGeometry(mm(PO.w), nBands * band, mm(PO.w)), [side, side, top, top, side, side]);
    postMesh.position.y = nBands * band / 2; postMesh.castShadow = shadows; postMesh.userData.part = 'post';
    group.add(postMesh);
  }
  plate.castShadow = shadows; if (def) def.castShadow = shadows;

  group.scale.setScalar(scale);
  const api = {
    group, plate, post: postMesh, def, face,
    setNumber(n, opts) { const f = faceTexture(n, opts); faceMat.map.dispose(); faceMat.map = f.texture; faceMat.needsUpdate = true; api.face = f; return f.layout; },
    setKind(k) { if (!def) return; def.material[4].map.dispose(); def.material[4].map = defPlateTexture(k); def.material[4].needsUpdate = true; },
    /** lowestBlack=false swaps the bands, the mistake cl. 6 forbids */
    setBands(lowestBlack = true) { if (!postMesh) return; bandTex.dispose(); bandTex = bandTexture(lowestBlack); postMesh.material[0].map = bandTex; postMesh.material[0].needsUpdate = true; },
  };
  return api;
}
