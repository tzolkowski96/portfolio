import { identity } from '../data/profile'
import { Button } from './primitives/Button'
import { Dot } from './primitives/Dot'

/** Calmer identity block: kicker, nameplate (with the graphic red tick), tagline,
 *  availability, one primary CTA. The single <h1> on the page. */
export function Hero() {
  return (
    <div className="flex flex-col justify-center">
      <p className="font-mono text-mono-label uppercase tracking-kicker text-label">{identity.eyebrow}</p>

      <h1 className="mt-4 font-display text-display-xl font-black uppercase leading-[0.86] tracking-[-0.025em] text-ink">
        <span className="block">Tobin</span>
        <span className="relative inline-block">
          Zolkowski
          <span aria-hidden="true" className="absolute -bottom-1 left-0 h-1 w-[0.4em] bg-signal-graphic" />
        </span>
      </h1>

      <p className="mt-6 max-w-reading text-body-lg font-medium text-ink-2">
        {identity.taglineLead} <span className="font-bold text-ink">{identity.taglineEmphasis}</span>
      </p>

      <p className="mt-5 inline-flex items-center gap-2 font-mono text-mono-label uppercase text-ink">
        <Dot />
        {identity.status}
      </p>

      <div className="mt-6">
        <Button as="a" href="#writing" variant="ghost">
          Read the writing →
        </Button>
      </div>
    </div>
  )
}
