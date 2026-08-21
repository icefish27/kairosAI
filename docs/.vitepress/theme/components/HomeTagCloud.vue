<script setup lang="ts">
import { withBase } from 'vitepress'
import { usePosts } from '../composables/usePosts'
import { computed } from 'vue'

const { tags } = usePosts()
const top = computed(() => tags.value.slice(0, 24))

// 字号映射频次
function size(count: number, max: number) {
  const min = 13
  const mx = 26
  const r = max ? count / max : 0
  return (min + (mx - min) * r).toFixed(0) + 'px'
}
const maxC = computed(() => tags.value[0]?.count || 1)
</script>

<template>
  <section class="block">
    <div class="head">
      <h2>热门标签</h2>
    </div>
    <div class="cloud">
      <a
        v-for="t in top"
        :key="t.name"
        class="tag"
        :style="{ fontSize: size(t.count, maxC) }"
        :href="withBase(`/articles?tag=${encodeURIComponent(t.name)}`)"
      >{{ t.name }}<sup>{{ t.count }}</sup></a>
    </div>
  </section>
</template>

<style scoped>
.block {
  max-width: var(--container);
  margin: 0 auto;
  padding: 32px 24px 56px;
}
.head {
  margin-bottom: 20px;
}
.head h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin: 0;
}
.cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
  align-items: center;
}
.tag {
  color: var(--c-text-soft);
  text-decoration: none;
  line-height: 1;
  transition: color 0.2s;
}
.tag:hover {
  color: var(--c-accent);
}
.tag sup {
  font-size: 0.6em;
  color: var(--c-text-mute);
  margin-left: 2px;
}
</style>
