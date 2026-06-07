import { useRef } from 'react'
import { useScrollDriven } from '../hooks/useScrollDriven'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const TOOLS = [
  'Tableau', 'Looker', 'SSRS', 'Python', 'pandas', 'scikit-learn',
  'PostgreSQL', 'MySQL', 'MS SQL', 'SSIS', 'REST APIs', 'AWS', 'REDCap', 'Git', 'pytest',
]

/** A tools ticker whose row offsets sideways as you scroll vertically — the safe,
 *  self-contained version of a horizontal-scroll effect (overflow-hidden, so it can
 *  never push the page wide). Static under reduced-motion. Decorative for AT: the
 *  real, canonical skill list lives in the About section's <dl>. */
export function TechBand() {
  const reduced = usePrefersReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)

  useScrollDriven((y) => {
    if (rowRef.current) rowRef.current.style.transform = `translate3d(${-(y * 0.25)}px,0,0)`
  }, !reduced)

  // Tripled so the sideways offset never reveals an edge within a page's scroll range.
  const items = [...TOOLS, ...TOOLS, ...TOOLS]

  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-hairline bg-panel">
      <div ref={rowRef} className="flex w-max items-center py-4">
        {items.map((tool, i) => (
          <span key={i} className="flex items-center font-mono text-mono-label uppercase text-label">
            {tool}
            <span className="mx-6 text-signal">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
