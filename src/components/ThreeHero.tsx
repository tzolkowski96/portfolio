import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * The WebGL hero: a field of brand-colored points (cream, with sparse signal-red)
 * drifting on a noise flow, repelled by the pointer, and carried by scroll.
 * Decorative (aria-hidden, pointer-events:none). Renders one static frame under
 * reduced motion; pauses offscreen and when the tab hides; fully disposed on
 * unmount. If WebGL is unavailable it mounts nothing — the dark canvas stands.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform float uPix;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    float t = uTime * 0.10 + aSeed * 6.2831;

    // slow noise-ish drift
    pos.x += sin(t + position.y * 0.45) * 0.55;
    pos.y += cos(t * 0.8 + position.x * 0.35) * 0.45;
    pos.y -= uScroll * (0.8 + aSeed * 0.8); // scroll carries the field upward past you

    // pointer repulsion
    vec2 d = pos.xy - uMouse;
    float dist = length(d);
    float push = smoothstep(2.4, 0.0, dist) * 1.2;
    pos.xy += (d / max(dist, 0.001)) * push;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPix * aSize * (26.0 / -mv.z);

    // fade points near the nameplate anchor so type stays calm and readable
    float anchor = length(position.xy - vec2(-2.6, 0.6));
    vAlpha = (0.10 + 0.40 * smoothstep(0.8, 4.5, anchor)) * (0.65 + 0.35 * sin(t * 2.0));
  }
`

const FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.16, d) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor, a);
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
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      return // no WebGL — the dark canvas stands on its own
    }

    const isNarrow = window.innerWidth < 768
    const COUNT = isNarrow ? 3000 : 8000
    const dpr = Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 1.75)
    renderer.setPixelRatio(dpr)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.className = 'pointer-events-none absolute inset-0 h-full w-full'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 30)
    camera.position.z = 8

    // brand-colored points: cream majority, sparse signal red
    const cream = new THREE.Color('#f3f3ef')
    const red = new THREE.Color('#ff2d16')
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const seeds = new Float32Array(COUNT)
    const sizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * 7.5
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 5
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * 2.5
      const c = Math.random() < 0.07 ? red : cream
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      seeds[i] = Math.random()
      sizes[i] = 0.6 + Math.random() * 1.6
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uPix: { value: dpr },
      },
    })
    scene.add(new THREE.Points(geo, mat))

    const mouse = { x: 99, y: 99, tx: 99, ty: 99 }

    function size() {
      const r = host!.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    function render(timeSec: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      mat.uniforms.uTime.value = timeSec
      mat.uniforms.uScroll.value = Math.min(window.scrollY / 700, 2.5)
      ;(mat.uniforms.uMouse.value as THREE.Vector2).set(mouse.x, mouse.y)
      renderer.render(scene, camera)
    }

    let onScreen = true
    let ticking = false
    const tick = (time: number) => render(time)
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
      const r = host!.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      // map viewport pointer into the field's world box (approximate, it's an effect)
      const nx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1
      const ny = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1)
      mouse.tx = nx * 7
      mouse.ty = ny * 4.5
    }
    const onLeave = () => {
      mouse.tx = 99
      mouse.ty = 99
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    size()
    if (reduced) {
      render(3.2) // one composed static frame
    } else {
      start()
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('blur', onLeave)
    }
    document.addEventListener('visibilitychange', onVisibility)

    const ro = new ResizeObserver(() => {
      size()
      if (reduced) render(3.2)
    })
    ro.observe(host)

    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          onScreen = entries[0]?.isIntersecting ?? true
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
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      io?.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduced])

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />
}
