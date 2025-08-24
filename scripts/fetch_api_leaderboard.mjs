import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = process.env.ARENA_API_BASE || '';
const API_TOKEN = process.env.ARENA_API_TOKEN || '';

if (!API_BASE) {
  console.error('Missing ARENA_API_BASE');
  process.exit(1);
}

async function fetchLeaderboard() {
  const url = `${API_BASE.replace(/\/$/, '')}/leaderboard`;
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
  const payload = await fetchLeaderboard();
  const normalized = {
    updatedAt: new Date().toISOString(),
    leaderboard: Array.isArray(payload.leaderboard) ? payload.leaderboard : [],
  };
  const outPath = path.join(process.cwd(), 'data', 'leaderboard.json');
  await fs.writeFile(outPath, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`写入 ${outPath}，条目数：${normalized.leaderboard.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(2);
});
