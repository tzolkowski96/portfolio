import { Suspense, lazy, useContext, useEffect, useState } from 'react'
import { Hero } from './Hero'
import { ProfileSchema } from './ProfileSchema'
import { KpiStrip } from './KpiStrip'
import { BarChart } from './BarChart'
import { RuntimeBar } from './RuntimeBar'
import { now } from '../data/metrics'
import { UiReadyContext } from '../lib/uiReady'

// three.js ships as its own deferred chunk — the page paints without it and the
// field fades in when ready (it's decorative, so nothing depends on it).
const ThreeHero = lazy(() => import('./ThreeHero').then((m) => ({ default: m.ThreeHero })))

/** Mounts the WebGL field only after window load AND after the loader curtain —
 *  keeping the ~126kB three.js fetch + first GPU frame off the critical path. */
function useFxReady(): boolean {
  const uiReady = useContext(UiReadyContext)
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
  return uiReady && winLoaded
}

/** The "record" lede: identity + profile over the WebGL field, then the 4-stat
 *  strip, then chart + now. Opaque panels sit above the field on their own layer. */
export function Record() {
  const fx = useFxReady()
  return (
    <section aria-label="Overview" className="relative border-b border-hairline">
      {/* Field in a sticky 100svh frame inside a 180svh rail: the canvas stays
          under the pinned hero for the whole knockout scrub (the pin adds ~70vh
          the old absolute anchor scrolled past), still bounded to one viewport
          of GPU fill, still pausable offscreen once the rail parks. */}
      {fx && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[180svh]" aria-hidden="true">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            <Suspense fallback={null}>
              <ThreeHero />
            </Suspense>
          </div>
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-container px-4 pb-12 pt-2 sm:px-6 md:pb-16 lg:px-8 lg:pb-20 xl:px-12">
        <Hero />

        <div className="mt-12 md:mt-16">
          <p className="mb-3 font-mono text-mono-label uppercase text-label">Record</p>
          <ProfileSchema />
        </div>

        <div className="mt-10 lg:mt-12">
          <p className="mb-3 font-mono text-mono-label uppercase text-label">Signals</p>
          <KpiStrip />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mt-12">
          <div className="border border-hairline bg-panel p-6">
            <p className="mb-4 font-mono text-mono-label uppercase text-label">Reporting impact</p>
            <BarChart />
            <div className="mt-8 border-t border-hairline pt-8">
              <RuntimeBar />
            </div>
          </div>
          <div className="border border-hairline bg-panel p-6">
            <p className="mb-3 font-mono text-mono-label uppercase text-label">Now</p>
            <p className="text-body text-ink-2">{now}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
