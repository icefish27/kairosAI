// scripts/crawl-ai-bot.mjs
// 爬取 ai-bot.cn/daily-ai-news 的时间线条目，生成 docs/daily/*.md（type:link 引用快讯）
// 去重：读 docs/daily/ 已有 sourceUrl，命中即跳过（无新不产）
//
// 运行：node scripts/crawl-ai-bot.mjs
// 定时：见 .github/workflows/crawl.yml（cron 每天 UTC 0:00 ≈ 北京 08:00）
//
// 注意：这是骨架，parseEntries 用简单正则提取 h2>a 链接。
// ai-bot.cn 若改版结构，需调整 parseEntries 的正则；摘要/来源字段可后续增强（L2 爬原文补全）。
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DAILY_DIR = path.resolve(ROOT, 'docs/daily')
const SOURCE_URL = 'https://ai-bot.cn/daily-ai-news/'

// 读取已发布 sourceUrl 集合，用于去重
function existingSourceUrls() {
  if (!fs.existsSync(DAILY_DIR)) return new Set()
  const set = new Set()
  for (const f of fs.readdirSync(DAILY_DIR).filter((f) => f.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(DAILY_DIR, f), 'utf-8')
    const m = text.match(/sourceUrl:\s*'?([^\s'']+)/)
    if (m) set.add(m[1])
  }
  return set
}

function slugify(title) {
  return (title || 'daily')
    .slice(0, 24)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

// 从 HTML 提取条目：ai-bot 条目形如 <h2><a href="mp.weixin.qq.com/s/...">标题</a></h2> + 摘要 + 来源：xxx
function parseEntries(html) {
  const entries = []
  const titleRe = /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g
  let m
  while ((m = titleRe.exec(html))) {
    const url = m[1]
    const title = m[2].replace(/<[^>]+>/g, '').trim()
    if (!url.startsWith('http')) continue
    entries.push({ title, sourceUrl: url, summary: '', source: '' })
  }
  return entries
}

async function main() {
  const exist = existingSourceUrls()
  console.log(`[crawl] 已发布 sourceUrl: ${exist.size} 条`)

  const res = await fetch(SOURCE_URL, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; kairosAI-bot/1.0)' }
  })
  if (!res.ok) throw new Error(`fetch ${SOURCE_URL} -> ${res.status}`)
  const html = await res.text()
  const entries = parseEntries(html)
  console.log(`[crawl] 抓取到 ${entries.length} 条`)

  const today = new Date().toISOString().slice(0, 10)
  let added = 0
  for (const e of entries) {
    if (exist.has(e.sourceUrl)) continue
    const slug = slugify(e.title) || 'daily'
    const file = path.join(DAILY_DIR, `${today}-${slug}.md`)
    const fm = [
      '---',
      `title: ${JSON.stringify(e.title)}`,
      `date: ${today}`,
      `summary: ''`,
      `tags: []`,
      `category: 资讯`,
      `type: link`,
      `source: ''`,
      `sourceUrl: ${e.sourceUrl}`,
      `layout: link`,
      `draft: false`,
      '---',
      '',
      '<!-- more -->',
      '',
      e.title,
      ''
    ].join('\n')
    fs.writeFileSync(file, fm)
    added++
    console.log(`[crawl]   + ${e.title}`)
  }
  console.log(`[crawl] 新增 ${added} 条`)
  if (added === 0) console.log('[crawl] 无新内容，不产出')
}

main().catch((e) => {
  console.error('[crawl] failed:', e)
  process.exit(1)
})
