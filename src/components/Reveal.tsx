import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/** Fades + rises its children into view on scroll. Under reduced-motion it
 *  renders them plainly (no initial hidden state), so nothing is ever stuck. */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>()

  // Always attach the ref (so the observer exists even if reduced-motion is on at
  // mount and later turned off). When reduced, emit no animation classes at all.
  const anim = reduced
    ? ''
    : `transition-all duration-700 ease-out will-change-[opacity,transform] ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`

  return (
    <div
      ref={ref}
      style={reduced ? undefined : { transitionDelay: `${delay}ms` }}
      className={`${anim} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
