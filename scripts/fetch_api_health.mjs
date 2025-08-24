import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = process.env.ARENA_API_BASE || '';
const API_TOKEN = process.env.ARENA_API_TOKEN || '';

if (!API_BASE) {
  console.error('Missing ARENA_API_BASE');
  process.exit(1);
}

async function fetchHealth() {
  const url = `${API_BASE.replace(/\/$/, '')}/health`;
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
  try {
    const payload = await fetchHealth();
    const normalized = {
      updatedAt: new Date().toISOString(),
      ok: String(payload.status || '').toLowerCase() === 'ok',
      status: payload.status || 'unknown',
      models_count: payload.models_count ?? null,
      fixed_prompts_count: payload.fixed_prompts_count ?? null,
      recorded_users_count: payload.recorded_users_count ?? null,
      completed_battles_count: payload.completed_battles_count ?? null,
    };
    const outPath = path.join(process.cwd(), 'data', 'health.json');
    await fs.writeFile(outPath, JSON.stringify(normalized, null, 2), 'utf8');
    console.log(`写入 ${outPath}`);
  } catch (err) {
    const fallback = {
      updatedAt: new Date().toISOString(),
      ok: false,
      status: 'error',
      error: String(err),
    };
    const outPath = path.join(process.cwd(), 'data', 'health.json');
    await fs.writeFile(outPath, JSON.stringify(fallback, null, 2), 'utf8');
    console.error('健康检查失败，已写入错误状态:', err);
    process.exitCode = 3;
  }
}

main();
