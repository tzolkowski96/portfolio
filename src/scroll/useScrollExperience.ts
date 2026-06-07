import { useLayoutEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

const HEADER = 56 // sticky header height, used as scroll offset

/**
 * Sets up the whole scroll experience once, after mount:
 *  - Lenis inertia smooth-scroll, synced to GSAP's ticker + ScrollTrigger
 *  - smooth anchor navigation (offset for the sticky header)
 *  - a gsap.matchMedia choreography: scrubbed reveals + parallax everywhere, and
 *    (desktop only) a pinned/scrubbed hero and a horizontal-scroll Projects section
 * Everything is gated on (prefers-reduced-motion: no-preference); under reduced
 * motion nothing animates and native scrolling is used.
 */
export function useScrollExperience(): void {
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let lenis: Lenis | null = null
    let ticker: ((t: number) => void) | null = null
    if (!reduce) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true })
      ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      ticker = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(ticker)
      gsap.ticker.lagSmoothing(0)
    }

    // Smooth in-page anchor navigation (header-aware).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute('href') || ''
      if (hash.length < 2) return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -HEADER })
      else (target as HTMLElement).scrollIntoView()
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

      // Desktop-only: pinned scrubbed hero + horizontal Projects.
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const heroPin = document.querySelector<HTMLElement>('[data-hero-pin]')
        const nameplate = document.querySelector<HTMLElement>('[data-nameplate]')
        if (heroPin && nameplate) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: heroPin,
                start: `top top+=${HEADER}`,
                end: '+=55%',
                pin: true,
                pinSpacing: true,
                scrub: true,
              },
            })
            .to(nameplate, { scale: 0.9, opacity: 0.5, transformOrigin: 'left center', ease: 'none' }, 0)
        }

        const section = document.querySelector<HTMLElement>('#projects')
        const track = document.querySelector<HTMLElement>('[data-projects-track]')
        const wrap = track?.parentElement
        if (section && track && wrap) {
          // Convert the accessible grid into a horizontal track — only now, when GSAP
          // actually runs (desktop + motion). gsap.set is reverted on cleanup/resize,
          // so no-JS / reduced-motion / mobile keep the readable grid.
          gsap.set(wrap, { overflow: 'hidden' })
          gsap.set(track, { display: 'flex', flexWrap: 'nowrap', gap: '24px' })
          gsap.set(Array.from(track.children), { flex: '0 0 360px' })
          const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth)
          gsap.to(track, {
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
        }
      })
    })

    // Recompute after fonts load (Fraunces can shift layout).
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    ScrollTrigger.refresh()

    return () => {
      document.removeEventListener('click', onClick)
      ctx.revert()
      if (ticker) gsap.ticker.remove(ticker)
      lenis?.destroy()
    }
  }, [])
}
