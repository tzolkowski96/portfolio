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

  if (reduced) return <div className={className}>{children}</div>

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
