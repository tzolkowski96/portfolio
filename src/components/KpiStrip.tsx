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
  if (!animate || Number.isNaN(target)) return <>{raw}</>
  return <>{formatNum(v, decimals, grouped)}</>
}

/** Four KPI figures. Numbers count up on scroll-in; red unit is graphic-only meaning. */
export function KpiStrip() {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4"
    >
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-panel p-6">
          <p className="font-display text-metric font-extrabold tabular-nums text-ink">
            <CountUp raw={kpi.value} active={inView} animate={!reduced} />
            {kpi.unit && <span className="align-top text-[0.6em] text-signal">{kpi.unit}</span>}
          </p>
          <p className="mt-3 font-mono text-mono-label uppercase leading-relaxed text-label">{kpi.caption}</p>
        </div>
      ))}
    </div>
  )
}
