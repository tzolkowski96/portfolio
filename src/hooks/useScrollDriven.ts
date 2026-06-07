import { useEffect, useRef } from 'react'

type ScrollCb = (scrollY: number, progress: number) => void

/**
 * Calls `cb(scrollY, progress)` on scroll, rAF-throttled. The scroll range is
 * cached and only recomputed when the document or viewport actually resizes
 * (via ResizeObserver + resize) — so the per-frame path reads only window.scrollY
 * and never forces a layout reflow. The callback is held in a ref so it can mutate
 * a DOM node directly without a React re-render. enabled=false disables it.
 */
export function useScrollDriven(cb: ScrollCb, enabled = true): void {
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    if (!enabled) return

    let max = document.documentElement.scrollHeight - window.innerHeight
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight
    }

    let raf = 0
    const run = () => {
      raf = 0
      const y = window.scrollY
      cbRef.current(y, max > 0 ? Math.min(1, Math.max(0, y / max)) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    const onResize = () => {
      measure()
      onScroll()
    }

    // Document height can change without a window resize (pin-spacers, feed
    // hydration, font load) — observe it so `max` stays correct.
    const ro = new ResizeObserver(() => {
      measure()
      onScroll()
    })
    ro.observe(document.body)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    run()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled])
}
