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

function renderTable(rows) {
  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = '';

  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 7;
    td.className = 'muted center';
    td.textContent = '暂无数据';
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

function updateTotalBattles(rows) {
  const total = rows.reduce((sum, r) => sum + (Number(r.battles) || 0), 0);
  const el = document.getElementById('totalBattles');
  if (el) el.textContent = `总对战：${total}`;
}

function renderHealth(health) {
  const footer = document.querySelector('.footer .container');
  if (!footer) return;
  const ok = !!health.ok && String(health.status || '').toLowerCase() === 'ok';
  const emoji = ok ? '🟢' : '🔴';
  const counts = [
    health.models_count != null ? `模型:${health.models_count}` : null,
    health.fixed_prompts_count != null ? `固定题:${health.fixed_prompts_count}` : null,
    health.recorded_users_count != null ? `用户:${health.recorded_users_count}` : null,
    health.completed_battles_count != null ? `完成对战:${health.completed_battles_count}` : null,
  ].filter(Boolean).join(' · ');

  const span = document.createElement('span');
  span.className = 'muted';
  span.style.marginLeft = '8px';
  span.textContent = `${emoji} 后端状态：${ok ? '正常' : '异常'}${counts ? ' · ' + counts : ''}`;
  footer.appendChild(span);
}

(async function init() {
  const [data, health] = await Promise.all([fetchLeaderboard(), fetchHealth()]);
  const rows = Array.isArray(data.leaderboard)
    ? data.leaderboard
    : (Array.isArray(data.entries) ? data.entries.map(e => ({ rank: e.rank, model_name: e.name, rating: e.score })) : []);

  const state = {
    rowsRaw: rows,
    query: '',
    sortKey: 'rank',
    sortDir: 'asc',
  };

  setupSearch(state);
  setupSorting(state);
  updateTotalBattles(rows);

  const updated = document.getElementById('updatedAt');
  if (data.updatedAt) {
    const d = new Date(data.updatedAt);
    updated.textContent = `最后更新：${d.toLocaleString()}`;
  } else {
    updated.textContent = '最后更新：--';
  }

  renderHealth(health || {});
  applyAndRender(state);
})();
