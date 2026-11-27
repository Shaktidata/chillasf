/* shop.js: product grid with filters and sort, plus the quick-view modal. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});
  const f = { category: '', colour: '', size: '', max: 250, sort: 'featured' };
  const qv = { id: null, colour: null, size: null };

  function list() {
    let ps = OF.PRODUCTS.filter((p) => OF.hasArt(p) && (!f.category || p.category === f.category)
      && (!f.colour || p.colours.includes(f.colour))
      && (!f.size || p.sizes.includes(f.size))
      && p.price <= f.max);
    if (f.sort === 'price-asc') ps = ps.slice().sort((a, b) => a.price - b.price || a.featured - b.featured);
    else if (f.sort === 'new') ps = ps.slice().sort((a, b) => (b.tags.includes('new') - a.tags.includes('new')) || a.featured - b.featured);
    return ps;
  }

  function render() {
    const ps = list();
    OF.$('#shopCount').textContent = `${ps.length} piece${ps.length === 1 ? '' : 's'}`;
    OF.$('#shopGrid').innerHTML = ps.length ? ps.map((p) => {
      const col = f.colour && p.colours.includes(f.colour) ? f.colour : p.defaultColour;
      const tag = p.tags.includes('new') ? '<span class="badge">New</span>' : p.tags.includes('bestseller') ? '<span class="badge badge-soft">Bestseller</span>' : '';
      return `<article class="p-card">
        <button type="button" class="p-thumb" data-qv="${p.id}" data-colour="${col}" aria-label="Quick view: ${OF.esc(OF.itemName(p.id, col))}">${OF.svg.thumb(p, col)}${tag}</button>
        <div class="p-info">
          <h3>${OF.esc(p.name)}</h3>
          <p class="price">${OF.money(p.price)}</p>
          <p class="dots" aria-label="${p.colours.length} colours: ${p.colours.map(OF.colourLabel).join(', ')}">${p.colours.map((c) => `<span class="dot" style="--sw:${OF.COLOURS[c].hex}"></span>`).join('')}</p>
        </div>
        <div class="p-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-qv="${p.id}" data-colour="${col}">Quick view</button>
          ${OF.inBuilder(p) ? `<button type="button" class="btn btn-ghost btn-sm" data-try="${p.id}" data-colour="${col}">Try in builder</button>` : ''}
        </div>
      </article>`;
    }).join('') : '<p class="muted">Nothing matches. Try widening the filters.</p>';
  }

  function guideFor(p) {
    const g = OF.SIZE_GUIDE[OF.sizeKind(p)];
    return `<table class="size-table"><thead><tr>${g.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${g.rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function renderQV(focusSel) {
    const p = OF.byId[qv.id];
    OF.$('#qvTitle').textContent = p.name;
    OF.$('#qvBody').innerHTML = `
      <div class="qv">
        <div class="qv-img">${OF.svg.thumb(p, qv.colour)}</div>
        <div class="qv-info">
          <p class="price big">${OF.money(p.price)}</p>
          <p>${OF.esc(p.fabric)}. ${OF.esc(p.fit)} fit.</p>
          <dl class="spec">
            <div><dt>Fit note</dt><dd>${OF.esc(p.fitNote)}</dd></div>
            <div><dt>Care</dt><dd>${OF.esc(p.care)}</dd></div>
            <div><dt>Good for</dt><dd>${p.occasions.map((o) => OF.OCCASIONS[o].label).join(', ')}</dd></div>
          </dl>
          <p class="field-label">Colour: <strong>${OF.colourLabel(qv.colour)}</strong></p>
          <div class="swatches" role="group" aria-label="Colour">${OF.swatches(p, qv.colour, 'data-qv-colour')}</div>
          <p class="field-label" id="qvSizeLabel">Size</p>
          <div class="size-row" role="radiogroup" aria-labelledby="qvSizeLabel">${p.sizes.map((s) =>
            `<button type="button" role="radio" class="size-btn" data-qv-size="${s}" aria-checked="${s === qv.size}" tabindex="${s === qv.size || (!qv.size && s === p.sizes[0]) ? 0 : -1}">${s}</button>`).join('')}</div>
          <p class="field-err" id="qvErr" role="alert"></p>
          <div class="btn-row">
            <button type="button" class="btn btn-primary" data-qv-add>Add to cart</button>
            ${OF.inBuilder(p) ? '<button type="button" class="btn btn-ghost" data-qv-try>Try in builder</button>' : ''}
          </div>
          <details class="size-guide"><summary>Size guide</summary>${guideFor(p)}</details>
        </div>
      </div>`;
    if (focusSel) { const el = OF.$(focusSel, OF.$('#qvBody')); if (el) el.focus(); }
  }

  function openQV(id, colour, trigger) {
    const p = OF.byId[id];
    qv.id = id; qv.colour = colour || p.defaultColour; qv.size = OF.defaultSize(p);
    renderQV();
    OF.modal.open(OF.$('#quickView'), trigger);
  }

  OF.shop = {
    openQV,
    init() {
      const cat = OF.$('#shopCategory'), col = OF.$('#shopColour'), size = OF.$('#shopSize'), price = OF.$('#shopPrice'), sort = OF.$('#shopSort');
      // Offer only categories and colours that the visible catalogue actually has.
      const shown = OF.PRODUCTS.filter(OF.hasArt);
      cat.innerHTML += OF.SHOP_CATEGORIES.filter((c) => shown.some((p) => p.category === c.id))
        .map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
      col.innerHTML += Object.keys(OF.COLOURS).filter((c) => shown.some((p) => p.colours.includes(c)))
        .map((c) => `<option value="${c}">${OF.COLOURS[c].label}</option>`).join('');
      size.innerHTML += ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12', '13', 'One size'].map((s) => `<option>${s}</option>`).join('');
      cat.addEventListener('change', () => { f.category = cat.value; render(); });
      col.addEventListener('change', () => { f.colour = col.value; render(); });
      size.addEventListener('change', () => { f.size = size.value; render(); });
      sort.addEventListener('change', () => { f.sort = sort.value; render(); });
      price.addEventListener('input', () => { f.max = +price.value; OF.$('#shopPriceOut').textContent = OF.money(f.max); render(); });

      OF.$('#shopGrid').addEventListener('click', (e) => {
        const q = e.target.closest('[data-qv]');
        if (q) { openQV(q.dataset.qv, q.dataset.colour, q); return; }
        const t = e.target.closest('[data-try]');
        if (t) { OF.builder.wear(t.dataset.try, t.dataset.colour); OF.scrollTo('builder'); }
      });

      const qb = OF.$('#qvBody');
      qb.addEventListener('click', (e) => {
        const p = OF.byId[qv.id];
        const c = e.target.closest('[data-qv-colour]');
        if (c) { qv.colour = c.dataset.colour; renderQV(`[data-colour="${qv.colour}"]`); return; }
        const s = e.target.closest('[data-qv-size]');
        if (s) { qv.size = s.dataset.qvSize; OF.rememberSize(p, qv.size); renderQV(`[data-qv-size="${qv.size}"]`); return; }
        if (e.target.closest('[data-qv-add]')) {
          if (!qv.size) {
            OF.$('#qvErr').textContent = 'Choose a size first.';
            const first = OF.$('.size-btn', qb); if (first) first.focus();
            return;
          }
          OF.cart.add(p.id, qv.colour, qv.size);
          OF.$('#qvErr').textContent = '';
          const btn = OF.$('[data-qv-add]', qb);
          btn.textContent = 'Added. Add another?';
          return;
        }
        if (e.target.closest('[data-qv-try]')) {
          OF.builder.wear(p.id, qv.colour);
          OF.modal.close(OF.$('#quickView'));
          OF.scrollTo('builder');
        }
      });
      qb.addEventListener('keydown', (e) => {
        const s = e.target.closest('[data-qv-size]');
        if (!s || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        const p = OF.byId[qv.id];
        let i = p.sizes.indexOf(s.dataset.qvSize);
        i = (i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + p.sizes.length) % p.sizes.length;
        qv.size = p.sizes[i]; OF.rememberSize(p, qv.size);
        renderQV(`[data-qv-size="${qv.size}"]`);
        e.preventDefault();
      });
      render();
    }
  };
})();
