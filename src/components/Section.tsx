import type { ReactNode } from 'react'
import { Chars } from './Chars'
import { Reveal } from './Reveal'
import { useCharReveal } from '../hooks/useCharReveal'

interface SectionProps {
  id: string
  num: string
  name: string
  meta: string
  children: ReactNode
}

/**
 * One numbered section: a drawn rule, then a giant serif title that rises
 * letter by letter (even-numbered sections set in italic for rhythm), the index
 * beside it and the meta aligned right; then the content. Sits on the solid
 * ground above the fixed terrain layer.
 */
export function Section({ id, num, name, meta, children }: SectionProps) {
  const headingId = `${id}-heading`
  const italic = Number(num) % 2 === 0
  const titleRef = useCharReveal<HTMLHeadingElement>({ stagger: 0.035, duration: 1.3 })
  return (
    <section id={id} aria-labelledby={headingId} className="relative z-10 bg-cream">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 xl:px-12">
        <Reveal mode="fade">
          <span aria-hidden="true" className="rule-draw block h-0 w-full border-t border-hairline" />
        </Reveal>
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 pt-16 md:pt-24">
          <div className="flex items-start gap-4 md:gap-6">
            <span aria-hidden="true" className="pt-3 font-mono text-nav text-index md:pt-6">
              {num}
            </span>
            <h2
              id={headingId}
              ref={titleRef}
              aria-label={name}
              className={`font-serif text-[clamp(3.5rem,10vw,10rem)] font-light leading-[0.92] tracking-[-0.04em] text-ink [font-variation-settings:'opsz'_144] ${
                italic ? 'italic' : ''
              }`}
            >
              <Chars text={name} />
            </h2>
          </div>
          <p className="max-w-[30ch] font-mono text-mono-label uppercase tracking-kicker text-label md:pb-5 md:text-right">
            {meta}
          </p>
        </header>
        <div className="pb-24 pt-14 md:pb-36 md:pt-20">{children}</div>
      </div>
    </section>
  )
}
