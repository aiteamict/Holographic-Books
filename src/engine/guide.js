// A guided sequence for one spread: three (or so) steps, one persistent explanation card anchored on the hologram,
// an optional one-tap reasoning check per step, then free play. The card never times out; it changes with the step and
// with whatever the spread tells it (`say`). Controls not named by the current step are hidden until "Explore".
import { textPlane, cardBg, wrapText } from '../spreads/util.js';

const F = 'Inter, Segoe UI, Arial';

/**
 * steps: [{ title, text, show: [action labels], enter?: fn, check?: { q, options: [..], answer: index, why } }]
 * anchor: [x, y, z] in the spread's group; w, h in cm. onChange fires after every step/free/check change.
 */
export function makeGuide(ctx, { steps, anchor = [0, 14, 0], w = 11, h = 4.8, rotY = 0, onChange } = {}) {
  let i = 0, free = false, said = '', picked = -1, boxes = [];
  const px = 48;
  const card = textPlane({ w, h, px, draw: (c, Wc, Hc) => {
    const s = steps[i], chk = s.check, done = picked === chk?.answer;
    cardBg(c, Wc, Hc, { stroke: free ? 'rgba(47,143,85,.8)' : chk ? 'rgba(29,95,135,.9)' : 'rgba(176,83,42,.85)' });
    c.fillStyle = free ? '#1f7a45' : '#8a3f1c'; c.font = `700 16px ${F}`; c.textAlign = 'left';
    c.fillText(free ? 'EXPLORE · everything is live' : `STEP ${i + 1} OF ${steps.length} · ${s.title.toUpperCase()}`, 22, 30);
    c.fillStyle = '#1f2328'; c.font = `500 20px ${F}`;
    const body = said || (chk && picked >= 0 ? (done ? `✓ ${chk.why}` : `✗ Not that one. ${chk.why}`) : chk ? chk.q : s.text);
    let y = 60; for (const line of wrapText(c, body, Wc - 44)) { c.fillText(line, 22, y); y += 26; }
    boxes = [];
    if (chk && !free) {   // option chips along the bottom
      const n = chk.options.length, gap = 10, bw = (Wc - 44 - gap * (n - 1)) / n, by = Hc - 70, bh = 36;   // chips sit above the "next" hint
      chk.options.forEach((o, k) => {
        const bx = 22 + k * (bw + gap), hit = picked === k, ok = k === chk.answer;
        c.fillStyle = hit ? (ok ? 'rgba(47,143,85,.28)' : 'rgba(194,59,47,.28)') : 'rgba(29,95,135,.12)';
        c.strokeStyle = hit ? (ok ? '#1f7a45' : '#b3362b') : 'rgba(29,95,135,.55)'; c.lineWidth = 1.5;
        c.beginPath(); c.roundRect(bx, by, bw, bh, 9); c.fill(); c.stroke();
        let fs = 18; c.font = `600 ${fs}px ${F}`; while (c.measureText(o).width > bw - 14 && fs > 11) { fs--; c.font = `600 ${fs}px ${F}`; }   // long options shrink to fit
        c.fillStyle = '#1f2328'; c.textAlign = 'center'; c.fillText(o, bx + bw / 2, by + 25); c.textAlign = 'left';
        boxes.push({ x0: bx / Wc, x1: (bx + bw) / Wc, y0: 1 - (by + bh) / Hc, y1: 1 - by / Hc, k });   // uv space (v up)
      });
    }
    const last = i >= steps.length - 1, canNext = !chk || done;
    if (!free && canNext) { c.fillStyle = '#1d5f87'; c.font = `600 15px ${F}`; c.textAlign = 'right'; c.fillText(last ? 'tap · explore freely →' : 'tap · next step →', Wc - 20, Hc - 14); c.textAlign = 'left'; }
  } });
  card.position.set(...anchor); card.rotation.y = rotY; card.userData.guide = true; card.renderOrder = 5;

  const api = {
    card, steps, onChange,                 // main.js replaces onChange to keep the step strip in sync
    get step() { return i; }, get free() { return free; }, get titles() { return steps.map(s => s.title); },
    /** show step j (or Explore when j >= steps.length) */
    go(j) {
      said = ''; picked = -1;
      if (j >= steps.length) { free = true; i = steps.length - 1; }
      else { free = false; i = Math.max(0, j); steps[i].enter?.(); }
      card.redraw(); ctx.ui.refreshActions?.(); api.onChange?.(api);
    },
    next() { const s = steps[i]; if (s.check && picked !== s.check.answer && !free) return false; api.go(free ? i : i + 1); return true; },
    explore() { api.go(steps.length); },
    /** dynamic body text for the current step (readouts); '' restores the step text */
    say(t) { said = t || ''; card.redraw(); },
    /** does the current step allow this action label? */
    allows(label) { return free || (steps[i].show || []).includes(label); },
    /** wrap a spread's actions so hidden() follows the guide */
    wrap(actions) { return actions.map(a => ({ ...a, hidden: () => !api.allows(a.label) || !!a.hidden?.() })); },
    /** choose option k of the current check (from the card or from the phone panel) */
    pick(k) { const s = steps[i]; if (!s.check || free) return; picked = k; card.redraw(); ctx.snd?.play(k === s.check.answer ? 'tick' : 'step'); api.onChange?.(api); },
    /** what the current step shows, for a DOM mirror on small screens */
    get current() { const s = steps[i], chk = s.check, done = picked === chk?.answer; return { title: free ? 'Explore' : `Step ${i + 1} of ${steps.length} · ${s.title}`, free, text: free ? 'Everything is live. Pick a step above to go back.' : chk ? (picked >= 0 ? (done ? `✓ ${chk.why}` : `✗ Not that one. ${chk.why}`) : chk.q) : s.text, options: chk && !free ? chk.options : null, picked, answer: chk?.answer, canNext: !free && (!chk || done), last: i >= steps.length - 1 }; },
    /** handle a tap on the card; returns true when consumed */
    tap(hit) {
      if (hit.object !== card) return false;
      const s = steps[i], uv = hit.uv;
      if (s.check && !free && uv) {
        const b = boxes.find(b => uv.x >= b.x0 && uv.x <= b.x1 && uv.y >= b.y0 && uv.y <= b.y1);
        if (b) { api.pick(b.k); return true; }
        if (picked !== s.check.answer) return true;      // must answer before moving on
      }
      api.next(); return true;
    },
    reset() { free = false; i = 0; said = ''; picked = -1; steps[0].enter?.(); card.redraw(); api.onChange?.(api); },
    get debug() { return { step: i, free, picked }; },
  };
  return api;
}
