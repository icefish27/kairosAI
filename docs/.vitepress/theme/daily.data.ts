import { createContentLoader } from 'vitepress'
import path from 'path'
import type { Post } from './posts.data'

// 构建期扫描 daily/*.md（爬虫聚合的引用快讯），产出元数据
// 与 posts.data（原创）分离，两份数据各服务各页面
export default createContentLoader('daily/*.md', {
  excerpt: true,
  excerptSeparator: '<!-- more -->',
  async transform(raw) {
    return raw
      .filter((p) => !p.frontmatter.draft)
      .map((p) => {
        const fm = p.frontmatter as Record<string, any>
        if (!fm.title) console.warn(`[daily] 缺 title: ${p.src}`)
        if (!fm.date) console.warn(`[daily] 缺 date: ${p.src}`)
        if (!fm.sourceUrl) console.warn(`[daily] 缺 sourceUrl: ${p.src}`)

        const tags = fm.tags || []
        const slug = p.url.replace(/^\/daily\//, '').replace(/\/$/, '')
        const dateStr = fm.date ? String(fm.date).split('T')[0] : ''

        return {
          title: fm.title || '无标题',
          date: dateStr,
          summary: fm.summary || p.excerpt || '',
          tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
          category: fm.category || '资讯',
          cover: fm.cover || '',
          hot: typeof fm.hot === 'number' ? fm.hot : 50,
          featured: !!fm.featured,
          draft: !!fm.draft,
          description: fm.description || fm.summary || '',
          keywords: fm.keywords || [],
          url: p.url,
          excerpt: p.excerpt || fm.summary || '',
          // 引用快讯无正文，字数/阅读时长无意义，置默认
          wordCount: 0,
          readingTime: 1,
          slug,
          type: 'link' as const,
          source: fm.source || '',
          sourceUrl: fm.sourceUrl || ''
        } as Post
      })
      .filter((p) => !!p.date)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }
})
