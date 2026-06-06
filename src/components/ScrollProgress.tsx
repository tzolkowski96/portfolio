import { useRef } from 'react'
import { useScrollDriven } from '../hooks/useScrollDriven'

/** Thin reading-progress line fixed at the very top. Reflects scroll position
 *  (informational, not gratuitous motion). Decorative for AT. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  useScrollDriven((_, progress) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`
  })
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div ref={barRef} className="h-full origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
