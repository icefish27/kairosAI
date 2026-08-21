<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { usePosts } from '../composables/usePosts'

const { posts } = usePosts()
const open = ref(false)
const kw = ref('')
const active = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

const results = computed(() => {
  const k = kw.value.trim().toLowerCase()
  if (!k) return posts.value.slice(0, 6)
  return posts.value
    .filter(
      (p) => p.title.toLowerCase().includes(k) || p.summary.toLowerCase().includes(k)
    )
    .slice(0, 8)
})

watch(results, () => (active.value = 0))

function openModal() {
  open.value = true
  kw.value = ''
  nextTick(() => inputEl.value?.focus())
}
function close() {
  open.value = false
}
function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    open.value ? close() : openModal()
    return
  }
  if (!open.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    active.value = Math.min(active.value + 1, results.value.length - 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  }
  if (e.key === 'Enter') {
    const r = results.value[active.value]
    if (r) window.location.href = r.url
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// 关键词高亮
function hl(text: string) {
  const k = kw.value.trim()
  if (!k) return text
  const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return text.replace(re, (m) => `<mark>${m}</mark>`)
}
</script>

<template>
  <button class="search-btn" @click="openModal" title="搜索 (⌘K)">
    <span class="ico">🔍</span>
    <span class="hint">搜索…</span>
    <kbd>⌘K</kbd>
  </button>

  <Teleport to="body">
    <div v-if="open" class="modal-mask" @click.self="close">
      <div class="modal">
        <div class="modal-input">
          <span class="ico">🔍</span>
          <input ref="inputEl" v-model="kw" type="text" placeholder="输入关键词搜索文章…" />
          <kbd @click="close">ESC</kbd>
        </div>
        <div class="modal-list">
          <a
            v-for="(r, i) in results"
            :key="r.url"
            :href="r.url"
            class="result"
            :class="{ on: i === active }"
            @click="close"
          >
            <div class="r-title" v-html="hl(r.title)" />
            <div class="r-summary" v-html="hl(r.summary)" />
            <div class="r-meta">{{ r.date }} · <span v-for="t in r.tags.slice(0,2)" :key="t">#{{t}} </span></div>
          </a>
          <div v-if="!results.length" class="empty">没有找到相关结果</div>
        </div>
        <div class="modal-footer">↑↓ 选择 · ↵ 打开 · ESC 关闭</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-card);
  color: var(--c-text-mute);
  cursor: pointer;
  font-size: 13px;
  transition: border-color 0.2s;
}
.search-btn:hover {
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
}
.search-btn .hint {
  display: none;
}
.search-btn kbd {
  font-size: 11px;
  padding: 1px 5px;
  border: 1px solid var(--c-border);
  border-radius: 4px;
  background: var(--c-bg-soft);
}
@media (min-width: 768px) {
  .search-btn .hint {
    display: inline;
  }
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
}
.modal {
  width: min(640px, 92vw);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.modal-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-border);
}
.modal-input .ico {
  opacity: 0.5;
}
.modal-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--c-text);
  font-size: 15px;
}
.modal-input kbd {
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid var(--c-border);
  border-radius: 4px;
  color: var(--c-text-mute);
  cursor: pointer;
}
.modal-list {
  max-height: 50vh;
  overflow-y: auto;
  padding: 6px;
}
.result {
  display: block;
  padding: 10px 12px;
  border-radius: var(--r-sm);
  text-decoration: none;
  color: inherit;
}
.result.on {
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}
.r-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}
.r-summary {
  font-size: 12.5px;
  color: var(--c-text-soft);
  margin: 3px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.r-meta {
  font-size: 11px;
  color: var(--c-text-mute);
}
:deep(mark) {
  background: color-mix(in srgb, var(--c-accent) 30%, transparent);
  color: inherit;
  border-radius: 2px;
}
.empty {
  padding: 32px;
  text-align: center;
  color: var(--c-text-mute);
}
.modal-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--c-border);
  font-size: 11px;
  color: var(--c-text-mute);
  text-align: center;
}
</style>
