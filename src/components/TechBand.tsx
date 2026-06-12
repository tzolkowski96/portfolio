import { useRef } from 'react'
import { useScrollDriven } from '../hooks/useScrollDriven'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const TOOLS = ['Tableau', 'Looker', 'Python', 'SQL', 'SSIS', 'REST APIs', 'AWS', 'REDCap', 'pytest']

/** Kinetic-type divider, two-plate edition: a blue-stroked base row and a
 *  red-stroked clone riding 0.03 slower with a 3px/2px misprint offset — the
 *  plates slide through registration as you scroll, flashing collide pink where
 *  the strokes screen together (overflow-hidden, can never push the page wide).
 *  Static misprint under reduced motion. Decorative for AT: the canonical skill
 *  list lives in the About section's <dl>. */
export function TechBand() {
  const reduced = usePrefersReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLDivElement>(null)

  useScrollDriven((y) => {
    if (rowRef.current) rowRef.current.style.transform = `translate3d(${-(y * 0.35)}px,0,0)`
    // same direction, 0.03 slower + the misprint offset — clone travel is always
    // less than base travel, so the tripled list's edge can never be exposed
    if (cloneRef.current) cloneRef.current.style.transform = `translate3d(${-(y * 0.32) + 3}px,2px,0)`
  }, !reduced)

  // Tripled so the sideways offset never reveals an edge within a page's scroll range.
  const items = [...TOOLS, ...TOOLS, ...TOOLS]

  return (
    <div aria-hidden="true" className="relative isolate overflow-hidden border-y border-hairline py-6 md:py-8">
      <div ref={rowRef} className="flex w-max items-center gap-8 md:gap-12">
        {items.map((tool, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <span className="whitespace-nowrap font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_#177AEE]">
              {tool}
            </span>
            <span className="h-2.5 w-2.5 shrink-0 bg-signal-graphic md:h-3 md:w-3" />
          </span>
        ))}
      </div>
      <div
        ref={cloneRef}
        aria-hidden="true"
        className="absolute inset-y-6 left-0 flex w-max translate-x-[3px] translate-y-[2px] items-center gap-8 mix-blend-screen md:inset-y-8 md:gap-12"
      >
        {items.map((tool, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <span className="whitespace-nowrap font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_#ff2d16]">
              {tool}
            </span>
            <span className="h-2.5 w-2.5 shrink-0 bg-transparent md:h-3 md:w-3" />
          </span>
        ))}
      </div>
    </div>
  )
}
