import { kpis } from '../data/metrics'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useCountUp } from '../hooks/useCountUp'

function formatNum(v: number, decimals: number, grouped: boolean): string {
  const fixed = v.toFixed(decimals)
  if (!grouped) return fixed
  const [int, dec] = fixed.split('.')
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec ? `${withCommas}.${dec}` : withCommas
}

/** Animates a numeric string (e.g. "6.4", "1,300") from 0 to its value, preserving
 *  decimals + comma grouping. Renders the value verbatim under reduced-motion. */
function CountUp({ raw, active, animate }: { raw: string; active: boolean; animate: boolean }) {
  const target = parseFloat(raw.replace(/,/g, ''))
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  const grouped = raw.includes(',')
  const v = useCountUp(target, active && animate)
  // Show the real figure until it animates in, so off-screen / no-scroll / print
  // tiles never read "0".
  if (!active || !animate || Number.isNaN(target)) return <>{raw}</>
  return <>{formatNum(v, decimals, grouped)}</>
}

/** The mega-stats band: four figures full-bleed at monument scale, 2×2 at every
 *  width ≥sm — the C2 stats moment. Numbers still count up on scroll-in. */
export function KpiStrip() {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div ref={ref} className="border-y border-hairline bg-cream [container-type:inline-size]">
      <p className="border-b border-hairline">
        <span className="mx-auto block max-w-container px-4 py-4 font-mono text-mono-label uppercase text-label sm:px-6 lg:px-8 xl:px-12">
          Signals
        </span>
      </p>
      <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`bg-cream px-4 py-12 sm:px-8 md:py-20 lg:px-12 ${
              reduced
                ? ''
                : `transition-all duration-700 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`
            }`}
            style={reduced ? undefined : { transitionDelay: `${i * 70}ms` }}
          >
            <p className="font-display text-[clamp(3.5rem,11cqw,11rem)] font-[900] leading-[0.9] tracking-[-0.03em] tabular-nums text-ink">
              <CountUp raw={kpi.value} active={inView} animate={!reduced} />
              {kpi.unit && <span className="align-top text-[0.45em] font-extrabold text-label">{kpi.unit}</span>}
            </p>
            <p className="mt-4 max-w-[34ch] font-mono text-mono-label uppercase leading-relaxed text-label">{kpi.caption}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
