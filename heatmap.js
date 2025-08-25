async function fetchHeatmap() {
  const url = 'data/heatmap.json';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('加载热力图数据失败:', err);
    return { win_rate_matrix: {}, match_count_matrix: {} };
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

const I18N = {
  zh: {
    htmlLang: 'zh-CN',
    title: '对战热力图',
    subtitle: 'Win Rate & Matches Heatmap',
    back: '返回排行榜',
    rules: '规则说明',
    wrTitle: '胜率热力图(%)',
    mcTitle: '对战场次热力图',
    footer: '由 GitHub Actions 定时同步 · 开源部署于 GitHub Pages',
    themeToLight: '亮色模式',
    themeToDark: '暗色模式',
    themeTitle: '切换明暗主题',
    langTitle: '切换语言',
    tooltipNA: '未对战',
    health: {
      prefix: '后端状态',
      ok: '正常',
      error: '异常',
      models: '模型',
      fixed_prompts: '固定题',
      users: '用户',
      completed_battles: '完成对战'
    }
  },
  en: {
    htmlLang: 'en',
    title: 'Battle Heatmap',
    subtitle: 'Win Rate & Matches Heatmap',
    back: 'Back to leaderboard',
    rules: 'Rules',
    wrTitle: 'Win Rate Heatmap (%)',
    mcTitle: 'Match Count Heatmap',
    footer: 'Synced by GitHub Actions · Deployed on GitHub Pages',
    themeToLight: 'Light Mode',
    themeToDark: 'Dark Mode',
    themeTitle: 'Toggle theme',
    langTitle: 'Change language',
    tooltipNA: 'No matches',
    health: {
      prefix: 'Backend',
      ok: 'OK',
      error: 'Error',
      models: 'Models',
      fixed_prompts: 'Fixed Prompts',
      users: 'Users',
      completed_battles: 'Completed'
    }
  },
  ja: {
    htmlLang: 'ja',
    title: '対戦ヒートマップ',
    subtitle: '勝率と対戦数のヒートマップ',
    back: 'ランキングへ戻る',
    rules: 'ルール',
    wrTitle: '勝率ヒートマップ(%)',
    mcTitle: '対戦数ヒートマップ',
    footer: 'GitHub Actions により同期 · GitHub Pages にデプロイ',
    themeToLight: 'ライトモード',
    themeToDark: 'ダークモード',
    themeTitle: 'テーマを切り替え',
    langTitle: '言語を切り替え',
    tooltipNA: '対戦なし',
    health: {
      prefix: 'バックエンド',
      ok: '正常',
      error: '異常',
      models: 'モデル',
      fixed_prompts: '固定課題',
      users: 'ユーザー',
      completed_battles: '完了対戦'
    }
  }
};

function getLang() {
  try { return localStorage.getItem('lang') || 'zh'; } catch (_) { return 'zh'; }
}

function applyLanguage(lang) {
  const T = I18N[lang] || I18N.zh;
  try { document.documentElement.lang = T.htmlLang; } catch (_) {}
  try { localStorage.setItem('lang', lang); } catch (_) {}

  const title = document.getElementById('pageTitle');
  const subtitle = document.getElementById('pageSubtitle');
  const back = document.getElementById('backLink');
  const rules = document.getElementById('rulesLink');
  const wrTitle = document.getElementById('wrTitle');
  const mcTitle = document.getElementById('mcTitle');
  const footer = document.getElementById('footerText');
  const sel = document.getElementById('langSelect');
  const themeBtn = document.getElementById('themeToggle');

  if (title) title.textContent = T.title;
  if (subtitle) subtitle.textContent = T.subtitle;
  if (back) back.textContent = T.back;
  if (rules) rules.textContent = T.rules;
  if (wrTitle) wrTitle.textContent = T.wrTitle;
  if (mcTitle) mcTitle.textContent = T.mcTitle;
  if (footer) footer.textContent = T.footer;
  if (sel) sel.title = T.langTitle;
  if (themeBtn) themeBtn.title = T.themeTitle;

  // re-render health with current language
  try { renderHealth(window.__lastHealth || {}); } catch (_) {}

  try { applyTheme(localStorage.getItem('theme') || 'light'); } catch (_) {}
}

function setupLanguage() {
  const sel = document.getElementById('langSelect');
  const saved = getLang();
  if (sel) {
    sel.value = saved;
    sel.addEventListener('change', (e) => {
      const next = e.target && e.target.value ? String(e.target.value) : 'zh';
      applyLanguage(next);
      try { window.__renderAll && window.__renderAll(); } catch (_) {}
    });
  }
  applyLanguage(saved);
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
    const T = I18N[lang] || I18N.zh;
    btn.textContent = isDark ? T.themeToLight : T.themeToDark;
    btn.classList.remove('light-target', 'dark-target');
    btn.classList.add(isDark ? 'light-target' : 'dark-target');
  }
}

function setupThemeToggle() {
  const themeBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  themeBtn.addEventListener('click', () => {
    const next = (localStorage.getItem('theme') || 'light') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { window.__renderAll && window.__renderAll(); } catch (_) {}
  });
}

function getUIColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    text: cs.getPropertyValue('--text')?.trim() || '#1f2328',
    muted: cs.getPropertyValue('--muted')?.trim() || '#6b6f76',
    border: cs.getPropertyValue('--border')?.trim() || '#e8d9a8',
  };
}

function unionModels(matrix) {
  const set = new Set();
  const rows = Object.keys(matrix || {});
  rows.forEach(r => {
    set.add(r);
    const cols = matrix[r] || {};
    Object.keys(cols).forEach(c => set.add(c));
  });
  return Array.from(set);
}

function matrixToSeriesData(models, matrix, transform) {
  const data = [];
  for (let i = 0; i < models.length; i++) {
    const rName = models[i];
    const row = matrix[rName] || {};
    for (let j = 0; j < models.length; j++) {
      const cName = models[j];
      let v = row[cName];
      if (typeof transform === 'function') v = transform(v);
      data.push([j, i, v]);
    }
  }
  return data;
}

function buildHeatmapOption({ title, models, data, min, max, colors, formatter, grid }) {
  const ui = getUIColors();
  const isMobile = window.matchMedia('(max-width: 480px)').matches;
  return {
    textStyle: { color: ui.text },
    tooltip: {
      position: 'top',
      formatter,
      renderMode: 'html',
      confine: true,
      appendToBody: true,
      backgroundColor: 'rgba(0,0,0,0.78)',
      borderWidth: 0,
      textStyle: { color: '#fff' }
    },
    grid: Object.assign({ containLabel: false }, grid || {}),
    xAxis: {
      type: 'category',
      data: models,
      splitArea: { show: true },
      axisLabel: { interval: 0, rotate: isMobile ? 60 : 45, color: ui.muted, fontSize: isMobile ? 10 : 11, margin: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: models,
      splitArea: { show: true },
      axisLabel: { color: ui.muted, fontSize: isMobile ? 10 : 11, margin: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    visualMap: {
      min, max,
      calculable: true,
      orient: 'vertical',
      right: 8,
      top: 'middle',
      inRange: { color: colors },
      textStyle: { color: ui.text }
    },
    series: [{
      name: title,
      type: 'heatmap',
      data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.35)' } },
      progressive: 0
    }]
  };
}

function getMaxValue(data) {
  let max = 0;
  for (const item of data) {
    const v = item[2];
    if (typeof v === 'number') max = Math.max(max, v);
  }
  return max || 1;
}

function estimateTextWidth(text, fontSize) {
  // rough estimate: average 0.55em per char in Inter; CJK wider ~0.95
  const isCJK = /[\u4e00-\u9fff\u3040-\u30ff\uff00-\uffef]/.test(text);
  const per = isCJK ? 0.95 : 0.55;
  return Math.max(8, Math.ceil(text.length * per * fontSize));
}

function computeLayoutFor(el, models, maxLabelRightText) {
  const isMobile = window.matchMedia('(max-width: 480px)').matches;
  const font = isMobile ? 10 : 11;
  const angle = isMobile ? Math.PI * 60/180 : Math.PI * 45/180;
  const longestY = models.reduce((m, s) => Math.max(m, estimateTextWidth(s, font)), 0);
  const longestX = models.reduce((m, s) => Math.max(m, estimateTextWidth(s, font)), 0);
  const leftMin = Math.min(220, Math.max(64, longestY + 14));
  const bottomNeeded = Math.ceil(longestX * Math.sin(angle)) + 18;
  const bottom = Math.min(160, Math.max(56, bottomNeeded));
  const rightLabel = String(maxLabelRightText || '').length || 3; // rough
  const right = Math.max(92, 14 + rightLabel * 8 + 22);
  const top = 24;
  const width = el.clientWidth || 600;
  // base grid width constrained by minimum left space and right visualMap space
  const gridWidth = Math.max(100, width - leftMin - right);
  // center horizontally while respecting minimum left space
  const leftCentered = Math.max(leftMin, Math.floor((width - right - gridWidth) / 2));
  const gridHeight = gridWidth; // enforce square
  const containerHeight = top + gridHeight + bottom;
  return {
    grid: { top, right, bottom, left: leftCentered, width: gridWidth, height: gridHeight, containLabel: false },
    height: containerHeight
  };
}

function renderHealth(health) {
  const footer = document.querySelector('.footer .container');
  if (!footer) return;
  const ok = !!health.ok && String(health.status || '').toLowerCase() === 'ok';
  const emoji = ok ? '🟢' : '🔴';
  const lang = getLang();
  const T = (I18N[lang] || I18N.zh).health;
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
  root.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = `${emoji} ${(I18N[lang] || I18N.zh).health.prefix}：${ok ? T.ok : T.error}`;
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

(async function init() {
  const [raw, health] = await Promise.all([fetchHeatmap(), fetchHealth()]);
  const WR = raw.win_rate_matrix || {};
  const MC = raw.match_count_matrix || {};

  window.__lastHealth = health || {};

  const models = Array.from(new Set([...unionModels(WR), ...unionModels(MC)])).sort();

  const lang = getLang();
  setupThemeToggle();
  setupLanguage();

  const wrData = matrixToSeriesData(models, WR, (v) => v == null ? null : Math.round(Number(v) * 100));
  const mcData = matrixToSeriesData(models, MC, (v) => v == null ? null : Number(v));

  const wrMax = 100;
  const mcMax = getMaxValue(mcData);

  const T = I18N[lang] || I18N.zh;

  const wrColors = ['#084081', '#0868ac', '#2b8cbe', '#7bccc4', '#a8ddb5', '#e0f3db', '#ffffbf'];
  const mcColors = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'];

  const elWR = document.getElementById('heatmapWinrate');
  const elMC = document.getElementById('heatmapMatches');
  const chartWR = echarts.init(elWR);
  const chartMC = echarts.init(elMC);

  // render footer health once loaded
  try { renderHealth(health || {}); } catch (_) {}

  function render() {
    const langNow = getLang();
    const TT = I18N[langNow] || I18N.zh;
    const naText = TT.tooltipNA;

    const elWRc = document.getElementById('heatmapWinrate');
    const elMCc = document.getElementById('heatmapMatches');

    const layoutWR = computeLayoutFor(elWRc, models, 100);
    const layoutMC = computeLayoutFor(elMCc, models, mcMax);

    if (elWRc && elWRc.style) elWRc.style.height = layoutWR.height + 'px';
    if (elMCc && elMCc.style) elMCc.style.height = layoutMC.height + 'px';

    chartWR.setOption(buildHeatmapOption({
      title: TT.wrTitle,
      models,
      data: wrData,
      min: 0,
      max: wrMax,
      colors: ['#0b3d91','#4f86c6','#a7c7e7','#f9f1dc','#f2c572','#e58e26','#c44536'],
      formatter: function (p) {
        const r = models[p.data[1]];
        const c = models[p.data[0]];
        const v = p.data[2];
        const count = (MC[r] && typeof MC[r][c] !== 'undefined') ? MC[r][c] : (MC[c] && MC[c][r] !== undefined ? MC[c][r] : null);
        const line1 = (v == null || isNaN(v)) ? `${r} × ${c}: ${naText}` : `${r} × ${c}: ${v}%`;
        const line2 = (count == null || isNaN(count)) ? '' : `${TT.mcTitle}: ${count}`;
        return line2 ? `${line1}<br/>${line2}` : line1;
      },
      grid: layoutWR.grid
    }));

    chartMC.setOption(buildHeatmapOption({
      title: TT.mcTitle,
      models,
      data: mcData,
      min: 0,
      max: mcMax,
      colors: ['#00429d','#4771b2','#7fb0d5','#f9f1dc','#f7b267','#f4845f','#dc2f02'],
      formatter: function (p) {
        const r = models[p.data[1]];
        const c = models[p.data[0]];
        const v = p.data[2];
        const wrRaw = (WR[r] && typeof WR[r][c] !== 'undefined') ? WR[r][c] : (WR[c] && WR[c][r] !== undefined ? WR[c][r] : null);
        const wrPct = (wrRaw == null || isNaN(wrRaw)) ? null : Math.round(wrRaw * 100);
        const line1 = (v == null || isNaN(v)) ? `${r} × ${c}: ${naText}` : `${r} × ${c}: ${v}`;
        const line2 = (wrPct == null) ? '' : `${TT.wrTitle}: ${wrPct}%`;
        return line2 ? `${line1}<br/>${line2}` : line1;
      },
      grid: layoutMC.grid
    }));
  }

  window.__renderAll = render;
  render();

  const ro = new ResizeObserver(() => {
    try {
      render();
      chartWR.resize();
      chartMC.resize();
    } catch (_) {}
  });
  try { ro.observe(document.getElementById('heatmapWinrate')); } catch (_) {}
  try { ro.observe(document.getElementById('heatmapMatches')); } catch (_) {}

  window.addEventListener('resize', () => {
    try {
      render();
      chartWR.resize();
      chartMC.resize();
    } catch (_) {}
  }, { passive: true });
})();
