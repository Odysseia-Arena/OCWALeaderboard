async function fetchLeaderboard() {
  const url = 'data/leaderboard.json';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('加载排行榜失败:', err);
    return { updatedAt: null, leaderboard: [], error: String(err) };
  }
}

async function fetchHealth() {
  const url = 'data/health.json';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { ok: false, status: 'error', error: String(err) };
  }
}

// 多语言：控制页面标题/副标题及各处文案
const I18N_TEXT = {
  zh: {
    htmlLang: 'zh-CN',
    title: '类脑AI创意写作竞技场',
    subtitle: 'Odysseia AI Creative Writing Arena',
    rulesLink: '规则说明',
    searchPlaceholder: '搜索模型名称...',
    totalBattles: '总对战',
    lastUpdated: '最后更新',
    loading: '加载中...',
    noData: '暂无数据',
    themeToLight: '亮色模式',
    themeToDark: '暗色模式',
    themeTitle: '切换明暗主题',
    langTitle: '切换语言',
    headers: {
      rank: '名次',
      model_name: 'AI模型名',
      rating: 'ELO评分',
      battles: '对战',
      wins: '胜',
      ties: '平',
      win_rate_percentage: '胜率%'
    },
    health: {
      prefix: '后端状态',
      ok: '正常',
      error: '异常',
      models: '模型',
      fixed_prompts: '固定题',
      users: '用户',
      completed_battles: '完成对战'
    },
    footer: '由 GitHub Actions 定时同步 · 开源部署于 GitHub Pages'
  },
  en: {
    htmlLang: 'en',
    title: 'Odysseia AI Creative Writing Arena',
    subtitle: '类脑AI创意写作竞技场',
    rulesLink: 'Rules',
    searchPlaceholder: 'Search model name...',
    totalBattles: 'Total Battles',
    lastUpdated: 'Last Updated',
    loading: 'Loading...',
    noData: 'No data',
    themeToLight: 'Light Mode',
    themeToDark: 'Dark Mode',
    themeTitle: 'Toggle theme',
    langTitle: 'Change language',
    headers: {
      rank: 'Rank',
      model_name: 'Model',
      rating: 'ELO',
      battles: 'Battles',
      wins: 'Wins',
      ties: 'Ties',
      win_rate_percentage: 'Win %'
    },
    health: {
      prefix: 'Backend',
      ok: 'OK',
      error: 'Error',
      models: 'Models',
      fixed_prompts: 'Fixed Prompts',
      users: 'Users',
      completed_battles: 'Completed'
    },
    footer: 'Synced by GitHub Actions · Deployed on GitHub Pages'
  },
  ja: {
    htmlLang: 'ja',
    // 類脳 带假名注音
    title: '<ruby><rb>類脳</rb><rt>オデュッセイア</rt></ruby>AI創作競技場',
    subtitle: '类脑AI创意写作竞技场',
    rulesLink: 'ルール',
    searchPlaceholder: 'モデル名を検索...',
    totalBattles: '総対戦数',
    lastUpdated: '最終更新',
    loading: '読み込み中...',
    noData: 'データなし',
    themeToLight: 'ライトモード',
    themeToDark: 'ダークモード',
    themeTitle: 'テーマを切り替え',
    langTitle: '言語を切り替え',
    headers: {
      rank: '順位',
      model_name: 'モデル',
      rating: 'ELO',
      battles: '対戦',
      wins: '勝',
      ties: '分',
      win_rate_percentage: '勝率%'
    },
    health: {
      prefix: 'バックエンド',
      ok: '正常',
      error: '異常',
      models: 'モデル',
      fixed_prompts: '固定課題',
      users: 'ユーザー',
      completed_battles: '完了対戦'
    },
    footer: 'GitHub Actions により同期 · GitHub Pages にデプロイ'
  },
};

let __lastUpdatedISO = null;

function getLang() {
  try { return localStorage.getItem('lang') || 'zh'; } catch (_) { return 'zh'; }
}

function applyLanguage(lang) {
  const conf = I18N_TEXT[lang] || I18N_TEXT.zh;
  try { localStorage.setItem('lang', lang); } catch (_) {}
  try { document.documentElement.lang = conf.htmlLang; } catch (_) {}

  const titleEl = document.querySelector('.header .title');
  const subEl = document.querySelector('.header .subtitle');
  if (titleEl) {
    if (lang === 'ja') titleEl.innerHTML = conf.title; else titleEl.textContent = conf.title;
  }
  if (subEl) subEl.textContent = conf.subtitle;

  const rulesLink = document.querySelector('.toolbar .right .link');
  if (rulesLink) rulesLink.textContent = conf.rulesLink;

  const searchInput = document.getElementById('search');
  if (searchInput) searchInput.placeholder = conf.searchPlaceholder;

  const updated = document.getElementById('updatedAt');
  if (updated) {
    const label = conf.lastUpdated;
    if (__lastUpdatedISO) {
      const d = new Date(__lastUpdatedISO);
      updated.textContent = `${label}：${d.toLocaleString()}`;
    } else {
      updated.textContent = `${label}：--`;
    }
  }

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.title = conf.themeTitle;

  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.title = conf.langTitle;

  updateTableHeaders(lang);
  // Footer
  const footerSpan = document.querySelector('.footer .container .muted');
  if (footerSpan) footerSpan.textContent = conf.footer;

  // total battles label refresh
  try {
    const health = window.__lastHealth || {};
    const rows = window.__lastRows || [];
    updateTotalBattles(health, rows);
  } catch (_) {}

  // refresh theme button text with localized label
  try { applyTheme(localStorage.getItem('theme') || 'light'); } catch (_) {}

  const select = document.getElementById('langSelect');
  if (select && select.value !== lang) select.value = lang;
}

function setupLanguage() {
  const select = document.getElementById('langSelect');
  const saved = getLang();

  if (select) {
    select.value = saved;
    select.addEventListener('change', (e) => {
      const next = e.target && e.target.value ? String(e.target.value) : 'zh';
      applyLanguage(next);
    });
  }
  applyLanguage(saved);
}

function updateTableHeaders(lang) {
  const conf = I18N_TEXT[lang] || I18N_TEXT.zh;
  const map = conf.headers;
  const keys = ['rank','model_name','rating','battles','wins','ties','win_rate_percentage'];
  keys.forEach((k) => {
    const th = document.querySelector(`th.sortable[data-key="${k}"]`);
    if (th) th.textContent = map[k];
  });
}

function renderTable(rows) {
  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = '';

  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 7;
    td.className = 'muted center';
    const lang = getLang();
    td.textContent = (I18N_TEXT[lang] || I18N_TEXT.zh).noData;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const item of rows) {
    const tr = document.createElement('tr');

    const tdRank = document.createElement('td');
    tdRank.textContent = item.rank ?? '';
    tr.appendChild(tdRank);

    const tdName = document.createElement('td');
    tdName.textContent = item.model_name ?? item.name ?? '';
    tr.appendChild(tdName);

    const tdRating = document.createElement('td');
    tdRating.textContent = item.rating ?? item.score ?? '';
    tr.appendChild(tdRating);

    const tdBattles = document.createElement('td');
    tdBattles.textContent = item.battles ?? '';
    tr.appendChild(tdBattles);

    const tdWins = document.createElement('td');
    tdWins.textContent = item.wins ?? '';
    tr.appendChild(tdWins);

    const tdTies = document.createElement('td');
    tdTies.textContent = item.ties ?? '';
    tr.appendChild(tdTies);

    const tdWinRate = document.createElement('td');
    const wr = item.win_rate_percentage;
    tdWinRate.textContent = (wr !== undefined && wr !== null) ? Number(wr).toFixed(2) : '';
    tr.appendChild(tdWinRate);

    tbody.appendChild(tr);
  }
}

function setupSearch(state) {
  const input = document.getElementById('search');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    state.query = q;
    applyAndRender(state);
  });
}

function setupSorting(state) {
  const headers = document.querySelectorAll('th.sortable');
  headers.forEach(th => {
    th.setAttribute('aria-sort', 'none');
  });
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-key');
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = key === 'rank' ? 'asc' : 'desc';
      }
      headers.forEach(h => h.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', state.sortDir);
      applyAndRender(state);
    });
  });
}

function applyAndRender(state) {
  const rows = state.rowsRaw
    .filter(e => (e.model_name || e.name || '').toLowerCase().includes(state.query || ''))
    .slice();

  const key = state.sortKey;
  const dir = state.sortDir;
  const factor = dir === 'asc' ? 1 : -1;
  const get = (r) => {
    if (key === 'model_name') return (r.model_name || r.name || '').toLowerCase();
    return Number(r[key] ?? (key === 'rating' ? r.score : undefined)) || 0;
  };
  rows.sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * factor;
    return (va - vb) * factor;
  });

  renderTable(rows);
}

function updateTotalBattles(health, rows) {
  let total;
  if (health && typeof health.completed_battles_count === 'number') {
    total = health.completed_battles_count;
  } else {
    total = rows.reduce((sum, r) => sum + (Number(r.battles) || 0), 0);
  }
  const el = document.getElementById('totalBattles');
  if (el) {
    const lang = getLang();
    const label = (I18N_TEXT[lang] || I18N_TEXT.zh).totalBattles;
    el.textContent = `${label}：${total}`;
  }
}

function renderHealth(health) {
  const footer = document.querySelector('.footer .container');
  if (!footer) return;
  const ok = !!health.ok && String(health.status || '').toLowerCase() === 'ok';
  const emoji = ok ? '🟢' : '🔴';
  const lang = getLang();
  const T = (I18N_TEXT[lang] || I18N_TEXT.zh).health;
  const counts = [
    health.models_count != null ? `${T.models}:${health.models_count}` : null,
    health.fixed_prompts_count != null ? `${T.fixed_prompts}:${health.fixed_prompts_count}` : null,
    health.recorded_users_count != null ? `${T.users}:${health.recorded_users_count}` : null,
    health.completed_battles_count != null ? `${T.completed_battles}:${health.completed_battles_count}` : null,
  ].filter(Boolean).join(' · ');

  const span = document.createElement('span');
  span.className = 'muted';
  span.style.marginLeft = '8px';
  span.textContent = `${emoji} ${(I18N_TEXT[lang] || I18N_TEXT.zh).health.prefix}：${ok ? T.ok : T.error}${counts ? ' · ' + counts : ''}`;
  footer.appendChild(span);
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const isDark = theme === 'dark';
    const lang = getLang();
    const T = I18N_TEXT[lang] || I18N_TEXT.zh;
    const targetText = isDark ? T.themeToLight : T.themeToDark;
    btn.textContent = targetText;
    btn.classList.remove('light-target', 'dark-target');
    btn.classList.add(isDark ? 'light-target' : 'dark-target');
  }
}

// 已移除 XP 风格相关逻辑

function setupToggles() {
  const themeBtn = document.getElementById('themeToggle');

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeBtn.addEventListener('click', () => {
    const next = (localStorage.getItem('theme') || 'light') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

(async function init() {
  const [data, health] = await Promise.all([fetchLeaderboard(), fetchHealth()]);
  const rows = Array.isArray(data.leaderboard)
    ? data.leaderboard
    : (Array.isArray(data.entries) ? data.entries.map(e => ({ rank: e.rank, model_name: e.name, rating: e.score })) : []);

  setupToggles();
  setupLanguage();

  const state = {
    rowsRaw: rows,
    query: '',
    sortKey: 'rank',
    sortDir: 'asc',
  };

  setupSearch(state);
  setupSorting(state);

  const updated = document.getElementById('updatedAt');
  if (data.updatedAt) {
    __lastUpdatedISO = data.updatedAt;
  } else {
    __lastUpdatedISO = null;
  }

  // 缓存最近一次数据以便在语言切换时重绘相关文案
  window.__lastHealth = health || {};
  window.__lastRows = rows;

  renderHealth(health || {});
  updateTotalBattles(health || {}, rows);
  applyAndRender(state);
  // 依据当前语言刷新所有静态文案
  applyLanguage(getLang());
})();
