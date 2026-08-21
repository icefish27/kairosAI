<script setup lang="ts">
const GITHUB_URL = 'https://github.com/icefish27/kairosAI'
</script>

<template>
  <section class="cta">
    <div class="cta-inner">
      <div class="cta-text">
        <h2>订阅 AI 资讯每日更新</h2>
        <p>第一时间获取大模型与 AI 行业前沿动态</p>
      </div>
      <div class="cta-btns">
        <a class="btn primary" href="/rss.xml">RSS 订阅</a>
        <a class="btn ghost" :href="GITHUB_URL" target="_blank" rel="noopener">GitHub 关注</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  background: var(--c-bg-alt);
  color: #fff;
}
.cta-inner {
  max-width: var(--container);
  margin: 0 auto;
  padding: 56px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.cta-text h2 {
  font-size: 1.6em;
  margin: 0 0 8px;
}
.cta-text p {
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
}
.cta-btns {
  display: flex;
  gap: 12px;
}
.btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 22px;
  border-radius: var(--r-md);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}
.btn.ghost:hover {
  border-color: #fff;
}
</style>
