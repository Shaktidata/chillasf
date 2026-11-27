/* cart.js: cart items, discount codes, totals and the slide-out drawer. Persisted through OF.store. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});
  const r2 = (n) => Math.round(n * 100) / 100;
  let codeMsg = { text: '', kind: '' };
  let sizeWarn = false;

  const keyOf = (id, colour, size) => `${id}|${colour}|${size || ''}`;

  function add(id, colour, size, qty, opts) {
    const st = OF.store.get();
    const cart = st.cart.map((c) => Object.assign({}, c));
    const key = keyOf(id, colour, size);
    const found = cart.find((c) => c.key === key);
    if (found) found.qty = Math.min(9, found.qty + (qty || 1));
    else cart.push({ key, id, colour, size: size || null, qty: qty || 1 });
    OF.store.set({ cart });
    if (!(opts && opts.silent)) OF.announce(`${OF.itemName(id, colour)}${size ? ', size ' + size : ''} added to cart.`);
    bump();
  }

  function update(key, patch) {
    const st = OF.store.get();
    let cart = st.cart.map((c) => Object.assign({}, c));
    const it = cart.find((c) => c.key === key);
    if (!it) return;
    Object.assign(it, patch);
    if (patch.size !== undefined) {
      it.key = keyOf(it.id, it.colour, it.size);
      // merge with an identical line if one exists
      const dupe = cart.find((c) => c !== it && c.key === it.key);
      if (dupe) { dupe.qty = Math.min(9, dupe.qty + it.qty); cart = cart.filter((c) => c !== it); }
    }
    cart = cart.filter((c) => c.qty > 0);
    OF.store.set({ cart });
  }

  function totals(opts) {
    const st = OF.store.get();
    const express = !!(opts && opts.express);
    const subtotal = st.cart.reduce((a, c) => a + OF.byId[c.id].price * c.qty, 0);
    const code = st.discount && OF.DISCOUNTS[st.discount] ? st.discount : null;
    const discount = code ? r2(subtotal * OF.DISCOUNTS[code].pct / 100) : 0;
    const after = r2(subtotal - discount);
    const count = st.cart.reduce((a, c) => a + c.qty, 0);
    const shipping = !count ? 0 : after >= OF.SHIPPING.freeOver ? 0 : OF.SHIPPING.standard;
    const expressFee = express && count ? OF.SHIPPING.express : 0;
    return { subtotal, code, discount, shipping, expressFee, total: r2(after + shipping + expressFee), count, toFree: Math.max(0, r2(OF.SHIPPING.freeOver - after)) };
  }

  function applyCode(raw) {
    const code = String(raw || '').trim().toUpperCase();
    const st = OF.store.get();
    if (!code) { codeMsg = { text: 'Enter a code.', kind: 'err' }; return false; }
    const d = OF.DISCOUNTS[code];
    if (!d) { codeMsg = { text: 'That code isn’t valid.', kind: 'err' }; return false; }
    if (d.needsUnlock && !(st.unlockedCodes || []).includes(code)) { codeMsg = { text: 'Win a game in Play to unlock this code.', kind: 'err' }; return false; }
    const replaced = st.discount && st.discount !== code ? ` It replaces ${st.discount}: one code per order.` : '';
    codeMsg = { text: `${code} applied: ${d.label}.${replaced}`, kind: 'ok' };
    OF.store.set({ discount: code });
    return true;
  }

  function bump() {
    const b = OF.$('#cartCount');
    if (!b || OF.reducedMotion()) return;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }

  function renderBadge() {
    const t = totals();
    OF.$('#cartCount').textContent = t.count;
    OF.$('#cartBtn').setAttribute('aria-label', `Open cart, ${t.count} item${t.count === 1 ? '' : 's'}`);
  }

  function lineHTML(c) {
    const p = OF.byId[c.id];
    const sizeOpts = ['<option value="">Select size</option>'].concat(p.sizes.map((s) => `<option${s === c.size ? ' selected' : ''}>${s}</option>`)).join('');
    const missing = !c.size;
    return `<li class="cart-line${missing && sizeWarn ? ' warn' : ''}" data-key="${OF.esc(c.key)}">
      <div class="cart-thumb">${OF.svg.thumb(p, c.colour)}</div>
      <div class="cart-info">
        <p class="cart-name">${OF.esc(p.name)}</p>
        <p class="muted">${OF.colourLabel(c.colour)} · ${OF.money(p.price)}</p>
        <div class="cart-controls">
          <label class="sr-only" for="sz-${OF.esc(c.key)}">Size for ${OF.esc(p.name)}</label>
          <select id="sz-${OF.esc(c.key)}" data-act="size" aria-invalid="${missing && sizeWarn}">${sizeOpts}</select>
          <div class="qty" role="group" aria-label="Quantity for ${OF.esc(p.name)}">
            <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
            <span aria-live="off">${c.qty}</span>
            <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="link-btn" data-act="remove">Remove</button>
        </div>
        ${missing ? '<p class="field-err">Select a size before checkout.</p>' : ''}
      </div>
      <p class="cart-line-total">${OF.money(p.price * c.qty)}</p>
    </li>`;
  }

  function renderDrawer() {
    const st = OF.store.get();
    const body = OF.$('#cartBody');
    const t = totals();
    const focusedKey = document.activeElement && document.activeElement.closest && document.activeElement.closest('.cart-line') ? document.activeElement.closest('.cart-line').dataset.key : null;
    const focusedAct = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.act : null;
    if (!st.cart.length) {
      body.innerHTML = `<div class="empty"><p>Your cart is empty.</p><p class="muted">Build a look and add it in one go.</p>
        <a class="btn btn-primary" href="#builder" data-close>Start styling</a></div>`;
      return;
    }
    const unlocked = (st.unlockedCodes || []).filter((c) => c !== st.discount);
    body.innerHTML = `
      <ul class="cart-lines">${st.cart.map(lineHTML).join('')}</ul>
      <form class="code-form" id="codeForm" novalidate>
        <label for="codeInput">Discount code</label>
        <div class="inline-form">
          <input id="codeInput" type="text" autocomplete="off" placeholder="PLAY10 or WELCOME5" aria-describedby="codeMsg">
          <button class="btn btn-ghost btn-sm" type="submit">Apply</button>
        </div>
        <p class="form-msg ${codeMsg.kind}" id="codeMsg" role="status">${OF.esc(codeMsg.text)}</p>
        ${unlocked.length ? `<p class="muted small">You have unlocked: ${unlocked.map((c) => `<button type="button" class="link-btn" data-code="${c}">${c}</button>`).join(' ')}</p>` : ''}
      </form>
      <dl class="totals">
        <div><dt>Subtotal</dt><dd>${OF.money(t.subtotal)}</dd></div>
        ${t.code ? `<div><dt>Discount (${t.code}) <button type="button" class="link-btn" data-act="clear-code">Remove</button></dt><dd>−${OF.money(t.discount)}</dd></div>` : ''}
        <div><dt>Shipping</dt><dd>${t.shipping ? OF.money(t.shipping) : 'Free'}</dd></div>
        <div class="grand"><dt>Total</dt><dd>${OF.money(t.total)}</dd></div>
      </dl>
      <p class="muted small">${t.shipping ? `Add ${OF.money(t.toFree)} more for free shipping.` : 'You have free shipping.'} Express delivery is chosen at checkout.</p>
      <p class="field-err" id="cartWarn" role="alert">${sizeWarn && st.cart.some((c) => !c.size) ? 'Choose a size for every item before checkout.' : ''}</p>
      <button class="btn btn-primary btn-block" type="button" id="toCheckout">Review &amp; checkout</button>
      <p class="demo-note">Demo store: no payment is taken.</p>`;
    if (focusedKey) {
      const el = body.querySelector(`.cart-line[data-key="${CSS.escape(focusedKey)}"] [data-act="${focusedAct}"]`);
      if (el) el.focus();
    }
  }

  function onDrawerClick(e) {
    const st = OF.store.get();
    const line = e.target.closest('.cart-line');
    const act = e.target.closest('[data-act]');
    if (act && line) {
      const it = st.cart.find((c) => c.key === line.dataset.key);
      if (!it) return;
      if (act.dataset.act === 'inc') update(it.key, { qty: Math.min(9, it.qty + 1) });
      if (act.dataset.act === 'dec') update(it.key, { qty: it.qty - 1 });
      if (act.dataset.act === 'remove') { update(it.key, { qty: 0 }); OF.announce(`${OF.byId[it.id].name} removed from cart.`); setTimeout(() => { const f = OF.$('#cartBody button, #cartBody a'); if (f) f.focus(); }, 0); }
      return;
    }
    if (act && act.dataset.act === 'clear-code') { OF.store.set({ discount: null }); codeMsg = { text: 'Code removed.', kind: '' }; renderDrawer(); return; }
    const codeBtn = e.target.closest('[data-code]');
    if (codeBtn) { applyCode(codeBtn.dataset.code); renderDrawer(); return; }
    if (e.target.closest('#toCheckout')) {
      if (st.cart.some((c) => !c.size)) {
        sizeWarn = true; renderDrawer();
        const sel = OF.$('#cartBody .cart-line select[aria-invalid="true"]');
        if (sel) sel.focus();
        OF.announce('Choose a size for every item before checkout.');
        return;
      }
      OF.modal.close(OF.$('#cartDrawer'));
      OF.checkout.open(OF.$('#cartBtn'));
    }
  }

  OF.cart = {
    add, update, totals, applyCode,
    open(trigger) { sizeWarn = false; renderDrawer(); OF.modal.open(OF.$('#cartDrawer'), trigger); },
    clear() { OF.store.set({ cart: [], discount: null }); codeMsg = { text: '', kind: '' }; },
    init() {
      renderBadge();
      OF.$('#cartBtn').addEventListener('click', (e) => OF.cart.open(e.currentTarget));
      const body = OF.$('#cartBody');
      body.addEventListener('click', onDrawerClick);
      body.addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-act="size"]');
        if (!sel) return;
        const line = sel.closest('.cart-line');
        const it = OF.store.get().cart.find((c) => c.key === line.dataset.key);
        if (it) { OF.rememberSize(OF.byId[it.id], sel.value || null); update(it.key, { size: sel.value || null }); }
      });
      body.addEventListener('submit', (e) => {
        if (e.target.id !== 'codeForm') return;
        e.preventDefault();
        applyCode(OF.$('#codeInput').value);
        renderDrawer();
        const inp = OF.$('#codeInput'); if (inp) inp.focus();
      });
      OF.store.subscribe((s, keys) => {
        if (keys.includes('cart') || keys.includes('discount') || keys.includes('unlockedCodes')) {
          renderBadge();
          if (OF.$('#cartDrawer').open) renderDrawer();
        }
      });
    }
  };
})();
