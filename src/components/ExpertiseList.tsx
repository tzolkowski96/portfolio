import { capabilities } from '../data/expertise'
import { emphasizeFigures } from '../lib/text'
import { Reveal } from './Reveal'

/** Four capabilities as a big-type list: index, a large serif title, and the
 *  detail beside it — one row per capability, arriving in a stagger. */
export function ExpertiseList() {
  return (
    <ol className="border-t border-hairline">
      {capabilities.map((cap, i) => (
        <li key={cap.id} className="border-b border-hairline">
          <Reveal
            delay={i * 70}
            className="grid grid-cols-1 gap-3 py-9 md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1fr)] md:items-baseline md:gap-10 md:py-12"
          >
            <span aria-hidden="true" className="font-mono text-nav text-index">
              {cap.id}
            </span>
            <h3 className="font-serif text-[clamp(2.125rem,4.4vw,4rem)] font-light leading-[1] tracking-[-0.03em] text-ink">
              {cap.title}
            </h3>
            <p className="max-w-[44ch] text-pretty text-body text-ink-2">{emphasizeFigures(cap.detail)}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
