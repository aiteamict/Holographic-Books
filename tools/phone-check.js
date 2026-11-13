// Phone layout check for the books that use phoneLayout: 2 (the IRC 38 chapters). Run it against the dev server
// (npx vite --host --port 5173) with a Playwright page: it is one async function taking `page`.
// It walks every spread of every chapter at six screen sizes with touch emulation and reports, per size:
//   problems  controls off-screen or overlapping, the canvas under the panel, text under 12 px, a step panel under 60 px,
//             a hologram cut off by the canvas edge or filling less than half of it
//   avgModelShare / minModelShare  the share of the whole screen the hologram's bounding box covers
// Zero problems at every size is the pass mark.
async (page) => {
  const SIZES = [[320, 568], [360, 640], [390, 844], [430, 932], [844, 390], [768, 1024]];
  const BOOKS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `irc-38-1988-${n}`);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const report = {}, errs = []; page.on('pageerror', e => errs.push(e.message));
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
    const bad = []; let n = 0, share = 0, minShare = 1;
    for (const book of BOOKS) {
      await page.goto(`http://localhost:5173/${book}/?phone`); await page.bringToFront();
      await page.evaluate(() => document.getElementById('go-quiet').click());   // a synthetic click: mouse clicks stall under touch emulation
      await page.waitForFunction(() => window.__book?.built, null, { timeout: 30000 });
      for (let k = 1; k <= 12; k++) {
        await page.evaluate(k => window.__book.goTo(k), k); await page.waitForTimeout(2000);   // page turn, hologram pop, camera fit
        const r = await page.evaluate(k => {
          const b = window.__book, i = b.built[k]; if (!i) return null;
          const out = [], vw = innerWidth, vh = innerHeight, R = el => el.getBoundingClientRect();
          if (!document.body.classList.contains('phone')) out.push('not in phone mode');
          const cv = R(document.getElementById('c')), sh = R(document.getElementById('mshell')), wide = vw > vh && vh <= 520;
          if (wide ? cv.right > sh.left + 1 : cv.bottom > sh.top + 1) out.push('canvas under panel');
          for (const id of ['mshell', 'mbar', 'mrow', 'gpanel', 'actions']) {
            const el = document.getElementById(id); if (!el) continue; const q = R(el); if (q.width < 2) continue;
            if (q.left < -1 || q.right > vw + 1 || q.top < -1 || q.bottom > vh + 1) out.push(id + ' off-screen');
          }
          const row = [...document.querySelectorAll('#mbar button, #mrow button')].filter(e => R(e).width > 2).map(R);
          search: for (let a = 0; a < row.length; a++) for (let c = a + 1; c < row.length; c++) {
            const A = row[a], B = row[c];
            if (A.left < B.right - 1 && B.left < A.right - 1 && A.top < B.bottom - 1 && B.top < A.bottom - 1) { out.push('buttons overlap'); break search; }
          }
          for (const el of document.querySelectorAll('#gpanel p, #gpanel small, #gpanel button, #actions button, #m-read, #mdots button')) {
            const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) { out.push('text ' + fs + 'px'); break; }
          }
          const gp = document.getElementById('gpanel'); if (gp && R(gp).height > 2 && R(gp).height < 60) out.push('step panel only ' + Math.round(R(gp).height) + 'px');
          const v = new b.THREE.Vector3(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; i.group.updateMatrixWorld(true);
          i.group.traverseVisible(o => {
            if (!o.geometry || o.material?.opacity === 0 || o.userData.noFit) return;
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox; if (!bb || bb.isEmpty()) return;
            for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) {
              v.set(x, y, z).applyMatrix4(o.matrixWorld).project(b.camera); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
            }
          });
          if (x0 < -1.02 || x1 > 1.02 || y0 < -1.02 || y1 > 1.02) out.push(`hologram cut off (${x0.toFixed(2)}, ${x1.toFixed(2)}, ${y0.toFixed(2)}, ${y1.toFixed(2)})`);
          const fill = Math.min(2, x1 - x0) * Math.min(2, y1 - y0) / 4;
          if (fill < .5) out.push('hologram fills only ' + Math.round(fill * 100) + '% of the canvas');
          return { out, share: fill * cv.width * cv.height / (vw * vh) };
        }, k);
        if (!r) break;
        n++; share += r.share; minShare = Math.min(minShare, r.share);
        if (r.out.length) bad.push(`${book} spread ${k}: ${r.out.join('; ')}`);
      }
    }
    report[`${w}x${h}`] = { spreads: n, avgModelShare: +(share / n).toFixed(2), minModelShare: +minShare.toFixed(2), problems: bad.length, list: bad.slice(0, 25) };
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride'); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  return { pageErrors: errs.slice(0, 5), report };
}
