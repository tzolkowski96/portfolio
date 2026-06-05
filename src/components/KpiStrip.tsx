import { kpis } from '../data/metrics'

/** Four KPI figures. The red unit suffix is graphic-only; meaning is in the caption. */
export function KpiStrip() {
  return (
    <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-panel p-6">
          <p className="font-display text-metric font-extrabold tabular-nums text-ink">
            {kpi.value}
            {kpi.unit && <span className="align-top text-[0.6em] text-signal">{kpi.unit}</span>}
          </p>
          <p className="mt-3 font-mono text-mono-label uppercase leading-relaxed text-label">{kpi.caption}</p>
        </div>
      ))}
    </div>
  )
}
