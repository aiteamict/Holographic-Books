// A screen-space "liquid glass" pass for the UI: the frame behind each DOM card is refracted toward the card's
// centre, blurred a little, tinted, and given a rim highlight and a soft drop shadow. The UI reports its rectangles.
import * as THREE from 'three';
import { Effect, BlendFunction, EffectAttribute } from 'postprocessing';

export const MAX_RECTS = 16;

const frag = /* glsl */`
uniform vec4 uRects[${MAX_RECTS}];   // x, y, w, h in buffer pixels, origin top-left
uniform vec4 uStyle[${MAX_RECTS}];   // corner radius px, tint 0..1, strength 0..1, highlight 0..1
uniform int uCount;
uniform vec2 uRes;

float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec3 blurAt(vec2 uv, float px) {
  vec3 c = vec3(0.0); float w = 0.0;
  for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) {
    vec2 o = vec2(float(i), float(j)) * px / uRes; float k = 1.0 - 0.1 * float(i * i + j * j);
    c += texture2D(inputBuffer, uv + o).rgb * k; w += k;
  }
  return c / w;
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 fp = vec2(uv.x * uRes.x, (1.0 - uv.y) * uRes.y);
  vec3 col = inputColor.rgb; float shadow = 0.0;
  for (int i = 0; i < ${MAX_RECTS}; i++) {
    if (i >= uCount) break;
    vec4 R = uRects[i]; vec4 S = uStyle[i];
    if (S.z < 0.01) continue;
    vec2 hb = R.zw * 0.5, c = R.xy + hb, p = fp - c;
    float r = min(S.x, min(hb.x, hb.y));
    float d = sdBox(p, hb, r);
    if (d > 0.0) { float sd = sdBox(p - vec2(0.0, 10.0), hb, r); shadow = max(shadow, (1.0 - smoothstep(0.0, 30.0, sd)) * 0.35 * S.z); continue; }
    vec2 g = vec2(sdBox(p + vec2(1.0, 0.0), hb, r) - sdBox(p - vec2(1.0, 0.0), hb, r), sdBox(p + vec2(0.0, 1.0), hb, r) - sdBox(p - vec2(0.0, 1.0), hb, r));
    vec2 n = normalize(g + 1e-5);
    float band = min(24.0, min(hb.x, hb.y) * 0.9);
    float edge = 1.0 - smoothstep(0.0, band, -d);
    float lens = edge * edge * (1.0 + 0.5 * S.w);
    vec2 off = (-n * lens * 32.0 - p * 0.05) / uRes; off.y = -off.y;
    vec3 refr;
    refr.r = blurAt(uv + off * 1.05, 1.4).r; refr.g = blurAt(uv + off, 1.4).g; refr.b = blurAt(uv + off * 0.95, 1.4).b;
    vec3 glass = mix(refr, vec3(0.03, 0.05, 0.07), S.y * 0.8) + vec3(0.012, 0.016, 0.024);
    float rim = 1.0 - smoothstep(0.0, 2.0, abs(d + 1.0));
    float rim2 = (1.0 - smoothstep(0.0, 1.4, abs(d + 3.4))) * 0.4;
    vec2 L = normalize(vec2(-0.45, -0.9)); float facing = max(0.0, dot(n, L));
    float spec = rim * (0.3 + 0.7 * facing) + rim2 * facing;
    glass += spec * vec3(0.72, 0.9, 1.0) * 0.65 + edge * edge * refr * 0.2;
    col = mix(col, glass, (1.0 - smoothstep(-0.8, 0.8, d)) * S.z);
    shadow = 0.0;
  }
  col *= 1.0 - shadow;
  outputColor = vec4(col, inputColor.a);
}`;

export class LiquidGlassEffect extends Effect {
  constructor() {
    super('LiquidGlassEffect', frag, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map([
        ['uRects', new THREE.Uniform(Array.from({ length: MAX_RECTS }, () => new THREE.Vector4()))],
        ['uStyle', new THREE.Uniform(Array.from({ length: MAX_RECTS }, () => new THREE.Vector4()))],
        ['uCount', new THREE.Uniform(0)],
        ['uRes', new THREE.Uniform(new THREE.Vector2(1, 1))],
      ]),
    });
  }
  setSize(w, h) { this.uniforms.get('uRes').value.set(w, h); }
  /** rects: [{ x, y, w, h, r, tint, strength, hi }] in CSS px; scale = buffer px per CSS px */
  setRects(rects, scale) {
    const R = this.uniforms.get('uRects').value, S = this.uniforms.get('uStyle').value;
    const n = Math.min(rects.length, MAX_RECTS);
    for (let i = 0; i < n; i++) { const q = rects[i]; R[i].set(q.x * scale, q.y * scale, q.w * scale, q.h * scale); S[i].set(q.r * scale, q.tint ?? .55, q.strength ?? 1, q.hi ?? 0); }
    this.uniforms.get('uCount').value = n;
  }
}
