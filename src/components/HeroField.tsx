import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * A faint field of data points behind the nameplate that gently responds to the
 * pointer — the site's signature "moment", on-brand for a data analyst.
 * Decorative (aria-hidden), pointer-events:none. Under reduced-motion it renders
 * a single static frame; it also pauses when scrolled offscreen or the tab hides.
 */
export function HeroField() {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !parent || !ctx) return

    const SPACING = 34
    const RADIUS = 120
    let width = 0
    let height = 0
    let dots: { x: number; y: number }[] = []
    const pointer = { x: -9999, y: -9999, active: false }
    let raf = 0
    let onScreen = true

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // re-read for DPI/zoom changes
      const rect = parent!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas!.width = Math.floor(width * dpr)
      canvas!.height = Math.floor(height * dpr)
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = []
      for (let y = SPACING / 2; y < height; y += SPACING)
        for (let x = SPACING / 2; x < width; x += SPACING) dots.push({ x, y })
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height)
      for (const d of dots) {
        let ox = 0
        let oy = 0
        let near = 0
        if (pointer.active) {
          const dx = d.x - pointer.x
          const dy = d.y - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < RADIUS && dist > 0.01) {
            near = 1 - dist / RADIUS
            const push = near * 14
            ox = (dx / dist) * push
            oy = (dy / dist) * push
          }
        }
        const drift = reduced ? 0 : Math.sin(t / 1600 + d.x * 0.05 + d.y * 0.03) * 1.1
        const r = 1.1 + near * 1.8
        const alpha = 0.09 + near * 0.5
        ctx!.beginPath()
        ctx!.arc(d.x + ox, d.y + oy + drift, r, 0, Math.PI * 2)
        ctx!.fillStyle = near > 0.55 ? `rgba(196,31,0,${alpha})` : `rgba(22,22,20,${alpha})`
        ctx!.fill()
      }
    }

    function loop(t: number) {
      draw(t)
      raf = requestAnimationFrame(loop)
    }

    function start() {
      if (reduced || !onScreen || document.hidden) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }
    function stop() {
      cancelAnimationFrame(raf)
    }

    build()
    if (reduced) draw(0)
    else start()

    const onPointer = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
    }
    const onResize = () => {
      build()
      if (reduced) draw(0)
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

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
      io.observe(parent)
    }

    let ro: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        build()
        if (reduced) draw(0)
      })
      ro.observe(parent)
    }

    return () => {
      stop()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      io?.disconnect()
      ro?.disconnect()
    }
  }, [reduced])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
