<script setup lang="ts">
import { withBase } from 'vitepress'
import { usePosts } from '../composables/usePosts'
import { computed } from 'vue'

const { featured, latest } = usePosts()
const items = computed(() => {
  let list = featured.value
  if (list.length < 3) list = [...list, ...latest(9)].slice(0, 3)
  return list
})
const big = computed(() => items.value[0])
const smalls = computed(() => items.value.slice(1, 3))

function grad(t: string) {
  let h = 0
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 360
  return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 40) % 360} 70% 45%))`
}
const fmt = (d: string) => d.slice(5)
</script>

<template>
  <section class="block">
    <div class="head">
      <h2>精选推荐</h2>
      <a class="more" :href="withBase('/articles')">查看全部 →</a>
    </div>
    <div class="grid">
      <a v-if="big" class="big" :href="withBase(big.url)">
        <div class="cover" :style="!big.cover ? { background: grad(big.title) } : {}">
          <img v-if="big.cover" :src="big.cover" :alt="big.title" loading="lazy" />
          <span class="cat">{{ big.category }}</span>
        </div>
        <div class="info">
          <h3 class="title">{{ big.title }}</h3>
          <p class="summary">{{ big.summary }}</p>
          <div class="tags"><span v-for="t in big.tags.slice(0,4)" :key="t" class="tag">#{{ t }}</span></div>
        </div>
      </a>
      <div class="smalls">
        <a v-for="p in smalls" :key="p.url" class="small" :href="withBase(p.url)">
          <div class="cover" :style="!p.cover ? { background: grad(p.title) } : {}">
            <img v-if="p.cover" :src="p.cover" :alt="p.title" loading="lazy" />
            <span class="cat">{{ p.category }}</span>
          </div>
          <div class="info">
            <h3 class="title">{{ p.title }}</h3>
            <p class="summary">{{ p.summary }}</p>
            <div class="meta"><span>{{ fmt(p.date) }}</span><span v-if="p.hot>=70">🔥{{ p.hot }}</span></div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block {
  max-width: var(--container);
  margin: 0 auto;
  padding: 32px 24px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
}
.head h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin: 0;
}
.more {
  font-size: 14px;
  color: var(--c-accent);
  text-decoration: none;
}
.grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: stretch;
}
.big {
  display: flex;
  flex-direction: column;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}
.big:hover {
  transform: translateY(-3px);
  box-shadow: var(--c-shadow);
}
.big .cover {
  aspect-ratio: 16 / 9;
  position: relative;
}
.big .cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.big .info {
  padding: 20px;
}
.big .title {
  font-size: 1.4em;
  font-weight: 700;
  line-height: 1.35;
  margin: 0 0 8px;
}
.big .summary {
  color: var(--c-text-soft);
  font-size: 14px;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.smalls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.small {
  flex: 1;
  display: flex;
  gap: 14px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}
.small:hover {
  transform: translateY(-2px);
}
.small .cover {
  width: 120px;
  flex-shrink: 0;
  position: relative;
}
.small .cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.small .info {
  padding: 12px 14px 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.small .title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.small .summary {
  font-size: 12.5px;
  color: var(--c-text-soft);
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cat {
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 3px 8px;
  border-radius: 6px;
}
.tags {
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
.meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--c-text-mute);
}
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .small .cover {
    width: 90px;
  }
}
</style>
