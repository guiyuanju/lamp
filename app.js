const state = { lamps: [], base: '', type: 'All', q: '' };
const $ = (s) => document.querySelector(s);

const img = (path, width) => width ? `${state.base}size/w${width}/${path}` : state.base + path;

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.append(...children.filter((c) => c != null));
  return n;
}

function byline(l) {
  return [l.designer, l.year].filter(Boolean).join(', ') || l.brand;
}

function matches(l) {
  if (state.type !== 'All' && l.type !== state.type) return false;
  if (!state.q) return true;
  const hay = [l.name, l.brand, l.designer, l.origin, l.story, ...l.features].join(' ').toLowerCase();
  return hay.includes(state.q);
}

function renderFilters() {
  const types = ['All', ...new Set(state.lamps.map((l) => l.type))];
  $('#filters').replaceChildren(...types.map((t) =>
    el('button', {
      'aria-pressed': String(t === state.type),
      onclick: () => { state.type = t; renderFilters(); renderGrid(); },
    }, t)));
}

function renderGrid() {
  const list = state.lamps.filter(matches);
  $('#count').textContent = `${list.length} of ${state.lamps.length} lamps`;
  $('#grid').replaceChildren(...list.map((l) => el('li', {},
    el('article', {
      class: 'card', tabindex: '0', role: 'button', 'aria-label': `${l.brand} ${l.name}`,
      onclick: () => openDetail(l),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(l); } },
    },
      el('div', { class: 'ph' }, el('img', { src: img(l.images[0], 600), alt: l.name, loading: 'lazy' })),
      el('div', { class: 'body' },
        el('p', { class: 'eyebrow' }, l.brand),
        el('h2', {}, l.name),
        el('p', { class: 'by' }, byline(l)),
        el('div', { class: 'tags' }, el('span', { class: 'tag' }, l.type), el('span', { class: 'tag' }, l.origin)))))));
}

function showImage(l, i) {
  $('#d-main').src = img(l.images[i], 1600);
  $('#d-main').alt = `${l.name}, photo ${i + 1}`;
  [...$('#d-thumbs').children].forEach((b, j) => b.setAttribute('aria-current', String(i === j)));
}

function openDetail(l) {
  $('#d-meta').textContent = l.brand;
  $('#d-name').textContent = l.name;
  const facts = [['Designer', l.designer], ['Year', l.year], ['Type', l.type], ['Origin', l.origin]].filter(([, v]) => v);
  $('#d-facts').replaceChildren(...facts.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, String(v))]));
  $('#d-features').replaceChildren(...l.features.map((f) => el('li', {}, f)));
  $('#d-story').textContent = l.story;
  $('#d-links').replaceChildren(
    ...l.links.map((k) => el('a', { href: k.url, target: '_blank', rel: 'noopener' }, `${k.label} ↗`)),
    el('a', { href: state.sourceUrl, target: '_blank', rel: 'noopener' }, 'Original post ↗'));
  $('#d-thumbs').replaceChildren(...l.images.map((p, i) =>
    el('button', { 'aria-label': `Photo ${i + 1}`, onclick: () => showImage(l, i) },
      el('img', { src: img(p, 150), alt: '', loading: 'lazy' }))));
  $('#d-thumbs').hidden = l.images.length < 2;
  showImage(l, 0);
  history.replaceState(null, '', `#${l.id}`);
  $('#detail').showModal();
}

$('#detail .close').addEventListener('click', () => $('#detail').close());
$('#detail').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$('#detail').addEventListener('close', () => history.replaceState(null, '', location.pathname));
$('#search').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); renderGrid(); });

fetch('data/lamps.json')
  .then((r) => r.json())
  .then(({ source, lamps }) => {
    Object.assign(state, { lamps, base: source.imageBase, sourceUrl: source.url });
    $('#source-link').href = source.url;
    $('#credit').href = source.url;
    renderFilters();
    renderGrid();
    const hit = lamps.find((l) => `#${l.id}` === location.hash);
    if (hit) openDetail(hit);
  });
