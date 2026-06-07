import { useLayoutEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

const HEADER = 56 // sticky header height — scroll offset for anchors + pins

type WindowWithLenis = Window & { __lenis?: Lenis }

/**
 * The whole scroll experience, set up once after mount:
 *  - Lenis inertia smooth-scroll synced to GSAP's ticker + ScrollTrigger
 *  - header-aware smooth anchor navigation
 *  - gsap.matchMedia choreography: parallax everywhere, and (desktop, tall enough,
 *    motion-OK) a pinned/scrubbed hero + horizontal-scroll Projects with keyboard
 *    focus-into-view
 * Reduced-motion is honored live (Lenis is started/stopped when the preference
 * changes); under reduced motion nothing animates and native scrolling is used.
 */
export function useScrollExperience(): void {
  useLayoutEffect(() => {
    let alive = true
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    let lenis: Lenis | null = null
    let ticker: ((t: number) => void) | null = null

    const startLenis = () => {
      if (lenis) return
      lenis = new Lenis({ duration: 1.05, smoothWheel: true })
      ;(window as WindowWithLenis).__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      ticker = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(ticker)
      gsap.ticker.lagSmoothing(0)
    }
    const stopLenis = () => {
      if (ticker) {
        gsap.ticker.remove(ticker)
        ticker = null
      }
      gsap.ticker.lagSmoothing(1000, 16) // restore GSAP's process-wide default
      if (lenis) {
        const w = window as WindowWithLenis
        if (w.__lenis === lenis) delete w.__lenis
        lenis.destroy()
        lenis = null
      }
    }

    if (!reduceMq.matches) startLenis()

    // Honor a mid-session reduced-motion toggle for the smooth-scroll itself.
    const onReduceChange = () => {
      if (reduceMq.matches) stopLenis()
      else startLenis()
      ScrollTrigger.refresh()
    }
    reduceMq.addEventListener('change', onReduceChange)

    // Header-aware in-page anchor navigation (same offset on both paths).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute('href') || ''
      if (hash.length < 2) return
      const target = document.querySelector(hash) as HTMLElement | null
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target, { offset: -HEADER })
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER })
    }
    document.addEventListener('click', onClick)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Parallax — any motion-OK viewport.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amt = parseFloat(el.dataset.parallax || '0')
          gsap.to(el, {
            yPercent: amt,
            ease: 'none',
            scrollTrigger: {
              trigger: (el.closest('section, [data-hero-pin]') as HTMLElement) || el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        })
      })

      // Desktop + tall enough + motion-OK: pinned hero + horizontal Projects.
      // The min-height floor keeps short/landscape screens on the readable grid so a
      // pinned section can never push content off-screen.
      mm.add('(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)', () => {
        const heroPin = document.querySelector<HTMLElement>('[data-hero-pin]')
        const nameplate = document.querySelector<HTMLElement>('[data-nameplate]')
        if (heroPin && nameplate) {
          gsap
            .timeline({
              scrollTrigger: { trigger: heroPin, start: `top top+=${HEADER}`, end: '+=55%', pin: true, pinSpacing: true, scrub: true },
            })
            .to(nameplate, { scale: 0.9, opacity: 0.5, transformOrigin: 'left center', ease: 'none' }, 0)
        }

        const section = document.querySelector<HTMLElement>('#projects')
        const track = document.querySelector<HTMLElement>('[data-projects-track]')
        const wrap = track?.parentElement
        if (!section || !track || !wrap) return

        gsap.set(wrap, { overflow: 'hidden' })
        gsap.set(track, { display: 'flex', flexWrap: 'nowrap', gap: '24px' })
        gsap.set(Array.from(track.children), { flex: '0 0 360px' })
        const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth)
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: `top top+=${HEADER}`,
            end: () => `+=${dist()}`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        const st = tween.scrollTrigger

        // Keyboard reachability: a focused card that's clipped off-screen maps to the
        // scroll position that scrubs it into view.
        const onFocusIn = (e: FocusEvent) => {
          const card = (e.target as HTMLElement | null)?.closest?.('[data-projects-track] > *') as HTMLElement | null
          if (!card || !st) return
          const d = dist()
          if (d <= 0) return
          const offset = card.getBoundingClientRect().left - track.getBoundingClientRect().left
          const fraction = Math.min(1, Math.max(0, offset / d))
          const y = st.start + fraction * (st.end - st.start)
          if (lenis) lenis.scrollTo(y)
          else window.scrollTo({ top: y })
        }
        document.addEventListener('focusin', onFocusIn)
        return () => document.removeEventListener('focusin', onFocusIn)
      })
    })

    if (document.fonts?.ready) document.fonts.ready.then(() => alive && ScrollTrigger.refresh())
    requestAnimationFrame(() => alive && ScrollTrigger.refresh())

    return () => {
      alive = false
      document.removeEventListener('click', onClick)
      reduceMq.removeEventListener('change', onReduceChange)
      ctx.revert()
      stopLenis()
    }
  }, [])
}
