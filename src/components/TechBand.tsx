import { useEffect, useRef } from 'react'
import { useScrollDriven } from '../hooks/useScrollDriven'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const TOOLS = ['Tableau', 'Looker', 'Python', 'SQL', 'SSIS', 'REST APIs', 'AWS', 'REDCap', 'pytest']

/** Kinetic-type divider, two-plate edition: a blue-stroked base row and a
 *  red-stroked clone riding 0.03 slower with a 3px/2px misprint offset — the
 *  plates slide through registration as you scroll, flashing collide pink where
 *  the strokes screen together (overflow-hidden, can never push the page wide).
 *  Static misprint under reduced motion; transform writes pause offscreen.
 *  Decorative for AT: the canonical skill list lives in the About <dl>; under
 *  forced colors the clone hides and the base plate drops its stroke, leaving
 *  one legible row. Hidden from print and selection. */
export function TechBand() {
  const reduced = usePrefersReducedMotion()
  const bandRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLDivElement>(null)
  const onScreenRef = useRef(true)

  const write = (y: number) => {
    if (rowRef.current) rowRef.current.style.transform = `translate3d(${-(y * 0.35)}px,0,0)`
    // same direction, 0.03 slower + the misprint offset — clone travel is always
    // less than base travel, so the tripled list's edge can never be exposed
    if (cloneRef.current) cloneRef.current.style.transform = `translate3d(${-(y * 0.32) + 3}px,2px,0)`
  }

  useScrollDriven((y) => {
    if (!onScreenRef.current) return // don't re-blend a parked band every frame
    write(y)
  }, !reduced)

  // Pause the per-frame writes while the band is far offscreen; sync once on re-entry.
  useEffect(() => {
    const band = bandRef.current
    if (!band || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        onScreenRef.current = e?.isIntersecting ?? true
        if (onScreenRef.current) write(window.scrollY)
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(band)
    return () => io.disconnect()
  }, [])

  // A mid-session reduced-motion toggle stops the writes — also clear the stale
  // inline transforms so the class-based static misprint takes back over.
  useEffect(() => {
    if (!reduced) return
    if (rowRef.current) rowRef.current.style.transform = ''
    if (cloneRef.current) cloneRef.current.style.transform = ''
  }, [reduced])

  // Tripled so the sideways offset never reveals an edge within a page's scroll range.
  const items = [...TOOLS, ...TOOLS, ...TOOLS]

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="relative isolate select-none overflow-hidden border-y border-hairline py-6 print:hidden md:py-8"
    >
      <div ref={rowRef} className="flex w-max items-center gap-8 md:gap-12">
        {items.map((tool, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <span className="whitespace-nowrap font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_#177AEE] forced-colors:[-webkit-text-stroke-width:0]">
              {tool}
            </span>
            <span className="h-2.5 w-2.5 shrink-0 bg-signal-graphic md:h-3 md:w-3" />
          </span>
        ))}
      </div>
      <div
        ref={cloneRef}
        aria-hidden="true"
        className="absolute inset-y-6 left-0 flex w-max translate-x-[3px] translate-y-[2px] items-center gap-8 mix-blend-screen forced-colors:hidden md:inset-y-8 md:gap-12"
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
