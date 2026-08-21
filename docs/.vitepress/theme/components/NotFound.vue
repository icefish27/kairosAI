<script setup lang="ts">
import { withBase } from 'vitepress'
import { useRouter } from 'vitepress'
const router = useRouter()
function goHome() {
  router.go('/')
}
</script>

<template>
  <div class="nf container">
    <div class="nf-code">404</div>
    <h1 class="nf-title">页面走丢了</h1>
    <p class="nf-desc">你访问的页面不存在，或者已被移除。</p>
    <div class="nf-actions">
      <button class="btn primary" @click="goHome">返回首页</button>
      <a class="btn ghost" :href="withBase('/timeline')">看时间线</a>
      <a class="btn ghost" :href="withBase('/deep')">深度解析</a>
    </div>
  </div>
</template>

<style scoped>
.nf {
  text-align: center;
  padding: 100px 24px 60px;
  max-width: 560px;
  margin: 0 auto;
}
.nf-code {
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  color: var(--c-accent);
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}
.nf-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--c-text);
}
.nf-desc {
  color: var(--c-text-mute);
  margin: 0 0 32px;
}
.nf-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 22px;
  border-radius: var(--r-md);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn.primary {
  background: var(--c-accent);
  color: #fff;
}
.btn.primary:hover {
  background: var(--c-accent-soft);
}
.btn.ghost {
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text-soft);
}
.btn.ghost:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
}
</style>
