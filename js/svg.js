/* svg.js: flat line-art mannequin and garment templates.
   Every garment is drawn in the same 200 x 440 coordinate space as the mannequin,
   so worn pieces layer onto the figure, and thumbnails are the same art with a cropped viewBox.
   Garment colour is applied through CSS: each garment group sets --g and filled shapes use .g-fill. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});

  const INK = '#1E1E1C';
  const SKIN = ['#F3D9C4', '#E2B896', '#C68E65', '#8D5B3E', '#5A3A28'];
  const BODY = { slim: 0.9, regular: 1, broad: 1.12 };

  // Mirror a left-half outline (starting and ending on the centre line x=100) into a full polygon.
  function sym(pts) {
    const right = pts.slice().reverse().map(([x, y]) => [200 - x, y]);
    return pts.concat(right).map((p) => p.join(',')).join(' ');
  }
  const pts = (arr) => arr.map((p) => p.join(',')).join(' ');
  const mirrorPts = (arr) => arr.map(([x, y]) => [200 - x, y]);
  const poly = (points, cls = 'g-fill') => `<polygon class="${cls}" points="${points}"/>`;
  const line = (d) => `<path class="g-line" d="${d}"/>`;
  const both = (d) => line(d) + `<g transform="translate(200 0) scale(-1 1)">${line(d)}</g>`;

  // Long or short sleeve geometry shared by tops and layers.
  function sleeve(kind, outer) {
    // outer: how far the garment sits outside the body (layers sit wider)
    const o = outer || 0;
    if (kind === 'short') return [[66 - o, 70], [56 - o, 80], [50 - o, 104], [64 - o, 110], [69 - o, 98]];
    if (kind === 'elbow') return [[66 - o, 70], [56 - o, 80], [50 - o, 132], [48 - o, 150], [61 - o, 153], [64 - o, 140], [69 - o, 108]];
    return [[66 - o, 70], [56 - o, 80], [50 - o, 140], [45 - o, 202], [47 - o, 208], [59 - o, 208], [61 - o, 198], [64 - o, 146], [69 - o, 110]];
  }

  function top(opts) {
    const { neck = 72, sl = 'long', hem = 212, body = 70, wide = 0 } = opts;
    const s = sleeve(sl, wide);
    const left = [[100, neck], [88, 66], [82, 64]].concat(s, [[body - wide, 150], [body - wide, hem], [100, hem]]);
    return poly(sym(left));
  }

  function layerShape(opts) {
    const { len = 220, open = false, sl = 'long' } = opts;
    const s = sleeve(sl, 3);
    if (!open) {
      return poly(sym([[100, 72], [88, 63], [80, 61]].concat(s, [[66, 150], [65, len], [100, len]])));
    }
    const leftPanel = [[88, 63], [80, 61]].concat(s, [[66, 150], [65, len], [90, len], [90, 90]]);
    return poly(pts(leftPanel)) + poly(pts(mirrorPts(leftPanel)));
  }

  function trousers(opts) {
    const { waist = 186, hemY = 392, hemOuter = 76, hemInner = 98, thigh = 68, crotch = 232 } = opts;
    return poly(sym([[100, waist], [70, waist], [thigh, 214], [hemOuter - 4 + (thigh - 68) * 0.5, 300], [hemOuter, hemY], [hemInner, hemY], [100, crotch]]));
  }

  function shoe(left) {
    return `<g>${left}</g><g transform="translate(200 0) scale(-1 1)">${left}</g>`;
  }

  // Each template: draw(v) -> inner SVG markup, box -> thumbnail viewBox.
  // v = { tuck, roll, open }.
  const T = {
    tee: { box: '38 56 124 166', variants: ['tuck'], draw: (v) =>
      top({ sl: 'short', hem: v.tuck ? 194 : 212 }) + line('M88,66 Q100,77 112,66') + (v.tuck ? line('M72,190 Q100,196 128,190') : '') },
    boxy: { box: '36 56 128 160', variants: ['tuck'], draw: (v) =>
      top({ sl: 'elbow', hem: v.tuck ? 194 : 206, wide: 3 }) + line('M88,66 Q100,76 112,66') + line('M86,67 Q100,80 114,67') },
    knit: { box: '38 56 124 160', variants: ['tuck', 'roll'], draw: (v) =>
      top({ sl: v.roll ? 'elbow' : 'long', hem: v.tuck ? 194 : 214 }) + line('M88,66 Q100,78 112,66') +
      line(`M70,${v.tuck ? 188 : 206} L130,${v.tuck ? 188 : 206}`) + (v.roll ? both('M49,144 L63,147') : both('M46,200 L60,201')) },
    shirt: { box: '38 56 124 166', variants: ['tuck', 'roll'], draw: (v) => {
      const hem = v.tuck ? 194 : 214;
      let s = top({ sl: v.roll ? 'elbow' : 'long', hem, neck: 74 });
      s += `<polygon class="g-fill" points="88,64 96,82 100,74"/><polygon class="g-fill" points="112,64 104,82 100,74"/>`;
      s += line('M88,64 L96,82 L100,74 L104,82 L112,64') + line(`M100,76 L100,${hem}`);
      [96, 116, 136, 156, 176].forEach((y) => { if (y < hem - 6) s += `<circle class="g-line" cx="102.5" cy="${y}" r="1.4"/>`; });
      s += v.roll ? both('M49,144 L63,147') : both('M46,198 L60,199');
      return s; } },
    camp: { box: '38 56 124 160', variants: ['tuck'], draw: (v) => {
      const hem = v.tuck ? 194 : 208;
      let s = top({ sl: 'short', hem, neck: 96, wide: 2 });
      s += line('M100,96 L90,72 L84,64') + line('M100,96 L110,72 L116,64') + line('M90,72 L94,84 M110,72 L106,84');
      [112, 134, 156, 178].forEach((y) => { if (y < hem - 6) s += `<circle class="g-line" cx="101.5" cy="${y}" r="1.3"/>`; });
      return s; } },

    overshirt: { box: '34 54 132 172', variants: ['open'], draw: (v) => {
      let s = layerShape({ len: 220, open: v.open });
      s += both('M72,98 L90,98 L90,118 L72,118 Z') + both('M72,98 L90,98 L81,104 Z');
      if (!v.open) { s += line('M100,72 L100,220'); [92, 116, 140, 164, 188].forEach((y) => { s += `<circle class="g-line" cx="102.5" cy="${y}" r="1.5"/>`; }); }
      return s; } },
    blazer: { box: '34 54 132 182', variants: ['open'], draw: (v) => {
      let s = layerShape({ len: 230, open: v.open });
      s += both('M88,63 L84,74 L94,114 L100,128') + both('M70,182 L90,182');
      if (!v.open) s += `<circle class="g-line" cx="100" cy="146" r="2"/><circle class="g-line" cx="100" cy="170" r="2"/>`;
      return s; } },
    bomber: { box: '34 54 132 160', variants: ['open'], draw: (v) => {
      let s = layerShape({ len: 208, open: v.open });
      s += both('M68,198 L94,198') + both('M47,196 L62,198') + line('M86,64 Q100,74 114,64');
      if (!v.open) s += line('M100,72 L100,208');
      s += both('M74,150 L80,176');
      return s; } },
    chore: { box: '34 54 132 176', variants: ['open'], draw: (v) => {
      let s = layerShape({ len: 224, open: v.open });
      s += both('M70,160 L88,160 L88,182 L70,182 Z') + line('M74,96 L88,96 L88,114 L74,114 Z');
      if (!v.open) { s += line('M100,72 L100,224'); [94, 124, 154, 184].forEach((y) => { s += `<circle class="g-line" cx="102.5" cy="${y}" r="1.6"/>`; }); }
      return s; } },

    chino: { box: '52 180 96 220', variants: [], draw: () =>
      trousers({ hemOuter: 78, hemInner: 97 }) + line('M70,196 L130,196') + line('M100,196 L100,222') + both('M72,200 Q80,210 84,198') },
    denim: { box: '52 180 96 220', variants: [], draw: () =>
      trousers({ hemOuter: 72, hemInner: 98, hemY: 394 }) + line('M70,196 L130,196') + line('M100,196 L100,224') +
      both('M71,200 Q82,214 86,198') + both('M85,240 L84,388') },
    wide: { box: '50 176 100 224', variants: [], draw: () =>
      trousers({ waist: 184, hemOuter: 62, hemInner: 99, hemY: 394, thigh: 66, crotch: 234 }) + line('M69,195 L131,195') +
      both('M86,196 L84,252') + both('M80,196 L78,236') + line('M100,195 L100,224') },
    drawstring: { box: '52 176 96 224', variants: [], draw: () =>
      trousers({ waist: 184, hemOuter: 76, hemInner: 98 }) + line('M70,196 L130,196') +
      line('M96,196 Q94,210 92,216 M104,196 Q106,210 108,216') + both('M77,382 L98,382') },
    shorts: { box: '52 180 96 100', variants: [], draw: () =>
      poly(sym([[100, 186], [70, 186], [67, 214], [66, 272], [98, 272], [100, 232]])) + line('M70,196 L130,196') +
      line('M100,196 L100,222') + both('M67,264 L98,264') },

    court: { box: '58 380 84 32', variants: [], draw: () =>
      shoe('<path class="g-fill" d="M72,390 L95,388 Q100,390 100,397 L100,401 L64,402 Q62,398 66,395 Z"/>' +
        '<path class="sole" d="M63,401 L100,400 L100,406 L63,406 Z"/>' + '<path class="g-line" d="M80,390 L84,398"/>') },
    canvas: { box: '58 380 84 32', variants: [], draw: () =>
      shoe('<path class="g-fill" d="M72,391 L95,389 Q100,391 100,397 L100,401 L64,402 Q62,399 66,396 Z"/>' +
        '<path class="sole" d="M63,401 L100,400 L100,406 L63,406 Z"/>' + '<path class="g-line" d="M66,396 Q70,394 74,396 M78,391 L80,398 M84,390 L86,398"/>') },
    loafer: { box: '58 382 84 28', variants: [], draw: () =>
      shoe('<path class="g-fill" d="M74,393 L95,391 Q100,393 100,399 L100,404 L63,405 Q61,401 65,398 Z"/>' +
        '<path class="g-line" d="M70,397 L84,394 M63,404 L100,403"/>') },
    chelsea: { box: '58 352 84 58', variants: [], draw: () =>
      shoe('<path class="g-fill" d="M75,358 L97,358 L97,390 Q100,392 100,399 L100,404 L63,405 Q61,400 66,396 L74,388 Z"/>' +
        '<path class="g-line" d="M86,360 L85,386 M63,404 L100,403"/>') },
    runner: { box: '58 380 84 32', variants: [], draw: () =>
      shoe('<path class="g-fill" d="M73,389 L95,387 Q100,389 100,396 L100,399 L64,401 Q62,397 66,394 Z"/>' +
        '<path class="sole" d="M63,399 L100,398 L100,407 Q82,409 63,407 Z"/>' + '<path class="g-line" d="M70,396 Q80,390 92,392"/>') },

    belt: { box: '64 178 72 26', variants: [], draw: () =>
      '<rect class="g-fill" x="69" y="186" width="62" height="8" rx="1"/><rect class="metal" x="95" y="184.5" width="10" height="11" rx="1.5"/>' +
      line('M78,186 L78,194 M122,186 L122,194') },
    tote: { box: '120 62 66 182', variants: [], draw: () =>
      '<path class="strap" d="M126,70 L148,178 M134,70 L170,178"/>' +
      '<path class="g-fill" d="M140,176 L178,176 L182,238 L136,238 Z"/>' + line('M140,184 L178,184') },
    beanie: { box: '74 4 52 44', variants: [], draw: () =>
      '<path class="g-fill" d="M81,34 Q80,10 100,9 Q120,10 119,34 L120,42 L80,42 Z"/>' +
      line('M80,33 L120,33 M88,34 L88,42 M96,34 L96,42 M104,34 L104,42 M112,34 L112,42') },
    watch: { box: '38 178 30 28', variants: [], draw: () =>
      '<rect class="g-fill" x="45" y="186" width="15" height="9" rx="2"/><circle class="metal" cx="52.5" cy="190.5" r="4.6"/><circle class="face" cx="52.5" cy="190.5" r="3.2"/>' },
    cap: { box: '70 6 60 40', variants: [], draw: () =>
      '<path class="g-fill" d="M82,32 Q81,12 100,11 Q119,12 118,32 Z"/><path class="g-fill" d="M80,30 Q100,26 120,30 Q122,37 100,38 Q78,37 80,30 Z"/>' +
      line('M100,11 L100,30') + '<circle class="g-line" cx="100" cy="12" r="1.5"/>' }
  };

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function garmentGroup(product, colourKey, v, extraAttrs) {
    const t = T[product.svg];
    const col = OF.COLOURS[colourKey] || OF.COLOURS[product.defaultColour];
    const dark = luminance(col.hex) < 0.18;
    return `<g class="garment ${dark ? 'is-dark' : 'is-light'}" style="--g:${col.hex}" ${extraAttrs || ''}>${t.draw(v || {})}</g>`;
  }

  OF.svg = {
    SKIN, BODY, templates: T,
    variantsFor(product) { return (T[product.svg] && T[product.svg].variants) || []; },

    // A product on its own, cropped to its bounding box.
    thumb(product, colourKey, v, label) {
      const t = T[product.svg];
      const name = label || `${(OF.COLOURS[colourKey] || {}).label || ''} ${product.name}`.trim();
      return `<svg class="thumb-svg" viewBox="${t.box}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${name}" focusable="false">${garmentGroup(product, colourKey, v)}</svg>`;
    },

    // The mannequin wearing an outfit. outfit: { slot: {id, colour, v} | null }
    figure(outfit, model, opts) {
      opts = opts || {};
      const skin = SKIN[Math.max(0, Math.min(4, (model && model.skin != null ? model.skin : 2)))];
      const sx = BODY[(model && model.body) || 'regular'] || 1;
      const o = outfit || {};
      const order = ['shoes', 'bottom', 'top', 'layer', 'accessory'];
      let g = '';
      order.forEach((slot) => {
        const it = o[slot];
        if (!it) return;
        const pr = OF.byId[it.id];
        if (!pr) return;
        const settle = opts.settle === slot ? ' data-settle="1"' : '';
        g += garmentGroup(pr, it.colour, it.v || (OF.defaultV ? OF.defaultV(pr) : {}), `data-slot="${slot}"${settle}`);
      });
      const label = opts.label || OF.svg.describe(o);
      const armL = [[66, 72], [56, 80], [50, 140], [46, 200], [49, 213], [56, 213], [59, 200], [63, 145], [69, 110]];
      const legL = [[100, 208], [70, 208], [70, 260], [76, 390], [97, 391], [99, 238]];
      const mannequin =
        `<g class="mannequin" style="--skin:${skin}">` +
        `<polygon class="skin" points="${pts(armL)}"/><polygon class="skin" points="${pts(mirrorPts(armL))}"/>` +
        `<polygon class="skin" points="${sym(legL)}"/>` +
        `<path class="skin" d="M66,70 Q100,60 134,70 L131,120 Q128,160 129,192 L131,212 L69,212 L71,192 Q72,160 69,120 Z"/>` +
        `<rect class="skin" x="93" y="50" width="14" height="16" rx="3"/>` +
        `<ellipse class="skin" cx="100" cy="34" rx="17" ry="20"/>` +
        `<ellipse class="skin" cx="86" cy="398" rx="13" ry="6"/><ellipse class="skin" cx="114" cy="398" rx="13" ry="6"/>` +
        `</g>`;
      return `<svg class="figure-svg" viewBox="0 0 200 440" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}" focusable="false">` +
        `<ellipse class="floor" cx="100" cy="410" rx="62" ry="7"/>` +
        `<g transform="translate(100 0) scale(${sx} 1) translate(-100 0)">${mannequin}${g}</g></svg>`;
    },

    describe(outfit) {
      const parts = OF.SLOTS.map((s) => outfit && outfit[s]).filter(Boolean).map((it) => {
        const pr = OF.byId[it.id]; const c = OF.COLOURS[it.colour];
        return pr ? `${c ? c.label.toLowerCase() + ' ' : ''}${pr.name}` : '';
      }).filter(Boolean);
      return parts.length ? 'Mannequin wearing ' + parts.join(', ') : 'Mannequin with no outfit';
    },

    INK
  };
})();
