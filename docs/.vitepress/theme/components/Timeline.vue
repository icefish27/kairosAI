<script setup lang="ts">
import { usePosts } from '../composables/usePosts'
import { useDaily } from '../composables/useDaily'
import { ref, computed } from 'vue'
import type { Post } from '../posts.data'

const props = defineProps<{ source?: 'daily' | 'posts' }>()
const isDaily = computed(() => props.source !== 'posts')

// 数据源按 source 切换：daily=爬虫聚合快讯，posts=原创深度
const dailyData = useDaily()
const postData = usePosts()
const posts = computed(() => (isDaily.value ? dailyData.posts.value : postData.posts.value))
const tags = computed(() => (isDaily.value ? dailyData.tags.value : postData.tags.value))
const categories = computed(() => (isDaily.value ? dailyData.categories.value : postData.categories.value))

const selectedYears = ref<string[]>([])
const selectedTags = ref<string[]>([])
const selectedCats = ref<string[]>([])

const years = computed(() =>
  [...new Set(posts.value.map((p) => p.date.slice(0, 4)))].sort().reverse()
)
const topTags = computed(() => tags.value.slice(0, 12))

const filtered = computed(() =>
  posts.value.filter((p) => {
    if (selectedYears.value.length && !selectedYears.value.includes(p.date.slice(0, 4))) return false
    if (selectedCats.value.length && !selectedCats.value.includes(p.category)) return false
    if (selectedTags.value.length && !selectedTags.value.some((t) => p.tags.includes(t))) return false
    return true
  })
)

interface Group {
  key: string
  year: number
  month: number
  items: Post[]
}
const groups = computed<Group[]>(() => {
  const m = new Map<string, Post[]>()
  for (const p of filtered.value) {
    const ym = p.date.slice(0, 7)
    if (!m.has(ym)) m.set(ym, [])
    m.get(ym)!.push(p)
  }
  return [...m.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([k, items]) => {
      const [y, mo] = k.split('-').map(Number)
      return { key: k, year: y, month: mo, items }
    })
})

function toggleYear(v: string) {
  const i = selectedYears.value.indexOf(v)
  if (i >= 0) selectedYears.value.splice(i, 1)
  else selectedYears.value.push(v)
}
function toggleTag(v: string) {
  const i = selectedTags.value.indexOf(v)
  if (i >= 0) selectedTags.value.splice(i, 1)
  else selectedTags.value.push(v)
}
function toggleCat(v: string) {
  const i = selectedCats.value.indexOf(v)
  if (i >= 0) selectedCats.value.splice(i, 1)
  else selectedCats.value.push(v)
}
function clearAll() {
  selectedYears.value = []
  selectedTags.value = []
  selectedCats.value = []
}
const fmt = (d: string) => d.slice(5)
</script>

<template>
  <div class="tl">
    <header class="tl-head">
      <h1>AI 时间线</h1>
      <p>按时间倒序回顾 AI 行业每一刻</p>
    </header>

    <!-- 筛选条 -->
    <div class="filters">
      <div class="fgroup">
        <span class="flabel">年份</span>
        <button
          v-for="y in years"
          :key="y"
          class="fchip"
          :class="{ on: selectedYears.includes(y) }"
          @click="toggleYear(y)"
        >{{ y }}</button>
      </div>
      <div class="fgroup">
        <span class="flabel">类别</span>
        <button
          v-for="c in categories"
          :key="c.name"
          class="fchip"
          :class="{ on: selectedCats.includes(c.name) }"
          @click="toggleCat(c.name)"
        >{{ c.name }}</button>
      </div>
      <div v-if="topTags.length" class="fgroup">
        <span class="flabel">标签</span>
        <button
          v-for="t in topTags"
          :key="t.name"
          class="fchip"
          :class="{ on: selectedTags.includes(t.name) }"
          @click="toggleTag(t.name)"
        >{{ t.name }}</button>
      </div>
      <button
        v-if="selectedYears.length || selectedTags.length || selectedCats.length"
        class="clear"
        @click="clearAll"
      >清空</button>
    </div>

    <!-- 空状态 -->
    <div v-if="!groups.length" class="empty">
      <p>该筛选下暂无文章，试试调整条件</p>
    </div>

    <!-- 时间轴 -->
    <div v-else class="axis">
      <div class="rail" />
      <div v-for="g in groups" :key="g.key" class="group">
        <div class="month-head">
          <span class="dot" />{{ g.year }} 年 {{ g.month }} 月 · {{ g.items.length }} 篇
        </div>
        <a
          v-for="p in g.items"
          :key="p.url"
          class="tcard"
          :href="isDaily ? p.sourceUrl : p.url"
          :target="isDaily ? '_blank' : undefined"
          rel="noopener"
        >
          <div class="tcard-date">{{ fmt(p.date) }}</div>
          <div class="tcard-main">
            <div class="tcard-title-row">
              <h3 class="tcard-title">{{ p.title }}</h3>
              <span v-if="isDaily" class="tcard-ext">↗</span>
            </div>
            <p class="tcard-summary">{{ p.summary }}</p>
            <div class="tcard-tags">
              <span class="badge">{{ p.category }}</span>
              <span v-if="isDaily && p.source" class="source">来源：{{ p.source }}</span>
              <span v-for="t in p.tags" :key="t" class="tag">#{{ t }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl {
  max-width: var(--container);
  margin: 0 auto;
  padding: 32px 24px 0;
}
.tl-head h1 {
  font-size: 2em;
  font-weight: 800;
  margin: 0 0 8px;
}
.tl-head p {
  color: var(--c-text-mute);
  margin: 0 0 24px;
}

.filters {
  position: sticky;
  top: 64px;
  z-index: 20;
  background: var(--c-bg);
  padding: 14px 0;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fgroup {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.flabel {
  font-size: 12px;
  color: var(--c-text-mute);
  min-width: 36px;
}
.fchip {
  font-size: 13px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text-soft);
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
}
.fchip.on {
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
}
.clear {
  align-self: flex-start;
  border: none;
  background: none;
  color: var(--c-accent);
  cursor: pointer;
  font-size: 13px;
}

.axis {
  position: relative;
  padding-left: 24px;
  margin-top: 24px;
}
.rail {
  position: absolute;
  left: 5px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--c-border);
}
.group {
  margin-bottom: 32px;
}
.month-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--c-text-soft);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  position: relative;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-accent);
  border: 2px solid var(--c-bg);
  position: absolute;
  left: -24px;
}
.tcard {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  margin-bottom: 12px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, transform 0.2s;
}
.tcard:hover {
  border-color: color-mix(in srgb, var(--c-accent) 40%, var(--c-border));
  transform: translateX(2px);
}
.tcard-date {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-accent);
  min-width: 44px;
}
.tcard-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--c-text);
}
.tcard-summary {
  font-size: 13.5px;
  color: var(--c-text-soft);
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tcard-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  font-size: 11px;
  color: var(--c-text-mute);
  background: var(--c-bg-soft);
  padding: 2px 7px;
  border-radius: 5px;
}

.empty {
  text-align: center;
  padding: 80px 0;
  color: var(--c-text-mute);
}

@media (max-width: 768px) {
  .filters {
    position: static;
  }
}
</style>
