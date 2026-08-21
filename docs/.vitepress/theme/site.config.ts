/**
 * 站点统一配置 —— 所有站点级常量集中在此，组件和 VitePress config 共用。
 * 修改站点信息只需改这一个文件。
 */

export const SITE_CONFIG = {
  /** GitHub Pages 的 base 路径。仓库名为 kairosAI 则为 '/kairosAI/'；若为 <user>.github.io 根站点则改为 '/' */
  base: '/kairosAI/',

  /** 站点正式域名（用于 sitemap、OG 等）。部署到 GitHub Pages 默认域名时改为 'https://<user>.github.io/kairosAI' */
  siteHost: 'https://example.com',

  /** GitHub 仓库地址 */
  githubUrl: 'https://github.com/icefish27/kairosAI',

  /** ICP 备案号（无备案则留空字符串，页脚不显示） */
  icp: '京ICP备xxxx号',

  /** 版权声明文案 */
  copyright: '© 2026 AI 资讯站',

  /** 顶导航菜单项 */
  navItems: [
    { text: '首页', link: '/' },
    { text: 'AI 时间线', link: '/timeline' },
    { text: '深度解析', link: '/deep' },
    { text: '文章列表', link: '/articles' }
  ]
} as const
