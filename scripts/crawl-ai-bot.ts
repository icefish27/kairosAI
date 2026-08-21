// scripts/crawl-ai-bot.ts
// 爬取 ai-bot.cn/daily-ai-news 的时间线条目，生成 docs/daily/*.md（type:link 引用快讯）
// 去重：读 docs/daily/ 已有 sourceUrl，命中即跳过（无新不产）
//
// 运行：npm run crawl  或  npx tsx scripts/crawl-ai-bot.ts
// 定时：见 .github/workflows/crawl.yml（cron 每天 UTC 0:00 ≈ 北京 08:00）
//
// 注意：ai-bot.cn 若改版结构，需调整 parseEntries 的正则。

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ────────────────────────────────────────────
// 爬虫配置（修改数据源、输出路径等只需改这里）
// ────────────────────────────────────────────
const CRAWL_CONFIG = {
  /** 数据源 URL（AI-Bot 每日快讯聚合页） */
  sourceUrl: 'https://ai-bot.cn/daily-ai-news/',
  /** 爬虫 User-Agent 标识 */
  userAgent: 'Mozilla/5.0 (compatible; kairosAI-bot/1.0)',
  /** 快讯 Markdown 输出目录（相对项目根） */
  outputDir: 'docs/daily',
  /** 快讯默认分类 */
  defaultCategory: '资讯',
  /** 快讯默认类型（link = 仅引用原文跳转） */
  defaultType: 'link'
}

// ────────────────────────────────────────────
// 核心逻辑
// ────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DAILY_DIR = path.resolve(ROOT, CRAWL_CONFIG.outputDir)
const SOURCE_URL = CRAWL_CONFIG.sourceUrl

interface CrawlEntry {
  title: string
  sourceUrl: string
  summary: string
  source: string
  date: string
}

// 读取已发布 sourceUrl 集合，用于去重
function existingSourceUrls(): Set<string> {
  if (!fs.existsSync(DAILY_DIR)) return new Set()
  const set = new Set<string>()
  for (const f of fs.readdirSync(DAILY_DIR).filter((f) => f.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(DAILY_DIR, f), 'utf-8')
    const m = text.match(/sourceUrl:\s*'?([^\s']+)/)
    if (m) set.add(m[1])
  }
  return set
}

function slugify(title: string): string {
  return (title || 'daily')
    .slice(0, 24)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

// 将中文日期 "8月21·周五" 转换为 ISO 格式 "2026-08-21"
function parseChineseDate(raw: string): string {
  const m = raw.match(/(\d+)月(\d+)/)
  if (!m) return new Date().toISOString().slice(0, 10)
  const month = parseInt(m[1], 10)
  const day = parseInt(m[2], 10)
  const now = new Date()
  let year = now.getFullYear()
  if (month > now.getMonth() + 1) year--
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 解码常见 HTML 实体
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
}

// 从 HTML 提取条目
// HTML 结构：<div class="news-date">8月21·周五</div> 后跟多个 <div class="news-item">
// 每个 item 含 <h2><a href="...">标题</a></h2> + <p>摘要...<span>来源：xxx</span></p>
function parseEntries(html: string): CrawlEntry[] {
  const entries: CrawlEntry[] = []

  // 按日期分段
  const dateSectionRe = /<div class="news-date">([^<]+)<\/div>([\s\S]*?)(?=<div class="news-date"|<div class="news-list"|$)/g
  let ds: RegExpExecArray | null
  while ((ds = dateSectionRe.exec(html))) {
    const rawDate = ds[1].trim()
    const sectionHtml = ds[2]
    const date = parseChineseDate(rawDate)

    // 在当前日期段内提取所有条目
    const itemRe = /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>(?:[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>)?/g
    let m: RegExpExecArray | null
    while ((m = itemRe.exec(sectionHtml))) {
      const url = m[1]
      const title = decodeEntities(m[2].replace(/<[^>]+>/g, '').trim())
      if (!url.startsWith('http')) continue

      // 从 <p> 内容提取摘要和来源
      const pContent = m[3] || ''
      const sourceMatch = pContent.match(/来源[：:]\s*([^<\s]+)/)
      const source = sourceMatch ? decodeEntities(sourceMatch[1]) : ''
      const summary = decodeEntities(
        pContent
          .replace(/<span[^>]*>[^<]*<\/span>/g, '')
          .replace(/<[^>]+>/g, '')
          .trim()
      )

      entries.push({ title, sourceUrl: url, summary, source, date })
    }
  }
  return entries
}

async function main(): Promise<void> {
  const exist = existingSourceUrls()
  console.log(`[crawl] 已发布 sourceUrl: ${exist.size} 条`)

  const res = await fetch(SOURCE_URL, {
    headers: { 'user-agent': CRAWL_CONFIG.userAgent }
  })
  if (!res.ok) throw new Error(`fetch ${SOURCE_URL} -> ${res.status}`)
  const html = await res.text()
  const entries = parseEntries(html)
  console.log(`[crawl] 抓取到 ${entries.length} 条`)

  let added = 0
  for (const e of entries) {
    if (exist.has(e.sourceUrl)) continue
    const slug = slugify(e.title) || 'daily'
    const file = path.join(DAILY_DIR, `${e.date}-${slug}.md`)
    const fm = [
      '---',
      `title: ${JSON.stringify(e.title)}`,
      `date: '${e.date}'`,
      `summary: ${JSON.stringify(e.summary)}`,
      `tags: []`,
      `category: ${CRAWL_CONFIG.defaultCategory}`,
      `type: ${CRAWL_CONFIG.defaultType}`,
      `source: ${JSON.stringify(e.source)}`,
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
    console.log(`[crawl]   + [${e.date}] ${e.title}`)
  }
  console.log(`[crawl] 新增 ${added} 条`)
  if (added === 0) console.log('[crawl] 无新内容，不产出')
}

main().catch((e) => {
  console.error('[crawl] failed:', e)
  process.exit(1)
})
