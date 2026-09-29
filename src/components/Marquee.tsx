import { useEffect, useRef } from 'react'
import type Lenis from 'lenis'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WindowWithLenis = Window & { __lenis?: Lenis }

const WORDS = [
  { text: 'Analytics', outline: false },
  { text: 'Reporting & BI', outline: true },
  { text: 'Data journalism', outline: false },
  { text: 'Public datasets', outline: true },
]

/**
 * A kinetic type band: the practice in giant serif, drifting sideways and
 * leaning into the scroll — its speed and skew follow the smooth-scroll
 * velocity, so fast scrolling makes the words race and tilt, then settle.
 * Alternating solid/outlined words. Decorative (aria-hidden; the same words
 * are in the hero eyebrow); static under reduced motion; pauses offscreen.
 */
export function Marquee() {
  const reduced = usePrefersReducedMotion()
  const bandRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const band = bandRef.current
    const row = rowRef.current
    if (!band || !row || reduced) return

    let x = 0
    let skew = 0
    let half = row.scrollWidth / 2
    let onScreen = true
    let lastY = window.scrollY

    const tick = () => {
      if (!onScreen) return
      const lenis = (window as WindowWithLenis).__lenis
      // velocity from Lenis when smoothing, else from the raw scroll delta
      const v = lenis ? lenis.velocity : window.scrollY - lastY
      lastY = window.scrollY
      x -= 0.55 + Math.min(18, Math.abs(v) * 0.35)
      if (x <= -half) x += half
      const target = Math.max(-9, Math.min(9, -v * 0.35))
      skew += (target - skew) * 0.12
      row.style.transform = `translate3d(${x}px,0,0) skewX(${skew.toFixed(2)}deg)`
    }
    gsap.ticker.add(tick)

    const ro = new ResizeObserver(() => {
      half = row.scrollWidth / 2
    })
    ro.observe(row)
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true
    })
    io.observe(band)

    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      io.disconnect()
      row.style.transform = ''
    }
  }, [reduced])

  const items = [...WORDS, ...WORDS, ...WORDS, ...WORDS]
  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="relative z-10 select-none overflow-hidden border-y border-hairline bg-cream py-10 print:hidden md:py-14"
    >
      <div ref={rowRef} className="flex w-max items-center will-change-transform">
        {items.map((w, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`whitespace-nowrap px-6 font-serif text-[clamp(3.5rem,10vw,9.5rem)] font-light leading-none tracking-[-0.035em] md:px-10 ${
                w.outline ? 'text-outline italic' : 'text-ink'
              }`}
            >
              {w.text}
            </span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-ink md:h-2.5 md:w-2.5" />
          </span>
        ))}
      </div>
    </div>
  )
}
