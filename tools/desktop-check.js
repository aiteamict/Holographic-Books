// Desktop walk of one IRC 24 chapter (set CH): every spread, every control twice, card text overflow, page errors, one screenshot a spread.
// Run it against the dev server with a Playwright page: it is one async function taking `page`.
async (page) => {
  const CH = 2;
  const cdp = await page.context().newCDPSession(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.setViewportSize({ width: 1400, height: 900 });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.addInitScript(() => {
    const o = CanvasRenderingContext2D.prototype.fillText; window.__ovf = [];
    CanvasRenderingContext2D.prototype.fillText = function (t, x, y) {
      try {
        const tr = this.getTransform(), w = this.measureText(t).width, W = this.canvas.width / tr.a, H = this.canvas.height / tr.d;
        const l = this.textAlign === 'right' ? x - w : this.textAlign === 'center' ? x - w / 2 : x, r = l + w;
        if (W > 430 && W < 450 && (l < 6 || r > W - 6 || y > H - 4)) window.__ovf.push(String(t).slice(0, 60) + ' | ' + Math.round(l) + '..' + Math.round(r) + ' of ' + Math.round(W) + ', y ' + Math.round(y) + ' of ' + Math.round(H));
      } catch (e) {}
      return o.apply(this, arguments);
    };
  });
  await page.goto('http://localhost:5173/irc-24-2010-' + CH + '/'); await page.bringToFront();
  await page.evaluate(() => document.getElementById('go-quiet').click());
  await page.waitForFunction(() => window.__book?.built, null, { timeout: 30000 });
  const out = {};
  for (let k = 1; k <= 12; k++) {
    await page.evaluate(k => window.__book.goTo(k), k);
    if (!await page.evaluate(k => !!window.__book.built[k], k)) break;
    await page.waitForFunction(k => window.__book.built[k].group.visible, k, { timeout: 15000 }); await page.waitForTimeout(1800);
    await page.screenshot({ path: 'd:/dev/work/Three.js/.playwright-mcp/s24/c' + CH + '-' + k + '.png' });
    out[k] = await page.evaluate(async k => {
      const i = window.__book.built[k], n = i.a11y.length, bad = [];
      for (let pass = 0; pass < 2; pass++) for (let j = 0; j < n; j++) { try { i.a11y[pass ? n - 1 - j : j].run(); } catch (e) { bad.push(i.a11y[j].label + ': ' + e.message); } await new Promise(r => setTimeout(r, 30)); }
      let dbg; try { dbg = JSON.stringify(i.debug).slice(0, 160); } catch (e) { bad.push('debug: ' + e.message); }
      try { i.reset(); } catch (e) { bad.push('reset: ' + e.message); }
      return { actions: n, bad, dbg };
    }, k);
    await page.waitForTimeout(300);
  }
  const ovf = await page.evaluate(() => [...new Set(window.__ovf)].slice(0, 30));
  return { errs: errs.slice(0, 8), ovf, out };
}
