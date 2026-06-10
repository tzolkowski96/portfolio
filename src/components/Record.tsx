import { Suspense, lazy } from 'react'
import { Hero } from './Hero'
import { ProfileSchema } from './ProfileSchema'
import { KpiStrip } from './KpiStrip'
import { BarChart } from './BarChart'
import { RuntimeBar } from './RuntimeBar'
import { now } from '../data/metrics'

// three.js ships as its own deferred chunk — the page paints without it and the
// field fades in when ready (it's decorative, so nothing depends on it).
const ThreeHero = lazy(() => import('./ThreeHero').then((m) => ({ default: m.ThreeHero })))

/** The "record" lede: identity + profile over the WebGL field, then the 4-stat
 *  strip, then chart + now. Opaque panels sit above the field on their own layer. */
export function Record() {
  return (
    <section aria-label="Overview" className="relative border-b border-hairline">
      <Suspense fallback={null}>
        <ThreeHero />
      </Suspense>
      <div className="relative z-10 mx-auto w-full max-w-container px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20 xl:px-12">
        <div
          data-hero-pin
          className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-12"
        >
          <Hero />
          <div className="flex flex-col justify-center">
            <ProfileSchema />
          </div>
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
