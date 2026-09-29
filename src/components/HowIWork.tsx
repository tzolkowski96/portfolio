import { useLayoutEffect, useRef } from 'react'
import { Chars } from './Chars'
import { gsap } from '../lib/gsap'

// His own method, from the About prose ("Same job in any sector: pull the mess
// together, automate the flow, make it readable."). Captions reuse his wording.
const STEPS = [
  {
    title: 'Pull the mess together',
    caption: 'Data out of systems that were never meant to talk to each other, normalized and handed back ready to use.',
  },
  {
    title: 'Automate the flow',
    caption: 'So the dull, breakable parts don’t make the work wait.',
  },
  {
    title: 'Make it readable',
    caption: 'Reporting people actually read, and writing that says plainly what’s going on.',
  },
]

const CONTAINER = 'mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 xl:px-12'

/**
 * The working method as a scroll story. On desktop (≥1024×700, motion OK) the
 * section pins and the three steps take the screen one at a time — letters
 * rising out of their masks, a giant outline numeral, a progress rail — while
 * the terrain behind acts each step out (the intro wrapper gets data-story="on",
 * which ThreeHero reads). Everywhere else it's a readable three-column list,
 * with a letter reveal on scroll when motion is allowed. All three steps stay
 * in the DOM as an ordered list, so assistive tech reads the whole method.
 */
export function HowIWork() {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const intro = section.closest<HTMLElement>('[data-intro]')
    const mm = gsap.matchMedia()

    mm.add(
      {
        pin: '(min-width: 1024px) and (min-height: 700px)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { pin, motion } = ctx.conditions as { pin: boolean; motion: boolean }
        if (!motion) return

        const steps = gsap.utils.toArray<HTMLElement>('.how-step', section)
        const chars = steps.map((s) => Array.from(s.querySelectorAll<HTMLElement>('.split-char')))
        const caps = steps.map((s) => s.querySelector<HTMLElement>('.how-caption'))
        const nums = steps.map((s) => s.querySelector<HTMLElement>('.how-num-inner'))
        const bars = gsap.utils.toArray<HTMLElement>('.how-bar', section)

        if (!pin) {
          // Readable list: each step's title rises in when it enters.
          chars.forEach((c) => gsap.set(c, { yPercent: 118 }))
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return
                io.unobserve(e.target)
                const i = steps.indexOf(e.target as HTMLElement)
                ctx.add(() => gsap.to(chars[i], { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.025 }))
              })
            },
            { rootMargin: '0px 0px -8% 0px' },
          )
          steps.forEach((s) => io.observe(s))
          return () => io.disconnect()
        }

        section.classList.add('is-pinned')
        if (intro) intro.dataset.story = 'on'

        // Step 1 shows first; 2 and 3 wait below their masks.
        gsap.set(steps.slice(1), { opacity: 0 })
        chars.slice(1).forEach((c) => gsap.set(c, { yPercent: 118 }))
        gsap.set(caps.slice(1), { opacity: 0, y: 24 })
        gsap.set(nums.slice(1), { opacity: 0, yPercent: 10 })
        gsap.set(bars, { scaleX: 0 })
        gsap.set(bars[0], { scaleX: 1 })
        // The first title rises as the story scrolls in — scrubbed (not one-shot)
        // and created before the pinned timeline, so both stay deterministic
        // even when the page is loaded mid-story.
        gsap.fromTo(
          chars[0],
          { yPercent: 118 },
          {
            yPercent: 0,
            ease: 'none',
            stagger: 0.03,
            scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 20%', scrub: 0.6 },
          },
        )

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=280%',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        })
        tl.to({}, { duration: 0.35 }) // hold on step 1
        for (let i = 0; i < steps.length - 1; i++) {
          const at = tl.duration()
          tl.to(chars[i], { yPercent: -118, duration: 0.45, ease: 'power2.in', stagger: 0.01 }, at)
            .to(caps[i], { opacity: 0, y: -24, duration: 0.3 }, at)
            .to(nums[i], { opacity: 0, yPercent: -10, duration: 0.4 }, at)
            .set(steps[i + 1], { opacity: 1 }, at + 0.3)
            .to(chars[i + 1], { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.012 }, at + 0.3)
            .to(nums[i + 1], { opacity: 1, yPercent: 0, duration: 0.55 }, at + 0.32)
            .to(caps[i + 1], { opacity: 1, y: 0, duration: 0.4 }, at + 0.55)
            .to(bars[i + 1], { scaleX: 1, duration: 0.55, ease: 'none' }, at + 0.3)
            .set(steps[i], { opacity: 0 }, at + 0.6)
          tl.to({}, { duration: 0.35 }) // hold
        }

        return () => {
          section.classList.remove('is-pinned')
          if (intro) delete intro.dataset.story
        }
      },
    )
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} aria-labelledby="how-heading" className="how relative z-10 bg-cream">
      <div aria-hidden="true" className="how-scrim pointer-events-none absolute inset-0 hidden" />
      <div className={`how-stage relative ${CONTAINER} py-24 md:py-32`}>
        <div className="flex items-center justify-between gap-6">
          <h2 id="how-heading" className="font-mono text-mono-label uppercase tracking-kicker text-label">
            How I work <span className="text-index">— same job, any sector</span>
          </h2>
          <div aria-hidden="true" className="how-progress hidden items-center gap-2">
            {STEPS.map((_, i) => (
              <span key={i} className="block h-px w-10 overflow-hidden bg-hairline">
                <span className="how-bar block h-full w-full origin-left bg-ink" />
              </span>
            ))}
          </div>
        </div>
        <ol className="how-steps mt-10 grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.title} className="how-step">
              {/* outer span centers (CSS only); the inner span is what GSAP
                  animates — so a tween can never overwrite the centering */}
              <span aria-hidden="true" className="how-num hidden">
                <span className="how-num-inner block">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span aria-hidden="true" className="how-rule block h-0 w-full border-t border-rule-strong" />
              <span aria-hidden="true" className="how-index mt-6 block font-mono text-nav text-index">
                {String(i + 1).padStart(2, '0')} / 03
              </span>
              <h3 aria-label={s.title} className="how-title mt-4 font-serif text-serif-l font-light text-ink">
                <Chars text={s.title} />
              </h3>
              <p className="how-caption mt-4 max-w-[34ch] text-pretty text-body-sm text-ink-2">{s.caption}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
