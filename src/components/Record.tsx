import { Suspense, lazy, useEffect, useState } from 'react'
import { Hero } from './Hero'
import { HowIWork } from './HowIWork'
import { Reveal } from './Reveal'
import { now } from '../data/now'

// three.js ships as its own deferred chunk — the page paints without it and the
// field fades in when ready (it's decorative, so nothing depends on it).
const ThreeHero = lazy(() => import('./ThreeHero').then((m) => ({ default: m.ThreeHero })))

/** Mounts the WebGL field only after window load — keeping the three.js fetch
 *  and first GPU frame off the critical path. */
function useFxReady(): boolean {
  const [winLoaded, setWinLoaded] = useState(() => document.readyState === 'complete')
  useEffect(() => {
    if (winLoaded) return
    const on = () => setWinLoaded(true)
    window.addEventListener('load', on, { once: true })
    const t = window.setTimeout(() => setWinLoaded(document.readyState === 'complete'), 2000)
    return () => {
      window.removeEventListener('load', on)
      window.clearTimeout(t)
    }
  }, [winLoaded])
  return winLoaded
}

const CONTAINER = 'mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 xl:px-12'

/** The opening of the page. The terrain is a fixed layer that stays behind the
 *  hero and the "How I work" story ([data-intro]); everything after sits on a
 *  solid ground above it. */
export function Record() {
  const fx = useFxReady()
  return (
    <>
      <div data-intro className="relative">
        {fx && (
          <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
            <Suspense fallback={null}>
              <ThreeHero />
            </Suspense>
          </div>
        )}
        <section data-hero aria-label="Introduction" className="relative z-10">
          <div className={CONTAINER}>
            <Hero />
          </div>
        </section>
        <HowIWork />
      </div>

      <section aria-labelledby="now-heading" className="relative z-10 bg-cream">
        <div className={`${CONTAINER} pb-24 pt-20 md:pb-32 md:pt-28`}>
          <Reveal>
            <div className="grid grid-cols-1 gap-6 border-t border-hairline pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:gap-16">
              <h2 id="now-heading" className="font-mono text-mono-label uppercase tracking-kicker text-label">
                Now
              </h2>
              <p className="max-w-[30ch] text-pretty font-serif text-[clamp(1.875rem,3.4vw,3rem)] font-light leading-[1.12] tracking-[-0.02em] text-ink">
                {now}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
