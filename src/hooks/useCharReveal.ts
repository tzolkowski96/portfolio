import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Letter-by-letter entrance for a <Chars> block: characters wait below their
 * word masks and rise in a stagger the first time the element enters the
 * viewport (from any direction — an IntersectionObserver latch, so a page
 * loaded mid-scroll still reveals titles above it on the way back up).
 * Under reduced motion nothing is hidden: the text renders complete.
 */
export function useCharReveal<T extends HTMLElement>(opts: { stagger?: number; duration?: number; delay?: number } = {}) {
  const ref = useRef<T>(null)
  const { stagger = 0.03, duration = 1.2, delay = 0 } = opts

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    const chars = el.querySelectorAll<HTMLElement>('.split-char')
    const ctx = gsap.context(() => {
      gsap.set(chars, { yPercent: 118 })
    }, el)
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        ctx.add(() => {
          gsap.to(chars, { yPercent: 0, duration, ease: 'expo.out', stagger, delay })
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      ctx.revert()
    }
  }, [stagger, duration, delay])

  return ref
}
