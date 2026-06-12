import { useEffect, useRef, useState } from 'react'
import type Lenis from 'lenis'
import { ScrollTrigger } from '../lib/gsap'

export const LOADER_KEY = 'tz-seen'
export const LOADER_DONE_EVENT = 'tz:loader-done'
const COUNT_MS = 1000
const EXIT_MS = 700 // single source of truth: also applied as the CSS duration

type WindowWithLenis = Window & { __lenis?: Lenis }

/** Decides once, before first paint: only on a fresh session, never under
 *  reduced motion, never without sessionStorage (private-mode safety). The seen
 *  key is written HERE — if setItem throws, we degrade to "no loader". */
export function shouldShowLoader(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (sessionStorage.getItem(LOADER_KEY) !== null) return false
    sessionStorage.setItem(LOADER_KEY, '1')
    return true
  } catch {
    return false
  }
}

/** Brief opening: T/Z mark + a counter to 100, then the curtain lifts. Stops
 *  Lenis (wheel input bypasses overflow:hidden) and locks native scroll while
 *  visible; refreshes ScrollTrigger and announces done after it leaves. */
export function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const lenis = (window as WindowWithLenis).__lenis
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'

    const t0 = performance.now()
    let raf = 0
    let exitTimer = 0
    const finish = () => {
      document.documentElement.style.overflow = ''
      lenis?.start()
      doneRef.current()
      ScrollTrigger.refresh()
      window.dispatchEvent(new Event(LOADER_DONE_EVENT))
    }
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / COUNT_MS)
      setCount(Math.round(p * 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setLeaving(true)
        exitTimer = window.setTimeout(finish, EXIT_MS)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(exitTimer)
      document.documentElement.style.overflow = ''
      lenis?.start()
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[60] flex flex-col justify-between bg-cream p-6 transition-transform sm:p-8 ${
        leaving ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDuration: `${EXIT_MS}ms` }}
    >
      <span className="font-mono text-sm font-bold tracking-[0.18em] text-ink">
        T<span className="text-label">/</span>Z
      </span>
      <div>
        <span className="block font-display text-metric font-extrabold tabular-nums text-ink">{count}%</span>
        {/* bar is rAF-driven — no CSS transition, or it'd lag the count and
            still be moving when the curtain starts */}
        <span className="mt-4 block h-px w-full bg-rule-strong/50">
          <span className="block h-full origin-left bg-ink" style={{ transform: `scaleX(${count / 100})` }} />
        </span>
      </div>
    </div>
  )
}
