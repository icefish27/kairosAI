// @ts-ignore — VitePress 构建期为 .data 文件生成 data 导出，源码中仅有 default export
import { data } from '../posts.data'
import { computed } from 'vue'
import type { Post } from '../posts.data'

// 文章数据的派生计算（标签云、分类计数、站点统计、上下篇、相关文章等）
// data 是构建期生成的静态数组，客户端可直接读取
const allPosts = data as Post[]

export function usePosts() {
  const posts = computed(() => allPosts)

  // 标签云：[{ name, count }] 按频次降序
  const tags = computed(() => {
    const map = new Map<string, number>()
    for (const p of allPosts) {
      for (const t of p.tags) {
        map.set(t, (map.get(t) || 0) + 1)
      }
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  })

  // 分类计数：[{ name, count }]
  const categories = computed(() => {
    const map = new Map<string, number>()
    for (const p of allPosts) {
      map.set(p.category, (map.get(p.category) || 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  })

  // 站点统计
  const stats = computed(() => {
    const words = allPosts.reduce((s, p) => s + p.wordCount, 0)
    const dates = allPosts.map((p) => +new Date(p.date)).filter(Boolean)
    const days = dates.length
      ? Math.max(1, Math.ceil((Date.now() - Math.min(...dates)) / 86400000))
      : 0
    return {
      count: allPosts.length,
      tagCount: tags.value.length,
      days,
      words
    }
  })

  const featured = computed(() => allPosts.filter((p) => p.featured))

  function latest(n = 9) {
    return allPosts.slice(0, n)
  }

  // 上下篇（按 date 相邻）
  function neighbors(currentUrl: string) {
    const idx = allPosts.findIndex((p) => p.url === currentUrl)
    if (idx < 0) return { prev: null, next: null }
    return {
      prev: idx < allPosts.length - 1 ? allPosts[idx + 1] : null,
      next: idx > 0 ? allPosts[idx - 1] : null
    }
  }

  // 相关文章：同标签优先，不足用同期补
  function related(currentUrl: string, currentTags: string[], n = 3) {
    const rest = allPosts.filter((p) => p.url !== currentUrl)
    const scored = rest.map((p) => {
      const overlap = p.tags.filter((t) => currentTags.includes(t)).length
      return { p, score: overlap * 100 - Math.abs(+new Date(p.date) - Date.now()) / 864000000 }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, n).map((s) => s.p)
  }

  return { posts, tags, categories, stats, featured, latest, neighbors, related }
}
