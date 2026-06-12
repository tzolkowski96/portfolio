import { useLayoutEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { LOADER_DONE_EVENT } from '../components/Loader'

const HEADER = 56 // sticky header height — scroll offset for anchors + pins

type WindowWithLenis = Window & { __lenis?: Lenis }
type WindowWithHero = Window & { __heroProgress?: number }

/**
 * The whole scroll experience, set up once after mount:
 *  - Lenis inertia smooth-scroll synced to GSAP's ticker + ScrollTrigger
 *  - header-aware smooth anchor navigation
 *  - gsap.matchMedia choreography: (desktop, tall enough,
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
      // a modal scroll-lock may be active (menu/loader) — a freshly created
      // Lenis must respect it, not start running underneath the lock
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
        // if a modal just closed in this same flush, make sure we're running
        // BEFORE scrollTo, so the cleanup's start() can't reset an in-flight scroll
        if (lenis.isStopped) lenis.start()
        // force: runs the scroll even if a stop() races us
        lenis.scrollTo(target, { force: true })
      } else {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER })
      }
    }
    document.addEventListener('click', onClick)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop + tall enough + motion-OK: pinned hero + horizontal Projects.
      // The min-height floor keeps short/landscape screens on the readable grid so a
      // pinned section can never push content off-screen.
      mm.add('(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)', () => {
        // Two-phase hero scrub: A) swell toward the viewer while the camera
        // dollies into the terrain, B) the nameplate knocks out to a stroked
        // outline as the field pours through the counters. Progress is published
        // on window.__heroProgress for the WebGL camera/gather (same channel).
        const heroWin = window as WindowWithHero
        const clearHero = () => {
          heroWin.__heroProgress = 0
        }
        const heroPin = document.querySelector<HTMLElement>('[data-hero-pin]')
        const nameplate = document.querySelector<HTMLElement>('[data-nameplate]')
        if (heroPin && nameplate) {
          heroWin.__heroProgress = 0
          gsap
            .timeline({
              scrollTrigger: {
                trigger: heroPin,
                start: `top top+=${HEADER}`,
                end: '+=70%',
                pin: true,
                pinSpacing: true,
                scrub: true,
                onUpdate: (self) => {
                  heroWin.__heroProgress = self.progress
                },
              },
            })
            .to(nameplate, { scale: 1.04, transformOrigin: 'left center', ease: 'none', duration: 0.45 }, 0)
            .to(
              nameplate,
              { scale: 0.92, yPercent: -3, '--np-fill': 0.15, '--np-stroke': 0.85, ease: 'none', duration: 0.55 },
              0.45,
            )
        }

        // Pin the section BODY, not the whole section: the title card scrolls
        // away first, then the track pins with the full viewport to itself.
        const track = document.querySelector<HTMLElement>('[data-projects-track]')
        const wrap = track?.parentElement
        const stage = track?.closest<HTMLElement>('[data-section-body]')
        if (!stage || !track || !wrap) return clearHero

        gsap.set(wrap, { overflow: 'hidden' })
        gsap.set(track, { display: 'flex', flexWrap: 'nowrap', gap: '24px' })
        gsap.set(Array.from(track.children), { flex: '0 0 360px' })
        const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth)
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
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
        return () => {
          clearHero() // leaving the breakpoint resets the camera/gather channel
          document.removeEventListener('focusin', onFocusIn)
        }
      })
    })

    // Deep links (/#projects): the native fragment jump happens before pins add
    // their spacers and without the header offset — re-resolve once layout is
    // final (after refresh), and again after the loader curtain lifts.
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
    const onLoaderDone = () => resolveHash()
    window.addEventListener(LOADER_DONE_EVENT, onLoaderDone)

    if (document.fonts?.ready)
      document.fonts.ready.then(() => {
        if (!alive) return
        ScrollTrigger.refresh()
        resolveHash() // font reflow shifts section tops — re-land the fragment
      })
    requestAnimationFrame(() => {
      if (!alive) return
      ScrollTrigger.refresh()
      resolveHash()
    })

    return () => {
      alive = false
      document.removeEventListener('click', onClick)
      window.removeEventListener(LOADER_DONE_EVENT, onLoaderDone)
      reduceMq.removeEventListener('change', onReduceChange)
      ctx.revert()
      stopLenis()
    }
  }, [])
}
