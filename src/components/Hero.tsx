import { identity } from '../data/profile'
import { Button } from './primitives/Button'
import { Dot } from './primitives/Dot'
import { HeroField } from './HeroField'
import { Reveal } from './Reveal'

/** Identity block: data-field backdrop, editorial serif nameplate (sized to its
 *  column via cqw) that rises line-by-line out of masks before the red tab draws
 *  in, a display-register claim with a mono spec line under it, availability, and
 *  one primary CTA. The page's only <h1>. */
export function Hero() {
  return (
    // container-type makes the nameplate size to THIS column (cqw), not the
    // viewport — so a long single word ("Zolkowski") can never outgrow its
    // column and collide with the profile schema beside it.
    <div className="relative flex flex-col justify-center [container-type:inline-size]">
      <HeroField />

      <div className="relative z-10">
        <Reveal delay={0}>
          <p className="font-mono text-mono-label uppercase tracking-kicker text-label">{identity.eyebrow}</p>
        </Reveal>

        <Reveal mode="fade" delay={90}>
          <h1
            data-nameplate
            className="mt-4 font-serif text-[clamp(2.5rem,14cqw,7rem)] font-[900] uppercase leading-[0.92] tracking-[-0.015em] text-ink"
          >
            {/* pt/-mt pairs guard Fraunces' ascender overshoot at tight leading */}
            <span className="-mt-[0.06em] block overflow-hidden pt-[0.06em]">
              <span className="mask-line" style={{ transitionDelay: '90ms' }}>
                Tobin
              </span>
            </span>
            <span className="relative inline-block">
              <span className="-mt-[0.06em] block overflow-hidden pt-[0.06em]">
                <span className="mask-line" style={{ transitionDelay: '180ms' }}>
                  Zolkowski
                </span>
              </span>
              <span
                aria-hidden="true"
                className="rule-draw absolute -bottom-1 left-0 h-1 w-[0.4em] bg-signal-graphic"
                style={{ transitionDelay: '480ms', transitionDuration: '0.6s' }}
              />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={170}>
          <p className="mt-6 max-w-[40ch] text-pretty font-display text-display-m font-medium leading-snug text-ink">
            {identity.taglineLead}
          </p>
          <p className="mt-4 max-w-reading font-mono text-mono-data text-label">{identity.taglineEmphasis}</p>
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
