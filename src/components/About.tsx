import { aboutProse, skillBlocks } from '../data/about'
import { profileRows } from '../data/profile'
import { serifAccent } from '../lib/text'
import { Reveal } from './Reveal'

const ROW = 'grid grid-cols-1 gap-1 py-4 sm:grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] sm:gap-6'
const DT = 'font-mono text-mono-label uppercase tracking-kicker text-label'

/** Split the first n sentences off a paragraph (for the serif lead). */
function splitLead(p: string, n = 2): [string, string] {
  const parts = p.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [p]
  return [parts.slice(0, n).join('').trim(), parts.slice(n).join('').trim()]
}

/** About: the opening sentences as a large serif lead, the rest of the prose at
 *  a reading measure, and beside it the profile and toolkit as quiet lists.
 *  Languages live in the toolkit with their levels, so the profile skips its
 *  shorthand row. */
export function About() {
  const profile = profileRows.filter((row) => row.key !== 'Languages')
  const [lead, firstRest] = splitLead(aboutProse[0])
  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
      <div>
        <Reveal>
          <p className="max-w-[18ch] text-balance font-serif text-[clamp(2.25rem,4vw,3.75rem)] font-light leading-[1.06] tracking-[-0.03em] text-ink">
            {lead}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-10 max-w-reading space-y-6">
            {firstRest && <p className="text-pretty text-body-lg text-ink-2">{firstRest}</p>}
            {aboutProse.slice(1).map((para, i) => (
              <p key={i} className="text-pretty text-body-lg text-ink-2">
                {i === 0 ? serifAccent(para, 'data is translation') : para}
              </p>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={200} className="space-y-12 lg:pt-4">
        <div>
          <h3 className={DT}>Profile</h3>
          <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
            {profile.map((row) => (
              <div key={row.key} className={ROW}>
                <dt className={DT}>{row.key}</dt>
                <dd className="text-body-sm text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className={DT}>Toolkit</h3>
          <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
            {skillBlocks.map((block) => (
              <div key={block.title} className={ROW}>
                <dt className={DT}>{block.title}</dt>
                <dd className="space-y-1">
                  {block.items.map((item, j) => (
                    <p key={j} className="text-body-sm text-ink">
                      {item.label}
                      {item.note && <span className="text-label"> · {item.note}</span>}
                    </p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </div>
  )
}
