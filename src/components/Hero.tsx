import { identity } from '../data/profile'
import { Button } from './primitives/Button'
import { Dot } from './primitives/Dot'
import { HeroField } from './HeroField'
import { Reveal } from './Reveal'

/** Identity block: data-field backdrop, editorial serif nameplate (sized to its
 *  column via cqw), tagline, availability, one primary CTA. The page's only <h1>. */
export function Hero() {
  return (
    <div className="relative flex flex-col justify-center [container-type:inline-size]">
      <HeroField />

      <div className="relative z-10">
        <Reveal delay={0}>
          <p className="font-mono text-mono-label uppercase tracking-kicker text-label">{identity.eyebrow}</p>
        </Reveal>

        <Reveal delay={90}>
          <h1
            data-nameplate
            className="mt-4 font-serif text-[clamp(2.5rem,14cqw,7rem)] font-[900] uppercase leading-[0.92] tracking-[-0.015em] text-ink"
          >
            <span className="block">Tobin</span>
            <span className="relative inline-block">
              Zolkowski
              <span aria-hidden="true" className="absolute -bottom-1 left-0 h-1 w-[0.4em] bg-signal-graphic" />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={170}>
          <p className="mt-6 max-w-reading text-body-lg font-medium text-ink-2">
            {identity.taglineLead} <span className="font-bold text-ink">{identity.taglineEmphasis}</span>
          </p>
        </Reveal>

        <Reveal delay={230}>
          <p className="mt-5 inline-flex items-center gap-2 font-mono text-mono-label uppercase text-ink">
            <Dot />
            {identity.status}
          </p>
        </Reveal>

        <Reveal delay={290}>
          <div className="mt-6">
            <Button as="a" href="#writing" variant="ghost">
              Read the writing →
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
