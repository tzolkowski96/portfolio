import { workEntries } from '../data/work'
import { emphasizeFigures } from '../lib/text'
import { Reveal } from './Reveal'

/** Reverse-chron work history: the period set large in serif italic with the
 *  location beneath; the org + role as one heading (the role distinguishes the
 *  two IU entries), then the bullets. */
export function WorkLog() {
  return (
    <ol className="border-t border-hairline">
      {workEntries.map((entry, i) => (
        <li key={i} className="border-b border-hairline">
          <Reveal className="grid grid-cols-1 gap-6 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] md:gap-12 md:py-16">
            <div>
              <p className="font-serif text-[clamp(1.875rem,3.2vw,3rem)] font-light italic leading-none tracking-[-0.02em] text-ink">
                {entry.period}
              </p>
              <p className="mt-4 font-mono text-mono-label uppercase tracking-kicker text-label">{entry.location}</p>
            </div>
            <div>
              <h3 className="font-serif text-serif-l font-light text-ink">
                {entry.org}{' '}
                <span className="mt-2 block font-mono text-mono-label uppercase tracking-kicker text-label">{entry.role}</span>
              </h3>
              <ul className="mt-6 space-y-3">
                {entry.bullets.map((bullet, j) => (
                  <li key={j} className="relative pl-6 text-body-sm text-ink-2">
                    <span aria-hidden="true" className="absolute left-0 top-[0.72em] h-0 w-3 border-t border-label" />
                    {emphasizeFigures(bullet)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
