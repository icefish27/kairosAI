// 文章正文自定义块（mermaid/echarts/three）的客户端渲染器
// fence 在 SSR 期输出 <div class="vp-block" data-lang="..."><pre>源码</pre></div>，
// 本模块在客户端 onMounted 扫描这些占位，按需 dynamic import 对应库并渲染。
// 重型库不进入首屏 bundle（均为此处的动态 import）。

export async function hydrateBlocks(root: ParentNode = document) {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>('.vp-block[data-lang]'))
  for (const block of blocks) {
    if (block.dataset.hydrated) continue
    block.dataset.hydrated = '1'
    const lang = block.dataset.lang
    const src = block.querySelector('code')?.textContent || ''
    try {
      if (lang === 'mermaid') await renderMermaid(block, src)
      else if (lang === 'echarts') await renderEChart(block, src)
      else if (lang === 'three') await renderThree(block, src)
    } catch (e) {
      console.error(`[block:${lang}] hydrate failed`, e)
    }
  }
}

async function renderMermaid(el: HTMLElement, src: string) {
  const { default: mermaid } = await import('mermaid')
  const isDark = document.documentElement.classList.contains('dark')
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose'
  })
  const { svg } = await mermaid.render(`mmd-${Math.random().toString(36).slice(2)}`, src)
  el.innerHTML = svg
}

async function renderEChart(el: HTMLElement, src: string) {
  const echarts = await import('echarts')
  const opt = JSON.parse(src)
  el.style.height = '360px'
  el.innerHTML = ''
  const isDark = document.documentElement.classList.contains('dark')
  const chart = echarts.init(el, isDark ? 'dark' : null, { renderer: 'canvas' })
  chart.setOption(opt)
  window.addEventListener('resize', () => chart.resize())
}

async function renderThree(el: HTMLElement, src: string) {
  const THREE = await import('three')
  let opt: { color?: string; shape?: string; speed?: number } = {}
  try {
    opt = JSON.parse(src)
  } catch {
    // 容错：用默认
  }
  const color = new THREE.Color(opt.color || '#2997ff')
  const speed = opt.speed ?? 0.005
  const shape = opt.shape || 'icosahedron'
  el.style.height = '320px'
  el.innerHTML = ''
  const w = el.clientWidth
  const h = 320
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(55, w / h, 0.1, 100)
  cam.position.z = 3.2
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  el.appendChild(renderer.domElement)

  let geo: THREE.BufferGeometry
  if (shape === 'torus') geo = new THREE.TorusGeometry(1.1, 0.4, 16, 64)
  else if (shape === 'globe') geo = new THREE.SphereGeometry(1.3, 32, 32)
  else if (shape === 'box') geo = new THREE.BoxGeometry(1.6, 1.6, 1.6)
  else geo = new THREE.IcosahedronGeometry(1.3, 1)

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.85 })
  )
  scene.add(mesh)

  const loop = () => {
    mesh.rotation.y += speed
    mesh.rotation.x += speed * 0.4
    renderer.render(scene, cam)
    requestAnimationFrame(loop)
  }
  loop()
}
