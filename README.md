# kairosAI · AI 资讯聚合站

每日精选大模型与 AI 行业前沿动态。纯前端 VitePress 自定义主题站，GitHub Pages 托管，GitHub Actions 自动构建部署。

## 目录结构

```
AI 资讯网站/
├── .github/workflows/
│   ├── crawl.yml              # 爬虫工作流（每天定时抓取 AI 资讯）
│   └── deploy.yml             # 部署工作流（push 到 main 自动构建部署到 GitHub Pages）
│
├── docs/                       # VitePress 站点根目录
│   ├── .vitepress/
│   │   ├── config.ts          # VitePress 主配置（base 路径、搜索、Markdown、Sitemap）
│   │   ├── theme/
│   │   │   ├── site.config.ts # ★ 站点统一配置（GitHub URL、ICP、导航、域名等，改这里一处即可）
│   │   │   ├── index.ts       # 主题入口：全局组件注册
│   │   │   ├── Layout.vue     # 全局布局：导航栏 + 暗色模式 + 页脚
│   │   │   ├── posts.data.ts  # 构建期：扫描 posts/*.md 产出文章元数据
│   │   │   ├── daily.data.ts  # 构建期：扫描 daily/*.md 产出快讯元数据
│   │   │   ├── composables/   # Vue composables（usePosts、useDaily、useBlocks）
│   │   │   ├── styles/        # CSS 设计变量 + 文章正文排版
│   │   │   └── components/     # 17 个 Vue 组件（首页/列表/时间线/文章详情等）
│   │   └── dist/               # 构建产物（gitignore，不提交）
│   │
│   ├── public/                # 静态资源（favicon、robots.txt）
│   ├── daily/                 # 爬虫产出的快讯 Markdown（type: link，仅引用原文）
│   ├── posts/                 # 原创深度文章 Markdown
│   ├── index.md               # 首页
│   ├── timeline.md            # 时间线页
│   ├── deep.md                # 深度解析页
│   └── articles.md            # 文章列表页
│
├── scripts/
│   └── crawl-ai-bot.ts        # 爬虫脚本（配置项在文件顶部 CRAWL_CONFIG）
│
├── package.json               # 依赖 + npm scripts
└── README.md                  # 本文件
```

## 快速开始

```bash
npm install          # 安装依赖
npm run docs:dev     # 启动本地开发服务器（http://localhost:5173）
npm run docs:build   # 构建静态站点到 docs/.vitepress/dist/
npm run docs:preview # 本地预览构建产物
npm run crawl        # 手动运行爬虫（需先 npm install）
```

## 站点页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Three.js 动效 + 精选 + 最新 + 统计 + 标签云 |
| 时间线 | `/timeline` | 爬虫聚合的 AI 资讯快讯（点标题跳原文） |
| 深度解析 | `/deep` | 原创深度文章列表 |
| 文章列表 | `/articles` | 关键词搜索 + 分类/标签筛选 + 排序 + 分页 |

## 内容生产

| 内容类型 | 存储路径 | 生产方式 |
|----------|----------|----------|
| 快讯 | `docs/daily/*.md` | 爬虫自动抓取（见下方爬虫章节） |
| 深度文章 | `docs/posts/*.md` | 手动或 AI 定时任务撰写 |

文章 Frontmatter 约定见 `docs/posts/` 现有示例文件。

## 爬虫机制

### 触发方式

爬虫通过 GitHub Actions 定时运行，配置在 `.github/workflows/crawl.yml`：

- **定时触发**：每天 UTC 0:00（北京时间 08:00），cron 表达式 `0 0 * * *`
- **手动触发**：在 GitHub 仓库的 Actions 页面 → Crawl daily news → Run workflow

> GitHub cron 不保证准时，可能延迟数分钟到数十分钟。

### 运行流程

```
cron 定时触发 / 手动触发
  → 检出代码
  → 安装 Node.js 22
  → 执行 npx tsx scripts/crawl-ai-bot.ts
    → 抓取 ai-bot.cn/daily-ai-news
    → 正则提取 <h2><a href="...">标题</a></h2> 条目
    → 读取 docs/daily/ 已有 sourceUrl 去重
    → 为新条目生成 docs/daily/YYYY-MM-DD-{slug}.md
  → 如有新内容：git commit & push（自动触发 deploy.yml 部署）
  → 如无新内容：跳过
```

### 爬虫配置

爬虫的可配置项集中在 `scripts/crawl-ai-bot.ts` 文件顶部：

```ts
const CRAWL_CONFIG = {
  sourceUrl: 'https://ai-bot.cn/daily-ai-news/',  // 数据源 URL
  userAgent: 'Mozilla/5.0 (compatible; kairosAI-bot/1.0)',  // 爬虫 UA
  outputDir: 'docs/daily',          // 快讯输出目录
  defaultCategory: '资讯',           // 默认分类
  defaultType: 'link'               // 默认类型（link = 仅引用原文）
}
```

### 修改爬虫定时频率

编辑 `.github/workflows/crawl.yml` 的 cron 表达式：

```yaml
schedule:
  - cron: '0 0 * * *'    # 每天 UTC 0:00 = 北京 08:00
  # 改为每 6 小时一次：
  # - cron: '0 */6 * * *'
  # 改为每天 UTC 2:00（北京 10:00）：
  # - cron: '0 2 * * *'
```

## 配置指南

所有站点级配置统一在 `docs/.vitepress/theme/site.config.ts`：

```ts
export const SITE_CONFIG = {
  base: '/kairosAI/',                              // GitHub Pages base 路径
  siteHost: 'https://example.com',                 // 站点正式域名（用于 sitemap）
  githubUrl: 'https://github.com/icefish27/kairosAI',  // GitHub 仓库地址
  icp: '京ICP备xxxx号',                            // ICP 备案号（留空则页脚不显示）
  copyright: '© 2026 AI 资讯站',                   // 版权声明
  navItems: [...]                                  // 导航栏菜单项
}
```

修改以上任意配置只需改 `site.config.ts` 一处，所有组件自动引用。

### VitePress 构建配置

`docs/.vitepress/config.ts` 管理构建层面配置：Tailwind CSS 插件、Rollup 分块策略、Shiki 双主题高亮、代码块渲染（mermaid/echarts/three）、全站搜索、Sitemap。base 路径和站点域名从 `site.config.ts` 导入。

## 部署

部署通过 `.github/workflows/deploy.yml` 自动完成：

- **触发**：push 到 main 分支（包括爬虫 push 新快讯后自动连带触发）
- **流程**：检出代码 → npm ci 安装依赖 → VitePress 构建 → 部署到 GitHub Pages
- **产物目录**：`docs/.vitepress/dist/`

首次部署前需在 GitHub 仓库 Settings → Pages → Source 选择 "GitHub Actions"。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | VitePress 1.6 | 静态站点生成器，完全自定义主题 |
| UI | Vue 3 + TypeScript | 组件开发 |
| 样式 | Tailwind CSS v4 | 原子化 CSS |
| 动画 | GSAP | 入场动效 |
| 图表 | ECharts / Mermaid | 数据可视化（动态 import，不进首屏 bundle） |
| 3D | Three.js | 首页 wireframe 球（动态 import） |
| 粒子 | @tsparticles | 粒子背景（动态 import） |
| 部署 | GitHub Pages + Actions | CI/CD |
