import type { Theme } from 'vitepress'
import Layout from './Layout.vue'

import 'element-plus/dist/index.css'
import './styles/index.css'
import './styles/prose.css'

// 页面级组件（在 .md 中直接以标签使用）
import HomeHero from './components/HomeHero.vue'
import HomeStats from './components/HomeStats.vue'
import HomeFeatured from './components/HomeFeatured.vue'
import HomeLatest from './components/HomeLatest.vue'
import HomeCategory from './components/HomeCategory.vue'
import HomeTagCloud from './components/HomeTagCloud.vue'
import SubscribeCTA from './components/SubscribeCTA.vue'
import ArticleList from './components/ArticleList.vue'
import ArticleCard from './components/ArticleCard.vue'
import Timeline from './components/Timeline.vue'
import PostLayout from './components/PostLayout.vue'
import LinkLayout from './components/LinkLayout.vue'
import NotFound from './components/NotFound.vue'
import ParticlesBg from './components/ParticlesBg.vue'
import Mermaid from './components/Mermaid.vue'
import EChart from './components/EChart.vue'
import ThreeBlock from './components/ThreeBlock.vue'
import SearchButton from './components/SearchButton.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    const comps = {
      HomeHero,
      HomeStats,
      HomeFeatured,
      HomeLatest,
      HomeCategory,
      HomeTagCloud,
      SubscribeCTA,
      ArticleList,
      ArticleCard,
      Timeline,
      PostLayout,
      LinkLayout,
      ParticlesBg,
      Mermaid,
      EChart,
      ThreeBlock,
      SearchButton,
      NotFound
    }
    for (const [name, comp] of Object.entries(comps)) {
      app.component(name, comp)
    }
  }
} satisfies Theme
