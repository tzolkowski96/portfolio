import { Reveal } from './Reveal'

/** Inverted footer: the page closes on an oversized serif sign-off — his own
 *  words from the About credo, answering the opening nameplate at comparable
 *  scale. Ink on paper: the analyst circles the word that matters in the same
 *  ink the sentence is set in. */
export function SiteFooter() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-container px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-36 lg:px-8 xl:px-12 [container-type:inline-size]">
        <Reveal>
          <p className="font-mono text-mono-label uppercase tracking-kicker text-cream2">§07 · Sign-off</p>
          <p className="mt-6 max-w-[14ch] text-balance font-serif text-[clamp(2.75rem,10cqw,9rem)] font-medium italic leading-[1.04] text-cream2">
            Data is{' '}
            <span className="relative inline-block">
              translation
              <svg
                aria-hidden="true"
                viewBox="0 0 200 70"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -left-[0.18em] -top-[0.1em] h-[calc(100%+0.2em)] w-[calc(100%+0.36em)] -rotate-2"
              >
                {/* two-arc <path>, not <ellipse>: pathLength on basic shapes is
                    ignored by older Safari/Chromium, which would leave the pen
                    stroke permanently dashed instead of drawn */}
                <path
                  d="M 4 35 A 96 30 0 1 1 196 35 A 96 30 0 1 1 4 35"
                  fill="none"
                  stroke="#161614"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeLinecap="round"
                  className="annotate-draw"
                />
              </svg>
            </span>
            {/* an honest period — works in every mode, no decoration */}.
          </p>
        </Reveal>
      </div>
      <div className="border-t border-cream2/15">
        <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-2 px-4 py-6 font-mono text-mono-label uppercase text-cream2 sm:px-6 lg:px-8 xl:px-12">
          <span>© 2026 Tobin Zolkowski</span>
          <span>Madison, WI · static site · no trackers</span>
          <span>Build 2026.06</span>
        </div>
      </div>
    </footer>
  )
}
