import { identity } from '../data/profile'
import { Button } from './primitives/Button'
import { Dot } from './primitives/Dot'
import { Reveal } from './Reveal'

/** The hero as a full-viewport typographic statement: kicker + availability on
 *  the top line, the nameplate sized to fill the container width (cqw), and a
 *  baseline meta row — claim, toolchain spec, CTA — beneath it. The terrain
 *  flows behind. The page's only <h1>. */
export function Hero() {
  return (
    // container-type sizes the nameplate to the container (cqw), so the longest
    // line ("Zolkowski") fills the measure at every width without overflowing.
    <div
      data-hero-pin
      className="relative flex min-h-[76svh] flex-col justify-between pt-6 md:min-h-[82svh] md:pt-8 [container-type:inline-size]"
    >
      <Reveal delay={0}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="font-mono text-mono-label uppercase tracking-kicker text-label">{identity.eyebrow}</p>
          <p className="inline-flex items-center gap-2 font-mono text-mono-label uppercase text-ink">
            <Dot />
            {identity.status}
          </p>
        </div>
      </Reveal>

      <div>
        <Reveal mode="fade" delay={90}>
          <h1
            data-nameplate
            className="font-serif text-[clamp(2.75rem,16.2cqw,13rem)] font-[900] uppercase leading-[0.86] tracking-[-0.02em] text-ink [font-variation-settings:'opsz'_144]"
          >
            {/* pt/-mt pairs guard Fraunces' ascender overshoot at tight leading */}
            <span className="-mt-[0.06em] block overflow-hidden pt-[0.06em]">
              <span className="mask-line" style={{ transitionDelay: '90ms' }}>
                Tobin
              </span>
            </span>
            <span className="relative block">
              <span className="-mt-[0.06em] block overflow-hidden pt-[0.06em]">
                <span className="mask-line" style={{ transitionDelay: '180ms' }}>
                  Zolkowski
                </span>
              </span>
              <span
                aria-hidden="true"
                className="rule-draw absolute -bottom-2 left-[0.02em] h-[0.07em] w-[0.4em] bg-signal-graphic"
                style={{ transitionDelay: '480ms', transitionDuration: '0.6s' }}
              />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-10 grid items-end gap-x-10 gap-y-6 border-t border-hairline pt-6 md:mt-14 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]">
            <p className="max-w-[36ch] text-pretty font-display text-display-m font-medium leading-snug text-ink">
              {identity.taglineLead}
            </p>
            <p className="max-w-[44ch] font-mono text-mono-data text-label">{identity.taglineEmphasis}</p>
            <Button as="a" href="#writing" variant="ghost">
              Read the writing →
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
