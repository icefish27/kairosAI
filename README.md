# kairosAI · AI 资讯聚合站

每日精选大模型与 AI 行业前沿动态。纯前端 VitePress 自定义主题站，GitHub Pages 托管，GitHub Actions 自动构建部署。

## 本地开发

```bash
npm install
npm run docs:dev      # 本地开发预览
npm run docs:build    # 构建
npm run docs:preview # 预览构建产物
```

## 站点结构

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 | `/` | Hero 动效 + 精选 + 最新 + 统计 |
| 时间线 | `/timeline` | 爬虫聚合的 AI 资讯快讯（点标题跳原文） |
| 深度解析 | `/deep` | AI 定时任务写的原创深度文章 |
| 文章列表 | `/articles` | 原创文章列表，支持筛选/排序 |

## 内容生产

- **时间线**：GitHub Actions cron 定时爬虫，聚合 AI 资讯快讯（`docs/daily/`）
- **深度解析**：workbuddy 多个定时 AI 任务，写原创深度文章（`docs/posts/`）
- 文章 frontmatter 约定见 `docs/posts/` 现有示例

## 技术栈

VitePress 1.6（完全自定义主题）+ Tailwind CSS v4 + mermaid / echarts / three / @tsparticles / gsap（全部动态加载，首屏 bundle 不含重型库）。
