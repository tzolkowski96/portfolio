import { onTimeChart as c } from '../data/metrics'

const MONO = "'Spline Sans Mono', ui-monospace, monospace"

/** On-time visit-rate figure. Both bars carry text value labels and the SVG has a
 *  full aria-label, so the gain is never communicated by color alone. The "before"
 *  bar is outlined (a faint fill would be <3:1); "after" uses the brand red graphic. */
export function BarChart() {
  const label = `On-time clinic-visit rate rose from ${c.before.display} before to ${c.after.display} after a scheduling pipeline, a gain of ${c.delta}.`
  return (
    <figure className="m-0">
      <p className="font-display text-display-m font-bold text-ink">{c.finding}</p>
      <figcaption className="mt-1 font-mono text-mono-label uppercase text-label">{c.caption}</figcaption>
      <svg viewBox="0 0 300 160" role="img" aria-label={label} className="mt-4 block w-full max-w-[340px]">
        <text x="150" y="13" textAnchor="middle" fontSize="11" fontWeight="700" fill="#c41f00" fontFamily={MONO}>
          {c.delta}
        </text>
        <line x1="30" y1="130" x2="270" y2="130" stroke="#565650" strokeWidth="1.5" />
        <rect x="60" y="33" width="70" height="97" fill="none" stroke="#161614" strokeWidth="1.5" />
        <rect x="170" y="24" width="70" height="106" fill="#ff2d16" />
        <text x="95" y="27" textAnchor="middle" fontSize="14" fontWeight="700" fill="#161614" fontFamily={MONO}>
          {c.before.display}
        </text>
        <text x="205" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#161614" fontFamily={MONO}>
          {c.after.display}
        </text>
        <text x="95" y="148" textAnchor="middle" fontSize="11" fill="#565650" fontFamily={MONO}>
          {c.before.label}
        </text>
        <text x="205" y="148" textAnchor="middle" fontSize="11" fill="#565650" fontFamily={MONO}>
          {c.after.label}
        </text>
      </svg>
    </figure>
  )
}
