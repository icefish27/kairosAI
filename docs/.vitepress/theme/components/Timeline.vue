<script setup lang="ts">
import { withBase } from 'vitepress'
import { usePosts } from '../composables/usePosts'
import { useDaily } from '../composables/useDaily'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Post } from '../posts.data'

// Element Plus Timeline
import { ElTimeline, ElTimelineItem } from 'element-plus'
import LinkPreview from './LinkPreview.vue'

const props = defineProps<{ source?: 'daily' | 'posts' }>()
const isDaily = computed(() => props.source !== 'posts')

const dailyData = useDaily()
const postData = usePosts()
const posts = computed(() => (isDaily.value ? dailyData.posts.value : postData.posts.value))
const tags = computed(() => (isDaily.value ? dailyData.tags.value : postData.tags.value))

const selectedYears = ref<string[]>([])
const selectedTags = ref<string[]>([])

const years = computed(() =>
  [...new Set(posts.value.map((p) => p.date.slice(0, 4)))].sort().reverse()
)
const topTags = computed(() => tags.value.slice(0, 12))

const filtered = computed(() =>
  posts.value.filter((p) => {
    if (selectedYears.value.length && !selectedYears.value.includes(p.date.slice(0, 4))) return false
    if (selectedTags.value.length && !selectedTags.value.some((t) => p.tags.includes(t))) return false
    return true
  })
)

interface DayGroup { date: string; weekday: string; items: Post[] }
interface MonthGroup { month: string; days: DayGroup[]; count: number }
interface YearGroup { year: string; months: MonthGroup[]; count: number }

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const groups = computed<YearGroup[]>(() => {
  const yearMap = new Map<string, Map<string, Map<string, Post[]>>>()
  for (const p of filtered.value) {
    const [y, m, d] = p.date.split('-')
    if (!yearMap.has(y)) yearMap.set(y, new Map())
    const monthMap = yearMap.get(y)!
    if (!monthMap.has(m)) monthMap.set(m, new Map())
    const dayMap = monthMap.get(m)!
    if (!dayMap.has(d)) dayMap.set(d, [])
    dayMap.get(d)!.push(p)
  }
  const result: YearGroup[] = []
  for (const [year, monthMap] of [...yearMap.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
    const months: MonthGroup[] = []
    for (const [month, dayMap] of [...monthMap.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
      const days: DayGroup[] = []
      let count = 0
      for (const [day, items] of [...dayMap.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
        const dt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        const weekday = weekdays[dt.getDay()]
        days.push({ date: `${parseInt(month)}月${parseInt(day)}日 · ${weekday}`, weekday, items })
        count += items.length
      }
      months.push({ month, days, count })
    }
    result.push({ year, months, count: months.reduce((s, m) => s + m.count, 0) })
  }
  return result
})

const totalCount = computed(() => filtered.value.length)

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
function clearAll() {
  selectedYears.value = []
  selectedTags.value = []
}

// GSAP 入场动效（轻量）
let ctx: { revert: () => void } | null = null
onMounted(async () => {
  const { gsap } = await import('gsap')
  ctx = gsap.context(() => {
    gsap.from('.year-banner', {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1
    })
  })
})
onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div class="timeline-page">
    <!-- 标题区 -->
    <header class="tl-header">
      <div class="header-eyebrow">AI 资讯流</div>
      <h1 class="header-title">时间线</h1>
      <p class="header-sub">每一天的 AI 行业脉搏，按时间倒序</p>
    </header>

    <!-- 筛选条 -->
    <div class="tl-filters">
      <div v-if="years.length > 1" class="filter-row">
        <span class="filter-label">年份</span>
        <button
          v-for="y in years"
          :key="y"
          class="chip"
          :class="{ active: selectedYears.includes(y) }"
          @click="toggleYear(y)"
        >{{ y }}</button>
      </div>
      <div v-if="topTags.length" class="filter-row">
        <span class="filter-label">标签</span>
        <button
          v-for="t in topTags"
          :key="t.name"
          class="chip"
          :class="{ active: selectedTags.includes(t.name) }"
          @click="toggleTag(t.name)"
        >{{ t.name }}</button>
      </div>
      <button
        v-if="selectedYears.length || selectedTags.length"
        class="clear-btn"
        @click="clearAll"
      >清除筛选</button>
    </div>

    <div class="tl-count">共 {{ totalCount }} 条</div>

    <!-- 空状态 -->
    <div v-if="!groups.length" class="empty-state">
      <p>该筛选条件下暂无内容</p>
    </div>

    <!-- Element Plus Timeline：年 → 月/日 -->
    <div v-else class="timeline-body">
      <div v-for="yg in groups" :key="yg.year" class="year-section">
        <!-- 年份横幅 -->
        <div class="year-banner">
          <span class="year-text">{{ yg.year }}</span>
          <span class="year-stat">{{ yg.count }} 条</span>
        </div>

        <!-- 每年一条 el-timeline -->
        <el-timeline class="tl-el">
          <el-timeline-item
            v-for="dg in yg.months.flatMap(m => m.days)"
            :key="dg.date"
            size="large"
            class="day-item"
          >
            <!-- 日期标题 -->
            <div class="day-date">{{ dg.date }}</div>

            <!-- 当日条目列表 -->
            <div class="day-entries">
              <template v-if="isDaily">
                <LinkPreview
                  v-for="p in dg.items"
                  :key="p.url"
                  :url="p.sourceUrl"
                  class="entry"
                >
                  <div class="entry-bar" />
                  <div class="entry-content">
                    <h3 class="entry-title">{{ p.title }}</h3>
                    <p v-if="p.summary" class="entry-summary">{{ p.summary }}</p>
                    <div class="entry-foot">
                      <span v-if="p.source" class="entry-source">来源：{{ p.source }}</span>
                      <span v-for="t in p.tags" :key="t" class="entry-tag">#{{ t }}</span>
                    </div>
                  </div>
                </LinkPreview>
              </template>
              <template v-else>
                <a
                  v-for="p in dg.items"
                  :key="p.url"
                  class="entry"
                  :href="withBase(p.url)"
                >
                  <div class="entry-bar" />
                  <div class="entry-content">
                    <h3 class="entry-title">{{ p.title }}</h3>
                    <p v-if="p.summary" class="entry-summary">{{ p.summary }}</p>
                    <div class="entry-foot">
                      <span v-for="t in p.tags" :key="t" class="entry-tag">#{{ t }}</span>
                    </div>
                  </div>
                </a>
              </template>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 24px 0;
}

/* ── 标题区 ── */
.tl-header {
  text-align: center;
  margin-bottom: 36px;
}
.header-eyebrow {
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--c-accent);
  font-weight: 600;
  margin-bottom: 10px;
}
.header-title {
  font-size: clamp(2em, 6vw, 3.5em);
  font-weight: 900;
  letter-spacing: -0.04em;
  margin: 0 0 6px;
  color: var(--c-text);
}
.header-sub {
  color: var(--c-text-mute);
  font-size: 14px;
  margin: 0;
}

/* ── 筛选条 ── */
.tl-filters {
  position: sticky;
  top: 64px;
  z-index: 20;
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 12px 0;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 12px;
  color: var(--c-text-mute);
  min-width: 32px;
  font-weight: 500;
}
.chip {
  font-size: 13px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text-soft);
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover {
  border-color: var(--c-accent-soft);
}
.chip.active {
  background: var(--c-accent-bg);
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
}
.clear-btn {
  align-self: flex-start;
  border: none;
  background: none;
  color: var(--c-accent);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 0;
}

/* ── 统计 ── */
.tl-count {
  font-size: 13px;
  color: var(--c-text-mute);
  margin: 18px 0 12px;
}

/* ── 空状态 ── */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--c-text-mute);
}

/* ── 年份横幅 ── */
.year-section {
  margin-bottom: 56px;
}
.year-banner {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 6px;
}
.year-text {
  font-size: clamp(1.8em, 4vw, 2.6em);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(135deg, var(--c-text), color-mix(in srgb, var(--c-accent) 60%, var(--c-text)));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.year-stat {
  font-size: 13px;
  color: var(--c-text-mute);
}

/* ── Element Plus Timeline 覆盖样式 ── */
.tl-el {
  padding-left: 18px;
}
:deep(.tl-el .el-timeline-item__node) {
  background: var(--c-accent);
  width: 12px;
  height: 12px;
  left: -4px;
  border: 2px solid var(--c-bg);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 15%, transparent);
}
:deep(.tl-el .el-timeline-item__tail) {
  border-left: 2px solid var(--c-border);
}
:deep(.tl-el .el-timeline-item__wrapper) {
  padding-left: 20px;
  padding-bottom: 28px;
}
.day-date {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  display: block;
  margin-bottom: 14px;
  padding-bottom: 4px;
}

/* ── 条目列表 ── */
.day-entries {
  display: flex;
  flex-direction: column;
  gap: 0;
}
:deep(.entry) {
  position: relative;
  display: block;
  padding: 12px 0 12px 16px;
  text-decoration: none;
  color: inherit;
  border-left: 2px solid transparent;
  transition: border-color 0.2s, padding-left 0.2s;
}
:deep(.entry:hover) {
  border-left-color: var(--c-accent);
  padding-left: 20px;
}
:deep(.entry-bar) {
  display: none;
}
:deep(.entry-title) {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--c-text);
  line-height: 1.45;
  transition: color 0.2s;
}
:deep(.entry:hover .entry-title) {
  color: var(--c-accent);
}
:deep(.entry-summary) {
  font-size: 13.5px;
  color: var(--c-text-soft);
  margin: 0 0 6px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
:deep(.entry-foot) {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.entry-source {
  font-size: 12px;
  color: var(--c-text-mute);
}
.entry-tag {
  font-size: 11px;
  color: var(--c-text-mute);
}

@media (max-width: 768px) {
  .tl-filters {
    position: static;
  }
  .timeline-page {
    padding: 24px 16px 0;
  }
}
</style>
