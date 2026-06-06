import { useEffect, useRef } from 'react'

type ScrollCb = (scrollY: number, progress: number) => void

/**
 * Calls `cb(scrollY, progress)` on scroll/resize, rAF-throttled. The callback is
 * held in a ref so it can mutate a DOM node's transform directly (no React
 * re-render per frame). Pass enabled=false (e.g. reduced-motion) to disable.
 */
export function useScrollDriven(cb: ScrollCb, enabled = true): void {
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const run = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      cbRef.current(y, max > 0 ? Math.min(1, Math.max(0, y / max)) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    run()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled])
}
