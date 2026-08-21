<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ code: string }>()
const decoded = decodeURIComponent(props.code || '')
const el = ref<HTMLElement | null>(null)
let raf = 0
let renderer: any = null
let ro: ResizeObserver | null = null

interface Opt {
  color?: string
  shape?: 'icosahedron' | 'torus' | 'globe' | 'box'
  speed?: number
}
function parseOpt(): Opt {
  try {
    return JSON.parse(decoded)
  } catch {
    return {}
  }
}

onMounted(async () => {
  if (!el.value) return
  const THREE = await import('three')
  const opt = parseOpt()
  const color = new THREE.Color(opt.color || '#2997ff')
  const speed = opt.speed ?? 0.005
  const shape = opt.shape || 'icosahedron'

  const w = el.value.clientWidth
  const h = el.value.clientHeight || 320

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100)
  camera.position.z = 3.2
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  el.value.appendChild(renderer.domElement)

  let geo: THREE.BufferGeometry
  if (shape === 'torus') geo = new THREE.TorusGeometry(1.1, 0.4, 16, 64)
  else if (shape === 'globe') geo = new THREE.SphereGeometry(1.3, 32, 32)
  else if (shape === 'box') geo = new THREE.BoxGeometry(1.6, 1.6, 1.6)
  else geo = new THREE.IcosahedronGeometry(1.3, 1)

  const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.85 })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)

  // 散点粒子点缀
  const pGeo = new THREE.BufferGeometry()
  const N = 200
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 6
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pMat = new THREE.PointsMaterial({ color, size: 0.03, transparent: true, opacity: 0.6 })
  scene.add(new THREE.Points(pGeo, pMat))

  const loop = () => {
    mesh.rotation.y += speed
    mesh.rotation.x += speed * 0.4
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  loop()

  ro = new ResizeObserver(() => {
    if (!el.value) return
    const nw = el.value.clientWidth
    const nh = el.value.clientHeight || 320
    camera.aspect = nw / nh
    camera.updateProjectionMatrix()
    renderer.setSize(nw, nh)
  })
  ro.observe(el.value)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  renderer?.dispose()
})
</script>

<template>
  <div ref="el" class="vp-three">
    <!-- SSR 占位 -->
    <div class="vp-block-fallback">
      <pre><code>{{ decoded }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.vp-three {
  margin: 1.5em 0;
  width: 100%;
  height: 320px;
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--c-bg-soft);
}
.vp-three :deep(canvas) {
  display: block;
}
</style>
