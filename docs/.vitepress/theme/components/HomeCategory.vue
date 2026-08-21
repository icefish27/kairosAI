<script setup lang="ts">
import { usePosts } from '../composables/usePosts'
const { categories } = usePosts()
</script>

<template>
  <section class="block">
    <div class="head">
      <h2>按分类浏览</h2>
    </div>
    <div class="cats">
      <a
        v-for="c in categories"
        :key="c.name"
        class="cat"
        :href="`/articles?category=${encodeURIComponent(c.name)}`"
      >
        <div class="cat-name">{{ c.name }}</div>
        <div class="cat-count">{{ c.count }} 篇</div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.block {
  max-width: var(--container);
  margin: 0 auto;
  padding: 48px 24px;
}
.head {
  margin-bottom: 24px;
}
.head h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin: 0;
}
.cats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.cat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 28px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, transform 0.2s, background 0.2s;
  min-height: 110px;
}
.cat:hover {
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--c-accent) 4%, transparent);
}
.cat-name {
  font-size: 1.3em;
  font-weight: 700;
}
.cat-count {
  font-size: 14px;
  color: var(--c-text-mute);
}
@media (max-width: 768px) {
  .cats {
    grid-template-columns: 1fr;
  }
}
</style>
