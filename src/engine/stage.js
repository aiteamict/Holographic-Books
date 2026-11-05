// Renderer, scene, lights, desk and the post-processing chain.
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect, DepthOfFieldEffect } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LiquidGlassEffect } from './liquidglass.js';

/** A procedural laminate: dark blue-grey with grain and faint streaks, tiled across the drafting table. */
function laminateTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#1a1f27'; g.fillRect(0, 0, 512, 512);
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 9000; i++) { const v = 18 + rnd() * 26; g.fillStyle = `rgba(${v + 4},${v + 8},${v + 16},${.25 + rnd() * .35})`; g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2); }
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(255,255,255,${.012 + rnd() * .02})`; g.lineWidth = .6 + rnd() * 1.2; g.beginPath(); const y = rnd() * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + (rnd() - .5) * 60, 340, y + (rnd() - .5) * 60, 512, y + (rnd() - .5) * 20); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 7); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
/** A cutting-mat grid that lies under the book only: 1 cm lines, 5 cm heavier, very faint. */
function matTexture() {
  const c = document.createElement('canvas'); c.width = 700; c.height = 480; const g = c.getContext('2d');   // 10 px per cm
  g.fillStyle = 'rgba(70,96,112,.16)'; g.fillRect(0, 0, 700, 480);
  for (let x = 0; x <= 700; x += 10) { g.fillStyle = x % 50 ? 'rgba(130,170,190,.10)' : 'rgba(130,170,190,.24)'; g.fillRect(x, 0, 1, 480); }
  for (let y = 0; y <= 480; y += 10) { g.fillStyle = y % 50 ? 'rgba(130,170,190,.10)' : 'rgba(130,170,190,.24)'; g.fillRect(0, y, 700, 1); }
  g.strokeStyle = 'rgba(160,200,220,.35)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 697, 477);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
/** The far backdrop: a vertical gradient with a soft cyan glow behind the hologram side, dithered so it never bands. */
function backdropMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uBottom: { value: new THREE.Color('#05070b') }, uTop: { value: new THREE.Color('#151d2a') }, uGlow: { value: new THREE.Color('#174553') }, uGlowDir: { value: new THREE.Vector3(.5, .3, -.8).normalize() } },
    vertexShader: 'varying vec3 vPos; void main(){ vPos = (modelMatrix * vec4(position,1.)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 vPos; uniform vec3 uBottom, uTop, uGlow, uGlowDir;
      void main(){ vec3 d = normalize(vPos); float h = smoothstep(-.15, .9, d.y);
        vec3 c = mix(uBottom, uTop, h); c += uGlow * pow(max(dot(d, uGlowDir), 0.), 10.) * .9;
        float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453); c += (n - .5) * (2. / 255.);
        gl_FragColor = vec4(c, 1.); }`,
  });
}

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  const off = new Set((new URLSearchParams(location.search).get('fx') || '').split(',')); // debug: ?fx=noao,nodof,noglass
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07080c');
  scene.fog = new THREE.Fog('#0a0e15', 140, 380);
  // the room: a far backdrop sphere (gradient + glow behind the hologram side) and an environment map for the metals
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(390, 48, 24), backdropMaterial()));
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .3; pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(34, 1, 1, 800);
  camera.position.set(8, 62, 58);

  // world units are centimetres, so lights use decay 0 and plain intensities instead of candela falloff
  scene.add(new THREE.HemisphereLight(0x9fb4d4, 0x14161c, 1.1));
  // a desk lamp: a tighter, warmer pool on the open spread; a cool spill from the hologram side so the right page glows faintly cyan
  const key = new THREE.SpotLight(0xfff0dc, 3.6, 500, Math.PI / 6.5, .65, 0);
  key.position.set(-30, 110, 50); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0006; key.shadow.normalBias = .4;
  key.target.position.set(0, 0, 0); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x9fc3ff, .55); fill.position.set(60, 40, -40); scene.add(fill);
  const holoLight = new THREE.PointLight(0x4fd8ff, .9, 120, 0); holoLight.position.set(12, 16, 0); scene.add(holoLight);
  const cool = new THREE.SpotLight(0x4fd8ff, 1.1, 320, Math.PI / 6, .9, 0); cool.position.set(70, 80, 30); cool.target.position.set(26, 0, 0); scene.add(cool, cool.target);

  // the drafting table: laminate top with a bevelled edge, and a cutting mat under the book
  const desk = new THREE.Mesh(new THREE.BoxGeometry(600, 4, 600), new THREE.MeshStandardMaterial({ map: laminateTexture(), roughness: .55, metalness: .04 }));
  desk.position.y = -2.9; desk.receiveShadow = true; scene.add(desk);
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(70, 48), new THREE.MeshStandardMaterial({ map: matTexture(), transparent: true, roughness: .8, metalness: 0, depthWrite: false }));
  mat.rotation.x = -Math.PI / 2; mat.position.set(0, -.88, 0); mat.receiveShadow = true; scene.add(mat);

  // dust in the lamp light: a few hundred drifting motes, tier-gated
  const DUST = 420, dustPos = new Float32Array(DUST * 3), dustVel = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dustPos[i * 3] = -50 + Math.random() * 130; dustPos[i * 3 + 1] = Math.random() * 60; dustPos[i * 3 + 2] = -60 + Math.random() * 110; dustVel[i * 3] = (Math.random() - .5) * .6; dustVel[i * 3 + 1] = -.25 - Math.random() * .35; dustVel[i * 3 + 2] = (Math.random() - .5) * .6; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const moteTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xbfd8e8, map: moteTex, size: .42, sizeAttenuation: true, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, fog: true }));
  scene.add(dust);
  const driftDust = dt => { for (let i = 0; i < DUST; i++) { let x = dustPos[i * 3] + dustVel[i * 3] * dt, y = dustPos[i * 3 + 1] + dustVel[i * 3 + 1] * dt, z = dustPos[i * 3 + 2] + dustVel[i * 3 + 2] * dt; if (y < 0) { y = 60; x = -50 + Math.random() * 130; z = -60 + Math.random() * 110; } dustPos[i * 3] = x; dustPos[i * 3 + 1] = y; dustPos[i * 3 + 2] = z; } dustGeo.attributes.position.needsUpdate = true; };

  // ---- post chain: render → AO → (DoF, cover only) → bloom/vignette/tone/SMAA → liquid glass for the UI
  // MSAA ×4 in the composer instead of SMAA: SMAA is a post-blur and smears thin text edges
  const msaa = renderer.capabilities.isWebGL2 ? 4 : 0;
  const composer = new EffectComposer(renderer, { multisampling: msaa });
  composer.addPass(new RenderPass(scene, camera));
  const ao = new N8AOPostPass(scene, camera, 1, 1);
  ao.configuration.aoRadius = 4; ao.configuration.distanceFalloff = 1.5; ao.configuration.intensity = 2.4; ao.configuration.halfRes = true;
  ao.configuration.color = new THREE.Color('#05070c'); ao.setQualityMode('Medium');
  if (!off.has('noao')) composer.addPass(ao);
  const dof = new DepthOfFieldEffect(camera, { focalLength: .05, bokehScale: 2.6 });
  dof.target = new THREE.Vector3(13, 1.5, 0);
  const dofPass = new EffectPass(camera, dof); if (!off.has('nodof')) composer.addPass(dofPass);
  // bloom kept to the hologram lines (high threshold, small radius) so glyphs do not halo; neutral tone mapping keeps
  // white text white where ACES would grey it down
  const bloom = new BloomEffect({ luminanceThreshold: .86, luminanceSmoothing: .15, intensity: .6, mipmapBlur: true, radius: .4 });
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL ?? ToneMappingMode.AGX ?? ToneMappingMode.ACES_FILMIC });
  const vignette = new VignetteEffect({ offset: .3, darkness: .45 });
  const effects = [bloom, vignette, tone]; if (!msaa) effects.push(new SMAAEffect());
  const fxPass = new EffectPass(camera, ...effects); fxPass.dithering = true;   // no banding rings in the dark gradient
  composer.addPass(fxPass);
  const glass = new LiquidGlassEffect();
  // opt-in (?fx=glass): the pass is only added when wanted, because a disabled *last* pass leaves nothing rendering to screen
  const glassPass = new EffectPass(camera, glass); if (off.has('glass')) composer.addPass(glassPass); else glassPass.enabled = false;

  const onResize = [];
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    const db = renderer.getDrawingBufferSize(new THREE.Vector2()); glass.setSize(db.x, db.y); for (const cb of onResize) cb(db.x, db.y);
  }
  addEventListener('resize', resize); resize();

  /** apply a quality tier (see quality.js) */
  function setTier(t) {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, t.dpr));
    ao.enabled = t.ao; ao.setQualityMode(t.aoMode); dust.visible = !!t.dust; scene.environmentIntensity = t.env ?? .3;
    if (key.shadow.mapSize.x !== t.shadow) { key.shadow.mapSize.set(t.shadow, t.shadow); key.shadow.map?.dispose(); key.shadow.map = null; }
    resize();
  }

  return {
    renderer, scene, camera, composer, lights: { key, fill, holoLight }, fx: { ao, dof, dofPass, glass, glassPass, bloom }, resize, setTier,
    onResize: cb => { onResize.push(cb); const db = renderer.getDrawingBufferSize(new THREE.Vector2()); cb(db.x, db.y); },
    bufferScale: () => renderer.getDrawingBufferSize(new THREE.Vector2()).x / (canvas.clientWidth || innerWidth),
    render: dt => { if (dust.visible) driftDust(Math.min(dt, .1)); composer.render(dt); },
  };
}
