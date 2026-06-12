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
 * One numbered §-section as a title card: a small gray meta line, then the
 * section name at near-viewport scale (alternating solid / outlined treatments,
 * 01/03/05 solid · 02/04/06 outlined), a drawn rule, then the body. The name
 * rides the existing .mask-line / .rule-draw entrance signatures off the single
 * Reveal observer. The container-query wrapper covers ONLY the masthead —
 * container-type implies layout containment, which would break ScrollTrigger's
 * pinning of the body (position:fixed descendants) if it wrapped everything.
 */
export function Section({ id, num, name, meta, children }: SectionProps) {
  const headingId = `${id}-heading`
  const outline = Number(num) % 2 === 0
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-hairline">
      <Reveal mode="fade" className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="[container-type:inline-size]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-14 md:pt-20 lg:pt-28">
            <span aria-hidden="true" className="inline-flex translate-y-px items-center">
              <span className="plural-l h-2.5 w-2.5 rounded-full border-[1.5px] border-ink" />
              <span className="plural-r -ml-[5px] h-2.5 w-2.5 rounded-full border-[1.5px] border-label" />
            </span>
            <span className="overflow-hidden font-mono text-nav font-semibold text-label">
              <span className="mask-line">§{num}</span>
            </span>
            <span className="ml-auto overflow-hidden font-mono text-mono-label uppercase text-index">
              <span className="mask-line" style={{ transitionDelay: '140ms' }}>
                {meta}
              </span>
            </span>
          </div>
          <h2
            id={headingId}
            className={`mt-4 -mb-[0.06em] overflow-hidden pb-[0.06em] font-display text-display-card font-[900] uppercase md:mt-6 ${
              outline ? 'title-outline' : 'text-ink'
            }`}
          >
            <span className="mask-line" style={{ transitionDelay: '60ms' }}>
              {name}
            </span>
          </h2>
          <span aria-hidden="true" className="rule-draw mt-8 block h-px w-full bg-rule-strong md:mt-12" />
        </div>
        <div data-section-body className="pb-20 pt-12 md:pb-28 md:pt-16 lg:pb-40 lg:pt-20">
          {children}
        </div>
      </Reveal>
    </section>
  )
}
