// Small procedural sound cues (Web Audio, no files): a page turn, a tick for handles, a ping for tours, a pop for holograms.
export class Sound {
  constructor() { this.ctx = null; this.muted = localStorage.getItem('nh-mute') === '1'; }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : .5; this.master.connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 1.2, buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setMuted(m) { this.muted = m; localStorage.setItem('nh-mute', m ? '1' : '0'); if (this.master) this.master.gain.setTargetAtTime(m ? 0 : .5, this.ctx.currentTime, .04); }
  env(g, t, a, d, peak = 1) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0005, t + a + d); }
  noise(t, dur, f0, f1, q = 1, peak = .6) {
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain(); this.env(g, t, dur * .25, dur * .75, peak); s.connect(bp).connect(g).connect(this.master); s.start(t); s.stop(t + dur + .05);
  }
  tone(t, dur, f0, f1 = f0, type = 'sine', peak = .25) {
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain(); this.env(g, t, .008, dur, peak); o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + .05);
  }
  play(name) {
    if (!this.ctx || this.muted) return; const t = this.ctx.currentTime + .01;
    switch (name) {
      case 'page': this.noise(t, .42, 500, 2600, .8, .5); this.noise(t + .18, .22, 1800, 700, 1.2, .25); break;
      case 'riffle': for (let i = 0; i < 4; i++) this.noise(t + i * .07, .12, 900 + i * 300, 2200, 1, .22); break;
      case 'tick': this.tone(t, .04, 1900, 1400, 'square', .12); break;
      case 'step': this.tone(t, .035, 720, 640, 'triangle', .14); break;
      case 'ping': this.tone(t, .35, 880, 1320, 'sine', .14); this.tone(t + .04, .5, 1760, 1760, 'sine', .05); break;
      case 'pop': this.tone(t, .16, 240, 520, 'sine', .22); this.noise(t, .08, 3000, 6000, .7, .12); break;
      case 'nope': this.tone(t, .12, 220, 160, 'sawtooth', .12); break;
    }
  }
}
