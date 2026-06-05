import { workEntries } from '../data/work'
import { emphasizeFigures } from '../lib/text'

/** Reverse-chron work history as an ordered list: when/org/loc rail + bullets. */
export function WorkLog() {
  return (
    <ol className="grid grid-cols-1 gap-px border border-hairline bg-hairline">
      {workEntries.map((entry, i) => (
        <li key={i} className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-[210px_minmax(0,1fr)]">
          <div className="bg-panel p-6">
            <p className="font-mono text-mono-label uppercase text-signal">{entry.period}</p>
            <p className="mt-2 font-display text-title font-extrabold text-ink">{entry.org}</p>
            <p className="mt-2 font-mono text-mono-label uppercase text-label">{entry.location}</p>
          </div>
          <div className="bg-panel p-6">
            <p className="font-mono text-mono-label uppercase text-ink">{entry.role}</p>
            <ul className="mt-4 space-y-3">
              {entry.bullets.map((bullet, j) => (
                <li key={j} className="relative pl-5 text-body-sm text-ink-2">
                  <span aria-hidden="true" className="absolute left-0 top-[0.6em] h-0.5 w-2.5 bg-signal-graphic" />
                  {emphasizeFigures(bullet)}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  )
}
