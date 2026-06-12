import { Reveal } from './Reveal'

/** Inverted footer: the page closes on an oversized serif sign-off — his own
 *  words from the About credo. On this light ground the blend law flips:
 *  collisions multiply toward ink (multiply(red, blue) ≈ the brand ink), so the
 *  period is red and blue data overprinted into the text color, and the analyst
 *  circles the word that matters in red pen as the page signs off. */
export function SiteFooter() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-container px-4 pb-14 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8 xl:px-12">
        <Reveal>
          <p className="font-mono text-mono-label uppercase tracking-kicker text-cream2">
            <span className="text-pulse-deep">§07</span> · Sign-off
          </p>
          <p className="mt-6 max-w-[14ch] text-balance font-serif text-display-xl font-medium italic text-cream2">
            Data is{' '}
            <span className="relative inline-block">
              translation
              <svg
                aria-hidden="true"
                viewBox="0 0 200 70"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -left-[0.18em] -top-[0.1em] h-[calc(100%+0.2em)] w-[calc(100%+0.36em)] -rotate-2"
              >
                <ellipse
                  cx="100"
                  cy="35"
                  rx="96"
                  ry="30"
                  fill="none"
                  stroke="#C81F0B"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeLinecap="round"
                  className="annotate-draw"
                />
              </svg>
            </span>
            <span className="sr-only">.</span>
            <span aria-hidden="true" className="isolate ml-[0.14em] inline-flex align-baseline">
              <span className="h-[0.14em] w-[0.14em] rounded-full bg-signal-graphic" />
              <span className="-ml-[0.05em] h-[0.14em] w-[0.14em] rounded-full bg-pulse-graphic mix-blend-multiply" />
              <span className="-ml-[0.05em] mt-[0.05em] h-[0.14em] w-[0.14em] rounded-full bg-signal-graphic mix-blend-multiply" />
            </span>
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
