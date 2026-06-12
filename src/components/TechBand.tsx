import { useEffect, useRef } from 'react'
import { useScrollDriven } from '../hooks/useScrollDriven'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const TOOLS = ['Tableau', 'Looker', 'Python', 'SQL', 'SSIS', 'REST APIs', 'AWS', 'REDCap', 'pytest']

/** Kinetic-type divider: one white-outlined plate drifting against scroll
 *  (overflow-hidden — can never push the page wide). Decorative — the canonical
 *  skill list lives in the About <dl>; forced colors drops the stroke leaving
 *  one legible row; static under reduced motion; writes pause offscreen. */
export function TechBand() {
  const reduced = usePrefersReducedMotion()
  const bandRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const onScreenRef = useRef(true)

  const write = (y: number) => {
    if (rowRef.current) rowRef.current.style.transform = `translate3d(${-(y * 0.35)}px,0,0)`
  }

  useScrollDriven((y) => {
    if (!onScreenRef.current) return // don't repaint a parked band every frame
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

  // A mid-session reduced-motion toggle stops the writes — clear the stale
  // inline transform so the static plate takes back over.
  useEffect(() => {
    if (!reduced) return
    if (rowRef.current) rowRef.current.style.transform = ''
  }, [reduced])

  // Tripled so the sideways offset never reveals an edge within a page's scroll range.
  const items = [...TOOLS, ...TOOLS, ...TOOLS]

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="relative select-none overflow-hidden border-y border-hairline py-8 print:hidden md:py-10"
    >
      <div ref={rowRef} className="flex w-max items-center gap-8 md:gap-12">
        {items.map((tool, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <span className="whitespace-nowrap font-display text-[clamp(2.75rem,6.5vw,5.5rem)] font-extrabold uppercase leading-none tracking-tight text-label supports-[-webkit-text-stroke:1px_#fff]:[color:rgb(243_243_239/0.10)] supports-[-webkit-text-stroke:1px_#fff]:[-webkit-text-stroke:1.5px_#f3f3ef] forced-colors:[-webkit-text-stroke-width:0]">
              {tool}
            </span>
            <span className="h-2.5 w-2.5 shrink-0 bg-ink md:h-3 md:w-3" />
          </span>
        ))}
      </div>
    </div>
  )
}
