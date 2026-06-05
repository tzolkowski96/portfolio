import { Hero } from './Hero'
import { ProfileSchema } from './ProfileSchema'
import { KpiStrip } from './KpiStrip'
import { BarChart } from './BarChart'
import { now } from '../data/metrics'

/** The "record" lede: identity + profile, then a 4-stat strip, then chart + now. */
export function Record() {
  return (
    <div className="border-b border-hairline">
      <div className="mx-auto w-full max-w-container px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20 xl:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-12">
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
            <BarChart />
          </div>
          <div className="border border-hairline bg-panel p-6">
            <p className="mb-3 font-mono text-mono-label uppercase text-label">Now</p>
            <p className="text-body text-ink-2">{now}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
