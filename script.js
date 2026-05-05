/* ── DATA ── */
const ITEMS = [
  {
    src: 'img/adv-4-6.png',
    title: 'マルチエージェント協調レビュー',
    desc: '親エージェントが複数サブエージェントを統括し、ビルドとレビューを自動化する高度なワークフロー。',
    level: 'adv', ver: 'v4.6', type: 'Multi-Agent',
    badges: [
      { cls:'badge-adv', label:'上級' },
      { cls:'badge-ver', label:'v4.6' },
      { cls:'chip-multi', label:'Multi-Agent' }
    ]
  },
  {
    src: 'img/mid-4-6.png',
    title: 'コードベース自動分析・要約',
    desc: 'AntigravityエージェントがSKILL.mdを読み込み、コードベースを解析して構造化された日本語サマリーを自動生成。',
    level: 'mid', ver: 'v4.6', type: 'Build-Automation',
    badges: [
      { cls:'badge-mid', label:'中級' },
      { cls:'badge-ver', label:'v4.6' },
      { cls:'chip-build', label:'Build-Automation' }
    ]
  },
  {
    src: 'img/mid-4-7.png',
    title: 'Seleniumログイン自動テスト',
    desc: 'Claude v4.7がSeleniumを操作しWebアプリへの自動ログインとセキュアエリアへのアクセスを検証。',
    level: 'mid', ver: 'v4.7', type: 'Browser-Testing',
    badges: [
      { cls:'badge-mid', label:'中級' },
      { cls:'badge-ver', label:'v4.7' },
      { cls:'chip-browser', label:'Browser-Testing' }
    ]
  }
];
let currentIdx = 0;

/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── MOBILE MENU ── */
const mobileMenu   = document.getElementById('mobile-menu');
const menuBackdrop = document.getElementById('menu-backdrop');
const iconOpen     = document.getElementById('icon-open');
const iconClose    = document.getElementById('icon-close');

const menuToggleBtn = document.getElementById('menu-toggle');
function openMenu() {
  mobileMenu.classList.add('open');
  menuBackdrop.classList.remove('hidden');
  iconOpen.classList.add('hidden');
  iconClose.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  menuToggleBtn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  menuBackdrop.classList.add('hidden');
  iconOpen.classList.remove('hidden');
  iconClose.classList.add('hidden');
  document.body.style.overflow = '';
  menuToggleBtn.setAttribute('aria-expanded', 'false');
}
menuToggleBtn.addEventListener('click', openMenu);
document.getElementById('menu-close').addEventListener('click', closeMenu);
menuBackdrop.addEventListener('click', closeMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

/* ── FILTER ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    let visible = 0;
    document.querySelectorAll('#portfolio-grid li').forEach(card => {
      const show = f === 'all'
        || card.dataset.level === f
        || card.dataset.ver  === f
        || card.dataset.type === f;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    document.getElementById('empty-state').classList.toggle('hidden', visible > 0);
  });
});

/* ── CARD SCROLL ANIMATION ── */
const cards = document.querySelectorAll('.portfolio-card');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = [...cards].indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('visible'), idx * 80);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
cards.forEach(c => observer.observe(c));

/* ── LIGHTBOX ── */
function renderLightbox() {
  const item = ITEMS[currentIdx];
  document.getElementById('lb-img').src = item.src;
  document.getElementById('lb-img').alt = item.title;
  document.getElementById('lb-title').textContent = item.title;
  document.getElementById('lb-desc').textContent  = item.desc;
  const vis = getVisibleItems();
  const visPos = vis.findIndex(i => ITEMS.indexOf(i) === currentIdx);
  document.getElementById('lb-counter').textContent =
    `${visPos + 1} / ${vis.length}`;
  /* ② innerHTML → DOM API (XSS latent risk 排除) */
  const badgesEl = document.getElementById('lb-badges');
  badgesEl.textContent = '';
  item.badges.forEach(b => {
    const span = document.createElement('span');
    span.className = b.cls;
    span.textContent = b.label;
    badgesEl.appendChild(span);
  });
}
function openLightbox(idx) {
  currentIdx = idx;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.querySelector('.lb-close').focus();
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
/* フィルターで表示中の ITEMS のみを返す (Bug #3 修正) */
function getVisibleItems() {
  const f = document.querySelector('.filter-btn.active')?.dataset.filter ?? 'all';
  if (f === 'all') return ITEMS;
  return ITEMS.filter(item => item.level === f || item.ver === f || item.type === f);
}
function prevItem() {
  const vis = getVisibleItems();
  if (vis.length === 0) return;
  const pos = vis.findIndex((_, i) => ITEMS.indexOf(vis[i]) === currentIdx);
  const cur = vis.findIndex(item => ITEMS.indexOf(item) === currentIdx);
  const newPos = (cur - 1 + vis.length) % vis.length;
  currentIdx = ITEMS.indexOf(vis[newPos]);
  renderLightbox();
}
function nextItem() {
  const vis = getVisibleItems();
  if (vis.length === 0) return;
  const cur = vis.findIndex(item => ITEMS.indexOf(item) === currentIdx);
  const newPos = (cur + 1) % vis.length;
  currentIdx = ITEMS.indexOf(vis[newPos]);
  renderLightbox();
}
/* カウンターも表示中の件数を反映 */

document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     { e.preventDefault(); closeLightbox(); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prevItem(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); nextItem(); }
});

/* ② inline onclick/onkeydown を addEventListener に移行 (CSP unsafe-inline 依存削減) */
/* カード: イベント委譲 */
const grid = document.getElementById('portfolio-grid');
grid.addEventListener('click', e => {
  const card = e.target.closest('.portfolio-card');
  if (!card) return;
  const idx = parseInt(card.dataset.index, 10);
  if (!isNaN(idx)) openLightbox(idx);
});
grid.addEventListener('keydown', e => {
  const card = e.target.closest('.portfolio-card');
  if (!card) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const idx = parseInt(card.dataset.index, 10);
    if (!isNaN(idx)) openLightbox(idx);
  }
});

/* ライトボックスボタン */
document.getElementById('lb-close-btn').addEventListener('click', closeLightbox);
document.getElementById('lb-prev-btn').addEventListener('click', prevItem);
document.getElementById('lb-next-btn').addEventListener('click', nextItem);
document.getElementById('lb-backdrop').addEventListener('click', closeLightbox);
