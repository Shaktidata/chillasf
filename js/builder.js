/* builder.js: wardrobe, model stage with pointer-event drag and drop, keyboard alternative,
   undo / reset / shuffle / save / share, and the live look summary. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});

  const ui = { tab: 'tops', colours: new Set(), occasion: '', maxPrice: 250, cardColour: {} };
  let settleSlot = null;

  // Drop zones are horizontal bands of the stage (fractions of its height).
  const ZONES = [
    { id: 'head', to: 0.14, accept: ['accessory'] },
    { id: 'upper', to: 0.49, accept: ['top', 'layer', 'accessory'] },
    { id: 'legs', to: 0.86, accept: ['bottom', 'accessory'] },
    { id: 'feet', to: 1.01, accept: ['shoes'] }
  ];
  const HINT = {
    top: 'Tops go on the upper body.', layer: 'Layers go over the upper body.',
    bottom: 'Bottoms go on the legs.', shoes: 'Shoes go on the feet.',
    accessory: 'Accessories go on the head, body or hands.'
  };
  // Where each slot's remove button sits on the stage (percent of width / height).
  const REMOVER_POS = { accessory: [66, 3], top: [70, 21], layer: [22, 21], bottom: [66, 58], shoes: [72, 88] };
  const VARIANT_LABEL = { tuck: ['Tuck in', 'Untuck'], roll: ['Roll sleeves', 'Unroll'], open: ['Open layer', 'Close layer'] };

  const st = () => OF.store.get();
  const entryLabel = (it) => OF.itemName(it.id, it.colour);

  // ---------- outfit actions
  function commit(outfit, msg, slot) {
    const s = st();
    const history = s.history.concat([OF.clone(s.outfit)]).slice(-30);
    settleSlot = slot || null;
    OF.store.set({ outfit, history });
    if (msg) OF.announce(msg);
  }

  function wear(id, colour) {
    const p = OF.byId[id];
    if (!OF.inBuilder(p)) return;
    colour = colour || ui.cardColour[id] || p.defaultColour;
    const s = st();
    const prev = s.outfit[p.slot];
    const outfit = OF.clone(s.outfit);
    outfit[p.slot] = { id, colour, size: prev && prev.id === id ? prev.size : OF.defaultSize(p), v: prev && prev.id === id ? prev.v || {} : OF.defaultV(p) };
    ui.cardColour[id] = colour;
    let msg = `${entryLabel(outfit[p.slot])} added to ${OF.SLOT_LABEL[p.slot].toLowerCase()}.`;
    if (prev && prev.id !== id) msg = `${entryLabel(outfit[p.slot])} swapped in. ${entryLabel(prev)} is back in the wardrobe.`;
    commit(outfit, msg, p.slot);
    if (prev && prev.id !== id) flashCard(prev.id);
  }

  function remove(slot) {
    const s = st();
    if (!s.outfit[slot]) return;
    const prev = s.outfit[slot];
    const outfit = OF.clone(s.outfit);
    outfit[slot] = null;
    commit(outfit, `${entryLabel(prev)} removed.`);
    flashCard(prev.id);
  }

  function setEntry(slot, patch, msg) {
    const s = st();
    if (!s.outfit[slot]) return;
    const outfit = OF.clone(s.outfit);
    outfit[slot] = Object.assign({}, outfit[slot], patch);
    commit(outfit, msg);
  }

  function load(src, msg) {
    const outfit = OF.emptyOutfit();
    OF.SLOTS.forEach((slot) => {
      const it = src && src[slot];
      if (it && OF.byId[it.id]) {
        const p = OF.byId[it.id];
        outfit[slot] = { id: it.id, colour: p.colours.includes(it.colour) ? it.colour : p.defaultColour, size: it.size || OF.defaultSize(p), v: it.v || OF.defaultV(p) };
        ui.cardColour[it.id] = outfit[slot].colour;
      }
    });
    commit(outfit, msg || 'Look loaded onto the model.', 'top');
  }

  function undo() {
    const s = st();
    if (!s.history.length) { OF.announce('Nothing to undo.'); return; }
    const history = s.history.slice(0, -1);
    settleSlot = null;
    OF.store.set({ outfit: s.history[s.history.length - 1], history });
    OF.announce('Undone.');
  }

  function flashCard(id) {
    const card = OF.$(`#wardrobeList .w-card[data-id="${id}"]`);
    if (!card || OF.reducedMotion()) return;
    card.classList.remove('returned'); void card.offsetWidth; card.classList.add('returned');
  }

  // ---------- share links: #look=top:tee-01-stone,bottom:chino-01-navy
  function encode(outfit) {
    return OF.SLOTS.filter((s) => outfit[s]).map((s) => `${s}:${outfit[s].id}-${outfit[s].colour}`).join(',');
  }
  function decode(str) {
    const o = OF.emptyOutfit();
    let any = false;
    String(str || '').split(',').forEach((part) => {
      const m = /^([a-z]+):([a-z]+-\d{2})-([a-z-]+)$/.exec(part.trim());
      if (!m) return;
      const p = OF.byId[m[2]];
      if (OF.inBuilder(p) && p.slot === m[1]) { o[m[1]] = { id: p.id, colour: p.colours.includes(m[3]) ? m[3] : p.defaultColour }; any = true; }
    });
    return any ? o : null;
  }
  function readHash() {
    const m = /#look=([^&]+)/.exec(window.location.hash);
    if (!m) return;
    const o = decode(decodeURIComponent(m[1]));
    if (o) load(o, 'Shared look loaded onto the model.');
  }

  async function share() {
    const s = st();
    const code = encode(s.outfit);
    if (!code) { OF.announce('Add something to the model first.'); setMsg('Add something to the model first.', 'err'); return; }
    const url = window.location.href.split('#')[0] + '#look=' + code;
    try { window.history.replaceState(null, '', '#look=' + code); } catch (e) { /* file:// in some browsers */ }
    const out = OF.$('#shareOut');
    const inp = OF.$('#shareUrl');
    inp.value = url;
    out.hidden = false;
    let copied = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); copied = true; } } catch (e) { copied = false; }
    if (!copied) { inp.focus(); inp.select(); }
    OF.announce(copied ? 'Link copied to clipboard.' : 'Link ready. Copy it from the field below the model.');
    setMsg(copied ? 'Link copied. Anyone with it sees this look.' : 'Copy the link below the model.', 'ok');
  }

  function saveLook() {
    const s = st();
    if (!OF.SLOTS.some((k) => s.outfit[k])) { setMsg('Add something to the model before saving.', 'err'); OF.announce('Add something to the model before saving.'); return; }
    if (s.savedLooks.length >= 6) { setMsg('You have 6 saved looks. Remove one to save another.', 'err'); OF.announce('Saved looks are full. Remove one to save another.'); return; }
    const look = { id: 'sv' + Date.now(), outfit: OF.clone(s.outfit), at: Date.now() };
    OF.store.set({ savedLooks: s.savedLooks.concat([look]) });
    OF.announce(`Look saved. ${s.savedLooks.length + 1} of 6.`);
    setMsg('Look saved.', 'ok');
  }

  function setMsg(text, kind) {
    const m = OF.$('#lookMsg');
    m.className = 'form-msg ' + (kind || '');
    m.textContent = text;
  }

  // ---------- drag and drop (Pointer Events: mouse, touch, pen)
  let drag = null;

  function startDrag(e, payload) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = e.currentTarget;
    const sx = e.clientX, sy = e.clientY;
    drag = { payload, el, sx, sy, active: false, ghost: null, id: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (e.pointerType === 'mouse') e.preventDefault();
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('lostpointercapture', onCancel);
  }

  function activate() {
    drag.active = true;
    const { payload } = drag;
    const p = OF.byId[payload.id];
    const g = document.createElement('div');
    g.className = 'drag-ghost';
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML = OF.svg.thumb(p, payload.colour, payload.v);
    document.body.appendChild(g);
    drag.ghost = g;
    const stage = OF.$('#stage');
    stage.classList.add('dragging');
    OF.$$('.zone', stage).forEach((z) => {
      const zone = ZONES.find((x) => x.id === z.dataset.zone);
      z.classList.toggle('accept', payload.type === 'new' && zone.accept.includes(p.slot));
    });
    if (payload.type === 'worn') stage.classList.add('dragging-worn');
    document.body.classList.add('is-dragging');
  }

  function zoneAt(x, y) {
    const r = OF.$('#stage').getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
    const fy = (y - r.top) / r.height;
    return ZONES.find((z) => fy < z.to) || null;
  }

  function onMove(e) {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      activate();
    }
    drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    const z = zoneAt(e.clientX, e.clientY);
    OF.$$('#stage .zone').forEach((el) => el.classList.toggle('over', !!z && el.dataset.zone === z.id));
    OF.$('#stage').classList.toggle('drop-out', drag.payload.type === 'worn' && !z);
  }

  function cleanup() {
    if (!drag) return;
    const { el, ghost } = drag;
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onCancel);
    el.removeEventListener('lostpointercapture', onCancel);
    if (ghost) ghost.remove();
    const stage = OF.$('#stage');
    stage.classList.remove('dragging', 'dragging-worn', 'drop-out');
    OF.$$('.zone', stage).forEach((z) => z.classList.remove('accept', 'over'));
    document.body.classList.remove('is-dragging');
    drag = null;
  }

  function onCancel() { cleanup(); }

  function onUp(e) {
    if (!drag) return;
    const d = drag;
    const wasActive = d.active;
    cleanup();
    if (!wasActive) return;
    const z = zoneAt(e.clientX, e.clientY);
    const p = OF.byId[d.payload.id];
    if (d.payload.type === 'worn') {
      if (!z) remove(d.payload.slot);
      return;
    }
    if (!z) return;
    if (z.accept.includes(p.slot)) wear(p.id, d.payload.colour);
    else wrongSlot(p);
  }

  function wrongSlot(p) {
    const stage = OF.$('#stage');
    const hint = OF.$('#stageHint');
    hint.textContent = HINT[p.slot];
    stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
    OF.announce(HINT[p.slot]);
    clearTimeout(wrongSlot.t);
    wrongSlot.t = setTimeout(() => { hint.textContent = ''; stage.classList.remove('shake'); }, 2200);
  }

  // ---------- rendering
  function filtered() {
    return OF.BUILDER_PRODUCTS.filter((p) => p.category === ui.tab)
      .filter((p) => !ui.colours.size || p.colours.some((c) => ui.colours.has(c)))
      .filter((p) => !ui.occasion || p.occasions.includes(ui.occasion))
      .filter((p) => p.price <= ui.maxPrice);
  }

  function cardColour(p) {
    if (ui.cardColour[p.id] && p.colours.includes(ui.cardColour[p.id])) return ui.cardColour[p.id];
    // When filtering by colour, show the matching colourway.
    const match = p.colours.find((c) => ui.colours.has(c));
    return match || p.defaultColour;
  }

  function renderTabs() {
    OF.$('#wardrobeTabs').innerHTML = OF.CATEGORIES.map((c) =>
      `<button type="button" role="tab" id="tab-${c.id}" data-tab="${c.id}" aria-selected="${c.id === ui.tab}" tabindex="${c.id === ui.tab ? 0 : -1}">${c.label}</button>`).join('');
    OF.$('#wardrobeList').setAttribute('aria-labelledby', 'tab-' + ui.tab);
  }

  function renderColourChips() {
    OF.$('#colourFilter').innerHTML = OF.BUILDER_COLOURS.map((c) =>
      `<button type="button" class="chip" data-chip="${c}" aria-pressed="${ui.colours.has(c)}"><span class="dot" style="--sw:${OF.COLOURS[c].hex}"></span>${OF.COLOURS[c].label}</button>`).join('');
  }

  function renderWardrobe() {
    const s = st();
    const list = filtered();
    const el = OF.$('#wardrobeList');
    if (!list.length) { el.innerHTML = '<p class="muted empty-note">Nothing matches those filters.</p>'; return; }
    el.innerHTML = list.map((p) => {
      const col = cardColour(p);
      const worn = s.outfit[p.slot] && s.outfit[p.slot].id === p.id;
      return `<article class="w-card${worn ? ' is-worn' : ''}" data-id="${p.id}">
        <div class="w-thumb" data-drag="${p.id}" title="Drag onto the model">${OF.svg.thumb(p, col)}</div>
        <div class="w-info">
          <h4>${OF.esc(p.name)}</h4>
          <p class="price">${OF.money(p.price)}</p>
        </div>
        <div class="swatches" role="group" aria-label="Colours for ${OF.esc(p.name)}">${OF.swatches(p, col)}</div>
        <button class="btn btn-sm btn-soft${worn ? ' is-on' : ''} wear-btn" type="button" data-wear="${p.id}" aria-label="${worn ? 'Wearing' : 'Wear'} ${OF.esc(OF.itemName(p.id, col))}">${worn ? 'Wearing' : 'Wear'}</button>
      </article>`;
    }).join('');
  }

  function renderModelControls() {
    const s = st();
    OF.$$('#bodyToggle [data-body]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.body === s.model.body)));
    OF.$('#skinToggle').innerHTML = OF.svg.SKIN.map((hex, i) =>
      `<button type="button" class="swatch skin-sw" style="--sw:${hex}" data-skin="${i}" aria-pressed="${i === s.model.skin}" aria-label="Skin tone ${i + 1} of 5"></button>`).join('');
  }

  function renderStage() {
    const s = st();
    const fig = OF.$('#stageFigure');
    fig.innerHTML = OF.svg.figure(s.outfit, s.model, { settle: OF.reducedMotion() ? null : settleSlot });
    settleSlot = null;
    OF.$$('.garment[data-settle]', fig).forEach((g) => g.classList.add('settle'));
    OF.$$('.garment[data-slot]', fig).forEach((g) => {
      g.addEventListener('pointerdown', (e) => {
        const slot = g.dataset.slot;
        const it = st().outfit[slot];
        if (it) startDrag(e, { type: 'worn', id: it.id, colour: it.colour, v: it.v, slot });
      });
    });
    OF.$('#stageRemovers').innerHTML = OF.SLOTS.filter((k) => s.outfit[k]).map((k) => {
      const [x, y] = REMOVER_POS[k];
      return `<button type="button" class="remover" data-remove="${k}" style="left:${x}%;top:${y}%" aria-label="Remove ${OF.esc(entryLabel(s.outfit[k]))}" title="Remove">${OF.icon('x')}</button>`;
    }).join('');
    OF.$('#undoBtn').disabled = !s.history.length;
  }

  function renderSummary() {
    const s = st();
    const worn = OF.SLOTS.filter((k) => s.outfit[k]);
    const list = OF.$('#lookItems');
    if (!worn.length) {
      list.innerHTML = '<li class="muted empty-note">Nothing on the model yet. Drag a piece over, press Wear, or try Shuffle.</li>';
    } else {
      list.innerHTML = worn.map((slot) => {
        const it = s.outfit[slot]; const p = OF.byId[it.id];
        const vs = OF.svg.variantsFor(p);
        const sizeOpts = ['<option value="">Size</option>'].concat(p.sizes.map((z) => `<option${z === it.size ? ' selected' : ''}>${z}</option>`)).join('');
        return `<li class="look-item" data-slot="${slot}">
          <div class="li-thumb">${OF.svg.thumb(p, it.colour, it.v)}</div>
          <div class="li-main">
            <p class="li-slot">${OF.SLOT_LABEL[slot]}</p>
            <p class="li-name">${OF.esc(p.name)}</p>
            <p class="muted small">${OF.colourLabel(it.colour)} · ${OF.money(p.price)}</p>
            <div class="swatches small" role="group" aria-label="Colours for ${OF.esc(p.name)}">${OF.swatches(p, it.colour, 'data-recolour="' + slot + '"')}</div>
            ${vs.length ? `<div class="variant-row">${vs.map((v) => `<button type="button" class="chip chip-sm" data-variant="${v}" aria-pressed="${!!(it.v && it.v[v])}">${VARIANT_LABEL[v][0]}</button>`).join('')}</div>` : ''}
            <div class="li-buy">
              <label class="sr-only" for="lsz-${slot}">Size for ${OF.esc(p.name)}</label>
              <select id="lsz-${slot}" data-size="${slot}">${sizeOpts}</select>
              <button type="button" class="btn btn-ghost btn-sm" data-add="${slot}">Add</button>
            </div>
          </div>
          <button type="button" class="icon-btn small" data-remove="${slot}" aria-label="Remove ${OF.esc(entryLabel(it))}">${OF.icon('x')}</button>
        </li>`;
      }).join('');
    }
    const total = worn.reduce((a, k) => a + OF.byId[s.outfit[k].id].price, 0);
    OF.$('#lookTotal').textContent = OF.money(total);
    const sc = OF.suggest.current();
    OF.$('#scoreValue').textContent = `${sc.score} / 100`;
    OF.$('#scoreBar').style.width = sc.score + '%';
    OF.$('#scoreReason').textContent = sc.reason;
    OF.$('#addLookBtn').disabled = !worn.length;
  }

  function renderSaved() {
    const s = st();
    OF.$('#savedCount').textContent = `${s.savedLooks.length} of 6`;
    OF.$('#savedLooks').innerHTML = s.savedLooks.length ? s.savedLooks.map((l, i) => `
      <li class="saved-item">
        <button type="button" class="saved-load" data-load="${l.id}" aria-label="Load saved look ${i + 1}">${OF.svg.figure(l.outfit, s.model, { label: 'Saved look ' + (i + 1) })}</button>
        <button type="button" class="saved-del" data-del="${l.id}" aria-label="Delete saved look ${i + 1}">${OF.icon('x')}</button>
      </li>`).join('') : '<li class="muted small">Save up to six looks to compare them.</li>';
  }

  function addPiece(slot) {
    const it = st().outfit[slot];
    if (!it) return false;
    if (!it.size) {
      const sel = OF.$(`#lsz-${slot}`);
      setMsg(`Choose a size for the ${OF.byId[it.id].name.toLowerCase()}.`, 'err');
      if (sel) { sel.setAttribute('aria-invalid', 'true'); sel.focus(); }
      return false;
    }
    OF.cart.add(it.id, it.colour, it.size);
    return true;
  }

  function addLook() {
    const s = st();
    const worn = OF.SLOTS.filter((k) => s.outfit[k]);
    const missing = worn.filter((k) => !s.outfit[k].size);
    if (missing.length) {
      const names = missing.map((k) => OF.byId[s.outfit[k].id].name.toLowerCase());
      setMsg(`Choose a size for: ${names.join(', ')}.`, 'err');
      missing.forEach((k) => { const sel = OF.$(`#lsz-${k}`); if (sel) sel.setAttribute('aria-invalid', 'true'); });
      const first = OF.$(`#lsz-${missing[0]}`); if (first) first.focus();
      OF.announce(`Choose sizes first: ${names.join(', ')}.`);
      return;
    }
    worn.forEach((k) => OF.cart.add(s.outfit[k].id, s.outfit[k].colour, s.outfit[k].size, 1, { silent: true }));
    setMsg(`${worn.length} piece${worn.length > 1 ? 's' : ''} added to your cart.`, 'ok');
    OF.announce(`Whole look added to cart: ${worn.length} pieces.`);
  }

  // ---------- events
  function bind() {
    const tabs = OF.$('#wardrobeTabs');
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      ui.tab = b.dataset.tab; renderTabs(); renderWardrobe();
    });
    tabs.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      const ids = OF.CATEGORIES.map((c) => c.id);
      let i = ids.indexOf(ui.tab);
      if (e.key === 'ArrowLeft') i = (i - 1 + ids.length) % ids.length;
      if (e.key === 'ArrowRight') i = (i + 1) % ids.length;
      if (e.key === 'Home') i = 0;
      if (e.key === 'End') i = ids.length - 1;
      ui.tab = ids[i]; renderTabs(); renderWardrobe();
      OF.$('#tab-' + ui.tab).focus();
      e.preventDefault();
    });
    OF.$('#colourFilter').addEventListener('click', (e) => {
      const b = e.target.closest('[data-chip]');
      if (!b) return;
      const c = b.dataset.chip;
      if (ui.colours.has(c)) ui.colours.delete(c); else ui.colours.add(c);
      b.setAttribute('aria-pressed', String(ui.colours.has(c)));
      renderWardrobe();
    });
    OF.$('#occasionFilter').addEventListener('change', (e) => { ui.occasion = e.target.value; renderWardrobe(); });
    const price = OF.$('#priceFilter');
    price.addEventListener('input', () => { ui.maxPrice = +price.value; OF.$('#priceOut').textContent = OF.money(ui.maxPrice); renderWardrobe(); });

    const list = OF.$('#wardrobeList');
    list.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('[data-drag]');
      if (!t) return;
      const p = OF.byId[t.dataset.drag];
      // currentTarget must be the thumb for pointer capture
      startDrag({ pointerType: e.pointerType, button: e.button, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, currentTarget: t, preventDefault: () => e.preventDefault() },
        { type: 'new', id: p.id, colour: cardColour(p) });
    });
    list.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch[data-colour]');
      if (sw) {
        const card = sw.closest('.w-card');
        const id = card.dataset.id; const p = OF.byId[id];
        ui.cardColour[id] = sw.dataset.colour;
        const worn = st().outfit[p.slot];
        if (worn && worn.id === id) setEntry(p.slot, { colour: sw.dataset.colour }, `${OF.itemName(id, sw.dataset.colour)} on the model.`);
        else { renderWardrobe(); OF.announce(`${OF.itemName(id, sw.dataset.colour)} selected.`); }
        const again = OF.$(`#wardrobeList .w-card[data-id="${id}"] .swatch[data-colour="${sw.dataset.colour}"]`);
        if (again) again.focus();
        return;
      }
      const w = e.target.closest('[data-wear]');
      if (w) {
        const id = w.dataset.wear;
        wear(id, cardColour(OF.byId[id]));
        const again = OF.$(`#wardrobeList [data-wear="${id}"]`);
        if (again) again.focus();
      }
    });

    OF.$('#bodyToggle').addEventListener('click', (e) => {
      const b = e.target.closest('[data-body]');
      if (!b) return;
      OF.store.set({ model: Object.assign({}, st().model, { body: b.dataset.body }) });
      OF.announce(`${b.textContent} body shape.`);
    });
    OF.$('#skinToggle').addEventListener('click', (e) => {
      const b = e.target.closest('[data-skin]');
      if (!b) return;
      OF.store.set({ model: Object.assign({}, st().model, { skin: +b.dataset.skin }) });
      OF.announce(`Skin tone ${+b.dataset.skin + 1} selected.`);
      const again = OF.$(`#skinToggle [data-skin="${b.dataset.skin}"]`); if (again) again.focus();
    });

    OF.$('#stageRemovers').addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (b) { remove(b.dataset.remove); OF.$('#stage').focus && OF.$('#shuffleBtn').focus(); }
    });

    OF.$('#shuffleBtn').addEventListener('click', () => {
      const o = OF.suggest.randomOutfit(st().weather);
      OF.SLOTS.forEach((k) => { if (o[k]) { o[k].size = OF.defaultSize(OF.byId[o[k].id]); ui.cardColour[o[k].id] = o[k].colour; } });
      commit(o, 'Shuffled: ' + OF.svg.describe(o).replace('Mannequin wearing ', '') + '.', 'top');
    });
    OF.$('#undoBtn').addEventListener('click', undo);
    OF.$('#resetBtn').addEventListener('click', () => {
      if (!OF.SLOTS.some((k) => st().outfit[k])) return;
      commit(OF.emptyOutfit(), 'Model reset. Everything is back in the wardrobe.');
    });
    OF.$('#saveLookBtn').addEventListener('click', saveLook);
    OF.$('#shareLookBtn').addEventListener('click', share);

    OF.$('#savedLooks').addEventListener('click', (e) => {
      const l = e.target.closest('[data-load]');
      const d = e.target.closest('[data-del]');
      const s = st();
      if (l) { const look = s.savedLooks.find((x) => x.id === l.dataset.load); if (look) load(look.outfit, 'Saved look loaded.'); }
      if (d) { OF.store.set({ savedLooks: s.savedLooks.filter((x) => x.id !== d.dataset.del) }); OF.announce('Saved look deleted.'); OF.$('#saveLookBtn').focus(); }
    });

    const sum = OF.$('#lookItems');
    sum.addEventListener('click', (e) => {
      const li = e.target.closest('.look-item');
      if (!li) return;
      const slot = li.dataset.slot;
      const it = st().outfit[slot];
      if (!it) return;
      const sw = e.target.closest('[data-recolour]');
      if (sw) {
        ui.cardColour[it.id] = sw.dataset.colour;
        setEntry(slot, { colour: sw.dataset.colour }, `${OF.itemName(it.id, sw.dataset.colour)} on the model.`);
        const again = OF.$(`#lookItems .look-item[data-slot="${slot}"] [data-colour="${sw.dataset.colour}"]`); if (again) again.focus();
        return;
      }
      const vb = e.target.closest('[data-variant]');
      if (vb) {
        const key = vb.dataset.variant;
        const v = Object.assign({}, it.v || {}, { [key]: !(it.v && it.v[key]) });
        setEntry(slot, { v }, `${VARIANT_LABEL[key][v[key] ? 0 : 1]}: ${OF.byId[it.id].name}.`);
        const again = OF.$(`#lookItems .look-item[data-slot="${slot}"] [data-variant="${key}"]`); if (again) again.focus();
        return;
      }
      if (e.target.closest('[data-add]')) { addPiece(slot); return; }
      if (e.target.closest('[data-remove]')) { remove(slot); OF.$('#addLookBtn').focus(); }
    });
    sum.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-size]');
      if (!sel) return;
      const slot = sel.dataset.size;
      const it = st().outfit[slot];
      const s = st();
      const outfit = OF.clone(s.outfit);
      outfit[slot].size = sel.value || null;
      OF.store.set({ outfit }); // size changes are not undo steps
      OF.rememberSize(OF.byId[it.id], sel.value);
      setMsg('', '');
      const again = OF.$(`#lsz-${slot}`); if (again) again.focus();
    });
    OF.$('#addLookBtn').addEventListener('click', addLook);

    window.addEventListener('hashchange', readHash);
  }

  OF.builder = {
    wear, remove, load, undo, encode, decode,
    init() {
      renderTabs(); renderColourChips(); renderModelControls();
      bind();
      renderWardrobe(); renderStage(); renderSummary(); renderSaved();
      readHash();
      OF.store.subscribe((s, keys) => {
        if (keys.includes('outfit') || keys.includes('model')) { renderStage(); renderWardrobe(); }
        if (keys.includes('model')) { renderModelControls(); renderSaved(); }
        if (keys.some((k) => ['outfit', 'weather', 'occasion'].includes(k))) renderSummary();
        if (keys.includes('savedLooks')) renderSaved();
        if (keys.includes('history')) OF.$('#undoBtn').disabled = !s.history.length;
      });
    }
  };
})();
