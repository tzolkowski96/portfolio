import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** 'rise' fades + lifts the wrapper; 'fade' only fades it, for when the motion
   *  lives in masked children (.mask-line / .rule-draw) instead. */
  mode?: 'rise' | 'fade'
}

/** Reveals children on scroll. Exposes data-revealed so child entrance classes
 *  (.mask-line, .rule-draw, .annotate-draw) ride the SAME observer — no extra
 *  observers, and under reduced motion everything renders complete from first paint. */
export function Reveal({ children, className = '', delay = 0, mode = 'rise' }: RevealProps) {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>()

  // Always attach the ref (so the observer exists even if reduced-motion is on at
  // mount and later turned off). When reduced, emit no animation classes at all.
  const anim = reduced
    ? ''
    : mode === 'fade'
      ? `transition-opacity duration-1000 ease-out ${inView ? 'opacity-100' : 'opacity-0'}`
      : `transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`

  return (
    <div
      ref={ref}
      data-revealed={reduced || inView ? 'true' : 'false'}
      style={reduced ? undefined : { transitionDelay: `${delay}ms` }}
      className={`${anim} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
