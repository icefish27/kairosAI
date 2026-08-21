<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import PostLayout from './components/PostLayout.vue'
import LinkLayout from './components/LinkLayout.vue'
import NotFound from './components/NotFound.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { frontmatter } = useData()
const route = useRoute()
// 404 检测：VitePress 在 not-found 页 route.data.relativePath 为 '404.html'
const isNotFound = computed(() => route.data.relativePath === '404.html')

// 暗色模式（自定义主题自行管理 html.dark class）
const isDark = ref(false)
function applyDark(v: boolean) {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', v)
}
onMounted(() => {
  const saved = localStorage.getItem('theme')
  isDark.value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  applyDark(isDark.value)
})
function toggleDark() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyDark(isDark.value)
}

// 顶导航项
const navItems = [
  { text: '首页', link: '/' },
  { text: 'AI 时间线', link: '/timeline' },
  { text: '深度解析', link: '/deep' },
  { text: '文章列表', link: '/articles' }
]

// GitHub 仓库地址
const GITHUB_URL = 'https://github.com/icefish27/kairosAI'

// 移动端菜单
const mobileOpen = ref(false)
const scrolled = ref(false)
function onScroll() {
  scrolled.value = window.scrollY > 10
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="app" :class="{ dark: isDark }">
    <!-- 顶导航 -->
    <header class="nav" :class="{ scrolled }">
      <div class="container nav-inner">
        <a href="/" class="logo">
          <span class="logo-mark">AI</span>
          <span class="logo-text">资讯站</span>
        </a>

        <nav class="nav-links" :class="{ open: mobileOpen }">
          <a
            v-for="item in navItems"
            :key="item.link"
            :href="item.link"
            class="nav-link"
            @click="mobileOpen = false"
          >
            {{ item.text }}
          </a>
        </nav>

        <div class="nav-actions">
          <SearchButton />
          <button class="icon-btn" :title="isDark ? '切换浅色' : '切换深色'" @click="toggleDark()">
            <span v-if="isDark">☀</span>
            <span v-else>☾</span>
          </button>
          <a class="icon-btn gh" :href="GITHUB_URL" target="_blank" rel="noopener" title="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.5 18 4.8 18 4.8c.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"
              />
            </svg>
          </a>
          <button class="icon-btn burger" @click="mobileOpen = !mobileOpen" aria-label="菜单">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- 内容区：自定义主题用全局 <Content/> 组件渲染当前页 markdown 内容 -->
    <main class="main">
      <NotFound v-if="isNotFound" />
      <LinkLayout v-else-if="frontmatter.layout === 'link'" />
      <PostLayout v-else-if="frontmatter.layout === 'post'">
        <Content />
      </PostLayout>
      <Content v-else />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-mark">AI</span>
            <span class="logo-text">资讯站</span>
          </div>
          <p class="footer-desc">每日精选大模型与 AI 行业前沿动态，由 AI 驱动生产。</p>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <h4>导航</h4>
            <a v-for="i in navItems" :key="i.link" :href="i.link">{{ i.text }}</a>
          </div>
          <div class="footer-col">
            <h4>内容</h4>
            <a href="/articles?view=tags">标签地图</a>
            <a href="/timeline">时间线</a>
            <a href="/articles?sort=hot">热门</a>
          </div>
          <div class="footer-col">
            <h4>订阅</h4>
            <a href="/rss.xml">RSS</a>
            <a :href="GITHUB_URL" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© 2026 AI 资讯站</span>
        <span class="footer-icp">京ICP备xxxx号</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

/* 顶导航 */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--c-bg) 85%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.nav.scrolled {
  border-bottom-color: var(--c-border);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--c-text);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.logo:hover {
  color: var(--c-text);
}
.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--c-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}
.logo-text {
  font-size: 16px;
}

.nav-links {
  display: flex;
  gap: 28px;
}
.nav-link {
  color: var(--c-text-soft);
  font-size: 14px;
  font-weight: 500;
  position: relative;
}
.nav-link:hover {
  color: var(--c-text);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text-soft);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s;
}
.icon-btn:hover {
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 40%, transparent);
}

.burger {
  display: none;
  flex-direction: column;
  gap: 4px;
}
.burger span {
  width: 16px;
  height: 2px;
  background: var(--c-text);
  border-radius: 2px;
}

.main {
  flex: 1;
}

/* 页脚 */
.footer {
  background: var(--c-bg-soft);
  border-top: 1px solid var(--c-border);
  margin-top: 80px;
  padding: 48px 0 24px;
}
.footer-inner {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}
.footer-brand {
  flex: 1;
  min-width: 240px;
}
.footer-desc {
  color: var(--c-text-mute);
  font-size: 14px;
  margin: 12px 0 0;
}
.footer-cols {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer-col h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--c-text-mute);
  font-weight: 600;
}
.footer-col a {
  font-size: 14px;
  color: var(--c-text-soft);
  text-decoration: none;
}
.footer-col a:hover {
  color: var(--c-accent);
}
.footer-bottom {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--c-border);
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--c-text-mute);
}

/* 移动端 */
@media (max-width: 768px) {
  .nav-links {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--c-bg);
    border-bottom: 1px solid var(--c-border);
    padding: 16px 24px;
    gap: 12px;
    transform: translateY(-120%);
    transition: transform 0.25s;
    box-shadow: var(--c-shadow);
  }
  .nav-links.open {
    transform: translateY(0);
  }
  .burger {
    display: inline-flex;
  }
}
</style>
