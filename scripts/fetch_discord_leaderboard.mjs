import fs from 'node:fs/promises';
import path from 'node:path';

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const BOT_USER_ID = process.env.LEADERBOARD_BOT_USER_ID || null;
const MESSAGE_MATCH_REGEX = process.env.MESSAGE_MATCH_REGEX || '(leaderboard|排行|榜)';

if (!DISCORD_TOKEN || !CHANNEL_ID) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID');
  process.exit(1);
}

const API = 'https://discord.com/api/v10';

async function fetchLatestMessages(limit = 50) {
  const res = await fetch(`${API}/channels/${CHANNEL_ID}/messages?limit=${limit}`, {
    headers: {
      'Authorization': `Bot ${DISCORD_TOKEN}`,
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Discord API error ${res.status}: ${t}`);
  }
  return res.json();
}

function candidateScoreLinesFromContent(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return lines;
}

function parseEntriesFromLines(lines) {
  const entries = [];
  const patterns = [
    /^(?:#|\b)?(\d{1,3})[).\-\s]+(.+?)\s+[-–—]?\s*(\d{1,9})(?:\b|$)/i,
    /^(\d{1,3})\s+(.+?)\s+(\d{1,9})(?:\b|$)/i,
  ];
  for (const line of lines) {
    for (const re of patterns) {
      const m = line.match(re);
      if (m) {
        const rank = Number(m[1]);
        const name = String(m[2]).replace(/[-–—]|\s+$/g, '').trim();
        const score = Number(m[3]);
        if (!Number.isNaN(rank) && !Number.isNaN(score) && name) {
          entries.push({ rank, name, score });
        }
        break;
      }
    }
  }
  // 去重并按 rank 排序
  const unique = new Map();
  for (const e of entries) {
    const key = `${e.rank}-${e.name.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, e);
  }
  return Array.from(unique.values()).sort((a, b) => a.rank - b.rank);
}

function parseFromEmbeds(embeds = []) {
  let allLines = [];
  for (const emb of embeds) {
    if (emb.title) allLines.push(emb.title);
    if (emb.description) allLines.push(...candidateScoreLinesFromContent(emb.description));
    if (Array.isArray(emb.fields)) {
      for (const f of emb.fields) {
        if (f?.name) allLines.push(f.name);
        if (f?.value) allLines.push(...candidateScoreLinesFromContent(f.value));
      }
    }
  }
  const entries = parseEntriesFromLines(allLines);
  return entries;
}

function looksLikeLeaderboard(message) {
  const re = new RegExp(MESSAGE_MATCH_REGEX, 'i');
  if (!re.test(message.content || '')) {
    // 若正文不匹配，尝试看 embed 中的描述/标题
    const text = [
      ...(message.embeds || []).map(e => e.title || ''),
      ...(message.embeds || []).map(e => e.description || ''),
    ].join('\n');
    if (!re.test(text)) return false;
  }
  if (BOT_USER_ID && message.author?.id !== BOT_USER_ID) return false;
  return true;
}

function parseLeaderboardFromMessage(message) {
  // 先尝试 embeds
  const embedEntries = parseFromEmbeds(message.embeds || []);
  if (embedEntries.length > 0) return embedEntries;
  // 退化为解析纯文本
  const lines = candidateScoreLinesFromContent(message.content || '');
  return parseEntriesFromLines(lines);
}

async function main() {
  const messages = await fetchLatestMessages(100);
  const target = messages.find(m => looksLikeLeaderboard(m));
  if (!target) {
    console.error('未找到匹配的排行榜消息');
    process.exit(2);
  }
  const entries = parseLeaderboardFromMessage(target);
  if (entries.length === 0) {
    console.error('找到消息但解析不到条目，请调整解析正则');
    process.exit(3);
  }

  const out = {
    updatedAt: new Date().toISOString(),
    sourceMessageId: target.id,
    entries,
  };

  const dataDir = path.join(process.cwd(), 'data');
  const outPath = path.join(dataDir, 'leaderboard.json');
  const prevPath = path.join(dataDir, 'leaderboard_prev.json');

  // 先备份上一份（若存在）
  try {
    const prevContent = await fs.readFile(outPath, 'utf8');
    await fs.writeFile(prevPath, prevContent, 'utf8');
    console.log(`已备份上一份排行榜到 ${prevPath}`);
  } catch (_) {
    console.log('未发现上一份排行榜，跳过备份。');
  }

  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`已写入 ${outPath} 共 ${entries.length} 条`);
}

main().catch(err => {
  console.error(err);
  process.exit(10);
});
