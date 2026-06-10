import { aboutProse, skillBlocks } from '../data/about'
import { serifAccent } from '../lib/text'

/** Reading-measure prose (66ch) + the skill reference blocks as <dl>s. */
export function About() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
      <div className="max-w-reading space-y-6">
        {aboutProse.map((para, i) => (
          <p key={i} className="text-pretty text-body text-ink-2">
            {i === 1 ? serifAccent(para, 'data is translation') : para}
          </p>
        ))}
      </div>

      <dl className="grid grid-cols-1 gap-px self-start border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-1">
        {skillBlocks.map((block) => (
          <div key={block.title} className="bg-panel p-4">
            <dt className="font-mono text-mono-label uppercase text-label">{block.title}</dt>
            <dd className="mt-2 space-y-1">
              {block.items.map((item, j) => (
                <p key={j} className="font-mono text-mono-data text-ink">
                  {item.label}
                  {item.note && <span className="text-label"> {item.note}</span>}
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
