<script setup lang="ts">
import { usePosts } from '../composables/usePosts'
import ArticleCard from './ArticleCard.vue'

const { latest } = usePosts()
const list = latest(9)
</script>

<template>
  <section class="block">
    <div class="head">
      <h2>最新资讯</h2>
      <a class="more" href="/articles?sort=date">查看全部 →</a>
    </div>
    <div class="grid">
      <ArticleCard v-for="p in list" :key="p.url" :post="p" />
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
