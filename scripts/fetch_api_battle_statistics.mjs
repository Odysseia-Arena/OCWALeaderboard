import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = process.env.ARENA_API_BASE || '';
const API_TOKEN = process.env.ARENA_API_TOKEN || '';

if (!API_BASE) {
  console.error('Missing ARENA_API_BASE');
  process.exit(1);
}

async function fetchBattleStatistics() {
  const url = `${API_BASE.replace(/\/$/, '')}/api/battle_statistics`;
  const headers = {};
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API ${res.status}: ${t}`);
  }
  return res.json();
}

async function main() {
  const payload = await fetchBattleStatistics();
  // 直接落盘为 heatmap.json，保留时间戳
  const normalized = {
    updatedAt: new Date().toISOString(),
    win_rate_matrix: payload.win_rate_matrix || {},
    match_count_matrix: payload.match_count_matrix || {},
  };
  const outPath = path.join(process.cwd(), 'data', 'heatmap.json');
  await fs.writeFile(outPath, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`写入 ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(2);
});


