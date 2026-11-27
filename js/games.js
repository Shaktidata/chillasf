/* games.js: Style Quiz, Capsule Challenge, This or That and Occasion Match.
   Every game ends with a reward: a look loaded into the builder, a tuned taste profile, or the PLAY10 code. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});
  const dlg = () => OF.$('#gameDialog');
  const body = () => OF.$('#gameBody');
  const title = (t) => { OF.$('#gameTitle').textContent = t; };
  let current = null;
  let keyHandler = null;

  function setKeys(fn) {
    if (keyHandler) dlg().removeEventListener('keydown', keyHandler);
    keyHandler = fn;
    if (fn) dlg().addEventListener('keydown', fn);
  }

  const backBtn = '<button class="btn btn-ghost btn-sm" type="button" data-close>Back to shopping</button>';
  const miniFig = (o, label) => `<div class="game-fig">${OF.svg.figure(o, OF.store.get().model, { label })}</div>`;

  function wearLook(outfit, msg) {
    OF.builder.load(outfit, msg);
    OF.modal.close(dlg());
    OF.scrollTo('builder');
  }

  function unlock(code) {
    const s = OF.store.get();
    if (!(s.unlockedCodes || []).includes(code)) OF.store.set({ unlockedCodes: (s.unlockedCodes || []).concat([code]) });
  }

  function rewardCode() {
    unlock('PLAY10');
    return `<div class="reward"><p class="eyebrow">Reward unlocked</p>
      <p class="code">PLAY10</p><p class="muted small">10% off one order. Demo code.</p>
      <button class="btn btn-primary btn-sm" type="button" data-apply="PLAY10">Apply to my cart</button></div>`;
  }

  // ---------------- Style Quiz
  function quiz() {
    title('Find your everyday style');
    let i = 0;
    const scores = { minimalist: 0, commuter: 0, relaxed: 0, mono: 0 };
    const picks = [];
    function q() {
      const item = OF.QUIZ[i];
      body().innerHTML = `
        <p class="progress-text">Question ${i + 1} of ${OF.QUIZ.length}</p>
        <div class="progress"><span style="width:${(i / OF.QUIZ.length) * 100}%"></span></div>
        <fieldset class="quiz-q"><legend>${OF.esc(item.q)}</legend>
          <div class="option-grid">${item.a.map((a, k) => `<button type="button" class="option" data-opt="${k}">${OF.esc(a.t)}</button>`).join('')}</div>
        </fieldset>
        <div class="game-foot">${i ? '<button class="btn btn-ghost btn-sm" type="button" data-prev>Back</button>' : '<span></span>'}${backBtn}</div>`;
      const first = body().querySelector('.option'); if (first) first.focus();
    }
    function result() {
      const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
      const prof = OF.STYLE_PROFILES[best];
      OF.store.set({ tasteProfile: Object.assign({}, prof.taste, { colours: Object.assign({}, prof.taste.colours), trained: true }) });
      OF.announce(`Your style: ${prof.name}.`);
      body().innerHTML = `
        <div class="result">
          ${miniFig(prof.outfit, prof.name + ' outfit')}
          <div>
            <p class="eyebrow">Your style profile</p>
            <h3 class="result-title">${prof.name}</h3>
            <p>${OF.esc(prof.description)}</p>
            <p class="muted small">Suggestions are now tuned to this profile.</p>
            <div class="btn-row"><button class="btn btn-primary" type="button" data-wear-profile="${best}">Wear this look</button>${backBtn}</div>
          </div>
        </div>`;
      body().querySelector('[data-wear-profile]').focus();
    }
    body().onclick = (e) => {
      const o = e.target.closest('[data-opt]');
      if (o) {
        const a = OF.QUIZ[i].a[+o.dataset.opt];
        picks[i] = a;
        i++;
        if (i >= OF.QUIZ.length) {
          picks.forEach((pk) => Object.entries(pk.s).forEach(([k, v]) => { scores[k] += v; }));
          result();
        } else q();
        return;
      }
      if (e.target.closest('[data-prev]')) { i = Math.max(0, i - 1); q(); return; }
      const w = e.target.closest('[data-wear-profile]');
      if (w) { const prof = OF.STYLE_PROFILES[w.dataset.wearProfile]; wearLook(prof.outfit, `${prof.name} look loaded onto the model.`); }
    };
    q();
  }

  // ---------------- Capsule Challenge
  const BUDGET = 400, PIECES = 5, TARGET = 10;
  function capsuleCount(ids) {
    const ps = ids.map((id) => OF.byId[id]);
    const by = (s) => ps.filter((p) => p.slot === s);
    const tops = by('top'), layers = by('layer'), bottoms = by('bottom'), shoes = by('shoes'), accs = by('accessory');
    const uppers = tops.map((t) => [t]).concat(layers.filter((l) => l.canStandAlone).map((l) => [l]));
    tops.forEach((t) => layers.forEach((l) => uppers.push([t, l])));
    const shoeOpts = shoes.length ? shoes.map((s) => [s]) : [[]];
    const accOpts = [[]].concat(accs.map((a) => [a]));
    let n = 0;
    uppers.forEach((u) => bottoms.forEach((b) => shoeOpts.forEach((sh) => accOpts.forEach((ac) => {
      const set = u.concat([b], sh, ac);
      const core = set.filter((p) => p.slot !== 'accessory');
      const fs = core.map((p) => p.formality);
      if (Math.max(...fs) - Math.min(...fs) > 2) return;
      const accents = new Set(set.map((p) => p.defaultColour).filter((c) => OF.COLOURS[c].type === 'accent'));
      if (accents.size > 1) return;
      const up = (u.find((p) => p.slot === 'top') || u[0]).defaultColour;
      const bc = b.defaultColour;
      if ((up === 'navy' && bc === 'black') || (up === 'black' && bc === 'navy')) return;
      n++;
    }))));
    return n;
  }

  function capsule() {
    title('5 pieces, 10 outfits');
    const picked = [];
    let won = false;
    function spend() { return picked.reduce((a, id) => a + OF.byId[id].price, 0); }
    function render(focusId) {
      const total = spend();
      const n = capsuleCount(picked);
      let msg;
      if (picked.length < PIECES) msg = `Pick ${PIECES - picked.length} more piece${PIECES - picked.length > 1 ? 's' : ''}. Your capsule makes ${n} outfit${n === 1 ? '' : 's'} so far.`;
      else if (n >= TARGET) msg = `Your capsule makes ${n} outfits. You did it.`;
      else msg = `Your capsule makes ${n} outfits. Swap one piece to reach ${TARGET}.`;
      const winNow = picked.length === PIECES && n >= TARGET;
      if (winNow && !won) { won = true; OF.announce(`Capsule complete: ${n} outfits. PLAY10 unlocked.`); }
      body().innerHTML = `
        <p class="muted">Choose ${PIECES} pieces for up to ${OF.money(BUDGET)}. An outfit is a top or a jacket, bottoms, and optionally shoes and an accessory, following the same colour and polish rules as the builder.</p>
        <div class="capsule-status">
          <div><span class="muted small">Budget</span><strong>${OF.money(total)} / ${OF.money(BUDGET)}</strong></div>
          <div><span class="muted small">Pieces</span><strong>${picked.length} / ${PIECES}</strong></div>
          <div><span class="muted small">Outfits</span><strong>${n} / ${TARGET}</strong></div>
        </div>
        <div class="progress"><span style="width:${Math.min(100, (n / TARGET) * 100)}%"></span></div>
        <p class="capsule-msg" role="status">${msg}</p>
        ${winNow ? rewardCode() : ''}
        <div class="capsule-grid">${OF.BUILDER_PRODUCTS.map((p) => {
          const on = picked.includes(p.id);
          const dis = !on && (picked.length >= PIECES || total + p.price > BUDGET);
          return `<button type="button" class="cap-item" data-cap="${p.id}" aria-pressed="${on}" ${dis ? 'disabled' : ''}>
            ${OF.svg.thumb(p, p.defaultColour)}<span class="cap-name">${OF.esc(OF.itemName(p.id, p.defaultColour))}</span><span class="cap-price">${OF.money(p.price)}</span></button>`;
        }).join('')}</div>
        <div class="game-foot"><button class="btn btn-ghost btn-sm" type="button" data-clear>Clear picks</button>${backBtn}</div>`;
      const f = focusId && body().querySelector(`[data-cap="${focusId}"]`);
      if (f && !f.disabled) f.focus();
    }
    body().onclick = (e) => {
      const b = e.target.closest('[data-cap]');
      if (b) {
        const id = b.dataset.cap;
        const k = picked.indexOf(id);
        if (k >= 0) picked.splice(k, 1); else if (picked.length < PIECES) picked.push(id);
        render(id); return;
      }
      if (e.target.closest('[data-clear]')) { picked.length = 0; render(); return; }
      applyFromReward(e);
    };
    render();
  }

  // ---------------- This or That
  function thisOrThat() {
    title('This or That');
    const ROUNDS = 10;
    let round = 0;
    const counts = { colours: {}, formality: [], fits: {} };
    const slots = ['top', 'bottom', 'layer', 'shoes', 'top', 'bottom', 'accessory', 'layer', 'shoes', 'top'];
    let pair = [];
    const rnd = (a) => a[Math.floor(Math.random() * a.length)];
    function makePair() {
      const pool = OF.BUILDER_PRODUCTS.filter((p) => p.slot === slots[round]);
      const a = rnd(pool);
      let b = rnd(pool);
      let guard = 0;
      while (b.id === a.id && guard++ < 20) b = rnd(pool);
      pair = [{ p: a, c: rnd(a.colours) }, { p: b, c: rnd(b.colours) }];
    }
    function show() {
      makePair();
      body().innerHTML = `
        <p class="progress-text">Round ${round + 1} of ${ROUNDS}. Click one, or use ← and →.</p>
        <div class="progress"><span style="width:${(round / ROUNDS) * 100}%"></span></div>
        <div class="tot-pair">${pair.map((x, k) => `
          <button type="button" class="tot-card" data-pick="${k}" aria-label="${k ? 'Right' : 'Left'}: ${OF.esc(OF.itemName(x.p.id, x.c))}">
            <span class="tot-thumb">${OF.svg.thumb(x.p, x.c)}</span>
            <span class="tot-name">${OF.esc(OF.itemName(x.p.id, x.c))}</span>
            <span class="muted small">${x.p.fit} · ${OF.money(x.p.price)}</span>
            <kbd aria-hidden="true">${k ? '→' : '←'}</kbd>
          </button>`).join('<span class="tot-or" aria-hidden="true">or</span>')}</div>
        <div class="game-foot"><span></span>${backBtn}</div>`;
      body().querySelector('[data-pick="0"]').focus();
    }
    function pick(k) {
      const x = pair[k];
      counts.colours[x.c] = (counts.colours[x.c] || 0) + 1;
      counts.formality.push(x.p.formality);
      counts.fits[x.p.fit] = (counts.fits[x.p.fit] || 0) + 1;
      round++;
      if (round >= ROUNDS) finish(); else show();
    }
    function finish() {
      setKeys(null);
      const form = counts.formality.reduce((a, b) => a + b, 0) / counts.formality.length;
      const fit = Object.entries(counts.fits).sort((a, b) => b[1] - a[1])[0][0];
      const taste = { colours: counts.colours, formality: Math.round(form * 10) / 10, fit, trained: true };
      OF.store.set({ tasteProfile: taste });
      const top = Object.entries(counts.colours).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => OF.colourLabel(c).toLowerCase());
      const word = form < 2 ? 'relaxed and casual' : form < 3.2 ? 'smart-casual' : 'polished';
      const look = OF.suggest.build({ weather: OF.store.get().weather, taste });
      OF.announce('Taste profile saved. Suggestions updated.');
      body().innerHTML = `
        <div class="result">
          ${miniFig(look, 'Look built from your taste')}
          <div>
            <p class="eyebrow">Your taste profile</p>
            <h3 class="result-title">Mostly ${top.join(', ')}</h3>
            <ul class="plain">
              <li>Leaning <strong>${word}</strong> (formality ${taste.formality} of 5)</li>
              <li>Favourite fit: <strong>${fit.toLowerCase()}</strong></li>
            </ul>
            <p class="muted small">Your suggestions now favour these. Here is a look we built for you.</p>
            <div class="btn-row"><button class="btn btn-primary" type="button" data-wear-built>Wear this look</button>
              <button class="btn btn-ghost btn-sm" type="button" data-see-suggest>See my suggestions</button></div>
          </div>
        </div>`;
      body()._look = look;
      body().querySelector('[data-wear-built]').focus();
    }
    body().onclick = (e) => {
      const b = e.target.closest('[data-pick]');
      if (b) { pick(+b.dataset.pick); return; }
      if (e.target.closest('[data-wear-built]')) { wearLook(body()._look, 'Your taste look is on the model.'); return; }
      if (e.target.closest('[data-see-suggest]')) { OF.modal.close(dlg()); OF.scrollTo('suggestions'); }
    };
    setKeys((e) => {
      if (round >= ROUNDS) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); pick(0); }
      if (e.key === 'ArrowRight') { e.preventDefault(); pick(1); }
    });
    show();
  }

  // ---------------- Occasion Match
  const occ = { prompt: null, left: 0, timer: null };
  function occasionIntro() {
    title('Occasion Match');
    const prompts = OF.OCCASION_PROMPTS;
    occ.prompt = prompts[Math.floor(Math.random() * prompts.length)];
    body().innerHTML = `
      <p class="eyebrow">Your occasion</p>
      <h3 class="result-title">${OF.esc(occ.prompt.text)}</h3>
      <p>You have 60 seconds to dress the model. Then we score it on polish, warmth and colour harmony.</p>
      <ul class="plain muted small"><li>Weather: ${occ.prompt.weather}</li><li>${occ.prompt.needLayer ? 'A layer will help.' : 'A layer is optional.'}</li></ul>
      <div class="btn-row"><button class="btn btn-primary" type="button" data-occ-start>Start 60 seconds</button>
        <button class="btn btn-ghost btn-sm" type="button" data-occ-new>Different occasion</button>${backBtn}</div>`;
    body().onclick = (e) => {
      if (e.target.closest('[data-occ-start]')) startOccasion();
      if (e.target.closest('[data-occ-new]')) occasionIntro();
      applyFromReward(e);
      const w = e.target.closest('[data-occ-pick]');
      if (w) wearLook(body()._look, 'Our pick for the occasion is on the model.');
    };
  }

  function startOccasion() {
    OF.modal.close(dlg());
    const bar = OF.$('#occasionBar');
    bar.hidden = false;
    OF.$('#occasionPrompt').textContent = occ.prompt.text;
    occ.left = 60;
    OF.$('#occasionTime').textContent = '60s';
    OF.scrollTo('builder');
    OF.announce(`Occasion Match started: ${occ.prompt.text}. 60 seconds.`);
    clearInterval(occ.timer);
    occ.timer = setInterval(() => {
      occ.left--;
      OF.$('#occasionTime').textContent = occ.left + 's';
      if (occ.left === 10) OF.announce('10 seconds left.');
      if (occ.left <= 0) finishOccasion(true);
    }, 1000);
    setTimeout(() => { const f = OF.$('#wardrobeTabs [aria-selected="true"]'); if (f) f.focus({ preventScroll: true }); }, 400);
  }

  function stopOccasion() {
    clearInterval(occ.timer);
    occ.timer = null;
    OF.$('#occasionBar').hidden = true;
  }

  function finishOccasion(timeUp) {
    stopOccasion();
    const p = occ.prompt;
    const outfit = OF.store.get().outfit;
    const res = OF.suggest.score(outfit, { weather: p.weather, target: p.formality, targetLabel: '“' + p.text + '”' });
    let s = res.score;
    const extra = [];
    if (p.needLayer && !outfit.layer) { s -= 10; extra.push('This occasion calls for a layer.'); }
    const stars = !res.complete ? 1 : s >= 82 ? 3 : s >= 64 ? 2 : 1;
    const notes = res.notes.slice().sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3).map((n) => n.text).concat(extra);
    const pick = OF.suggest.build({ weather: p.weather, target: p.formality, targetLabel: p.text, needLayer: p.needLayer });
    title('Occasion Match');
    body().innerHTML = `
      <p class="eyebrow">${timeUp ? 'Time is up' : 'Scored'} · ${OF.esc(p.text)}</p>
      <p class="stars" aria-label="${stars} of 3 stars">${'★'.repeat(stars)}<span>${'★'.repeat(3 - stars)}</span></p>
      <ul class="plain">${notes.map((n) => `<li>${OF.esc(n)}</li>`).join('')}</ul>
      ${stars >= 2 ? rewardCode() : '<p class="muted small">Earn 2 stars or more to unlock a discount code.</p>'}
      <div class="result compact">
        ${miniFig(pick, 'Our pick for this occasion')}
        <div><p class="eyebrow">Our pick for this occasion</p><p class="muted small">${OF.esc(OF.svg.describe(pick).replace('Mannequin wearing ', ''))}.</p>
          <div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-occ-pick>Wear our pick</button>
          <button class="btn btn-ghost btn-sm" type="button" data-occ-new>Play again</button>${backBtn}</div></div>
      </div>`;
    body()._look = pick;
    occasionIntroHandlers();
    OF.modal.open(dlg(), OF.$('#occasionSubmit'));
    OF.announce(`${stars} of 3 stars.`);
  }
  function occasionIntroHandlers() {
    body().onclick = (e) => {
      if (e.target.closest('[data-occ-new]')) { occasionIntro(); return; }
      applyFromReward(e);
      if (e.target.closest('[data-occ-pick]')) wearLook(body()._look, 'Our pick for the occasion is on the model.');
    };
  }

  function applyFromReward(e) {
    const a = e.target.closest('[data-apply]');
    if (!a) return;
    OF.cart.applyCode(a.dataset.apply);
    a.textContent = 'Applied to your cart';
    a.disabled = true;
    OF.announce(`${a.dataset.apply} applied to your cart.`);
  }

  OF.games = {
    capsuleCount,
    open(name, trigger) {
      if (occ.timer && name !== 'occasion') stopOccasion();
      current = name;
      setKeys(null);
      body().onclick = null;
      if (name === 'quiz') quiz();
      else if (name === 'capsule') capsule();
      else if (name === 'tot') thisOrThat();
      else if (name === 'occasion') { if (occ.timer) { finishOccasion(false); return; } occasionIntro(); }
      OF.modal.open(dlg(), trigger);
    },
    init() {
      OF.$('#occasionSubmit').addEventListener('click', () => finishOccasion(false));
      OF.$('#occasionCancel').addEventListener('click', () => { stopOccasion(); OF.announce('Occasion Match stopped.'); });
      dlg().addEventListener('of:closed', () => { setKeys(null); current = null; });
    }
  };
})();
