import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  num: string
  name: string
  meta: string
  children: ReactNode
}

/**
 * One numbered §-section: shared container width, gutters, vertical rhythm, and
 * the masthead (§id + Archivo name + right-aligned meta). Centralizing it keeps
 * spacing consistent across the page (DRY).
 */
export function Section({ id, num, name, meta, children }: SectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-hairline">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-rule-strong py-6">
          <span className="font-mono text-nav font-semibold text-signal">§{num}</span>
          <h2 className="font-display text-display-l font-extrabold uppercase tracking-tight text-ink" id={headingId}>
            {name}
          </h2>
          <span className="ml-auto font-mono text-mono-label uppercase text-index">{meta}</span>
        </div>
        <div className="pb-12 pt-8 md:pb-16 md:pt-12 lg:pb-20 lg:pt-16">{children}</div>
      </div>
    </section>
  )
}
