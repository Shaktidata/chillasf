/* main.js: central state with a small pub/sub, shared helpers, page-level UI and bootstrap. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});
  const KEY = 'of_state_v1';
  const PERSIST = ['outfit', 'savedLooks', 'cart', 'tasteProfile', 'model', 'weather', 'discount', 'unlockedCodes', 'sizePrefs'];

  OF.emptyOutfit = () => ({ top: null, layer: null, bottom: null, shoes: null, accessory: null });
  OF.clone = (o) => JSON.parse(JSON.stringify(o));
  // Layers start open so the top underneath shows.
  OF.defaultV = (p) => (p && p.slot === 'layer' ? { open: true } : {});

  function defaults() {
    return {
      outfit: OF.emptyOutfit(),
      history: [],
      savedLooks: [],
      cart: [],
      discount: null,
      unlockedCodes: [],
      tasteProfile: { colours: {}, formality: 3, fit: null, trained: false },
      model: { body: 'regular', skin: 2 },
      weather: 'mild',
      occasion: '',
      sizePrefs: { apparel: null, shoes: null }
    };
  }

  function load() {
    const s = defaults();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        PERSIST.forEach((k) => { if (saved && saved[k] !== undefined) s[k] = saved[k]; });
      }
    } catch (e) { /* storage unavailable: start fresh */ }
    // Drop anything that no longer matches the catalogue.
    OF.SLOTS.forEach((slot) => {
      const it = s.outfit && s.outfit[slot];
      if (it && (!OF.inBuilder(OF.byId[it.id]) || OF.byId[it.id].slot !== slot)) s.outfit[slot] = null;
    });
    s.outfit = Object.assign(OF.emptyOutfit(), s.outfit || {});
    s.cart = (s.cart || []).filter((c) => OF.byId[c.id]);
    return s;
  }

  const state = load();
  const subs = [];

  function persist() {
    try {
      const out = {};
      PERSIST.forEach((k) => { out[k] = state[k]; });
      window.localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) { /* ignore quota or privacy-mode errors */ }
  }

  OF.store = {
    get: () => state,
    set(patch) {
      Object.assign(state, patch);
      persist();
      const keys = Object.keys(patch);
      subs.forEach((fn) => { try { fn(state, keys); } catch (e) { console.error(e); } });
    },
    subscribe(fn) { subs.push(fn); }
  };

  // ---------- helpers
  OF.$ = (sel, root) => (root || document).querySelector(sel);
  OF.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  OF.money = (n) => {
    const v = Math.round(n * 100) / 100;
    return v % 1 === 0 ? fmt.format(v) : new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2 }).format(v);
  };
  OF.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  OF.colourLabel = (k) => (OF.COLOURS[k] ? OF.COLOURS[k].label : k);
  OF.itemName = (id, colour) => `${OF.colourLabel(colour)} ${OF.byId[id].name}`;
  OF.reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let liveTimer;
  OF.announce = (msg) => {
    const el = document.getElementById('live');
    if (!el) return;
    el.textContent = '';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { el.textContent = msg; }, 60);
  };

  OF.sizeKind = (p) => (p.category === 'shoes' ? 'shoes' : p.category === 'accessories' ? 'accessories' : p.gender === 'women' ? 'womens' : 'apparel');
  OF.defaultSize = (p) => {
    if (p.sizes.length === 1) return p.sizes[0];
    const pref = state.sizePrefs[OF.sizeKind(p)];
    return pref && p.sizes.includes(pref) ? pref : null;
  };
  OF.rememberSize = (p, size) => {
    const kind = OF.sizeKind(p);
    if (kind === 'accessories' || !size) return;
    OF.store.set({ sizePrefs: Object.assign({}, state.sizePrefs, { [kind]: size }) });
  };

  const ICONS = {
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>'
  };
  OF.icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  OF.swatches = (p, current, attrs) => p.colours.map((c) =>
    `<button type="button" class="swatch" style="--sw:${OF.COLOURS[c].hex}" data-colour="${c}" aria-pressed="${c === current}" aria-label="${OF.COLOURS[c].label}" title="${OF.COLOURS[c].label}" ${attrs || ''}></button>`).join('');

  // ---------- modals (native <dialog>: focus stays inside, Esc closes; we return focus to the trigger)
  OF.modal = {
    open(dlg, trigger) {
      if (!dlg) return;
      dlg._trigger = trigger || document.activeElement;
      if (!dlg.open) dlg.showModal();
      document.body.classList.add('modal-open');
      const first = dlg.querySelector('[data-autofocus]') || dlg.querySelector('.modal-body button, .modal-body input, .modal-body select, .drawer-body button, .drawer-body input, [data-close]');
      if (first) setTimeout(() => first.focus(), 30);
    },
    close(dlg) { if (dlg && dlg.open) dlg.close(); }
  };

  function wireDialogs() {
    OF.$$('dialog').forEach((dlg) => {
      dlg.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) { OF.modal.close(dlg); return; }
        if (e.target === dlg) OF.modal.close(dlg); // backdrop click
      });
      dlg.addEventListener('close', () => {
        if (!OF.$$('dialog').some((d) => d.open)) document.body.classList.remove('modal-open');
        const t = dlg._trigger;
        if (t && document.contains(t) && typeof t.focus === 'function') t.focus();
        dlg.dispatchEvent(new CustomEvent('of:closed'));
      });
    });
  }

  OF.scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: OF.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  // ---------- page UI
  function initNav() {
    const btn = OF.$('#menuToggle');
    const nav = OF.$('#siteNav');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('open', open);
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); }
    });
  }

  const lookOutfit = (l) => {
    const o = {};
    OF.SLOTS.forEach((s) => { o[s] = l.outfit[s] ? { id: l.outfit[s].id, colour: l.outfit[s].colour, v: OF.defaultV(OF.byId[l.outfit[s].id]) } : null; });
    return o;
  };
  const lookTotal = (l) => OF.SLOTS.reduce((a, s) => a + (l.outfit[s] ? OF.byId[l.outfit[s].id].price : 0), 0);

  function initHero() {
    const looks = OF.LOOKS_OF_WEEK.map((id) => OF.CURATED_LOOKS.find((l) => l.id === id));
    const byId = (id) => OF.CURATED_LOOKS.find((l) => l.id === id);
    const fig = OF.$('#heroFigure');
    const name = OF.$('#heroLookName');
    const price = OF.$('#heroLookPrice');
    const dots = OF.$('#heroDots');
    const wrap = OF.$('#heroVisual');
    let i = 0, paused = false;

    // Background models (decorative) and floating garments.
    OF.$('#heroSideL').innerHTML = OF.svg.figure(lookOutfit(byId('look-weekend')), { body: 'slim', skin: 0 }, { label: '' });
    OF.$('#heroSideR').innerHTML = OF.svg.figure(lookOutfit(byId('look-summer')), { body: 'broad', skin: 4 }, { label: '' });
    const floats = [
      { id: 'cap-01', colour: 'navy', depth: 0.42, cls: 'f1' },
      { id: 'sneaker-01', colour: 'off-white', depth: 0.55, cls: 'f2' },
      { id: 'tote-01', colour: 'olive', depth: 0.36, cls: 'f3' },
      { id: 'tee-02', colour: 'rust', depth: 0.5, cls: 'f4' }
    ];
    OF.$('#heroFloats').innerHTML = floats.map((f) => {
      const p = OF.byId[f.id];
      return `<div class="float-wrap ${f.cls}" data-depth="${f.depth}">
        <button type="button" class="float-card" data-hero-try="${f.id}" data-colour="${f.colour}" aria-label="Try the ${OF.esc(OF.itemName(f.id, f.colour).toLowerCase())} in the fitting room">
          <span class="float-thumb">${OF.svg.thumb(p, f.colour, null, '')}</span>
          <span class="price-pill">${OF.money(p.price)}</span>
        </button></div>`;
    }).join('');
    OF.$('#heroFloats').addEventListener('click', (e) => {
      const b = e.target.closest('[data-hero-try]');
      if (!b) return;
      OF.builder.wear(b.dataset.heroTry, b.dataset.colour);
      OF.scrollTo('builder');
    });
    OF.$('#heroWearLook').addEventListener('click', () => {
      const l = looks[i];
      OF.builder.load(l.outfit, `${l.name} loaded onto the model.`);
      OF.scrollTo('builder');
    });

    dots.innerHTML = looks.map(() => '<span></span>').join('');
    function show() {
      const l = looks[i];
      fig.classList.remove('fade');
      void fig.offsetWidth;
      fig.innerHTML = OF.svg.figure(lookOutfit(l), { body: 'regular', skin: 2 }, { label: 'Featured look: ' + l.name });
      fig.classList.add('fade');
      name.textContent = l.name;
      price.textContent = OF.money(lookTotal(l));
      OF.$('#heroWearLook').setAttribute('aria-label', `Wear the ${l.name} look`);
      OF.$$('span', dots).forEach((d, k) => d.classList.toggle('on', k === i));
    }
    show();
    setInterval(() => { if (!paused && !document.hidden) { i = (i + 1) % looks.length; show(); } }, 4000);
    ['mouseenter', 'focusin'].forEach((ev) => wrap.addEventListener(ev, () => { paused = true; }));
    ['mouseleave', 'focusout'].forEach((ev) => wrap.addEventListener(ev, () => { paused = false; }));
    initParallax();
  }

  // Layered parallax: every [data-depth] layer drifts with scroll and (on mouse/pen devices) with the pointer.
  // Deeper numbers sit "closer" and move further. Off entirely with prefers-reduced-motion.
  function initParallax() {
    const hero = OF.$('#hero');
    const layers = OF.$$('#heroVisual [data-depth]');
    const copy = OF.$('.hero-copy');
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    let tx = 0, ty = 0, mx = 0, my = 0, raf = null, visible = true;

    function reset() {
      layers.forEach((l) => { l.style.transform = ''; });
      copy.style.transform = ''; copy.style.opacity = '';
    }
    function frame() {
      raf = null;
      if (mq.matches) { reset(); return; }
      const h = hero.offsetHeight || 1;
      const sy = Math.max(0, Math.min(window.scrollY - hero.offsetTop + OF.headerH(), h));
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      const amp = fine ? 46 : 0;
      layers.forEach((l) => {
        const d = +l.dataset.depth;
        l.style.transform = `translate3d(${(-mx * d * amp).toFixed(2)}px, ${(-sy * d * 1.1 - my * d * amp).toFixed(2)}px, 0)`;
      });
      copy.style.transform = `translate3d(0, ${(sy * 0.18).toFixed(2)}px, 0)`;
      copy.style.opacity = String(Math.max(0, 1 - sy / (h * 0.85)).toFixed(3));
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) kick();
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    if (fine) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        kick();
      });
      hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    if (mq.addEventListener) mq.addEventListener('change', kick);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) kick(); }).observe(hero);
    }
    kick();
  }
  // Section photos: the image drifts inside its rounded frame as the frame crosses the viewport.
  function initPhotoParallax() {
    const frames = OF.$$('[data-photo-parallax]');
    if (!frames.length) return;
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    let raf = null;
    function frame() {
      raf = null;
      const vh = window.innerHeight;
      frames.forEach((f) => {
        const img = f.querySelector('img');
        if (!img) return;
        if (mq.matches) { img.style.transform = ''; return; }
        const r = f.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
        img.style.transform = `translate3d(0, ${(p * -6).toFixed(2)}%, 0) scale(1.14)`;
      });
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
  }

  function initPhotoLinks() {
    document.addEventListener('click', (e) => {
      const pin = e.target.closest('[data-pin]');
      if (pin && OF.shop) { OF.shop.openQV(pin.dataset.pin, null, pin); return; }
      if (e.target.closest('#shopTopsBtn')) {
        const sel = OF.$('#shopCategory');
        sel.value = 'tops';
        sel.dispatchEvent(new Event('change'));
        OF.$('#shopGrid').scrollIntoView({ behavior: OF.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
        OF.announce('Showing tops.');
      }
    });
  }

  OF.headerH = () => { const h = document.querySelector('.site-header'); return h ? h.offsetHeight : 0; };

  function initNewsletter() {
    const form = OF.$('#newsletterForm');
    const input = OF.$('#newsletterEmail');
    const msg = OF.$('#newsletterMsg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      input.setAttribute('aria-invalid', String(!ok));
      msg.className = 'form-msg ' + (ok ? 'ok' : 'err');
      msg.textContent = ok ? 'Thank you. You are on the list. (Demo: nothing was sent.)' : 'Enter an email like name@example.com.';
      if (ok) input.value = ''; else input.focus();
    });
  }

  function initGameButtons() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-game]');
      if (b && OF.games) OF.games.open(b.dataset.game, b);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireDialogs();
    initNav();
    initHero();
    initNewsletter();
    initGameButtons();
    initPhotoParallax();
    initPhotoLinks();
    ['cart', 'builder', 'suggest', 'games', 'shop', 'checkout'].forEach((m) => {
      if (OF[m] && OF[m].init) { try { OF[m].init(); } catch (e) { console.error('init ' + m, e); } }
    });
  });
})();
