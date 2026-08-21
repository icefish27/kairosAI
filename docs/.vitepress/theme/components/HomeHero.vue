<script setup lang="ts">
import { withBase } from 'vitepress'
import { ref, onMounted, onUnmounted } from 'vue'
import ParticlesBg from './ParticlesBg.vue'

const threeEl = ref<HTMLElement | null>(null)
let raf = 0
let renderer: any = null
let ro: ResizeObserver | null = null

onMounted(async () => {
  // 背景三维 wireframe 球（桌面端，移动端关闭省性能）
  if (threeEl.value && window.innerWidth > 768) {
    const THREE = await import('three')
    const el = threeEl.value
    const w = el.clientWidth
    const h = el.clientHeight
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    cam.position.z = 5
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    el.appendChild(renderer.domElement)

    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.7, 2),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#2997ff'),
        wireframe: true,
        transparent: true,
        opacity: 0.45
      })
    )
    scene.add(mesh)

    const pts = new THREE.Points(
      new THREE.IcosahedronGeometry(2.5, 1),
      new THREE.PointsMaterial({
        color: new THREE.Color('#5bb6ff'),
        size: 0.04,
        transparent: true,
        opacity: 0.6
      })
    )
    scene.add(pts)

    const loop = () => {
      mesh.rotation.y += 0.003
      mesh.rotation.x += 0.001
      pts.rotation.y -= 0.0015
      renderer.render(scene, cam)
      raf = requestAnimationFrame(loop)
    }
    loop()

    ro = new ResizeObserver(() => {
      if (!el) return
      const nw = el.clientWidth
      const nh = el.clientHeight
      cam.aspect = nw / nh
      cam.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    })
    ro.observe(el)
  }

  // GSAP 入场动效
  const { gsap } = await import('gsap')
  gsap.from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' })
  gsap.from('.hero-title', { y: 30, opacity: 0, duration: 0.9, delay: 0.1, ease: 'power3.out' })
  gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.8, delay: 0.25, ease: 'power3.out' })
  gsap.from('.hero-cta', {
    y: 20,
    opacity: 0,
    duration: 0.7,
    delay: 0.4,
    stagger: 0.12,
    ease: 'power3.out'
  })
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  renderer?.dispose?.()
})
</script>

<template>
  <section class="hero">
    <ParticlesBg class="hero-particles" />
    <div ref="threeEl" class="hero-three" aria-hidden="true" />
    <div class="hero-content container">
      <div class="hero-eyebrow">AI 资讯 · 聚合站</div>
      <h1 class="hero-title">每日精选大模型<br />与 AI 行业前沿动态</h1>
      <p class="hero-sub">由 AI 驱动生产，文件驱动发布，零成本托管</p>
      <div class="hero-actions">
        <a class="hero-cta btn primary" :href="withBase('/articles')">浏览文章</a>
        <a class="hero-cta btn ghost" :href="withBase('/timeline')">查看时间线</a>
      </div>
      <div class="hero-scroll">↓ 继续滚动</div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  background: var(--c-bg-alt);
  color: #fff;
  min-height: 78vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.hero-three {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  height: 480px;
  z-index: 1;
  opacity: 0.8;
}
.hero-three :deep(canvas) {
  display: block;
}
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
}
.hero-eyebrow {
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-accent-soft);
  margin-bottom: 20px;
}
.hero-title {
  font-size: clamp(2.2em, 6vw, 4em);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 20px;
}
.hero-sub {
  font-size: clamp(15px, 2vw, 19px);
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 36px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  border-radius: var(--r-md);
  font-size: 16px;
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
.hero-scroll {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
@media (max-width: 768px) {
  .hero {
    min-height: 70vh;
  }
}
</style>
