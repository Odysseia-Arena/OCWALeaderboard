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

async function fetchPrevLeaderboard() {
  const url = 'data/leaderboard_prev.json';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    // 首次运行或无备份时可能 404，返回空结构
    return { updatedAt: null, leaderboard: [] };
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
    heatmapLink: '热力图',
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
      rating: '评分',
      tier: '段位',
      rating_deviation: '评分偏差',
      volatility: '波动率',
      battles: '对战',
      wins: '胜',
      ties: '平',
      skips: '弃权',
      win_rate_percentage: '胜率%'
    },
    sortBy: {
      label: '排序',
      rank: '名次',
      rating: '评分',
      tier: '段位',
      rating_deviation: '评分偏差',
      volatility: '波动率',
      battles: '对战',
      wins: '胜',
      ties: '平',
      skips: '弃权',
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
    footer: '由 GitHub Actions 定时同步 · 开源部署于 GitHub Pages',
    tooltip: {
      labels: {
        rating: '评分',
        rating_deviation: '评分偏差',
        volatility: '波动率'
      },
      nonRealtime: '长期',
      realtime: '实时',
      rdShort: '评分偏差',
      volShort: '波动率'
    }
  },
  en: {
    htmlLang: 'en',
    title: 'Odysseia AI Creative Writing Arena',
    subtitle: '类脑AI创意写作竞技场',
    rulesLink: 'Rules',
    heatmapLink: 'Heatmap',
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
      tier: 'Tier',
      rating_deviation: 'RD',
      volatility: 'Volatility',
      battles: 'Battles',
      wins: 'Wins',
      ties: 'Ties',
      skips: 'Skips',
      win_rate_percentage: 'Win Rate %'
    },
    sortBy: {
      label: 'Sort by',
      rank: 'Rank',
      rating: 'ELO',
      tier: 'Tier',
      rating_deviation: 'RD',
      volatility: 'Volatility',
      battles: 'Battles',
      wins: 'Wins',
      ties: 'Ties',
      skips: 'Skips',
      win_rate_percentage: 'Win Rate %'
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
    footer: 'Synced by GitHub Actions · Deployed on GitHub Pages',
    tooltip: {
      labels: {
        rating: 'Rating',
        rating_deviation: 'RD',
        volatility: 'Volatility'
      },
      nonRealtime: 'Long-term',
      realtime: 'Realtime',
      rdShort: 'RD',
      volShort: 'σ'
    }
  },
  ja: {
    htmlLang: 'ja',
    // 類脳 带假名注音
    title: '<ruby><rb>類脳</rb><rt>オデュッセイア</rt></ruby>AI創作競技場',
    subtitle: '类脑AI创意写作竞技场',
    rulesLink: 'ルール',
    heatmapLink: 'ヒートマップ',
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
      tier: 'ティア',
      rating_deviation: 'レート偏差',
      volatility: '変動率',
      battles: '対戦',
      wins: '勝',
      ties: '分',
      skips: '棄権',
      win_rate_percentage: '勝率%'
    },
    sortBy: {
      label: 'ソート',
      rank: '順位',
      rating: 'ELO',
      tier: 'ティア',
      rating_deviation: 'レート偏差',
      volatility: '変動率',
      battles: '対戦',
      wins: '勝',
      ties: '分',
      skips: '棄権',
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
    footer: 'GitHub Actions により同期 · GitHub Pages にデプロイ',
    tooltip: {
      labels: {
        rating: 'レーティング',
        rating_deviation: 'レート偏差',
        volatility: '変動率'
      },
      nonRealtime: '長期',
      realtime: 'リアルタイム',
      rdShort: 'RD',
      volShort: 'σ'
    }
  },
};

// Breakpoints (single source of truth)
const BREAKPOINT_TABLE = 480;   // stacked-card table threshold

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

  const rulesLink = document.getElementById('rulesLink');
  if (rulesLink) rulesLink.textContent = conf.rulesLink;
  const heatmapLink = document.getElementById('heatmapLink');
  if (heatmapLink) heatmapLink.textContent = conf.heatmapLink;

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

  // sync custom language select
  try {
    const root = document.getElementById('langCustom');
    if (root) {
      const menu = root.querySelector('.menu');
      const label = root.querySelector('.label');
      const opts = [
        { v: 'zh', label: '中文' },
        { v: 'en', label: 'English' },
        { v: 'ja', label: '日本語' },
      ];
      menu.innerHTML = '';
      opts.forEach(o => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.dataset.value = o.v;
        li.textContent = o.label;
        if (o.v === lang) li.classList.add('active');
        menu.appendChild(li);
      });
      label.textContent = opts.find(o => o.v === lang)?.label || '中文';
    }
  } catch (_) {}

  // mobile sort select localization
  const sortSelect = document.getElementById('sortSelect');
  const sortLabel = document.getElementById('sortByLabel');
  if (sortLabel) sortLabel.textContent = (I18N_TEXT[lang] || I18N_TEXT.zh).sortBy.label;
  if (sortSelect) {
    const sortConf = (I18N_TEXT[lang] || I18N_TEXT.zh).sortBy;
    const options = [
      { value: 'rank', label: sortConf.rank },
      { value: 'rating', label: sortConf.rating },
      { value: 'tier', label: sortConf.tier },
      { value: 'rating_deviation', label: sortConf.rating_deviation },
      { value: 'volatility', label: sortConf.volatility },
      { value: 'battles', label: sortConf.battles },
      { value: 'wins', label: sortConf.wins },
      { value: 'ties', label: sortConf.ties },
      { value: 'skips', label: sortConf.skips },
      { value: 'win_rate_percentage', label: sortConf.win_rate_percentage },
    ];
    sortSelect.innerHTML = '';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value; o.textContent = opt.label; sortSelect.appendChild(o);
    });
  }

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

  // health status re-render with current language
  try {
    renderHealth(window.__lastHealth || {});
  } catch (_) {}

  // refresh responsive labels for current language
  try { applyResponsiveLabels(lang); } catch (_) {}

  // refresh theme button text with localized label
  try { applyTheme(localStorage.getItem('theme') || 'light'); } catch (_) {}

  const select = document.getElementById('langSelect');
  if (select && select.value !== lang) select.value = lang;

  // re-render table to update localized tooltips
  try {
    if (window.__renderState) applyAndRender(window.__renderState);
  } catch (_) {}
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
  // custom select interactions
  const custom = document.getElementById('langCustom');
  if (custom) {
    // 可聚焦以便键盘操作
    try { custom.setAttribute('tabindex', '0'); } catch (_) {}

    const menu = custom.querySelector('.menu');

    const getItems = () => Array.from(menu.querySelectorAll('li'));
    const getActiveIndex = () => getItems().findIndex(n => n.classList.contains('active'));
    const setActiveIndex = (idx) => {
      const items = getItems();
      if (items.length === 0) return;
      const bounded = Math.max(0, Math.min(items.length - 1, idx));
      items.forEach(n => n.classList.remove('active'));
      const el = items[bounded];
      el.classList.add('active');
      try { el.scrollIntoView({ block: 'nearest' }); } catch (_) {}
    };
    const openMenu = () => {
      custom.classList.add('open');
      custom.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      custom.classList.remove('open');
      custom.setAttribute('aria-expanded', 'false');
    };

    custom.addEventListener('click', (e) => {
      const target = e.target;
      // 点击容器标签区 -> 切换展开
      if (!target.closest('li')) {
        if (custom.classList.contains('open')) closeMenu(); else openMenu();
      }
      // choose option
      if (target && target.closest('li')) {
        const li = target.closest('li');
        const v = li?.dataset.value || 'zh';
        custom.querySelectorAll('li').forEach(n => n.classList.remove('active'));
        li.classList.add('active');
        const label = custom.querySelector('.label');
        label.textContent = li.textContent || '中文';
        applyLanguage(v);
        closeMenu();
      }
    });
    // 键盘交互：Enter/Space 打开或选中；↑↓导航；Esc 关闭
    custom.addEventListener('keydown', (e) => {
      const key = e.key;
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
        if (!custom.classList.contains('open')) openMenu();
        const cur = getActiveIndex();
        setActiveIndex((key === 'ArrowDown' ? cur + 1 : cur - 1));
      } else if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        if (!custom.classList.contains('open')) {
          openMenu();
        } else {
          const items = getItems();
          const idx = getActiveIndex();
          const sel = items[idx] || items[0];
          if (sel) {
            const v = sel.dataset.value || 'zh';
            const label = custom.querySelector('.label');
            label.textContent = sel.textContent || '中文';
            applyLanguage(v);
          }
          closeMenu();
        }
      } else if (key === 'Escape') {
        closeMenu();
      }
    });
    document.addEventListener('click', (e) => {
      if (!custom.contains(e.target)) {
        closeMenu();
      }
    });
    // 滚动/窗口变化时收起，避免错位渲染
    window.addEventListener('scroll', closeMenu, { passive: true });
    window.addEventListener('resize', closeMenu);
  }
  applyLanguage(saved);
}

function updateTableHeaders(lang) {
  const conf = I18N_TEXT[lang] || I18N_TEXT.zh;
  const map = conf.headers;
  const keys = ['rank','model_name','rating','tier','rating_deviation','volatility','battles','wins','ties','skips','win_rate_percentage'];
  keys.forEach((k) => {
    const th = document.querySelector(`th.sortable[data-key="${k}"]`);
    if (th) {
      const label = th.querySelector('.th-label');
      if (label) label.textContent = map[k];
    }
  });
}

function applyResponsiveLabels(lang) {
  const conf = I18N_TEXT[lang] || I18N_TEXT.zh;
  const map = conf.headers;
  const keys = ['rank','model_name','rating','tier','rating_deviation','volatility','battles','wins','ties','skips','win_rate_percentage'];
  const tbody = document.getElementById('leaderboardBody');
  if (!tbody) return;
  // Only auto-assign labels for desktop table. Mobile uses explicit labels per cell.
  const isMobile = window.matchMedia(`(max-width: ${BREAKPOINT_TABLE}px)`).matches;
  if (isMobile) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(tr => {
    const tds = tr.querySelectorAll('td');
    tds.forEach((td, idx) => {
      const key = keys[idx];
      if (key && map[key]) td.setAttribute('data-label', map[key]);
    });
  });
}

// ---- Tooltip helpers for realtime vs non-realtime metrics ----
function formatNumberCompact(value, opts) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') {
    if (opts && opts.fixed != null) return value.toFixed(opts.fixed);
    return String(value);
  }
  return String(value);
}

function createHoverTip(labelKey, baseValue, realtimeValue, options) {
  const lang = getLang();
  const T = I18N_TEXT[lang] || I18N_TEXT.zh;
  const TT = T.tooltip;
  const labelText = (TT.labels && TT.labels[labelKey]) || labelKey;
  const colon = lang === 'en' ? ': ' : '：';

  const baseStr = formatNumberCompact(baseValue, options && options.format);
  const rtStr = (realtimeValue === undefined || realtimeValue === null)
    ? ''
    : formatNumberCompact(realtimeValue, options && options.format);

  // On mobile, avoid rendering hover bubbles; show plain text only
  let isMobileScreen = false;
  try { isMobileScreen = window.matchMedia(`(max-width: ${BREAKPOINT_TABLE}px)`).matches; } catch (_) {}

  // If no realtime provided, render plain text with base; on mobile prefer realtime text
  if (!rtStr || isMobileScreen) {
    const span = document.createElement('span');
    span.textContent = rtStr || baseStr;
    return span;
  }

  const root = document.createElement('span');
  root.className = 'hover-tip' + ((options && options.small) ? ' small' : '');

  const text = document.createElement('span');
  // Display realtime value in cell when available; fallback to base
  text.textContent = rtStr || baseStr;
  root.appendChild(text);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const line1 = document.createElement('div');
  const nrPrefix = (TT.nonRealtime || '') + (TT.nonRealtime ? ' ' : '');
  line1.textContent = `${nrPrefix}${labelText}${colon}${baseStr}`;
  const line2 = document.createElement('div');
  // Prefix "Realtime" in current language
  const rtPrefix = TT.realtime;
  line2.textContent = `${rtPrefix}${labelText ? ' ' + labelText : ''}${colon}${rtStr}`;
  bubble.appendChild(line1);
  bubble.appendChild(line2);
  root.appendChild(bubble);

  // Do not set native title to avoid duplicate white tooltip
  return root;
}

function buildRatingCellContent(item, opts) {
  const lang = getLang();
  const T = I18N_TEXT[lang] || I18N_TEXT.zh;
  const TT = T.tooltip;

  const container = document.createElement('div');
  container.className = 'rating-cell';

  // Main rating
  const main = document.createElement('div');
  main.className = 'main';
  const ratingEl = createHoverTip('rating', item.rating ?? item.score ?? '', item.rating_realtime);
  main.appendChild(ratingEl);
  container.appendChild(main);

  // Sub metrics: RD and volatility (if present)
  const includeSub = !!(opts && opts.includeSub);
  const hasRD = includeSub && (item.rating_deviation != null || item.rating_deviation_realtime != null);
  const hasVol = includeSub && (item.volatility != null || item.volatility_realtime != null);
  if (includeSub && (hasRD || hasVol)) {
    const sub = document.createElement('div');
    sub.className = 'rating-sub';
    if (hasRD) {
      const rdVal = item.rating_deviation;
      const rdRt = item.rating_deviation_realtime;
      const rdWrap = document.createElement('span');
      const rdLabel = TT.rdShort || 'RD';
      const rdTip = createHoverTip('rating_deviation', rdVal, rdRt, { small: true });
      // prepend short label
      const rdPrefix = document.createElement('span'); rdPrefix.className = 'sub-prefix'; rdPrefix.textContent = rdLabel + ' ';
      const rdGroup = document.createElement('span');
      rdGroup.appendChild(rdPrefix);
      rdGroup.appendChild(rdTip);
      sub.appendChild(rdGroup);
    }
    if (hasVol) {
      const volVal = item.volatility;
      const volRt = item.volatility_realtime;
      const volWrap = document.createElement('span');
      const volLabel = TT.volShort || 'σ';
      const volTip = createHoverTip('volatility', formatNumberCompact(volVal, { fixed: 2 }),
        (volRt != null ? formatNumberCompact(volRt, { fixed: 2 }) : null), { small: true, format: { fixed: 2 } });
      const volPrefix = document.createElement('span'); volPrefix.className = 'sub-prefix'; volPrefix.textContent = volLabel + ' ';
      const volGroup = document.createElement('span');
      volGroup.appendChild(volPrefix);
      volGroup.appendChild(volTip);
      // separator if both exist
      if (hasRD) {
        const sep = document.createElement('span'); sep.className = 'sub-sep'; sep.textContent = '·'; sub.appendChild(sep);
      }
      sub.appendChild(volGroup);
    }
    container.appendChild(sub);
  }

  return container;
}

function createDeltaArrow(delta) {
  if (delta == null || Number.isNaN(Number(delta)) || Number(delta) === 0) return null;
  const up = Number(delta) > 0;
  const span = document.createElement('span');
  span.className = 'delta-arrow ' + (up ? 'up' : 'down');
  span.textContent = up ? '▲' : '▼';
  span.setAttribute('aria-hidden', 'true');
  return span;
}

function getComparableRating(item) {
  const v = (item && (item.rating_realtime ?? item.rating ?? item.score));
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getComparableWinRate(item) {
  const v = (item && item.win_rate_percentage);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildPrevMap(prevEntries) {
  const map = Object.create(null);
  if (!Array.isArray(prevEntries)) return map;
  for (const p of prevEntries) {
    const key = (p.model_name || p.name || '').toLowerCase();
    if (!key) continue;
    map[key] = p;
  }
  return map;
}

// Build only the sub-metrics (RD and Volatility) snippet for mobile second line
function buildRatingSubContent(item) {
  const lang = getLang();
  const T = I18N_TEXT[lang] || I18N_TEXT.zh;
  const TT = T.tooltip;

  const hasRD = (item.rating_deviation != null || item.rating_deviation_realtime != null);
  const hasVol = (item.volatility != null || item.volatility_realtime != null);
  if (!hasRD && !hasVol) return null;

  const sub = document.createElement('div');
  sub.className = 'rating-sub';

  if (hasRD) {
    const rdVal = item.rating_deviation;
    const rdRt = item.rating_deviation_realtime;
    const rdLabel = TT.rdShort || 'RD';
    const rdTip = createHoverTip('rating_deviation', rdVal, rdRt, { small: true });
    const rdPrefix = document.createElement('span'); rdPrefix.className = 'sub-prefix'; rdPrefix.textContent = rdLabel + ' ';
    const rdGroup = document.createElement('span');
    rdGroup.appendChild(rdPrefix);
    rdGroup.appendChild(rdTip);
    sub.appendChild(rdGroup);
  }
  if (hasVol) {
    const volVal = item.volatility;
    const volRt = item.volatility_realtime;
    const volLabel = TT.volShort || 'σ';
    const volTip = createHoverTip('volatility', formatNumberCompact(volVal, { fixed: 2 }),
      (volRt != null ? formatNumberCompact(volRt, { fixed: 2 }) : null), { small: true, format: { fixed: 2 } });
    const volPrefix = document.createElement('span'); volPrefix.className = 'sub-prefix'; volPrefix.textContent = volLabel + ' ';
    const volGroup = document.createElement('span');
    volGroup.appendChild(volPrefix);
    volGroup.appendChild(volTip);
    if (hasRD) { const sep = document.createElement('span'); sep.className = 'sub-sep'; sep.textContent = '·'; sub.appendChild(sep); }
    sub.appendChild(volGroup);
  }
  return sub;
}

function renderTable(rows, state) {
  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = '';

  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 11;
    td.className = 'muted center';
    const lang = getLang();
    td.textContent = (I18N_TEXT[lang] || I18N_TEXT.zh).noData;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  const lang = getLang();
  const conf = I18N_TEXT[lang] || I18N_TEXT.zh;
  const map = conf.headers;
  const isMobile = window.matchMedia(`(max-width: ${BREAKPOINT_TABLE}px)`).matches;
  const displayKey = (state && state.sortKey && state.sortKey !== 'rank') ? state.sortKey : 'rating';
  const prevMap = (state && state.prevMap) || {};
  for (const item of rows) {
    const tr = document.createElement('tr');

    const prev = prevMap[(item.model_name || item.name || '').toLowerCase()];
    const prevRank = prev && prev.rank != null ? Number(prev.rank) : null;
    const curRank = item && item.rank != null ? Number(item.rank) : null;
    const rankDelta = (prevRank != null && curRank != null) ? (curRank - prevRank) : null;
    const prevRating = getComparableRating(prev);
    const curRating = getComparableRating(item);
    const ratingDelta = (prevRating != null && curRating != null) ? (curRating - prevRating) : null;
    const prevWR = getComparableWinRate(prev);
    const curWR = getComparableWinRate(item);
    const wrDelta = (prevWR != null && curWR != null) ? (curWR - prevWR) : null;

    const tdRank = document.createElement('td');
    tdRank.textContent = item.rank ?? '';
    tdRank.className = 'cell-rank';
    tdRank.setAttribute('data-label', map.rank);
    {
      const arrow = createDeltaArrow(rankDelta != null ? -rankDelta : null);
      if (arrow) tdRank.appendChild(arrow);
    }
    tr.appendChild(tdRank);

    const tdName = document.createElement('td');
    tdName.textContent = item.model_name ?? item.name ?? '';
    tdName.className = 'cell-name';
    tdName.setAttribute('data-label', map.model_name);
    tr.appendChild(tdName);

    if (!isMobile) {
      // Desktop: always render fixed 7 columns to match headers
      const tdRating = document.createElement('td');
      const ratingNode = buildRatingCellContent(item, { includeSub: false });
      // append arrow to rating main
      const main = ratingNode && ratingNode.querySelector && ratingNode.querySelector('.main');
      if (main) {
        const arrow = createDeltaArrow(ratingDelta);
        if (arrow) main.appendChild(arrow);
      }
      tdRating.appendChild(ratingNode);
      tr.appendChild(tdRating);

      const tdTier = document.createElement('td');
      tdTier.textContent = item.tier ?? '';
      tr.appendChild(tdTier);

      const tdRD = document.createElement('td');
      tdRD.className = 'cell-rd sub-col slim';
      tdRD.appendChild(createHoverTip('rating_deviation', item.rating_deviation ?? '', item.rating_deviation_realtime));
      tr.appendChild(tdRD);

      const tdVol = document.createElement('td');
      tdVol.className = 'cell-vol sub-col slim';
      tdVol.appendChild(createHoverTip('volatility', item.volatility != null ? Number(item.volatility) : '', item.volatility_realtime != null ? Number(item.volatility_realtime) : null, { format: { fixed: 2 } }));
      tr.appendChild(tdVol);

      const tdBattles = document.createElement('td');
      tdBattles.className = 'cell-battles sub-col';
      tdBattles.textContent = item.battles ?? '';
      tr.appendChild(tdBattles);

      const tdWins = document.createElement('td');
      tdWins.className = 'cell-wins sub-col';
      tdWins.textContent = item.wins ?? '';
      tr.appendChild(tdWins);

      const tdTies = document.createElement('td');
      tdTies.className = 'cell-ties sub-col';
      tdTies.textContent = item.ties ?? '';
      tr.appendChild(tdTies);

      const tdSkips = document.createElement('td');
      tdSkips.className = 'cell-skips sub-col';
      tdSkips.textContent = item.skips ?? '';
      tr.appendChild(tdSkips);

      const tdWinRate = document.createElement('td');
      tdWinRate.className = 'cell-winrate sub-col';
      const wr = item.win_rate_percentage;
      tdWinRate.textContent = (wr !== undefined && wr !== null) ? Number(wr).toFixed(2) : '';
      {
        const arrow = createDeltaArrow(wrDelta);
        if (arrow) tdWinRate.appendChild(arrow);
      }
      tr.appendChild(tdWinRate);
    } else {
      // Mobile: header shows Rating main on the first line; sub-metrics on a separate second line
      const tdRatingHeader = document.createElement('td');
      tdRatingHeader.className = 'cell-elo';
      tdRatingHeader.setAttribute('data-label', map.rating);
      const ratingNode = buildRatingCellContent(item, { includeSub: false });
      const main = ratingNode && ratingNode.querySelector && ratingNode.querySelector('.main');
      if (main) {
        const arrow = createDeltaArrow(ratingDelta);
        if (arrow) main.appendChild(arrow);
      }
      tdRatingHeader.appendChild(ratingNode);
      tr.appendChild(tdRatingHeader);

      const subNode = buildRatingSubContent(item);
      if (subNode) {
        const tdRatingSub = document.createElement('td');
        tdRatingSub.className = 'cell-elo-sub';
        tdRatingSub.appendChild(subNode);
        tr.appendChild(tdRatingSub);
      }

      // Optional secondary header metric for non-rating, non-RD, non-Volatility sorts
      if (displayKey !== 'rating' && displayKey !== 'rating_deviation' && displayKey !== 'volatility') {
        const tdMetric = document.createElement('td');
        let metricVal = '';
        if (displayKey === 'tier') {
          metricVal = item.tier ?? '';
          tdMetric.setAttribute('data-label', map.tier);
        } else if (displayKey === 'win_rate_percentage') {
          const wr2 = item.win_rate_percentage;
          metricVal = (wr2 !== undefined && wr2 !== null) ? Number(wr2).toFixed(2) : '';
          tdMetric.setAttribute('data-label', map.win_rate_percentage);
        } else if (displayKey === 'skips') {
          metricVal = item.skips ?? '';
          tdMetric.setAttribute('data-label', map.skips);
        } else if (displayKey === 'battles') {
          metricVal = item.battles ?? '';
          tdMetric.setAttribute('data-label', map.battles);
        } else if (displayKey === 'wins') {
          metricVal = item.wins ?? '';
          tdMetric.setAttribute('data-label', map.wins);
        } else if (displayKey === 'ties') {
          metricVal = item.ties ?? '';
          tdMetric.setAttribute('data-label', map.ties);
        } else {
          metricVal = item[displayKey] ?? '';
          tdMetric.setAttribute('data-label', map[displayKey] || '');
        }
        tdMetric.textContent = metricVal;
        tdMetric.className = 'cell-metric';
        tr.appendChild(tdMetric);
      }

      const tdBattles = document.createElement('td');
      tdBattles.textContent = item.battles ?? '';
      tdBattles.className = 'cell-battles detail-cell';
      tdBattles.setAttribute('data-label', map.battles);
      tr.appendChild(tdBattles);

      const tdWins = document.createElement('td');
      tdWins.textContent = item.wins ?? '';
      tdWins.className = 'cell-wins detail-cell';
      tdWins.setAttribute('data-label', map.wins);
      tr.appendChild(tdWins);

      const tdTies = document.createElement('td');
      tdTies.textContent = item.ties ?? '';
      tdTies.className = 'cell-ties detail-cell';
      tdTies.setAttribute('data-label', map.ties);
      tr.appendChild(tdTies);

      const tdSkips = document.createElement('td');
      tdSkips.textContent = item.skips ?? '';
      tdSkips.className = 'cell-skips detail-cell';
      tdSkips.setAttribute('data-label', map.skips);
      tr.appendChild(tdSkips);

      const tdWinRate = document.createElement('td');
      const wr = item.win_rate_percentage;
      tdWinRate.textContent = (wr !== undefined && wr !== null) ? Number(wr).toFixed(2) : '';
      tdWinRate.className = 'cell-winrate detail-cell';
      tdWinRate.setAttribute('data-label', map.win_rate_percentage);
      {
        const arrow = createDeltaArrow(wrDelta);
        if (arrow) tdWinRate.appendChild(arrow);
      }
      tr.appendChild(tdWinRate);

      if (displayKey !== 'tier') {
        const tdTierDetail = document.createElement('td');
        tdTierDetail.className = 'cell-tier detail-cell';
        tdTierDetail.setAttribute('data-label', map.tier);
        tdTierDetail.textContent = item.tier ?? '';
        tr.appendChild(tdTierDetail);
      }
      // RD/Volatility are shown under Rating on mobile; do not duplicate them in details

      tr.addEventListener('click', () => {
        if (window.matchMedia(`(max-width: ${BREAKPOINT_TABLE}px)`).matches) {
          tr.classList.toggle('expanded');
        }
      });
    }

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

  // mobile sort select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const key = sortSelect.value || 'rank';
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = key === 'rank' ? 'asc' : 'desc';
      }
      applyAndRender(state);
    });
  }
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
    // Prefer realtime fields for the three metrics
    if (key === 'rating') {
      return Number(r.rating_realtime ?? r.rating ?? r.score ?? 0);
    }
    if (key === 'rating_deviation') {
      return Number(r.rating_deviation_realtime ?? r.rating_deviation ?? 0);
    }
    if (key === 'volatility') {
      return Number(r.volatility_realtime ?? r.volatility ?? 0);
    }
    return Number(r[key] ?? 0) || 0;
  };
  rows.sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * factor;
    return (va - vb) * factor;
  });

  renderTable(rows, state);
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
  const countItems = [
    health.models_count != null ? { k: T.models, v: String(health.models_count) } : null,
    health.fixed_prompts_count != null ? { k: T.fixed_prompts, v: String(health.fixed_prompts_count) } : null,
    health.recorded_users_count != null ? { k: T.users, v: String(health.recorded_users_count) } : null,
    health.completed_battles_count != null ? { k: T.completed_battles, v: String(health.completed_battles_count) } : null,
  ].filter(Boolean);

  let root = document.getElementById('healthStatus');
  if (!root) {
    root = document.createElement('span');
    root.id = 'healthStatus';
    root.className = 'muted';
    root.style.marginLeft = '8px';
    footer.appendChild(root);
  }
  // rebuild structured content for better mobile layout
  root.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = `${emoji} ${(I18N_TEXT[lang] || I18N_TEXT.zh).health.prefix}：${ok ? T.ok : T.error}`;
  root.appendChild(label);
  if (countItems.length) {
    const ul = document.createElement('ul');
    ul.className = 'counts';
    const colon = (lang === 'en') ? ': ' : '：';
    countItems.forEach(item => {
      const li = document.createElement('li');
      const sk = document.createElement('span'); sk.className = 'k'; sk.textContent = item.k + colon;
      const sv = document.createElement('span'); sv.className = 'v'; sv.textContent = item.v;
      li.appendChild(sk);
      li.appendChild(sv);
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }
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

// 当跨越移动端/桌面端断点时自动刷新，避免残留移动端控件
function setupResponsiveReload() {
  try {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT_TABLE}px)`);
    const handler = (e) => {
      try { location.reload(); } catch (_) {}
    };
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
    } else if (typeof mql.addListener === 'function') {
      // 兼容旧浏览器
      mql.addListener(handler);
    }
  } catch (_) {}
}

(async function init() {
  const [data, health, prevData] = await Promise.all([fetchLeaderboard(), fetchHealth(), fetchPrevLeaderboard()]);
  const rows = Array.isArray(data.leaderboard)
    ? data.leaderboard
    : (Array.isArray(data.entries) ? data.entries.map(e => ({ rank: e.rank, model_name: e.name, rating: e.score })) : []);
  const prevRows = Array.isArray(prevData && prevData.leaderboard) ? prevData.leaderboard : [];
  const prevMap = buildPrevMap(prevRows);

  setupToggles();
  setupLanguage();
  setupResponsiveReload();

  const state = {
    rowsRaw: rows,
    query: '',
    sortKey: 'rank',
    sortDir: 'asc',
    prevMap,
  };
  window.__renderState = state;

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
  window.__prevMap = prevMap;

  renderHealth(health || {});
  updateTotalBattles(health || {}, rows);
  applyAndRender(state);
  // 依据当前语言刷新所有静态文案
  applyLanguage(getLang());
})();
