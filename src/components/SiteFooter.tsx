import { Chars } from './Chars'
import { LocalTime } from './LocalTime'
import { Reveal } from './Reveal'
import { useCharReveal } from '../hooks/useCharReveal'
import { useMagnetic } from '../hooks/useMagnetic'

/** The sign-off: his own words from the About credo, set huge in light serif
 *  italic and arriving letter by letter, while a pen ellipse circles the word
 *  that matters. A magnetic "Back to top", and the local time in Madison. */
export function SiteFooter() {
  const signRef = useCharReveal<HTMLParagraphElement>({ stagger: 0.03, duration: 1.4 })
  const topRef = useMagnetic<HTMLAnchorElement>(0.3)
  return (
    <footer className="relative z-10 bg-cream">
      <div className="mx-auto max-w-container px-4 pb-20 pt-24 sm:px-6 md:pb-28 md:pt-36 lg:px-8 xl:px-12 [container-type:inline-size]">
        <Reveal mode="fade">
          <span aria-hidden="true" className="rule-draw block h-0 w-full border-t border-hairline" />
          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 md:mt-20">
            <p className="font-mono text-mono-label uppercase tracking-kicker text-label">Sign-off</p>
            <a
              ref={topRef}
              href="#top"
              data-cursor="Top"
              className="inline-flex min-h-tap items-center gap-2 font-mono text-nav uppercase text-ink"
            >
              <span className="u-draw">Back to top</span>
              <span aria-hidden="true">↑</span>
            </a>
          </div>
          <p
            ref={signRef}
            className="mt-8 font-serif text-[clamp(3.25rem,14cqw,13rem)] font-light italic leading-[0.95] tracking-[-0.04em] text-ink [font-variation-settings:'opsz'_144]"
          >
            <span className="sr-only">Data is translation.</span>
            <span aria-hidden="true">
              <Chars text="Data is" />{' '}
              <span className="relative inline-block">
                <Chars text="translation" />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 70"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute -left-[0.12em] -top-[0.04em] h-[calc(100%+0.14em)] w-[calc(100%+0.26em)] -rotate-2"
                >
                  {/* two-arc <path>, not <ellipse>: pathLength on basic shapes is
                      ignored by older Safari/Chromium, which would leave the pen
                      stroke permanently dashed instead of drawn */}
                  <path
                    d="M 4 35 A 96 30 0 1 1 196 35 A 96 30 0 1 1 4 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    pathLength={100}
                    strokeDasharray={100}
                    strokeLinecap="round"
                    className="annotate-draw"
                  />
                </svg>
              </span>
              <Chars text="." />
            </span>
          </p>
        </Reveal>
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 font-mono text-mono-label uppercase tracking-kicker text-label sm:px-6 lg:px-8 xl:px-12">
          <span>© 2026 Tobin Zolkowski</span>
          <span>Personal site · views are my own, not my employer’s</span>
          <LocalTime />
        </div>
      </div>
    </footer>
  )
}
