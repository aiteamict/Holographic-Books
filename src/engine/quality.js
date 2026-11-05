// Quality tiers: measured once on the cover, before any spread is built, so line thickness can be decided up front.
export const TIERS = {
  high:   { dpr: 2,    ao: true,  aoMode: 'Medium', shadow: 2048, thick: true,  dof: true,  dust: true,  env: .3 },    // native pixels on 2× displays: text stays crisp
  medium: { dpr: 1.5,  ao: true,  aoMode: 'Low',    shadow: 1024, thick: true,  dof: false, dust: true,  env: .2 },
  low:    { dpr: 1,    ao: false, aoMode: 'Low',    shadow: 1024, thick: false, dof: false, dust: false, env: 0 },
  phone:  { dpr: 1.5,  ao: false, aoMode: 'Low',    shadow: 1024, thick: true,  dof: false, dust: false, env: .15 },   // touch devices: crisp lines, no AO, no dust
};

/** Median frame time over `frames` animation frames, after a short warm-up. */
export function measureFrameMs(frames = 50) {
  return new Promise(res => {
    const t = []; let warm = 10;
    const f = now => {
      if (warm-- > 0) { requestAnimationFrame(f); return; }
      t.push(now);
      if (t.length <= frames) requestAnimationFrame(f);
      else { const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b); res(d[Math.floor(d.length / 2)]); }
    };
    requestAnimationFrame(f);
  });
}

export function pickTier(medianMs, forced) {
  if (forced && TIERS[forced]) return forced;
  // measured on the cover with AO on, DoF off, DPR 1.5: the 16.7 ms line is the target, 40 ms is where thin lines help more than they hurt
  return medianMs <= 24 ? 'high' : medianMs <= 40 ? 'medium' : 'low';
}
