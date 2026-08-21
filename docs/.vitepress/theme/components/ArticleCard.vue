<script setup lang="ts">
import type { Post } from '../posts.data'

const props = defineProps<{ post: Post; showHot?: boolean }>()

// 无封面时按标题 hash 生成渐变色占位
function gradient(title: string) {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) % 360
  return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 40) % 360} 70% 45%))`
}
const fmt = (d: string) => (d ? d.slice(5) : '')
</script>

<template>
  <a class="acard" :href="props.post.url">
    <div class="cover" :style="!props.post.cover ? { background: gradient(props.post.title) } : {}">
      <img v-if="props.post.cover" :src="props.post.cover" :alt="props.post.title" loading="lazy" />
      <span class="cover-cat">{{ props.post.category }}</span>
    </div>
    <div class="body">
      <h3 class="title">{{ props.post.title }}</h3>
      <p class="summary">{{ props.post.summary }}</p>
      <div class="meta">
        <span class="date">{{ fmt(props.post.date) }}</span>
        <span v-if="showHot || props.post.hot >= 70" class="hot">🔥{{ props.post.hot }}</span>
      </div>
      <div class="tags">
        <span v-for="t in props.post.tags.slice(0, 3)" :key="t" class="tag">#{{ t }}</span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.acard {
  display: flex;
  flex-direction: column;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  height: 100%;
}
.acard:hover {
  transform: translateY(-3px);
  box-shadow: var(--c-shadow);
  border-color: color-mix(in srgb, var(--c-accent) 30%, var(--c-border));
}
.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  background-size: cover;
  display: flex;
  align-items: flex-end;
  padding: 10px;
}
.cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-cat {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 3px 8px;
  border-radius: 6px;
}
.body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.summary {
  font-size: 13.5px;
  color: var(--c-text-soft);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--c-text-mute);
}
.hot {
  color: #e8590c;
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: auto;
}
.tag {
  font-size: 11px;
  color: var(--c-text-mute);
  background: var(--c-bg-soft);
  padding: 2px 7px;
  border-radius: 5px;
}
</style>
