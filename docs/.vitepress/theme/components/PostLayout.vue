<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { usePosts } from '../composables/usePosts'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import ArticleCard from './ArticleCard.vue'
import { hydrateBlocks } from '../composables/useBlocks'

const { frontmatter, page } = useData()
const { posts, neighbors, related } = usePosts()

const cur = computed(() => ({
  url: '/' + (page.value.relativePath || '').replace(/\.md$/, ''),
  tags: (frontmatter.value.tags as string[]) || []
}))
const meta = computed(() => posts.value.find((p) => p.url === cur.value.url))
const navi = computed(() => neighbors(cur.value.url))
const relatedPosts = computed(() => related(cur.value.url, cur.value.tags, 3))
const headers = computed(() => (page.value.headers || []) as { level: number; title: string; link: string }[])

// 返回链接
const backHref = withBase('/articles')

// TOC 滚动高亮
const activeId = ref('')
let observer: IntersectionObserver | null = null
onMounted(() => {
  const headings = headers.value
  if (!headings.length) return
  const els = headings
    .map((h) => document.querySelector(`[href="${h.link}"]`) || document.getElementById(h.link.slice(1)))
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.target.id) activeId.value = e.target.id
      }
    },
    { rootMargin: '-80px 0px -70% 0px' }
  )
  document.querySelectorAll('h2, h3').forEach((el) => observer!.observe(el))
})

// 客户端渲染 mermaid/echarts/three 自定义块（fence SSR 期已输出源码占位）
onMounted(() => {
  hydrateBlocks(document.querySelector('.post-content') || document)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="post-layout container">
    <!-- 返回 -->
    <a class="back" :href="backHref">← 返回文章列表</a>

    <!-- 文章头 -->
    <header class="post-head">
      <span class="badge badge--accent">{{ frontmatter.category || '资讯' }}</span>
      <h1 class="post-title">{{ frontmatter.title }}</h1>
      <div class="post-meta">
        <span>{{ (frontmatter.date || '').split('T')[0] }}</span>
        <span>· 阅读约 {{ meta?.readingTime || 1 }} 分钟</span>
        <span v-if="meta?.wordCount">· {{ meta.wordCount }} 字</span>
        <span v-if="meta?.hot">· 🔥{{ meta.hot }}</span>
      </div>
      <div class="post-tags">
        <a v-for="t in (frontmatter.tags || [])" :key="t" class="tag" :href="withBase(`/articles?tag=${encodeURIComponent(t)}`)">#{{ t }}</a>
      </div>
      <img v-if="frontmatter.cover" class="post-cover" :src="frontmatter.cover" :alt="frontmatter.title" />
    </header>

    <!-- 双栏：正文 + TOC -->
    <div class="post-body-wrap" :class="{ 'no-toc': !headers.length }">
      <article class="prose post-content">
        <slot />
      </article>

      <aside v-if="headers.length" class="post-toc">
        <div class="toc-inner">
          <div class="toc-title">目录</div>
          <nav>
            <a
              v-for="h in headers"
              :key="h.link"
              :href="h.link"
              class="toc-item"
              :class="[`lv${h.level}`, { active: activeId === h.link.slice(1) }]"
            >{{ h.title }}</a>
          </nav>
        </div>
      </aside>
    </div>

    <!-- 上下篇 -->
    <nav class="prev-next">
      <a v-if="navi.prev" class="pn-link prev" :href="withBase(navi.prev.url)">
        <span class="pn-label">← 上一篇</span>
        <span class="pn-title">{{ navi.prev.title }}</span>
      </a>
      <span v-else class="pn-link prev disabled"><span class="pn-label">← 上一篇</span><span class="pn-title">已是最早</span></span>
      <a v-if="navi.next" class="pn-link next" :href="withBase(navi.next.url)">
        <span class="pn-label">下一篇 →</span>
        <span class="pn-title">{{ navi.next.title }}</span>
      </a>
      <span v-else class="pn-link next disabled"><span class="pn-label">下一篇 →</span><span class="pn-title">已是最新</span></span>
    </nav>

    <!-- 相关文章 -->
    <section v-if="relatedPosts.length" class="related">
      <h3 class="section-title">相关文章</h3>
      <div class="related-grid">
        <ArticleCard v-for="p in relatedPosts" :key="p.url" :post="p" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.post-layout {
  padding: 32px 24px 0;
  max-width: var(--container);
  margin: 0 auto;
}
.back {
  font-size: 14px;
  color: var(--c-text-soft);
}
.back:hover {
  color: var(--c-accent);
}
.post-head {
  margin: 24px 0 8px;
}
.post-title {
  font-size: 2.1em;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 16px 0 12px;
  color: var(--c-text);
}
.post-meta {
  color: var(--c-text-mute);
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.post-tags {
  margin: 12px 0;
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
.post-cover {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: var(--r-lg);
  margin: 24px 0;
  border: 1px solid var(--c-border);
}

.post-body-wrap {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 48px;
  align-items: start;
  margin-top: 32px;
}
.post-body-wrap.no-toc {
  grid-template-columns: 1fr;
}
.post-content {
  min-width: 0;
}

.post-toc {
  position: sticky;
  top: 88px;
  font-size: 13px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.toc-inner {
  border-left: 2px solid var(--c-border);
  padding-left: 16px;
}
.toc-title {
  font-size: 12px;
  color: var(--c-text-mute);
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.toc-item {
  display: block;
  color: var(--c-text-soft);
  text-decoration: none;
  padding: 4px 0;
  line-height: 1.4;
  border-left: 2px solid transparent;
  margin-left: -18px;
  padding-left: 16px;
  transition: color 0.15s, border-color 0.15s;
}
.toc-item.lv3 {
  padding-left: 32px;
  font-size: 12.5px;
}
.toc-item:hover,
.toc-item.active {
  color: var(--c-accent);
  border-left-color: var(--c-accent);
}

.prev-next {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 56px 0 0;
  padding-top: 32px;
  border-top: 1px solid var(--c-border);
}
.pn-link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.pn-link:hover {
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
  background: color-mix(in srgb, var(--c-accent) 4%, transparent);
}
.pn-link.next {
  text-align: right;
}
.pn-link.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.pn-label {
  font-size: 12px;
  color: var(--c-text-mute);
}
.pn-title {
  font-size: 14px;
  color: var(--c-text);
  font-weight: 500;
}

.related {
  margin: 56px 0;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .post-body-wrap {
    grid-template-columns: 1fr;
  }
  .post-toc {
    position: static;
    max-height: none;
    margin-bottom: 24px;
  }
}
@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
  .prev-next {
    grid-template-columns: 1fr;
  }
}
</style>
