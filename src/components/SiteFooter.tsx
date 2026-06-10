import { Reveal } from './Reveal'

/** Inverted footer: the page closes on an oversized serif sign-off — his own
 *  words from the About credo — then the record line. Cream on ink = 16.29:1. */
export function SiteFooter() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-container px-4 pb-14 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8 xl:px-12">
        <Reveal>
          <p className="font-mono text-mono-label uppercase tracking-kicker text-cream2">§07 · Sign-off</p>
          <p className="mt-6 max-w-[14ch] text-balance font-serif text-display-xl font-medium italic text-cream2">
            Data is translation
            <span className="sr-only">.</span>
            <span aria-hidden="true" className="ml-[0.12em] inline-block h-[0.13em] w-[0.13em] bg-signal-graphic" />
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
