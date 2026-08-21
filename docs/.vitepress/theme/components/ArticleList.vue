<script setup lang="ts">
import { usePosts } from '../composables/usePosts'
import { ref, computed, watch, onMounted } from 'vue'
import ArticleCard from './ArticleCard.vue'

const { posts, categories, tags } = usePosts()

const q = ref('')
const category = ref('')
const selectedTags = ref<string[]>([])
const sort = ref<'date' | 'hot'>('date')
const view = ref<'grid' | 'list'>('grid')
const page = ref(1)
const pageSize = 12

const topTags = computed(() => tags.value.slice(0, 14))

const filtered = computed(() => {
  let list = posts.value
  const kw = q.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (p) => p.title.toLowerCase().includes(kw) || p.summary.toLowerCase().includes(kw)
    )
  }
  if (category.value) list = list.filter((p) => p.category === category.value)
  if (selectedTags.value.length) {
    list = list.filter((p) => selectedTags.value.some((t) => p.tags.includes(t)))
  }
  if (sort.value === 'hot') list = [...list].sort((a, b) => b.hot - a.hot)
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)
const pageList = computed(() => {
  const arr: number[] = []
  const tp = totalPages.value
  const cur = page.value
  for (let i = 1; i <= tp; i++) {
    if (i === 1 || i === tp || Math.abs(i - cur) <= 1) arr.push(i)
    else if (arr[arr.length - 1] !== -1) arr.push(-1) // 省略号
  }
  return arr
})

function toggleTag(t: string) {
  const i = selectedTags.value.indexOf(t)
  if (i >= 0) selectedTags.value.splice(i, 1)
  else selectedTags.value.push(t)
}
function clearAll() {
  q.value = ''
  category.value = ''
  selectedTags.value = []
  sort.value = 'date'
  page.value = 1
}
function goto(p: number) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 任意筛选/排序变化重置页码
watch([q, category, selectedTags, sort], () => (page.value = 1))

// URL query 同步（便于分享）
watch(
  () => [q.value, category.value, selectedTags.value.join(','), sort.value, view.value, page.value],
  () => {
    if (typeof window === 'undefined') return
    const u = new URL(window.location.href)
    const set = (k: string, v: string) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k))
    set('q', q.value)
    set('category', category.value)
    set('tag', selectedTags.value.join(','))
    set('sort', sort.value === 'date' ? '' : sort.value)
    set('view', view.value === 'grid' ? '' : view.value)
    set('page', page.value === 1 ? '' : String(page.value))
    window.history.replaceState(null, '', u)
  }
)

onMounted(() => {
  const u = new URL(window.location.href)
  q.value = u.searchParams.get('q') || ''
  category.value = u.searchParams.get('category') || ''
  const tg = u.searchParams.get('tag')
  if (tg) selectedTags.value = tg.split(',').filter(Boolean)
  if (u.searchParams.get('sort') === 'hot') sort.value = 'hot'
  if (u.searchParams.get('view') === 'list') view.value = 'list'
  const p = parseInt(u.searchParams.get('page') || '1', 10)
  if (p > 1) page.value = p
})
</script>

<template>
  <div class="alist">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-box">
        <span class="ico">🔍</span>
        <input v-model="q" type="text" placeholder="关键词搜索标题与摘要…" />
      </div>
      <div class="filters">
        <select v-model="category" class="sel">
          <option value="">全部分类</option>
          <option v-for="c in categories" :key="c.name" :value="c.name">{{ c.name }}（{{ c.count }}）</option>
        </select>
        <div class="seg">
          <button :class="{ on: sort === 'date' }" @click="sort = 'date'">最新</button>
          <button :class="{ on: sort === 'hot' }" @click="sort = 'hot'">最热</button>
        </div>
        <div class="seg">
          <button :class="{ on: view === 'grid' }" @click="view = 'grid'" title="网格">▦</button>
          <button :class="{ on: view === 'list' }" @click="view = 'list'" title="列表">≡</button>
        </div>
      </div>
    </div>

    <!-- 标签筛选 chip 行 -->
    <div v-if="topTags.length" class="tag-row">
      <span
        v-for="t in topTags"
        :key="t.name"
        class="tag-chip"
        :class="{ on: selectedTags.includes(t.name) }"
        @click="toggleTag(t.name)"
      >{{ t.name }} <span class="cnt">{{ t.count }}</span></span>
    </div>

    <!-- 结果计数 -->
    <div class="count">
      共 {{ filtered.length }} 篇
      <button v-if="q || category || selectedTags.length" class="clear" @click="clearAll">清空筛选</button>
    </div>

    <!-- 空状态 -->
    <div v-if="!filtered.length" class="empty">
      <p>未找到匹配文章</p>
      <button @click="clearAll">清空筛选条件</button>
    </div>

    <!-- 列表 -->
    <div v-else class="grid" :class="view">
      <div v-for="p in paged" :key="p.url" class="cell" :class="{ 'list-cell': view === 'list' }">
        <ArticleCard :post="p" :show-hot="sort === 'hot'" />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pager">
      <button :disabled="page === 1" @click="goto(page - 1)">‹</button>
      <template v-for="(n, i) in pageList" :key="i">
        <span v-if="n === -1" class="ellipsis">…</span>
        <button v-else :class="{ on: n === page }" @click="goto(n)">{{ n }}</button>
      </template>
      <button :disabled="page === totalPages" @click="goto(page + 1)">›</button>
    </div>
  </div>
</template>

<style scoped>
.alist {
  max-width: var(--container);
  margin: 0 auto;
  padding: 24px;
}
.toolbar {
  position: sticky;
  top: 64px;
  z-index: 20;
  background: var(--c-bg);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--c-border);
}
.search-box {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 8px 12px;
  background: var(--c-card);
}
.search-box .ico {
  opacity: 0.5;
}
.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--c-text);
  font-size: 14px;
}
.filters {
  display: flex;
  gap: 8px;
}
.sel {
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 8px 10px;
  background: var(--c-card);
  color: var(--c-text);
  font-size: 14px;
  cursor: pointer;
}
.seg {
  display: inline-flex;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  overflow: hidden;
}
.seg button {
  border: none;
  background: var(--c-card);
  color: var(--c-text-soft);
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  border-right: 1px solid var(--c-border);
}
.seg button:last-child {
  border-right: none;
}
.seg button.on {
  background: var(--c-accent);
  color: #fff;
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
}
.tag-chip {
  font-size: 13px;
  color: var(--c-text-soft);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
}
.tag-chip .cnt {
  opacity: 0.6;
  font-size: 11px;
}
.tag-chip.on {
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
}

.count {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--c-text-mute);
  font-size: 13px;
  padding: 8px 0 20px;
}
.clear {
  border: none;
  background: none;
  color: var(--c-accent);
  cursor: pointer;
  font-size: 13px;
}

.grid {
  display: grid;
  gap: 20px;
}
.grid.grid {
  grid-template-columns: repeat(3, 1fr);
}
.grid.list .list-cell :deep(.cover) {
  display: none;
}
.grid.list {
  grid-template-columns: 1fr;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--c-text-mute);
}
.empty button {
  margin-top: 12px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text);
  padding: 8px 16px;
  border-radius: var(--r-md);
  cursor: pointer;
}

.pager {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 40px 0;
}
.pager button {
  min-width: 36px;
  height: 36px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text-soft);
  border-radius: var(--r-sm);
  cursor: pointer;
}
.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pager button.on {
  background: var(--c-accent);
  color: #fff;
  border-color: var(--c-accent);
}
.ellipsis {
  color: var(--c-text-mute);
  padding: 0 4px;
}

@media (max-width: 1024px) {
  .grid.grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .grid.grid {
    grid-template-columns: 1fr;
  }
  .toolbar {
    position: static;
  }
}
</style>
