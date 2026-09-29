import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * The terrain: data that calms as you read. A fixed layer behind the opening of
 * the page (the hero and the pinned "How I work" story, inside [data-intro]).
 * It starts turbulent — an extra octave of noise, two scanlines — then, as the
 * reader moves through the story, flows faster ("Automate the flow") and
 * settles into orderly parallel lines ("Make it readable").
 *  - Story mode ([data-intro][data-story="on"], desktop pin): calm follows
 *    progress through the whole intro wrapper, pin spacer included.
 *  - Otherwise: calm follows the hero scrolling out.
 * Decorative (aria-hidden, pointer-events:none). One static frame under reduced
 * motion; hidden + paused once the intro is offscreen; 30fps on small devices;
 * full dispose + forced context loss on unmount. No WebGL → the canvas stays dark.
 */

// Stored unconverted: the raw ShaderMaterial writes gl_FragColor straight to
// the sRGB canvas (no colorspace_fragment), so these hexes render as the tokens.
const HI = new THREE.Color().setHex(0xf3f3ef, THREE.LinearSRGBColorSpace) // = ink
const LO = new THREE.Color().setHex(0x55554f, THREE.LinearSRGBColorSpace) // far-row atmosphere

// A composed moment for the reduced-motion still: both scanlines mid-field.
const STATIC_T = 8.8

const LINE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uCalm;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vScan;
  varying float vScanB;
  varying float vDepth;
  varying float vSwell;

  float surface(vec2 p, float t, float mess) {
    float h = 0.0;
    h += 0.55 * sin(p.x * 0.45 + t * 0.50) * cos(p.y * 0.55 - t * 0.30);
    h += 0.25 * sin(p.x * 1.10 - t * 0.35) * sin(p.y * 1.40 + t * 0.45);
    h += 0.12 * sin(p.x * 2.30 + t * 0.80) * cos(p.y * 2.10 + t * 0.60);
    // the "messy" octave — only present before the data calms
    h += mess * 0.20 * sin(p.x * 3.70 + t * 1.10) * cos(p.y * 3.10 - t * 0.90);
    return h;
  }

  void main() {
    vec3 pos = position;
    float calm = clamp(uCalm, 0.0, 1.0);
    float settle = 1.0 - 0.92 * calm; // amplitude left once calm
    float t = uTime;
    pos.y = surface(vec2(position.x, position.z), t, 1.0 - calm) * settle;

    // pointer raises the surface locally — a swell that quiets with the data
    float md = distance(vec2(position.x, position.z), uMouse);
    float swell = smoothstep(2.2, 0.0, md) * (1.0 - 0.8 * calm);
    pos.y += 0.55 * swell;
    vSwell = swell;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // nearer rows brighter; edges fade so the surface dissolves, not crops
    float depth = smoothstep(-7.0, 1.0, position.z);
    vDepth = depth;
    float edge = 1.0 - smoothstep(6.5, 8.8, abs(position.x));
    vAlpha = mix(0.05, 0.34, depth) * edge;

    // two scanlines at incommensurate rates (the crossing precesses); both
    // fade out as the data calms
    float scanZ = mix(-6.5, 0.8, fract(t * 0.035));
    vScan = smoothstep(0.30, 0.0, abs(position.z - scanZ)) * (1.0 - calm);
    float scanX = mix(-9.0, 9.0, fract(t * 0.021 + 0.5));
    vScanB = smoothstep(0.45, 0.0, abs(position.x - scanX)) * (1.0 - calm);
  }
`

const LINE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uHi;
  uniform vec3 uLo;
  varying float vAlpha;
  varying float vScan;
  varying float vScanB;
  varying float vDepth;
  varying float vSwell;
  void main() {
    vec3 base = mix(uLo, uHi, smoothstep(0.0, 0.75, vDepth));
    base = mix(base, uHi, vSwell * 0.45);
    vec3 color = mix(base, uHi, vScan);
    color = mix(color, uHi, vScanB * 0.65 * (1.0 - vScan * 0.6));
    float crossing = vScan * vScanB;
    // stay below 1.0 so per-pixel additive stacking can't flat-white the type
    color = min(color + uHi * crossing * 0.8, vec3(0.96));
    float boost = (vScan * 1.5 + vScanB * 1.0 + crossing * 1.6) * mix(0.30, 1.0, vDepth);
    float a = min(vAlpha * (1.0 + boost), 0.80);
    gl_FragColor = vec4(color, a);
  }
`

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (k: number) => k * k * (3 - 2 * k)

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
    const COLS = 150 // vertices are cheap; coarse columns look jagged on phones
    // 9.5ms floor renders every frame up to ~100Hz (120Hz → 60, 144Hz → 72); small devices hold 30fps
    const MIN_DT = isSmall ? 1 / 30 - 0.002 : 0.0095

    const currentDpr = () => Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75)
    renderer.setPixelRatio(currentDpr())
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.className = 'pointer-events-none absolute inset-0 h-full w-full'
    // fades in on the first frame (the global reduced-motion rule makes it instant)
    renderer.domElement.style.opacity = '0'
    renderer.domElement.style.transition = 'opacity 1.4s cubic-bezier(0.22,1,0.36,1)'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)
    camera.position.set(0, 2.4, 7.5)

    // Contour rows: line segments along x, stacked in z; y computed in-shader.
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
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCalm: { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uHi: { value: HI },
        uLo: { value: LO },
      },
    })
    scene.add(new THREE.LineSegments(geo, mat))

    const mouse = { x: 99, y: 99, tx: 99, ty: 99 }
    const raycaster = new THREE.Raycaster()
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const ndc = new THREE.Vector2()
    const hit = new THREE.Vector3()

    function size() {
      const d = currentDpr() // re-read: monitor moves / zoom change DPR
      if (d !== renderer.getPixelRatio()) renderer.setPixelRatio(d)
      const r = host!.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // portrait: pitch down so the band sits behind the name, clear of the tagline
      camera.lookAt(0, camera.aspect < 1 ? -1.1 : 0, -1.5)
    }

    const wrapper = host.closest<HTMLElement>('[data-intro]')
    const hero = wrapper?.querySelector<HTMLElement>('[data-hero]') ?? null
    function calmNow(): number {
      if (wrapper && wrapper.dataset.story === 'on') {
        const r = wrapper.getBoundingClientRect()
        const p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight))
        return smooth(clamp01((p - 0.04) / 0.84))
      }
      const r = (hero ?? host!).getBoundingClientRect()
      return smooth(clamp01(-r.top / Math.max(1, r.height * 0.55)))
    }

    let shown = false
    function render(timeSec: number, calm: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.07
      mouse.y += (mouse.ty - mouse.y) * 0.07
      mat.uniforms.uTime.value = timeSec
      mat.uniforms.uCalm.value = calm
      ;(mat.uniforms.uMouse.value as THREE.Vector2).set(mouse.x, mouse.y)
      renderer.render(scene, camera)
      if (!shown) {
        shown = true
        requestAnimationFrame(() => {
          renderer.domElement.style.opacity = '1'
        })
      }
    }

    // Simulation time advances faster mid-story ("Automate the flow"): speed is
    // a bell around calm ≈ 0.55, integrated per frame so it never jumps.
    let sim = 0
    let lastT = -1
    let last = 0
    let onScreen = true
    let ticking = false
    const tick = (time: number) => {
      if (time - last < MIN_DT) return
      last = time
      const dt = lastT < 0 ? 0 : Math.min(0.1, time - lastT)
      lastT = time
      const calm = calmNow()
      const speed = 1 + 1.4 * Math.exp(-(((calm - 0.55) / 0.17) ** 2))
      sim += dt * speed
      render(sim, calm)
    }
    function start() {
      if (reduced || ticking || !onScreen || document.hidden) return
      lastT = -1
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
      // raycast onto the ground plane so the swell lands under the cursor
      ndc.set(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1))
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(ground, hit) && hit.z > Z0 - 1) {
        mouse.tx = hit.x
        mouse.ty = hit.z
      } else onLeave()
    }
    function onLeave() {
      mouse.tx = 99
      mouse.ty = 99
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    const staticFrame = () => render(STATIC_T, 0) // the turbulent "before", composed
    const onRestore = () => {
      size()
      if (reduced) staticFrame()
    }

    size()
    if (reduced) {
      staticFrame()
    } else {
      start()
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('blur', onLeave)
      document.documentElement.addEventListener('mouseleave', onLeave)
    }
    document.addEventListener('visibilitychange', onVisibility)
    renderer.domElement.addEventListener('webglcontextrestored', onRestore)

    const ro = new ResizeObserver(() => {
      size() // setSize clears the buffer — repaint so a resize never shows blank
      if (reduced) staticFrame()
      else if (ticking) render(sim, calmNow())
    })
    ro.observe(host)

    // The host is fixed (always "in view"), so watch the intro wrapper instead:
    // once the page scrolls past the story, hide and pause the layer.
    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          const lastEntry = entries[entries.length - 1] // batches arrive oldest-first
          onScreen = lastEntry?.isIntersecting ?? true
          host!.style.visibility = onScreen ? '' : 'hidden'
          if (onScreen) start()
          else stop()
        },
        { threshold: 0 },
      )
      io.observe(wrapper ?? host)
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
