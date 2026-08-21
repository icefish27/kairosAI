<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()
const fm = computed(() => frontmatter.value)
</script>

<template>
  <div class="link-layout container">
    <a class="back" href="/timeline">← 返回时间线</a>

    <header class="ll-head">
      <span v-if="fm.source" class="badge badge--accent">来源：{{ fm.source }}</span>
      <h1 class="ll-title">{{ fm.title }}</h1>
      <div class="ll-meta">
        <span>{{ (fm.date || '').split('T')[0] }}</span>
        <span v-if="fm.hot"> · 🔥{{ fm.hot }}</span>
      </div>
      <div v-if="fm.tags?.length" class="ll-tags">
        <a v-for="t in fm.tags" :key="t" class="tag" :href="`/timeline?tag=${encodeURIComponent(t)}`">#{{ t }}</a>
      </div>
    </header>

    <p v-if="fm.summary" class="ll-summary">{{ fm.summary }}</p>

    <div class="ll-cta">
      <p class="ll-note">本文为聚合快讯，完整内容见原文。</p>
      <a class="read-original" :href="fm.sourceUrl" target="_blank" rel="noopener noreferrer">
        阅读原文
        <span class="arrow">→</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.link-layout {
  padding: 32px 24px 0;
  max-width: 760px;
  margin: 0 auto;
}
.back {
  font-size: 14px;
  color: var(--c-text-soft);
}
.ll-head {
  margin: 24px 0 16px;
}
.ll-title {
  font-size: 2em;
  font-weight: 800;
  line-height: 1.25;
  margin: 16px 0 12px;
  color: var(--c-text);
}
.ll-meta {
  color: var(--c-text-mute);
  font-size: 14px;
}
.ll-tags {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  font-size: 13px;
  color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 8%, transparent);
  padding: 3px 10px;
  border-radius: 6px;
  text-decoration: none;
}
.ll-summary {
  font-size: 16px;
  line-height: 1.8;
  color: var(--c-text-soft);
  margin: 24px 0;
}
.ll-cta {
  margin: 40px 0;
  padding: 28px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  text-align: center;
  background: var(--c-bg-soft);
}
.ll-note {
  color: var(--c-text-mute);
  font-size: 14px;
  margin: 0 0 20px;
}
.read-original {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: var(--c-accent);
  color: #fff;
  border-radius: var(--r-md);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.read-original:hover {
  background: var(--c-accent-soft);
}
.arrow {
  transition: transform 0.2s;
}
.read-original:hover .arrow {
  transform: translateX(3px);
}
</style>
