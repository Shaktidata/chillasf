/* checkout.js: four-step mock checkout (Review → Details → Delivery → Confirm), inline validation,
   order confirmation with delivery estimate, print summary. No payment details are ever requested. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});
  const STEPS = ['Review outfit', 'Details', 'Delivery', 'Confirm'];
  const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
  const form = { name: '', email: '', phone: '', address: '', suburb: '', state: '', postcode: '', delivery: 'standard', gift: '', confirm: false };
  let step = 0;
  let order = null;

  const dlg = () => OF.$('#checkoutDialog');
  const bodyEl = () => OF.$('#checkoutBody');

  const RULES = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name.'),
    email: (v) => (!v.trim() ? 'Enter your email.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email like name@example.com.'),
    phone: (v) => {
      const d = v.replace(/[\s().-]/g, '');
      if (!d) return 'Enter your phone number.';
      return /^(?:\+?61|0)[2-478]\d{8}$/.test(d) ? '' : 'Enter an Australian number, e.g. 0412 345 678 or (08) 9123 4567.';
    },
    address: (v) => (v.trim().length >= 4 ? '' : 'Enter your street address.'),
    suburb: (v) => (v.trim().length >= 2 ? '' : 'Enter your suburb.'),
    state: (v) => (STATES.includes(v) ? '' : 'Choose a state or territory.'),
    postcode: (v) => (/^\d{4}$/.test(v.trim()) ? '' : 'Postcodes have 4 digits.')
  };
  const STEP_FIELDS = { 1: ['name', 'email', 'phone'], 2: ['address', 'suburb', 'state', 'postcode'] };

  function stepErrors(i) { return (STEP_FIELDS[i] || []).filter((k) => RULES[k](form[k])); }
  const allValid = () => !stepErrors(1).length && !stepErrors(2).length && OF.store.get().cart.length && OF.store.get().cart.every((c) => c.size);

  function field(k, label, type, extra) {
    const err = (field.show && field.show[k]) ? RULES[k](form[k]) : '';
    return `<div class="field">
      <label for="co-${k}">${label}</label>
      <input id="co-${k}" name="${k}" type="${type || 'text'}" value="${OF.esc(form[k])}" ${extra || ''} aria-invalid="${!!err}" aria-describedby="err-${k}">
      <p class="field-err" id="err-${k}">${err}</p>
    </div>`;
  }
  field.show = {};

  function stepper() {
    return `<ol class="stepper">${STEPS.map((s, i) => {
      const reachable = i <= maxReachable();
      return `<li class="${i === step ? 'current' : i < step ? 'done' : ''}">
        <button type="button" data-goto="${i}" ${reachable ? '' : 'disabled'} ${i === step ? 'aria-current="step"' : ''}><span class="num">${i + 1}</span>${s}</button></li>`;
    }).join('')}</ol>`;
  }
  function maxReachable() {
    if (!OF.store.get().cart.length) return 0;
    if (stepErrors(1).length) return 1;
    if (stepErrors(2).length) return 2;
    return 3;
  }

  function costRows(t) {
    return `<dl class="totals">
      <div><dt>Subtotal</dt><dd>${OF.money(t.subtotal)}</dd></div>
      ${t.code ? `<div><dt>Discount (${t.code})</dt><dd>−${OF.money(t.discount)}</dd></div>` : ''}
      <div><dt>Shipping</dt><dd>${t.shipping ? OF.money(t.shipping) : 'Free'}</dd></div>
      ${t.expressFee ? `<div><dt>Express delivery</dt><dd>${OF.money(t.expressFee)}</dd></div>` : ''}
      <div class="grand"><dt>Total</dt><dd>${OF.money(t.total)}</dd></div>
    </dl>`;
  }

  function itemsList(cart) {
    return `<ul class="co-items">${cart.map((c) => {
      const p = OF.byId[c.id];
      return `<li><span class="co-thumb">${OF.svg.thumb(p, c.colour)}</span>
        <span class="co-name">${OF.esc(p.name)}<span class="muted small">${OF.colourLabel(c.colour)} · ${c.size || 'No size'} · Qty ${c.qty}</span></span>
        <span>${OF.money(p.price * c.qty)}</span></li>`;
    }).join('')}</ul>`;
  }

  function addBusinessDays(d, n) {
    const x = new Date(d.getTime());
    while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) n--; }
    return x;
  }
  const dfmt = (d) => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  function estimate(express) {
    const now = new Date();
    const [a, b] = express ? [1, 2] : [3, 5];
    return `${dfmt(addBusinessDays(now, a))} – ${dfmt(addBusinessDays(now, b))}`;
  }

  function render(focusFirstError) {
    const st = OF.store.get();
    const t = OF.cart.totals({ express: form.delivery === 'express' });
    let html = '';
    if (order) { renderConfirmation(); return; }
    html += stepper();
    if (step === 0) {
      const worn = OF.SLOTS.some((k) => st.outfit[k]);
      html += `<div class="co-review">
        <div class="co-fig">${worn ? OF.svg.figure(st.outfit, st.model) : '<p class="muted small">No outfit on the model. Your cart is below.</p>'}</div>
        <div>
          <h3>Your order</h3>
          ${st.cart.length ? itemsList(st.cart) : '<p>Your cart is empty. Add a look first.</p>'}
          ${st.cart.some((c) => !c.size) ? '<p class="field-err">Some items have no size. Choose sizes in your cart.</p>' : ''}
          ${costRows(t)}
          <button type="button" class="btn btn-ghost btn-sm" data-edit-look>Edit look</button>
        </div>
      </div>`;
    } else if (step === 1) {
      html += `<form class="co-form" novalidate data-step="1"><h3>Your details</h3>
        ${field('name', 'Full name', 'text', 'autocomplete="name"')}
        ${field('email', 'Email', 'email', 'autocomplete="email" inputmode="email"')}
        ${field('phone', 'Phone (Australian)', 'tel', 'autocomplete="tel" inputmode="tel"')}
      </form>`;
    } else if (step === 2) {
      const stErr = field.show.state ? RULES.state(form.state) : '';
      html += `<form class="co-form" novalidate data-step="2"><h3>Delivery</h3>
        ${field('address', 'Street address', 'text', 'autocomplete="street-address"')}
        <div class="field-row">
          ${field('suburb', 'Suburb', 'text', 'autocomplete="address-level2"')}
          <div class="field"><label for="co-state">State</label>
            <select id="co-state" name="state" autocomplete="address-level1" aria-invalid="${!!stErr}" aria-describedby="err-state">
              <option value="">Choose</option>${STATES.map((s) => `<option${s === form.state ? ' selected' : ''}>${s}</option>`).join('')}
            </select><p class="field-err" id="err-state">${stErr}</p></div>
          ${field('postcode', 'Postcode', 'text', 'inputmode="numeric" maxlength="4" autocomplete="postal-code"')}
        </div>
        <fieldset class="radio-group"><legend>Delivery option</legend>
          <label class="radio-card"><input type="radio" name="delivery" value="standard" ${form.delivery === 'standard' ? 'checked' : ''}>
            <span><strong>Standard, 3–5 business days</strong><span class="muted small">${t.shipping ? OF.money(t.shipping) : 'Free'} · arrives ${estimate(false)}</span></span></label>
          <label class="radio-card"><input type="radio" name="delivery" value="express" ${form.delivery === 'express' ? 'checked' : ''}>
            <span><strong>Express, 1–2 business days</strong><span class="muted small">+${OF.money(OF.SHIPPING.express)} · arrives ${estimate(true)}</span></span></label>
        </fieldset>
        <div class="field"><label for="co-gift">Gift note (optional)</label>
          <textarea id="co-gift" name="gift" rows="2" maxlength="200">${OF.esc(form.gift)}</textarea></div>
      </form>`;
    } else {
      html += `<div class="co-confirm"><h3>Confirm your order</h3>
        <div class="co-two">
          <div>${itemsList(st.cart)}${costRows(t)}</div>
          <div class="co-addr">
            <p><strong>${OF.esc(form.name)}</strong><br>${OF.esc(form.email)}<br>${OF.esc(form.phone)}</p>
            <p>${OF.esc(form.address)}<br>${OF.esc(form.suburb)} ${OF.esc(form.state)} ${OF.esc(form.postcode)}</p>
            <p>${form.delivery === 'express' ? 'Express' : 'Standard'} delivery, estimated ${estimate(form.delivery === 'express')}</p>
            ${form.gift ? `<p class="muted small">Gift note: ${OF.esc(form.gift)}</p>` : ''}
          </div>
        </div>
        <p class="notice">Demo store: no payment will be taken. You will not be asked for card details.</p>
        <label class="check"><input type="checkbox" id="co-confirm" ${form.confirm ? 'checked' : ''}> I confirm my order details are correct</label>
      </div>`;
    }
    const canNext = step === 0 ? st.cart.length && st.cart.every((c) => c.size) : true;
    html += `<div class="co-nav">
      ${step > 0 ? '<button type="button" class="btn btn-ghost" data-back>Back</button>' : '<span></span>'}
      ${step < 3 ? `<button type="button" class="btn btn-primary" data-next ${canNext ? '' : 'disabled'}>Continue</button>`
        : `<button type="button" class="btn btn-primary" data-place ${form.confirm && allValid() ? '' : 'disabled'}>Place order</button>`}
    </div>`;
    bodyEl().innerHTML = html;
    if (focusFirstError) {
      const bad = bodyEl().querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
    } else {
      const h = bodyEl().querySelector('h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }
  }

  function readForm() {
    OF.$$('#checkoutBody input, #checkoutBody select, #checkoutBody textarea').forEach((el) => {
      if (!el.name) return;
      if (el.type === 'radio') { if (el.checked) form[el.name] = el.value; } else form[el.name] = el.value;
    });
  }

  function next() {
    readForm();
    const errs = stepErrors(step);
    if (errs.length) {
      errs.forEach((k) => { field.show[k] = true; });
      STEP_FIELDS[step].forEach((k) => { field.show[k] = true; });
      render(true);
      OF.announce(`${errs.length} field${errs.length > 1 ? 's need' : ' needs'} attention.`);
      return;
    }
    step = Math.min(3, step + 1);
    render();
  }

  function place() {
    if (!form.confirm || !allValid()) return;
    const st = OF.store.get();
    const express = form.delivery === 'express';
    const t = OF.cart.totals({ express });
    const num = `CASF-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
    order = {
      number: num, placedAt: new Date().toISOString(), items: OF.clone(st.cart), outfit: OF.clone(st.outfit), model: OF.clone(st.model),
      totals: t, delivery: form.delivery, estimate: estimate(express), name: form.name, email: form.email,
      address: `${form.address}, ${form.suburb} ${form.state} ${form.postcode}`
    };
    try { window.localStorage.setItem('lastOrder', JSON.stringify(order)); } catch (e) { /* ignore */ }
    OF.announce(`Order placed. Your order number is ${num}.`);
    renderConfirmation();
  }

  function renderConfirmation() {
    const o = order;
    const worn = OF.SLOTS.some((k) => o.outfit[k]);
    bodyEl().innerHTML = `
      <div class="confirmation print-area">
        <p class="eyebrow">Order placed</p>
        <h3 class="result-title" tabindex="-1" id="thanksHead">Thank you, ${OF.esc(o.name.split(' ')[0])}.</h3>
        <p>Your order number is <strong class="order-no">${o.number}</strong>. A confirmation would be sent to ${OF.esc(o.email)}. (Demo: nothing is sent.)</p>
        <div class="co-two">
          ${worn ? `<div class="co-fig">${OF.svg.figure(o.outfit, o.model)}</div>` : ''}
          <div>
            ${itemsList(o.items)}
            ${costRows(o.totals)}
            <p><strong>Estimated delivery:</strong> ${o.estimate} (${o.delivery === 'express' ? 'Express' : 'Standard'})</p>
            <p class="muted small">Ship to ${OF.esc(o.address)}</p>
          </div>
        </div>
        <p class="notice">Demo store: no payment was taken and nothing will be shipped.</p>
        <div class="btn-row no-print">
          <button type="button" class="btn btn-ghost" data-print>Download summary</button>
          <button type="button" class="btn btn-primary" data-continue>Continue shopping</button>
        </div>
      </div>`;
    OF.$('#checkoutTitle').textContent = 'Order confirmed';
    OF.$('#thanksHead').focus();
  }

  function finish() {
    OF.cart.clear();
    order = null; step = 0;
    Object.assign(form, { confirm: false });
    OF.modal.close(dlg());
    OF.scrollTo('builder');
    OF.announce('Cart cleared. Your saved looks are still here.');
  }

  OF.checkout = {
    open(trigger) {
      order = null; step = 0; field.show = {}; form.confirm = false;
      OF.$('#checkoutTitle').textContent = 'Checkout';
      render();
      OF.modal.open(dlg(), trigger);
      setTimeout(() => { const h = bodyEl().querySelector('h3'); if (h) h.focus(); }, 40);
    },
    init() {
      const b = bodyEl();
      b.addEventListener('click', (e) => {
        if (e.target.closest('[data-next]')) { next(); return; }
        if (e.target.closest('[data-back]')) { readForm(); step = Math.max(0, step - 1); render(); return; }
        const g = e.target.closest('[data-goto]');
        if (g) { readForm(); step = +g.dataset.goto; render(); return; }
        if (e.target.closest('[data-place]')) { place(); return; }
        if (e.target.closest('[data-edit-look]')) { OF.modal.close(dlg()); OF.scrollTo('builder'); return; }
        if (e.target.closest('[data-print]')) {
          document.body.classList.add('printing-order');
          const done = () => { document.body.classList.remove('printing-order'); window.removeEventListener('afterprint', done); };
          window.addEventListener('afterprint', done);
          window.print();
          setTimeout(done, 1000);
          return;
        }
        if (e.target.closest('[data-continue]')) finish();
      });
      b.addEventListener('change', (e) => {
        if (e.target.id === 'co-confirm') {
          form.confirm = e.target.checked;
          const btn = OF.$('[data-place]', b);
          if (btn) btn.disabled = !(form.confirm && allValid());
        }
        if (e.target.name === 'delivery') { readForm(); render(); const r = OF.$(`input[value="${form.delivery}"]`, b); if (r) r.focus(); }
      });
      // Re-validate a field when the user leaves it, once it has been shown as invalid.
      b.addEventListener('focusout', (e) => {
        const k = e.target.name;
        if (!k || !RULES[k] || !field.show[k]) return;
        form[k] = e.target.value;
        const err = RULES[k](form[k]);
        e.target.setAttribute('aria-invalid', String(!!err));
        const p = OF.$('#err-' + k); if (p) p.textContent = err;
      });
      b.addEventListener('submit', (e) => { e.preventDefault(); next(); });
      dlg().addEventListener('of:closed', () => { if (order) { /* closing after ordering behaves like Continue shopping */ OF.cart.clear(); order = null; step = 0; } });
    }
  };
})();
