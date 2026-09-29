import { useEffect, useLayoutEffect, useRef } from 'react'
import { identity } from '../data/profile'
import { Dot } from './primitives/Dot'
import { Chars } from './Chars'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useFontsReady } from '../hooks/useFontsReady'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** The opening: the name set large in Fraunces light (first name roman, surname
 *  italic), arriving letter by letter once the real font is ready; the claim,
 *  toolchain and availability follow. On scroll the two lines drift apart at
 *  different speeds over the terrain. The page's only <h1>. */
export function Hero() {
  const reduced = usePrefersReducedMotion()
  const fontsReady = useFontsReady()
  const rootRef = useRef<HTMLDivElement>(null)

  // Before first paint: park the letters below their masks and the meta out of
  // view, so nothing flashes in a fallback state.
  useLayoutEffect(() => {
    if (reduced || !rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.set('.split-char', { yPercent: 118 })
      gsap.set('[data-hero-fade]', { opacity: 0, y: 18 })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  // The intro plays once the display serif is ready.
  useEffect(() => {
    if (reduced || !fontsReady || !rootRef.current) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.1 })
        .to('.split-char', { yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: 0.045 })
        .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12 }, 0.6)
    }, rootRef)
    return () => ctx.revert()
  }, [fontsReady, reduced])

  // Scroll parallax: the lines part as the hero leaves.
  useEffect(() => {
    if (reduced || !rootRef.current) return
    const root = rootRef.current
    const ctx = gsap.context(() => {
      const common = { ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } }
      gsap.to('[data-line="1"]', { yPercent: -35, ...common })
      gsap.to('[data-line="2"]', { yPercent: -12, xPercent: 3, ...common })
    }, rootRef)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [reduced])

  return (
    // container-type sizes the name to its container (cqw) so "Zolkowski" fills
    // the measure at every width without overflowing.
    <div
      ref={rootRef}
      className="relative flex min-h-[calc(100svh-56px)] flex-col justify-between pb-14 pt-10 md:pb-20 md:pt-14 [container-type:inline-size]"
    >
      <p data-hero-fade className="font-mono text-mono-label uppercase tracking-kicker text-label">
        {identity.eyebrow}
      </p>

      <div>
        {/* aria-label names the heading once; the split letters are aria-hidden */}
        <h1
          aria-label="Tobin Zolkowski"
          className="font-serif text-[clamp(3.5rem,24cqw,17rem)] font-light leading-[0.9] tracking-[-0.035em] text-ink [font-variation-settings:'opsz'_144]"
        >
          <span data-line="1" className="block will-change-transform">
            <Chars text="Tobin" />
          </span>{' '}
          <span data-line="2" className="block will-change-transform">
            <Chars text="Zolkowski" className="italic" />
          </span>
        </h1>

        <div className="mt-12 grid items-end gap-x-12 gap-y-8 md:mt-16 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <p data-hero-fade className="max-w-[26ch] text-pretty font-display text-display-m font-normal leading-snug text-ink">
            {identity.taglineLead}
          </p>
          <div data-hero-fade className="space-y-5">
            <p className="max-w-[40ch] font-mono text-mono-data text-label">{identity.taglineEmphasis}</p>
            <p className="inline-flex items-center gap-2 font-mono text-mono-label uppercase text-ink-2">
              <Dot />
              {identity.status}
            </p>
            <div>
              <a
                href="#writing"
                data-cursor="Read"
                className="inline-flex min-h-tap items-center gap-2 font-mono text-nav uppercase text-ink"
              >
                <span className="u-draw">Read the writing</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
