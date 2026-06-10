import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * The WebGL hero: a contour surface of thin brand-cream lines — a data terrain —
 * flowing slowly under the nameplate, lifted by the pointer, with a single red
 * scanline sweeping the rows. Structured and drafted, not particles.
 * Decorative (aria-hidden, pointer-events:none). One static frame under reduced
 * motion; pauses offscreen/hidden; 30fps on small devices; full dispose +
 * forced context loss on unmount. No WebGL → the dark canvas stands.
 */

// Frozen copies of the brand tokens (shaders can't read the tailwind config).
const CREAM = new THREE.Color('#f3f3ef')
const RED = new THREE.Color('#ff2d16')

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vScan;

  float surface(vec2 p, float t) {
    float h = 0.0;
    h += 0.55 * sin(p.x * 0.45 + t * 0.50) * cos(p.y * 0.55 - t * 0.30);
    h += 0.25 * sin(p.x * 1.10 - t * 0.35) * sin(p.y * 1.40 + t * 0.45);
    h += 0.12 * sin(p.x * 2.30 + t * 0.80) * cos(p.y * 2.10 + t * 0.60);
    return h;
  }

  void main() {
    vec3 pos = position;
    float t = uTime + uScroll * 2.0; // scroll advances the flow
    pos.y = surface(vec2(position.x, position.z), t);

    // pointer raises the surface locally — a swell, not a dent
    float md = distance(vec2(position.x, position.z), uMouse);
    pos.y += 0.55 * smoothstep(2.2, 0.0, md);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // nearer rows brighter; edges fade so the surface dissolves, not crops
    float depth = smoothstep(-7.0, 1.0, position.z);
    float edge = 1.0 - smoothstep(6.5, 8.8, abs(position.x));
    vAlpha = mix(0.05, 0.34, depth) * edge;

    // one red scanline sweeping slowly across the rows
    float scanZ = mix(-6.5, 0.8, fract(t * 0.035));
    vScan = smoothstep(0.30, 0.0, abs(position.z - scanZ));
  }
`

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uCream;
  uniform vec3 uRed;
  varying float vAlpha;
  varying float vScan;
  void main() {
    vec3 color = mix(uCream, uRed, vScan);
    float a = vAlpha * (1.0 + vScan * 1.6);
    gl_FragColor = vec4(color, a);
  }
`

export function ThreeHero() {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      return // no WebGL — the dark canvas stands on its own
    }

    // Tier by device class, not instantaneous width (a landscape phone is still a phone).
    const isSmall = Math.min(window.innerWidth, window.innerHeight) < 768 || matchMedia('(pointer: coarse)').matches
    const ROWS = isSmall ? 30 : 52
    const COLS = isSmall ? 90 : 150
    const FRAME_INTERVAL = isSmall ? 1 / 30 : 1 / 60 // throttle inside OUR tick — never the shared ticker

    const currentDpr = () => Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75)
    renderer.setPixelRatio(currentDpr())
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.className = 'pointer-events-none absolute inset-0 h-full w-full'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)
    camera.position.set(0, 2.4, 7.5)
    camera.lookAt(0, 0, -1.5)

    // Contour rows: line segments along x, stacked in z. position.y is computed
    // in the vertex shader, so the geometry itself is flat.
    const X0 = -9, X1 = 9, Z0 = -7, Z1 = 1
    const verts = new Float32Array(ROWS * (COLS + 1) * 3)
    let vi = 0
    for (let r = 0; r < ROWS; r++) {
      const z = Z0 + ((Z1 - Z0) * r) / (ROWS - 1)
      for (let c = 0; c <= COLS; c++) {
        verts[vi++] = X0 + ((X1 - X0) * c) / COLS
        verts[vi++] = 0
        verts[vi++] = z
      }
    }
    const indices: number[] = []
    for (let r = 0; r < ROWS; r++) {
      const base = r * (COLS + 1)
      for (let c = 0; c < COLS; c++) indices.push(base + c, base + c + 1)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    geo.setIndex(indices)

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uCream: { value: CREAM },
        uRed: { value: RED },
      },
    })
    scene.add(new THREE.LineSegments(geo, mat))

    const mouse = { x: 99, y: 99, tx: 99, ty: 99 }

    function size() {
      const d = currentDpr() // re-read: monitor moves / zoom change DPR
      if (d !== renderer.getPixelRatio()) renderer.setPixelRatio(d)
      const r = host!.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    function render(timeSec: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.07
      mouse.y += (mouse.ty - mouse.y) * 0.07
      mat.uniforms.uTime.value = timeSec
      mat.uniforms.uScroll.value = Math.min(window.scrollY / 900, 2)
      ;(mat.uniforms.uMouse.value as THREE.Vector2).set(mouse.x, mouse.y)
      renderer.render(scene, camera)
    }

    let onScreen = true
    let ticking = false
    let last = 0
    const tick = (time: number) => {
      if (time - last < FRAME_INTERVAL) return
      last = time
      render(time)
    }
    function start() {
      if (reduced || ticking || !onScreen || document.hidden) return
      gsap.ticker.add(tick)
      ticking = true
    }
    function stop() {
      if (!ticking) return
      gsap.ticker.remove(tick)
      ticking = false
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return // touch would park a permanent swell
      const r = host!.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      // approximate viewport → surface mapping (it's an ambient effect)
      const nx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1
      const nyTop = (e.clientY - r.top) / Math.max(1, r.height) // 0 top … 1 bottom
      mouse.tx = nx * 7.5
      mouse.ty = Z0 + (Z1 - Z0) * nyTop // top of screen = far rows
    }
    const onLeave = () => {
      mouse.tx = 99
      mouse.ty = 99
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    const onRestore = () => {
      size()
      if (reduced) render(5)
    }

    size()
    if (reduced) {
      render(5) // one composed static frame
    } else {
      start()
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('blur', onLeave)
      document.documentElement.addEventListener('mouseleave', onLeave)
    }
    document.addEventListener('visibilitychange', onVisibility)
    renderer.domElement.addEventListener('webglcontextrestored', onRestore)

    const ro = new ResizeObserver(() => {
      size()
      if (reduced) render(5)
    })
    ro.observe(host)

    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          const lastEntry = entries[entries.length - 1] // batches arrive oldest-first
          onScreen = lastEntry?.isIntersecting ?? true
          if (onScreen) start()
          else stop()
        },
        { threshold: 0 },
      )
      io.observe(host)
    }

    return () => {
      stop()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('blur', onLeave)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.domElement.removeEventListener('webglcontextrestored', onRestore)
      ro.disconnect()
      io?.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.forceContextLoss() // don't wait for GC to free the GL context
      renderer.domElement.remove()
    }
  }, [reduced])

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />
}
