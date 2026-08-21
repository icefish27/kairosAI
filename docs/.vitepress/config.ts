import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'
import { SITE_CONFIG } from './theme/site.config'

// 站点 base 和域名从 site.config.ts 统一管理，修改时只需改一处
const BASE = SITE_CONFIG.base
const SITE_HOST = SITE_CONFIG.siteHost

// 代码块 fence 重写：把 ```mermaid / ```echarts / ```three 渲染为对应 Vue 组件
// 这些语言默认会被 Shiki 当普通代码块高亮，这里拦截改为组件占位（SSR 期输出源码 pre，客户端 hydrate 后渲染为图/3D）
const CUSTOM_FENCE_LANGS: Record<string, string> = {
  mermaid: 'Mermaid',
  echarts: 'EChart',
  three: 'ThreeBlock'
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lang: 'zh-CN',
    title: 'AI 资讯站',
    titleTemplate: ' · AI 资讯站',
    description: '每日精选大模型与 AI 行业前沿动态',
    base: BASE,
    cleanUrls: true,
    lastUpdated: true,

    // Vite 插件：Tailwind CSS v4
    vite: {
      plugins: [tailwindcss()],
      build: {
        // 分块策略：确保重型依赖不进入首屏 chunk
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/mermaid')) return 'mermaid'
              if (id.includes('node_modules/echarts')) return 'echarts'
              if (id.includes('node_modules/three')) return 'three'
              if (id.includes('node_modules/@tsparticles')) return 'tsparticles'
              if (id.includes('node_modules/gsap')) return 'gsap'
            }
          }
        }
      }
    },

    head: [
      ['meta', { name: 'theme-color', content: '#0a0a0a' }],
      ['meta', { name: 'author', content: 'AI 资讯站' }],
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      // Open Graph 默认
      ['meta', { property: 'og:site_name', content: 'AI 资讯站' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
    ],

    // Markdown 配置：Shiki 双主题高亮
    markdown: {
      theme: { light: 'github-light', dark: 'github-dark' },
      lineNumbers: false,
      // 把 ```mermaid/echarts/three 代码块转换为 Vue 组件占位
      config(md) {
        const defaultFence = md.renderer.rules.fence!
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const lang = (token.info || '').trim().split(/\s+/)[0]
          if (CUSTOM_FENCE_LANGS[lang]) {
            // SSR 期输出源码占位（爬虫可见）；客户端 onMounted 扫描 .vp-block 动态渲染为图/3D
            const escaped = md.utils.escapeHtml(token.content)
            return `<div class="vp-block" data-lang="${lang}"><pre class="vp-block-src"><code>${escaped}</code></pre></div>`
          }
          return defaultFence(tokens, idx, options, env, self)
        }
      }
    },

    // 全站搜索：VitePress 内置 local search（minisearch，构建期建索引）
    // @ts-ignore — VitePress 1.6 类型定义未声明 search，运行时支持
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文章' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    // SSG 构建输出目录
    outDir: '.vitepress/dist',

    sitemap: {
      hostname: SITE_HOST
    }
  })
