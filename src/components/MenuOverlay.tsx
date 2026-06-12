import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type Lenis from 'lenis'
import type { NavItem } from '../data/types'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WindowWithLenis = Window & { __lenis?: Lenis }

interface MenuOverlayProps {
  sections: NavItem[]
  activeId: string
  onClose: () => void
}

/** The fullscreen menu — six section names as giant display rows that fall in
 *  on open (an entrance, not an exit: close unmounts instantly). A true modal:
 *  focus trapped, Escape closes, Lenis + native scroll locked while open.
 *  Portaled to <body> so it escapes the header's stacking context and covers
 *  everything except the loader (z-55 < z-60). */
export function MenuOverlay({ sections, activeId, onClose }: MenuOverlayProps) {
  const reduced = usePrefersReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Scroll lock (Lenis ignores overflow:hidden — stop it too) + initial focus.
  useEffect(() => {
    const lenis = (window as WindowWithLenis).__lenis
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.documentElement.style.overflow = ''
      lenis?.start()
    }
  }, [])

  // Escape closes; Tab wraps within the overlay (it IS modal, unlike the old disclosure).
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = overlay!.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    overlay.addEventListener('keydown', onKey)
    return () => overlay.removeEventListener('keydown', onKey)
  }, [onClose])

  // The falling entrance — GSAP doesn't obey the CSS reduced-motion kill, so gate it.
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // opacity, NOT autoAlpha: visibility:hidden would make the overlay
      // unfocusable during the fade and the initial focus would silently fail
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'none' })
      gsap.from('[data-menu-row]', { yPercent: -110, duration: 0.7, ease: 'power4.out', stagger: 0.06, delay: 0.08 })
    }, overlayRef)
    return () => ctx.revert()
  }, [reduced])

  return createPortal(
    <div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[55] flex flex-col bg-cream"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule-strong px-4 sm:px-6 lg:px-8 xl:px-12">
        <span aria-hidden="true" className="font-mono text-sm font-bold tracking-[0.18em] text-ink">
          T<span className="text-accent">/</span>Z
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex min-h-tap min-w-tap items-center justify-center border border-rule-strong px-4 font-mono text-nav uppercase text-ink"
        >
          Close
        </button>
      </div>

      <nav
        aria-label="Sections"
        data-lenis-prevent
        className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12"
      >
        <ul>
          {sections.map((s, i) => {
            const active = s.id === activeId
            return (
              <li key={s.id} className="overflow-hidden border-b border-hairline last:border-b-0">
                <a
                  href={`#${s.id}`}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className="group flex min-h-[max(48px,11svh)] items-center py-1"
                >
                  <span data-menu-row className="flex w-full items-baseline gap-x-5">
                    <span
                      aria-hidden="true"
                      className="w-[3.5ch] shrink-0 font-mono text-nav text-index transition-colors duration-brand ease-brand group-hover:text-ink"
                    >
                      §{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-[min(10svh,12vw)] font-[900] uppercase leading-[0.9] tracking-[-0.02em] text-ink">
                      {s.label}
                    </span>
                    {active && <span aria-hidden="true" className="ml-auto h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink" />}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>,
    document.body,
  )
}
