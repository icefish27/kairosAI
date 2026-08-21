import { createContentLoader } from 'vitepress'
import fs from 'fs'
import path from 'path'

export interface Post {
  title: string
  date: string
  summary: string
  tags: string[]
  category: string
  cover?: string
  hot: number
  featured: boolean
  draft: boolean
  description: string
  keywords: string[]
  url: string
  excerpt: string
  wordCount: number
  readingTime: number
  slug: string
  type: 'link' | 'original'
  source?: string
  sourceUrl?: string
}

// 构建期扫描 posts/*.md，产出全站文章元数据数组
export default createContentLoader('posts/*.md', {
  excerpt: true,
  excerptSeparator: '<!-- more -->',
  async transform(raw) {
    const root = path.resolve(process.cwd(), 'docs')
    return (
      raw
        .filter((p) => !p.frontmatter.draft)
        .map((p) => {
          const fm = p.frontmatter as Record<string, any>

          // 验收红线3：frontmatter 缺 title/date/summary 时构建期告警
          if (!fm.title) console.warn(`[posts] 缺 title: ${p.src}`)
          if (!fm.date) console.warn(`[posts] 缺 date: ${p.src}`)
          if (!fm.summary) console.warn(`[posts] 缺 summary: ${p.src}`)

          // 字数：读正文（去掉 frontmatter、代码块、markdown 标记）后的字符数
          let wordCount = 0
          try {
            const full = fs.readFileSync(path.resolve(root, p.src), 'utf-8')
            const body = full
              .replace(/^---[\s\S]*?---/, '')
              .replace(/```[\s\S]*?```/g, '')
              .replace(/<[^>]+>/g, '')
              .replace(/[#>*_`~\-\[\]()!]/g, '')
            wordCount = body.replace(/\s/g, '').length
          } catch {
            // 读不到则跳过字数
          }

          const tags = fm.tags || []
          const summary: string = fm.summary || p.excerpt || ''
          const slug = p.url.replace(/^\/posts\//, '').replace(/\/$/, '')
          const dateStr = fm.date ? String(fm.date).split('T')[0] : ''

          return {
            title: fm.title || '无标题',
            date: dateStr,
            summary,
            tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
            category: fm.category || '资讯',
            cover: fm.cover || '',
            hot: typeof fm.hot === 'number' ? fm.hot : 50,
            featured: !!fm.featured,
            draft: !!fm.draft,
            description: fm.description || summary,
            keywords: fm.keywords || [],
            url: p.url,
            excerpt: p.excerpt || summary,
            wordCount,
            readingTime: Math.max(1, Math.ceil(wordCount / 300)),
            slug,
            type: 'original',
            source: fm.source || '',
            sourceUrl: fm.sourceUrl || ''
          } as Post
        })
        .filter((p) => !!p.date)
        // 按时间倒序
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    )
  }
})
