import { useState } from 'react'
import { onTimeChart as c } from '../data/metrics'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const MONO = "'Spline Sans Mono', ui-monospace, monospace"

/** On-time visit-rate figure. Bars grow from the baseline on scroll-in; hovering a
 *  bar emphasizes it. Both bars carry text values + a full aria-label, so meaning
 *  is never color- or motion-dependent. "Before" is outlined (a faint fill is <3:1). */
export function BarChart() {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLElement>()
  const [hover, setHover] = useState<'before' | 'after' | null>(null)
  const grown = reduced || inView
  const label = `On-time clinic-visit rate rose from ${c.before.display} before to ${c.after.display} after a scheduling pipeline, a gain of ${c.delta}.`

  const barsStyle = {
    transform: grown ? 'none' : 'scaleY(0)',
    transformBox: 'view-box' as const,
    transformOrigin: '150px 130px',
    transition: reduced ? undefined : 'transform 900ms cubic-bezier(0.22,1,0.36,1)',
  }
  // Values stay readable at all times (only the bars animate in).
  const labelStyle = (on: boolean) => ({
    transition: reduced ? undefined : 'font-size 150ms ease',
    fontSize: on ? 16 : 14,
  })

  return (
    <figure ref={ref} className="m-0">
      <p className="font-display text-display-m font-bold text-ink">{c.finding}</p>
      <figcaption className="mt-1 font-mono text-mono-label uppercase text-label">{c.caption}</figcaption>
      <svg viewBox="0 0 300 160" role="img" aria-label={label} className="mt-4 block w-full max-w-[340px]">
        <text x="150" y="13" textAnchor="middle" fontSize="11" fontWeight="700" fill="#c41f00" fontFamily={MONO}>
          {c.delta}
        </text>
        <line x1="30" y1="130" x2="270" y2="130" stroke="#565650" strokeWidth="1.5" />

        <g style={barsStyle}>
          <rect
            x="60" y="33" width="70" height="97"
            fill={hover === 'before' ? 'rgba(86,86,80,0.14)' : 'none'}
            stroke="#161614" strokeWidth="1.5"
            onPointerEnter={() => setHover('before')}
            onPointerLeave={() => setHover(null)}
          />
          <rect
            x="170" y="24" width="70" height="106"
            fill="#ff2d16" opacity={hover === 'after' ? 0.85 : 1}
            onPointerEnter={() => setHover('after')}
            onPointerLeave={() => setHover(null)}
          />
        </g>

        <text x="95" y="27" textAnchor="middle" fontWeight="700" fill="#161614" fontFamily={MONO} style={labelStyle(hover === 'before')}>
          {c.before.display}
        </text>
        <text x="205" y="18" textAnchor="middle" fontWeight="700" fill="#161614" fontFamily={MONO} style={labelStyle(hover === 'after')}>
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
