/// <reference types="vitepress/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// VitePress 的 createContentLoader 生成的 .data.ts 文件在构建期产出 data 导出，
// 源码中只有 default export，TypeScript 不认识运行时的 data 导出，需声明。
declare module '*.data' {
  const data: any
  export { data }
  export default data
}
