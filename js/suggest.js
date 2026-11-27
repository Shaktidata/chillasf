/* suggest.js: a transparent, rule-based style engine.
   score() rates an outfit 0–100 and explains why; complete() proposes the best pieces for an empty slot;
   randomOutfit() builds a complete, rule-valid look; build() assembles a look for a taste or an occasion. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});
  const CORE = ['top', 'layer', 'bottom', 'shoes'];
  const FAMILY_WORD = { sand: 'sand', grey: 'grey', blue: 'blue', green: 'olive', earth: 'earthy' };

  function items(outfit) {
    return OF.SLOTS.filter((s) => outfit && outfit[s]).map((s) => {
      const it = outfit[s]; const p = OF.byId[it.id];
      return { slot: s, p, colour: it.colour, c: OF.COLOURS[it.colour] };
    }).filter((x) => x.p && x.c);
  }
  const lower = (x) => `${x.c.label.toLowerCase()} ${x.p.name.toLowerCase()}`;
  const listWords = (arr) => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];

  function hasUpper(outfit) {
    return !!(outfit.top || (outfit.layer && OF.byId[outfit.layer.id] && OF.byId[outfit.layer.id].canStandAlone));
  }

  // opts: { weather, occasion (key), target (formality number), targetLabel }
  function score(outfit, opts) {
    opts = opts || {};
    const list = items(outfit);
    if (!list.length) return { score: 0, reason: 'Start by dragging a top onto the model.', notes: [], complete: false };
    const notes = [];
    const add = (delta, text, kind) => notes.push({ delta, text, kind: kind || 'style' });

    const missing = [];
    if (!hasUpper(outfit)) missing.push('a top');
    if (!outfit.bottom) missing.push('bottoms');
    if (!outfit.shoes) missing.push('shoes');
    if (missing.length) add(-14 * missing.length, `Add ${listWords(missing)} to finish the look.`, 'missing');

    // Colour harmony
    const accents = [...new Set(list.filter((x) => x.c.type === 'accent').map((x) => x.colour))];
    if (accents.length === 0) add(10, 'Neutral palette. Easy to wear, easy to repeat.');
    else if (accents.length === 1) {
      const neutrals = [...new Set(list.filter((x) => x.c.type === 'neutral').map((x) => x.c.label.toLowerCase()))];
      add(12, `One quiet accent: ${OF.COLOURS[accents[0]].label.toLowerCase()} sits well with ${neutrals.length ? listWords(neutrals.slice(0, 2)) : 'itself'}.`);
    } else add(-12 * (accents.length - 1), `${listWords(accents.map((a) => OF.COLOURS[a].label.toLowerCase()))} compete. Keep one accent and swap the other for a neutral.`);

    const families = [...new Set(list.map((x) => x.c.family))];
    if (list.length >= 3 && families.length === 1) {
      const names = [...new Set(list.map((x) => x.c.label.toLowerCase()))];
      add(10, names.length > 1
        ? `Great tonal palette: ${listWords(names.slice(0, 3))} work well together.`
        : `Head-to-toe ${names[0]}. Tonal and deliberate.`);
    }
    const upperC = outfit.top ? outfit.top.colour : outfit.layer ? outfit.layer.colour : null;
    const botC = outfit.bottom ? outfit.bottom.colour : null;
    if (upperC && botC && ((upperC === 'navy' && botC === 'black') || (upperC === 'black' && botC === 'navy'))) {
      add(-6, 'Navy next to black can look accidental. Try charcoal or stone.');
    }

    // Formality
    const core = list.filter((x) => CORE.includes(x.slot));
    if (core.length >= 2) {
      const fs = core.map((x) => x.p.formality);
      const spread = Math.max(...fs) - Math.min(...fs);
      if (spread <= 1) add(12, 'Every piece sits at the same level of polish.');
      else if (spread === 2) add(3, 'Mostly balanced formality.');
      else {
        const hi = core.reduce((a, b) => (b.p.formality > a.p.formality ? b : a));
        const lo = core.reduce((a, b) => (b.p.formality < a.p.formality ? b : a));
        add(-12, `Formality is mixed: the ${lower(hi)} is much dressier than the ${lower(lo)}.`);
      }
      const avg = fs.reduce((a, b) => a + b, 0) / fs.length;
      const acc = list.find((x) => x.slot === 'accessory');
      if (acc && Math.abs(acc.p.formality - avg) >= 2.5) add(-5, `The ${lower(acc)} doesn't match the outfit's polish.`);
      const target = opts.target != null ? opts.target : (opts.occasion && OF.OCCASIONS[opts.occasion] ? OF.OCCASIONS[opts.occasion].formality : null);
      if (target != null) {
        const label = opts.targetLabel || OF.OCCASIONS[opts.occasion].label.toLowerCase();
        const d = avg - target;
        if (Math.abs(d) <= 0.75) add(8, `The right level of polish for ${label}.`, 'occasion');
        else if (Math.abs(d) > 1.25) add(-Math.round(6 * Math.abs(d)), d < 0 ? `A bit too casual for ${label}.` : `A little dressed up for ${label}.`, 'occasion');
      }
    }

    // Weather
    const w = opts.weather || 'mild';
    const warm3 = list.filter((x) => x.p.warmth === 3);
    if (w === 'warm') {
      if (outfit.layer) add(-8, 'A layer may be too much on a warm day.', 'weather');
      if (warm3.length) add(-5 * warm3.length, `The ${lower(warm3[0])} is warm for today.`, 'weather');
      if (list.some((x) => ['shorts', 'camp'].includes(x.p.svg) || /linen/i.test(x.p.fabric))) add(4, 'Light fabrics suit a warm day.', 'weather');
    } else if (w === 'cool') {
      if (!outfit.layer && !(outfit.top && OF.byId[outfit.top.id].warmth === 3)) add(-10, 'Add a layer for the cooler weather.', 'weather');
      if (outfit.bottom && OF.byId[outfit.bottom.id].svg === 'shorts') add(-8, 'Shorts will feel cold today.', 'weather');
      if (warm3.length) add(Math.min(6, 3 * warm3.length), `The ${lower(warm3[0])} keeps you warm.`, 'weather');
    } else if (outfit.layer) add(2, 'A light layer suits a mild day.', 'weather');

    const total = Math.max(0, Math.min(100, Math.round(58 + notes.reduce((a, n) => a + n.delta, 0))));
    let reason;
    const miss = notes.find((n) => n.kind === 'missing');
    if (miss) reason = miss.text;
    else {
      const neg = notes.filter((n) => n.delta < 0).sort((a, b) => a.delta - b.delta)[0];
      const pos = notes.filter((n) => n.delta > 0).sort((a, b) => b.delta - a.delta)[0];
      reason = neg && (total < 75 || neg.delta <= -8) ? neg.text : (pos ? pos.text : neg ? neg.text : 'A solid start.');
    }
    return { score: total, reason, notes, complete: !missing.length };
  }

  // Strict rules used by Shuffle: complete, at most one accent, formality within ±1, weather-appropriate.
  function isValid(outfit, weather) {
    if (!hasUpper(outfit) || !outfit.top || !outfit.bottom || !outfit.shoes) return false;
    const list = items(outfit);
    const accents = new Set(list.filter((x) => x.c.type === 'accent').map((x) => x.colour));
    if (accents.size > 1) return false;
    const fs = list.filter((x) => CORE.includes(x.slot)).map((x) => x.p.formality);
    if (Math.max(...fs) - Math.min(...fs) > 1) return false;
    const acc = list.find((x) => x.slot === 'accessory');
    const avg = fs.reduce((a, b) => a + b, 0) / fs.length;
    if (acc && Math.abs(acc.p.formality - avg) >= 2.5) return false;
    const u = outfit.top.colour, b = outfit.bottom.colour;
    if ((u === 'navy' && b === 'black') || (u === 'black' && b === 'navy')) return false;
    if (weather === 'warm' && (outfit.layer || list.some((x) => x.p.warmth === 3))) return false;
    if (weather === 'cool' && (!outfit.layer || OF.byId[outfit.bottom.id].svg === 'shorts')) return false;
    return true;
  }

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const inSlot = (slot) => OF.BUILDER_PRODUCTS.filter((p) => p.slot === slot);

  function randomOutfit(weather) {
    for (let i = 0; i < 3000; i++) {
      const o = OF.emptyOutfit();
      ['top', 'bottom', 'shoes'].forEach((s) => { const p = rand(inSlot(s)); o[s] = { id: p.id, colour: rand(p.colours), v: {} }; });
      const wantLayer = weather === 'cool' ? true : weather === 'warm' ? false : Math.random() < 0.4;
      if (wantLayer) { const p = rand(inSlot('layer')); o.layer = { id: p.id, colour: rand(p.colours), v: OF.defaultV(p) }; }
      if (Math.random() < 0.5) { const p = rand(inSlot('accessory')); o.accessory = { id: p.id, colour: rand(p.colours), v: {} }; }
      if (isValid(o, weather)) return o;
    }
    const l = OF.CURATED_LOOKS[0].outfit;
    const o = OF.emptyOutfit();
    OF.SLOTS.forEach((s) => { if (l[s]) o[s] = { id: l[s].id, colour: l[s].colour, v: {} }; });
    return o;
  }

  function tasteBoost(p, colour, taste) {
    if (!taste || !taste.trained) return 0;
    let b = Math.min(6, (taste.colours[colour] || 0) * 1.5);
    b -= Math.abs(p.formality - (taste.formality || 3)) * 1.2;
    if (taste.fit && p.fit === taste.fit) b += 2;
    return b;
  }

  function why(p, colour, outfit, opts) {
    const c = OF.COLOURS[colour];
    const list = items(outfit);
    const reasons = [];
    const accents = list.filter((x) => x.c.type === 'accent');
    if (p.slot === 'layer' && opts.weather === 'cool') reasons.push('adds warmth for cooler days');
    if (opts.weather === 'warm' && p.warmth === 1 && p.slot !== 'accessory') reasons.push('stays light in the heat');
    if (list.some((x) => x.c.family === c.family && x.colour !== colour)) reasons.push(`builds a tonal ${FAMILY_WORD[c.family]} look`);
    if (c.type === 'neutral' && !reasons.some((r) => r.includes('tonal'))) reasons.push(accents.length ? `lets the ${accents[0].c.label.toLowerCase()} stand out` : 'keeps the palette neutral');
    if (c.type === 'accent' && !accents.length) reasons.push('adds one quiet accent');
    const core = list.filter((x) => CORE.includes(x.slot));
    if (core.length) {
      const avg = core.reduce((a, x) => a + x.p.formality, 0) / core.length;
      if (Math.abs(p.formality - avg) <= 1) reasons.push('matches the outfit’s level of polish');
    }
    if (opts.taste && opts.taste.trained && (opts.taste.colours[colour] || 0) > 0) reasons.push('fits your taste profile');
    let r = reasons.slice(0, 2);
    if (!r.length) r.push('works with what you have on');
    // "Chinos add…", "Overshirt adds…"
    if (/s$/i.test(p.name)) r = r.map((x) => x.replace(/^(\w+)/, (w) => (/ches$/.test(w) ? w.slice(0, -2) : w.slice(0, -1))));
    return `${c.label} ${p.name.toLowerCase()} ${listWords(r)}.`;
  }

  // Best candidates for one slot given the current outfit.
  function candidates(slot, outfit, opts, n) {
    const res = [];
    inSlot(slot).forEach((p) => {
      let best = null;
      p.colours.forEach((col) => {
        const o = Object.assign({}, outfit, { [slot]: { id: p.id, colour: col, v: {} } });
        const s = score(o, opts).score + tasteBoost(p, col, opts.taste) + (col === p.defaultColour ? 0.5 : 0);
        if (!best || s > best.s) best = { p, colour: col, s };
      });
      if (best) res.push(best);
    });
    res.sort((a, b) => b.s - a.s);
    return res.slice(0, n || 3);
  }

  function optsFromState(st) {
    return { weather: st.weather, occasion: st.occasion, taste: st.tasteProfile };
  }

  // What to suggest next: { slot, mode, items: [{p, colour, why}] }
  function complete(st) {
    const outfit = st.outfit;
    const opts = optsFromState(st);
    const order = [];
    if (!outfit.top) order.push('top');
    if (!outfit.bottom) order.push('bottom');
    if (!outfit.shoes) order.push('shoes');
    if (!outfit.layer && st.weather === 'cool') order.unshift('layer');
    if (!order.length) {
      if (!outfit.layer && st.weather !== 'warm') order.push('layer');
      if (!outfit.accessory) order.push('accessory');
    }
    if (order.length) {
      const slot = order[0];
      const mode = ['layer', 'accessory'].includes(slot) && outfit.top && outfit.bottom && outfit.shoes ? 'finish' : 'complete';
      return { slot, mode, next: order.slice(1), items: candidates(slot, outfit, opts, 3).map((c) => ({ p: c.p, colour: c.colour, why: why(c.p, c.colour, outfit, opts) })) };
    }
    // Everything worn: best single swaps that raise the score.
    const base = score(outfit, opts).score;
    const swaps = [];
    OF.SLOTS.forEach((slot) => {
      const rest = Object.assign({}, outfit, { [slot]: null });
      candidates(slot, rest, opts, 2).forEach((c) => {
        if (c.p.id === outfit[slot].id && c.colour === outfit[slot].colour) return;
        const ns = score(Object.assign({}, outfit, { [slot]: { id: c.p.id, colour: c.colour } }), opts).score;
        if (ns >= base) swaps.push({ p: c.p, colour: c.colour, gain: ns - base, why: why(c.p, c.colour, rest, opts) });
      });
    });
    swaps.sort((a, b) => b.gain - a.gain);
    return { slot: null, mode: 'swap', items: swaps.slice(0, 3) };
  }

  // Greedy look builder for a taste profile or occasion prompt.
  function build(opts) {
    let o = OF.emptyOutfit();
    const slots = ['bottom', 'top', 'shoes'];
    if (opts.weather === 'cool' || opts.needLayer) slots.push('layer');
    slots.push('accessory');
    slots.forEach((s) => {
      const c = candidates(s, o, opts, 1)[0];
      if (!c) return;
      const next = Object.assign({}, o, { [s]: { id: c.p.id, colour: c.colour, v: OF.defaultV(c.p) } });
      if (s === 'accessory' && score(next, opts).score < score(o, opts).score) return;
      o = next;
    });
    return o;
  }

  OF.suggest = {
    score, isValid, randomOutfit, complete, build, why, candidates, items, hasUpper,
    current: () => score(OF.store.get().outfit, optsFromState(OF.store.get())),

    init() {
      const st = OF.store.get();
      const wt = OF.$('#weatherToggle');
      const occ = OF.$('#occasionSelect');
      occ.value = st.occasion || '';
      wt.addEventListener('click', (e) => {
        const b = e.target.closest('[data-weather]');
        if (!b) return;
        OF.store.set({ weather: b.dataset.weather });
        OF.announce(`Weather set to ${b.textContent.toLowerCase()}.`);
      });
      occ.addEventListener('change', () => OF.store.set({ occasion: occ.value }));
      OF.$('#suggestGrid').addEventListener('click', onTry);
      OF.$('#weekLooks').addEventListener('click', (e) => {
        const b = e.target.closest('[data-look]');
        if (!b) return;
        const l = OF.CURATED_LOOKS.find((x) => x.id === b.dataset.look);
        OF.builder.load(l.outfit, `${l.name} loaded onto the model.`);
        OF.scrollTo('builder');
      });
      renderWeek();
      render();
      OF.store.subscribe((s, keys) => {
        if (keys.some((k) => ['outfit', 'weather', 'occasion', 'tasteProfile'].includes(k))) render();
      });
    }
  };

  function onTry(e) {
    const b = e.target.closest('[data-try]');
    if (!b) return;
    OF.builder.wear(b.dataset.try, b.dataset.colour);
    OF.scrollTo('builder');
  }

  function render() {
    const st = OF.store.get();
    OF.$$('#weatherToggle [data-weather]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.weather === st.weather)));
    const t = st.tasteProfile;
    const tl = OF.$('#tasteLine');
    if (t && t.trained) {
      const cols = Object.entries(t.colours).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => OF.colourLabel(c).toLowerCase());
      tl.textContent = `Tuned to your taste: ${listWords(cols)}${t.fit ? ', ' + t.fit.toLowerCase() + ' fits' : ''}.`;
    } else tl.textContent = 'Play the quiz or This or That to tune these to your taste.';

    const res = complete(st);
    const head = OF.$('#suggestHead');
    if (res.mode === 'swap') head.textContent = res.items.length ? 'Swap ideas for your look' : 'Your look is complete';
    else if (res.mode === 'finish') head.textContent = `Finishing touch: ${OF.SLOT_LABEL[res.slot].toLowerCase()}`;
    else head.textContent = `Complete the look: ${OF.SLOT_LABEL[res.slot].toLowerCase()}` + (res.next && res.next.length ? ` (then ${res.next.map((s) => OF.SLOT_LABEL[s].toLowerCase()).join(', ')})` : '');
    const grid = OF.$('#suggestGrid');
    if (!res.items.length) {
      grid.innerHTML = '<p class="muted">Every piece already works together. Try a different weather or occasion above.</p>';
      return;
    }
    grid.innerHTML = res.items.map((it) => `
      <article class="s-card">
        <div class="s-thumb">${OF.svg.thumb(it.p, it.colour)}</div>
        <div class="s-info">
          <h4>${OF.esc(OF.itemName(it.p.id, it.colour))}</h4>
          <p class="price">${OF.money(it.p.price)}</p>
          <p class="why">${OF.esc(it.why)}</p>
          <button class="btn btn-ghost btn-sm" type="button" data-try="${it.p.id}" data-colour="${it.colour}">Try it on</button>
        </div>
      </article>`).join('');
  }

  function renderWeek() {
    OF.$('#weekLooks').innerHTML = OF.LOOKS_OF_WEEK.map((id) => {
      const l = OF.CURATED_LOOKS.find((x) => x.id === id);
      const o = {}; OF.SLOTS.forEach((s) => { o[s] = l.outfit[s] ? Object.assign({ v: OF.defaultV(OF.byId[l.outfit[s].id]) }, l.outfit[s]) : null; });
      const total = OF.SLOTS.reduce((a, s) => a + (l.outfit[s] ? OF.byId[l.outfit[s].id].price : 0), 0);
      return `<article class="week-card">
        <div class="week-fig">${OF.svg.figure(o, { body: 'regular', skin: 2 }, { label: l.name })}</div>
        <h4>${OF.esc(l.name)}</h4><p class="muted">${OF.esc(l.note)}</p><p class="price">${OF.money(total)}</p>
        <button class="btn btn-soft btn-sm" type="button" data-look="${l.id}">Wear this look</button>
      </article>`;
    }).join('');
  }
})();
