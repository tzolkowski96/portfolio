import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * The WebGL hero, grayscale edition: a contour surface whose near rows glow
 * white and far rows sink into dark warm gray, swept by a primary scanline and
 * a slower perpendicular sweep (incommensurate rates — the bright crossing
 * precesses across the field). White/gray plurality rings ride the surface and
 * gather into a seven-circle cluster as the hero scrub progresses; the camera
 * dollies into the field on the same scrub channel (__heroProgress).
 * Decorative (aria-hidden, pointer-events:none). One static frame under reduced
 * motion; pauses offscreen/hidden; 30fps on small devices; full dispose +
 * forced context loss on unmount. No WebGL → the dark canvas stands.
 */

// Frozen copies of the brand tokens (shaders can't read the tailwind config).
const HI = new THREE.Color('#f3f3ef') // = ink: near rows + scan glow
const MID = new THREE.Color('#a3a39c') // = label: ring alternate
const LO = new THREE.Color('#55554f') // far-row sink — atmosphere on #121211

// At t=8.8 the red scanline sits ≈ z -4.25 and the blue ≈ x +3.3 — both visibly
// mid-field, so the reduced-motion frozen frame tells the whole duotone story.
const STATIC_T = 8.8

type WindowWithHero = Window & { __heroProgress?: number }

// Single source of truth for the surface — shared by the line and point shaders.
const SURFACE_GLSL = /* glsl */ `
  float surface(vec2 p, float t) {
    float h = 0.0;
    h += 0.55 * sin(p.x * 0.45 + t * 0.50) * cos(p.y * 0.55 - t * 0.30);
    h += 0.25 * sin(p.x * 1.10 - t * 0.35) * sin(p.y * 1.40 + t * 0.45);
    h += 0.12 * sin(p.x * 2.30 + t * 0.80) * cos(p.y * 2.10 + t * 0.60);
    return h;
  }
`

const LINE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vScan;
  varying float vScanB;
  varying float vDepth;
  varying float vSwell;
  ${SURFACE_GLSL}

  void main() {
    vec3 pos = position;
    float t = uTime + uScroll * 2.0; // scroll advances the flow
    pos.y = surface(vec2(position.x, position.z), t);

    // pointer raises the surface locally — a swell, not a dent
    float md = distance(vec2(position.x, position.z), uMouse);
    float swell = smoothstep(2.2, 0.0, md);
    pos.y += 0.55 * swell;
    vSwell = swell;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // nearer rows brighter; edges fade so the surface dissolves, not crops
    float depth = smoothstep(-7.0, 1.0, position.z);
    vDepth = depth;
    float edge = 1.0 - smoothstep(6.5, 8.8, abs(position.x));
    vAlpha = mix(0.05, 0.34, depth) * edge;

    // primary scanline sweeping the rows
    float scanZ = mix(-6.5, 0.8, fract(t * 0.035));
    vScan = smoothstep(0.30, 0.0, abs(position.z - scanZ));

    // secondary perpendicular sweep — 0.021 vs 0.035 is incommensurate, so the
    // bright crossing precesses across the field instead of repeating in place
    float scanX = mix(-9.0, 9.0, fract(t * 0.021 + 0.5));
    vScanB = smoothstep(0.45, 0.0, abs(position.x - scanX));
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
    // far rows sink into dark gray — atmospheric depth, not just alpha
    vec3 base = mix(uLo, uHi, smoothstep(0.0, 0.75, vDepth));
    base = mix(base, uHi, vSwell * 0.45); // the pointer swell brightens the surface
    vec3 color = mix(base, uHi, vScan);
    color = mix(color, uHi, vScanB * 0.65 * (1.0 - vScan * 0.6));
    float crossing = vScan * vScanB;
    // CLAMP LAW (monochrome): sit BELOW 1.0 so per-pixel additive stacking of
    // interleaved far rows can never flat-white into the knockout counters
    color = min(color + uHi * crossing * 0.8, vec3(0.96));
    // depth-attenuate the boost — the per-fragment alpha cap can't bound the
    // stacked far rows that interleave per pixel near the horizon
    float boost = (vScan * 1.5 + vScanB * 1.0 + crossing * 1.6) * mix(0.30, 1.0, vDepth);
    float a = min(vAlpha * (1.0 + boost), 0.80); // caps one stroke, not the accumulated backdrop
    gl_FragColor = vec4(color, a);
  }
`

const POINT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uGather;
  uniform float uDpr;
  uniform vec2 uMouse;
  attribute float aHue;
  attribute vec2 aTarget;
  varying float vHue;
  varying float vFade;
  ${SURFACE_GLSL}

  void main() {
    float t = uTime + uScroll * 2.0;
    vec2 xz = mix(vec2(position.x, position.z), aTarget, uGather);
    // same pointer swell as the lines — otherwise rings sink into the raised contour
    float y = surface(xz, t) + 0.06 + 0.55 * smoothstep(2.2, 0.0, distance(xz, uMouse));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(xz.x, y, xz.y, 1.0);
    gl_PointSize = (3.0 + 5.0 * smoothstep(-0.6, 0.9, y)) * uDpr;
    vHue = aHue;
    vFade = mix(0.5, 0.9, smoothstep(-6.5, 0.5, xz.y));
  }
`

const POINT_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uHi;
  uniform vec3 uMid;
  varying float vHue;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float ring = smoothstep(0.5, 0.43, d) * smoothstep(0.30, 0.37, d);
    if (ring < 0.01) discard;
    // 0.7: gathered white-on-white rings sum hotter than the old screened hues
    gl_FragColor = vec4(mix(uHi, uMid, vHue), ring * 0.7 * vFade);
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
    const N = isSmall ? 64 : 140 // plurality ring-points
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
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uHi: { value: HI },
        uLo: { value: LO },
      },
    })
    scene.add(new THREE.LineSegments(geo, mat))

    // Plurality ring-points: scattered red/blue rings that ride the surface and
    // gather into seven overlapping circles (the C2 cluster) as the hero scrubs.
    const ptsPos = new Float32Array(N * 3)
    const ptsHue = new Float32Array(N)
    const ptsTarget = new Float32Array(N * 2)
    for (let i = 0; i < N; i++) {
      ptsPos[i * 3] = (Math.random() * 2 - 1) * 8
      ptsPos[i * 3 + 1] = 0
      ptsPos[i * 3 + 2] = -6.5 + Math.random() * 7
      ptsHue[i] = i % 2
      const k = i % 7
      ptsTarget[i * 2] = -3.0 + 1.5 * Math.cos((k * 2 * Math.PI) / 7) + (Math.random() * 2 - 1) * 0.45
      ptsTarget[i * 2 + 1] = -0.9 + 0.55 * Math.sin((k * 2 * Math.PI) / 7) + (Math.random() * 2 - 1) * 0.45
    }
    const ptsGeo = new THREE.BufferGeometry()
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptsPos, 3))
    ptsGeo.setAttribute('aHue', new THREE.BufferAttribute(ptsHue, 1))
    ptsGeo.setAttribute('aTarget', new THREE.BufferAttribute(ptsTarget, 2))
    const matPts = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        // SHARED objects with the line material — one write updates both draws.
        uTime: mat.uniforms.uTime,
        uScroll: mat.uniforms.uScroll,
        uMouse: mat.uniforms.uMouse,
        uHi: { value: HI },
        uMid: { value: MID },
        uGather: { value: 0 },
        uDpr: { value: currentDpr() },
      },
    })
    scene.add(new THREE.Points(ptsGeo, matPts))

    const mouse = { x: 99, y: 99, tx: 99, ty: 99 }

    function size() {
      const d = currentDpr() // re-read: monitor moves / zoom change DPR
      if (d !== renderer.getPixelRatio()) {
        renderer.setPixelRatio(d)
        matPts.uniforms.uDpr.value = d
      }
      const r = host!.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    let lastP = -1
    function render(timeSec: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.07
      mouse.y += (mouse.ty - mouse.y) * 0.07
      // the hero pin scrub dollies the camera into the field + gathers the rings
      const p = (window as WindowWithHero).__heroProgress ?? 0
      if (Math.abs(p - lastP) > 0.001) {
        lastP = p
        camera.position.set(0, 2.4 - 0.9 * p, 7.5 - 1.9 * p)
        camera.fov = 42 + 10 * p
        camera.updateProjectionMatrix()
        camera.lookAt(0, 0, -1.5)
        matPts.uniforms.uGather.value = THREE.MathUtils.smoothstep(p, 0.1, 0.85)
      }
      mat.uniforms.uTime.value = timeSec
      mat.uniforms.uScroll.value = Math.min(window.scrollY / 900, 2)
      ;(mat.uniforms.uMouse.value as THREE.Vector2).set(mouse.x, mouse.y)
      renderer.render(scene, camera)
    }

    let onScreen = true
    let ticking = false
    let last = 0
    const tick = (time: number) => {
      // 2ms slack: ticker deltas jitter around exact frame multiples (16.66 vs
      // 16.67ms), and without it 60Hz displays drop to an erratic 16/33 cadence.
      if (time - last < FRAME_INTERVAL - 0.002) return
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
      const nx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1
      const nyTop = (e.clientY - r.top) / Math.max(1, r.height)
      mouse.tx = nx * 7.5
      mouse.ty = Z0 + (Z1 - Z0) * nyTop
    }
    const onLeave = () => {
      mouse.tx = 99
      mouse.ty = 99
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    const onRestore = () => {
      size()
      if (reduced) render(STATIC_T)
    }

    size()
    if (reduced) {
      render(STATIC_T) // one composed static frame — both hues visible
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
      if (reduced) render(STATIC_T)
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
      ptsGeo.dispose()
      matPts.dispose()
      renderer.dispose()
      renderer.forceContextLoss() // don't wait for GC to free the GL context
      renderer.domElement.remove()
    }
  }, [reduced])

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />
}
