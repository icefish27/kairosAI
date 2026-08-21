import { data } from '../daily.data'
import { computed } from 'vue'
import type { Post } from '../posts.data'

// 爬虫聚合快讯的派生计算（标签云、分类计数、统计、最新）
const allDaily = data as Post[]

export function useDaily() {
  const posts = computed(() => allDaily)

  const tags = computed(() => {
    const map = new Map<string, number>()
    for (const p of allDaily) {
      for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
    }
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  })

  const categories = computed(() => {
    const map = new Map<string, number>()
    for (const p of allDaily) map.set(p.category, (map.get(p.category) || 0) + 1)
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  })

  const stats = computed(() => {
    const dates = allDaily.map((p) => +new Date(p.date)).filter(Boolean)
    const days = dates.length ? Math.max(1, Math.ceil((Date.now() - Math.min(...dates)) / 86400000)) : 0
    return { count: allDaily.length, tagCount: tags.value.length, days, words: 0 }
  })

  function latest(n = 9) {
    return allDaily.slice(0, n)
  }

  return { posts, tags, categories, stats, latest }
}
