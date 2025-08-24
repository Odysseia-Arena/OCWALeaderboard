# Discord Leaderboard 到 GitHub Pages

一个静态页面，自动同步 Discord 指定频道里机器人发布的排行榜到 `data/leaderboard.json` 并展示。

## 工作原理
- GitHub Actions 定时调用脚本 `scripts/fetch_discord_leaderboard.mjs`
- 脚本通过 Discord API 读取频道最近的消息，找到由指定机器人发布的排行榜消息，解析为 JSON
- 若解析成功，将覆盖写入 `data/leaderboard.json` 并提交到仓库，从而触发 GitHub Pages 更新

> 说明：无法直接“调用另一个机器人的 /leaderboard 命令”。该脚本是“读取频道中已发布的排行榜消息”。若你的机器人会把 /leaderboard 的结果发到一个固定频道，则可用本方案同步。

## 启动步骤（一次性）
1. 在仓库 Settings → Pages 中，将 GitHub Pages 指向 `main` 分支根目录
2. 在仓库 Settings → Secrets and variables → Actions 新建下列 Secrets：
   - `DISCORD_BOT_TOKEN`：一个你自己的 Discord 机器人 Token（需进到目标服务器，具备 `View Channel` 与 `Read Message History` 权限）
   - `DISCORD_CHANNEL_ID`：排行榜所在频道 ID
   - `LEADERBOARD_BOT_USER_ID`：发布排行榜的机器人用户 ID（可选，但强烈建议）
   - `MESSAGE_MATCH_REGEX`：用于匹配排行榜消息的正则（可选，默认包含 `leaderboard|排行|榜`）
3. 确保该机器人已被邀请进服务器且能看到目标频道

## 本地预览
直接用任意静态服务器预览（或 VS Code Live Server）：
```bash
npx serve .
```
页面会从 `data/leaderboard.json` 读取数据进行渲染。

## 数据格式
`data/leaderboard.json`
```json
{
  "updatedAt": "ISO 时间",
  "sourceMessageId": "消息 ID",
  "entries": [
    { "rank": 1, "name": "Alice", "score": 2560 }
  ]
}
```

## 调整解析规则
不同机器人输出格式不一。脚本默认尝试以下几种：
- 嵌入(Embed)字段与描述中的条目
- 文本内容中形如 `1) Name - 1234` 或 `#1 Name 1234` 的行

若解析失败，请在 `scripts/fetch_discord_leaderboard.mjs` 中按注释调整正则。

## 触发更新
- 自动：每小时定时运行
- 手动：在 Actions 里使用 `Run workflow`

## 免责声明
请遵守 Discord 开发者与服务器规则。脚本仅以 **Bot Token** 调用官方 API 读取消息，不使用用户账号，不模拟客户端行为。

## 部署到 GitHub Pages
1. 打开仓库 Settings → Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main` 与根目录 `/`
4. 保存后几分钟即可通过 Pages URL 访问页面

## 故障排查
- Actions 报错 `Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID`：检查 Secrets 是否配置
- 能找到消息但 `解析不到条目`：请在 `scripts/fetch_discord_leaderboard.mjs` 中调整解析正则或打印抓到的原始文本进行对照
- 页面显示“暂无数据”：确认 `data/leaderboard.json` 是否被成功更新提交
- 机器人权限：确保有 `View Channel` 和 `Read Message History`

## 安全建议
- 仅把 Token 配置在 GitHub Secrets，不要提交到仓库
- 如果服务器有多机器人，建议设置 `LEADERBOARD_BOT_USER_ID` 限定消息来源

## 使用外部 API (GET /leaderboard)
若你已有 HTTP 端点可直接返回如下结构：
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "model_name": "gpt-4.1",
      "rating": 1250,
      "battles": 15,
      "wins": 10,
      "ties": 3,
      "win_rate_percentage": 75.0
    }
  ]
}
```
可通过 Secrets 启用 API 方式：
- `ARENA_API_BASE`：你的 API 根地址（例如 `https://api.example.com`），脚本将请求 `GET {ARENA_API_BASE}/leaderboard`
- `ARENA_API_TOKEN`（可选）：若需要鉴权，作为 `Authorization: Bearer <token>`

Actions 会优先使用 API（若 `ARENA_API_BASE` 非空），否则回退到 Discord 频道消息解析。
