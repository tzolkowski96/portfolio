import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionProps {
  id: string
  num: string
  name: string
  meta: string
  children: ReactNode
}

/**
 * One numbered §-section: shared container width, gutters, vertical rhythm, and
 * the masthead (§id + Archivo name + right-aligned mono meta). On entrance the
 * masthead text rises out of overflow masks and the rule draws itself — all keyed
 * off the single Reveal observer; the body simply fades. Centralizing it keeps
 * spacing and choreography consistent across the page (DRY).
 */
export function Section({ id, num, name, meta, children }: SectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-hairline">
      <Reveal mode="fade" className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 pb-6 pt-10 md:pt-14 lg:pt-16">
          {/* plurality glyph: red + blue circles converge on reveal; the overlap
              screens to collide pink. isolate is mandatory or the blend would
              composite against the page (and the terrain near §01). */}
          <span aria-hidden="true" className="isolate inline-flex translate-y-px items-center">
            <span className="plural-l h-2.5 w-2.5 rounded-full bg-signal-graphic mix-blend-screen" />
            <span className="plural-r -ml-[5px] h-2.5 w-2.5 rounded-full bg-pulse-graphic mix-blend-screen" />
          </span>
          <span className="overflow-hidden font-mono text-nav font-semibold text-signal">
            <span className="mask-line">§{num}</span>
          </span>
          <h2
            id={headingId}
            className="-mb-[0.05em] overflow-hidden pb-[0.05em] font-display text-display-l font-extrabold uppercase tracking-tight text-ink"
          >
            <span className="mask-line" style={{ transitionDelay: '60ms' }}>
              {name}
            </span>
          </h2>
          <span className="ml-auto overflow-hidden font-mono text-mono-label uppercase text-index">
            <span className="mask-line" style={{ transitionDelay: '140ms' }}>
              {meta}
            </span>
          </span>
        </div>
        <span aria-hidden="true" className="rule-draw block h-px w-full bg-rule-strong" />
        <div className="pb-14 pt-8 md:pb-20 md:pt-10 lg:pb-28 lg:pt-12">{children}</div>
      </Reveal>
    </section>
  )
}
