import { useLayoutEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

const HEADER = 56 // sticky header height — scroll offset for anchors

type WindowWithLenis = Window & { __lenis?: Lenis }

/**
 * The scroll experience, set up once after mount:
 *  - Lenis inertia smooth-scroll driven by GSAP's ticker and feeding
 *    ScrollTrigger (the pinned story + scroll parallax stay in lockstep with it)
 *  - header-aware smooth anchor navigation that also moves keyboard focus to
 *    the target (preventDefault skips the browser's own fragment focus step)
 *  - deep links re-landed and ScrollTrigger refreshed once fonts settle
 * Reduced motion is honored live (Lenis is started/stopped when the preference
 * changes); under reduced motion native scrolling is used.
 */
export function useScrollExperience(): void {
  useLayoutEffect(() => {
    let alive = true
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    let lenis: Lenis | null = null
    let ticker: ((t: number) => void) | null = null

    const startLenis = () => {
      if (lenis) return
      lenis = new Lenis({ duration: 1.15, smoothWheel: true })
      ;(window as WindowWithLenis).__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      ticker = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(ticker)
      gsap.ticker.lagSmoothing(0)
      // a modal scroll-lock may be active (the menu) — a freshly created Lenis
      // must respect it, not start running underneath the lock
      if (document.documentElement.style.overflow === 'hidden') lenis.stop()
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

    // In-page anchor navigation. Header offset: on the Lenis path it comes from
    // CSS scroll-padding-top (56px), which Lenis subtracts itself for element
    // targets — adding -HEADER on top would double it. The native fallback
    // doesn't read scroll-padding here, so it keeps the explicit math.
    const onClick = (e: MouseEvent) => {
      // let modified clicks (new tab etc.) and prior handlers do their thing
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute('href') || ''
      if (hash.length < 2) return
      const target = document.querySelector(hash) as HTMLElement | null
      if (!target) return
      e.preventDefault()
      if (lenis) {
        // if the menu just closed in this same flush, make sure we're running
        // BEFORE scrollTo, so its cleanup's start() can't reset an in-flight scroll
        if (lenis.isStopped) lenis.start()
        // force: runs the scroll even if a stop() races us
        lenis.scrollTo(target, { force: true })
      } else {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER })
      }
      // Move the focus starting point too (skip link, menu links): the next Tab
      // continues from the target instead of jumping back to the header.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)

    // Deep links (/#writing): the native fragment jump lands before fonts and
    // pin spacers settle — re-resolve once layout is final.
    const resolveHash = () => {
      if (!location.hash || location.hash.length < 2) return
      let target: HTMLElement | null = null
      try {
        target = document.querySelector<HTMLElement>(location.hash)
      } catch {
        return // malformed fragment — nothing to resolve
      }
      if (!target) return
      // Lenis subtracts scroll-padding-top itself; the fallback needs it explicit
      if (lenis) lenis.scrollTo(target, { immediate: true })
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER })
    }

    if (document.fonts?.ready)
      document.fonts.ready.then(() => {
        if (!alive) return
        ScrollTrigger.refresh()
        resolveHash()
      })
    requestAnimationFrame(() => {
      if (!alive) return
      ScrollTrigger.refresh()
      resolveHash()
    })

    return () => {
      alive = false
      document.removeEventListener('click', onClick)
      reduceMq.removeEventListener('change', onReduceChange)
      stopLenis()
    }
  }, [])
}
