import { useRef } from 'react'
import { useScrollDriven } from '../hooks/useScrollDriven'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const TOOLS = ['Tableau', 'Looker', 'Python', 'SQL', 'SSIS', 'REST APIs', 'AWS', 'REDCap', 'pytest']

/** Kinetic-type divider: the toolchain as huge outlined uppercase letters that
 *  slide sideways as you scroll vertically (overflow-hidden — can never push the
 *  page wide). Static under reduced-motion. Decorative for AT: the canonical
 *  skill list lives in the About section's <dl>. */
export function TechBand() {
  const reduced = usePrefersReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)

  useScrollDriven((y) => {
    if (rowRef.current) rowRef.current.style.transform = `translate3d(${-(y * 0.35)}px,0,0)`
  }, !reduced)

  // Tripled so the sideways offset never reveals an edge within a page's scroll range.
  const items = [...TOOLS, ...TOOLS, ...TOOLS]

  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-hairline py-6 md:py-8">
      <div ref={rowRef} className="flex w-max items-center gap-8 md:gap-12">
        {items.map((tool, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <span className="whitespace-nowrap font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_#8a8a82]">
              {tool}
            </span>
            <span className="h-2.5 w-2.5 shrink-0 bg-signal-graphic md:h-3 md:w-3" />
          </span>
        ))}
      </div>
    </div>
  )
}
