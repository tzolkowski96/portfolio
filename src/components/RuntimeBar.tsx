import { runtime as r } from '../data/metrics'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** Report-runtime reduction (2 h → 10 min) as proportional horizontal bars that
 *  grow on scroll-in. Bars are aria-hidden; an sr-only sentence carries the data. */
export function RuntimeBar() {
  const reduced = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLElement>()
  const grown = reduced || inView
  const afterPct = (r.after.minutes / r.before.minutes) * 100
  const trans = reduced ? undefined : 'width 900ms cubic-bezier(0.22,1,0.36,1)'

  return (
    <figure ref={ref} className="m-0">
      <p className="font-display text-display-m font-bold text-ink">{r.label}</p>
      <figcaption className="mt-1 font-mono text-mono-label uppercase text-label">{r.caption}</figcaption>

      <div className="mt-4 space-y-3" aria-hidden="true">
        <div>
          <div className="mb-1 flex items-center justify-between font-mono text-mono-label uppercase">
            <span className="text-label">Before</span>
            <span className="text-ink">{r.before.display}</span>
          </div>
          <div className="h-3 w-full border border-hairline">
            <div className="h-full bg-ink" style={{ width: grown ? '100%' : '0%', transition: trans }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between font-mono text-mono-label uppercase">
            <span className="text-label">After</span>
            <span className="text-ink">
              {r.after.display} <span className="text-signal">{r.delta}</span>
            </span>
          </div>
          <div className="h-3 w-full border border-hairline">
            <div className="h-full bg-signal-graphic" style={{ width: grown ? `${afterPct}%` : '0%', transition: trans }} />
          </div>
        </div>
      </div>

      <p className="sr-only">
        {r.label}: down from {r.before.display} to {r.after.display}, {r.delta}.
      </p>
    </figure>
  )
}
