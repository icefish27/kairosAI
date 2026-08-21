<script setup lang="ts">
import { withBase } from 'vitepress'
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()
const fm = computed(() => frontmatter.value)
</script>

<template>
  <div class="link-layout container">
    <a class="back-link" :href="withBase('/timeline')">返回时间线</a>

    <header class="link-header">
      <span v-if="fm.source" class="source-badge">{{ fm.source }}</span>
      <h1 class="link-title">{{ fm.title }}</h1>
      <div class="link-meta">
        <span>{{ (fm.date || '').split('T')[0] }}</span>
      </div>
      <div v-if="fm.tags?.length" class="link-tags">
        <a
          v-for="t in fm.tags"
          :key="t"
          class="link-tag"
          :href="withBase(`/timeline?tag=${encodeURIComponent(t)}`)"
        >#{{ t }}</a>
      </div>
    </header>

    <p v-if="fm.summary" class="link-summary">{{ fm.summary }}</p>

    <div class="link-cta">
      <p class="link-note">本文为聚合快讯，完整内容请查看原文</p>
      <a class="read-btn" :href="fm.sourceUrl" target="_blank" rel="noopener noreferrer">
        阅读原文
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
.back-link {
  font-size: 14px;
  color: var(--c-text-soft);
  text-decoration: none;
}
.back-link:hover {
  color: var(--c-accent);
}
.link-header {
  margin: 24px 0 16px;
}
.source-badge {
  display: inline-block;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: var(--r-sm);
  background: var(--c-accent-bg);
  color: var(--c-accent);
  margin-bottom: 12px;
}
.link-title {
  font-size: 1.8em;
  font-weight: 800;
  line-height: 1.3;
  margin: 0 0 10px;
  color: var(--c-text);
  letter-spacing: -0.02em;
}
.link-meta {
  color: var(--c-text-mute);
  font-size: 14px;
}
.link-tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.link-tag {
  font-size: 13px;
  color: var(--c-accent);
  background: var(--c-accent-bg);
  padding: 3px 10px;
  border-radius: var(--r-sm);
  text-decoration: none;
}
.link-summary {
  font-size: 15px;
  line-height: 1.8;
  color: var(--c-text-soft);
  margin: 24px 0;
}
.link-cta {
  margin: 40px 0;
  padding: 28px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  text-align: center;
  background: var(--c-bg-soft);
}
.link-note {
  color: var(--c-text-mute);
  font-size: 14px;
  margin: 0 0 20px;
}
.read-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 32px;
  background: var(--c-accent);
  color: #fff;
  border-radius: var(--r-md);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.read-btn:hover {
  background: var(--c-accent-soft);
  color: #fff;
}
</style>
