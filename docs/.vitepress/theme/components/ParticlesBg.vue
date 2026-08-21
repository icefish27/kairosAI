<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 粒子背景：用于首页 Hero。客户端动态 import @tsparticles/slim，SSG 安全
const el = ref<HTMLElement | null>(null)
let observer: MutationObserver | null = null

onMounted(async () => {
  if (!el.value) return
  const { tsParticles } = await import('@tsparticles/engine')
  const { loadSlim } = await import('@tsparticles/slim')
  await loadSlim(tsParticles)

  const isDark = document.documentElement.classList.contains('dark')
  await tsParticles.load({
    id: `particles-${Math.random().toString(36).slice(2)}`,
    element: el.value,
    options: {
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      particles: {
        number: { value: 60, density: { enable: true } },
        color: { value: isDark ? '#5bb6ff' : '#0066cc' },
        opacity: { value: { min: 0.1, max: 0.6 } },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 130,
          color: isDark ? '#5bb6ff' : '#0066cc',
          opacity: 0.25
        },
        move: { enable: true, speed: 0.6, outModes: { default: 'out' } }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 140, links: { opacity: 0.4 } } }
      }
    }
  })

  // 暗色切换重载
  observer = new MutationObserver(async () => {
    if (!el.value) return
    el.value.innerHTML = ''
    const dark = document.documentElement.classList.contains('dark')
    await tsParticles.load({
      id: `particles-${Math.random().toString(36).slice(2)}`,
      element: el.value,
      options: {
        fullScreen: { enable: false },
        background: { color: 'transparent' },
        particles: {
          number: { value: 60 },
          color: { value: dark ? '#5bb6ff' : '#0066cc' },
          opacity: { value: { min: 0.1, max: 0.6 } },
          size: { value: { min: 1, max: 3 } },
          links: { enable: true, distance: 130, color: dark ? '#5bb6ff' : '#0066cc', opacity: 0.25 },
          move: { enable: true, speed: 0.6 }
        }
      }
    })
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div ref="el" class="particles-bg" aria-hidden="true" />
</template>

<style scoped>
.particles-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
