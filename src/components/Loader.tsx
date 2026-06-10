import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'

export const LOADER_KEY = 'tz-seen'

/** Decides once, before first paint: only on a fresh session, never under
 *  reduced motion, never without sessionStorage (private-mode safety). */
export function shouldShowLoader(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(LOADER_KEY) === null
  } catch {
    return false
  }
}

/** Brief opening: T/Z mark + a counter to 100, then the curtain lifts. Locks
 *  scroll while visible; refreshes ScrollTrigger after it leaves the layout. */
export function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    const t0 = performance.now()
    const DURATION = 1000
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DURATION)
      setCount(Math.round(p * 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setLeaving(true)
        window.setTimeout(() => {
          try {
            sessionStorage.setItem(LOADER_KEY, '1')
          } catch {
            /* private mode */
          }
          document.documentElement.style.overflow = ''
          doneRef.current()
          ScrollTrigger.refresh()
        }, 700)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[60] flex flex-col justify-between bg-cream p-6 transition-transform duration-700 sm:p-8 ${
        leaving ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <span className="font-mono text-sm font-bold tracking-[0.18em] text-ink">
        T<span className="text-signal">/</span>Z
      </span>
      <div>
        <span className="block font-display text-metric font-extrabold tabular-nums text-ink">{count}%</span>
        <span className="mt-4 block h-px w-full bg-hairline">
          <span className="block h-full origin-left bg-signal transition-transform" style={{ transform: `scaleX(${count / 100})` }} />
        </span>
      </div>
    </div>
  )
}
