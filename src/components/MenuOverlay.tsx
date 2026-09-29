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

/** The fullscreen menu — six section names in large light serif that rise out
 *  of their masks on open (an entrance, not an exit: close unmounts instantly).
 *  A true modal: focus trapped, Escape closes, Lenis + native scroll locked
 *  while open. Portaled to <body> so it escapes the header's stacking context.
 *  Hovering (or focusing) one row dims the others. */
export function MenuOverlay({ sections, activeId, onClose }: MenuOverlayProps) {
  const reduced = usePrefersReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Scroll lock (Lenis ignores overflow:hidden — stop it too) + initial focus.
  // Read __lenis live in cleanup: a reduced-motion toggle while open can swap
  // the instance, and the captured one would be destroyed.
  useEffect(() => {
    ;(window as WindowWithLenis).__lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.documentElement.style.overflow = ''
      ;(window as WindowWithLenis).__lenis?.start()
    }
  }, [])

  // Escape closes; Tab wraps within the overlay (it IS modal). The listener
  // lives on DOCUMENT: if focus falls to <body> (dead-space click), events never
  // pass through the portal — an overlay-attached trap would go deaf and Tab
  // would walk the hidden page behind the modal.
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
      if (!overlay!.contains(document.activeElement)) {
        e.preventDefault()
        ;(first ?? closeRef.current)?.focus() // recapture strayed focus
        return
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // The falling entrance — GSAP doesn't obey the CSS reduced-motion kill, so gate it.
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // opacity, NOT autoAlpha: visibility:hidden would make the overlay
      // unfocusable during the fade and the initial focus would silently fail
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'none' })
      gsap.from('[data-menu-row]', { yPercent: 105, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.06 })
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
        // the root is fully tiled by the top bar + nav, so target===currentTarget
        // can never fire — dead-space = anything that isn't a link or button
        if (!(e.target as Element).closest('a, button')) onClose()
      }}
      className="fixed inset-0 z-[55] flex flex-col bg-cream"
    >
      <div className="shrink-0 border-b border-hairline">
      <div className="mx-auto flex h-14 w-full max-w-container items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <span aria-hidden="true" className="font-mono text-sm font-medium tracking-[0.18em] text-ink">
          T<span className="text-label">/</span>Z
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="group -mr-3 inline-flex min-h-tap min-w-tap items-center justify-center border border-transparent px-3 font-mono text-nav uppercase text-ink"
        >
          <span className="u-draw">Close</span>
        </button>
      </div>
      </div>

      <nav
        aria-label="Sections"
        data-lenis-prevent
        className="mx-auto flex min-h-0 w-full max-w-container flex-1 flex-col overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 xl:px-12"
      >
        {/* my-auto, not justify-center: centered when there's room, scrollable
            from the FIRST row when there isn't (justify-center pushes overflow
            above the scroll origin where scrollTop can't reach it) */}
        <ul className="group/list my-auto w-full">
          {sections.map((s, i) => {
            const active = s.id === activeId
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    // modified clicks open a new tab — keep the menu up for those
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    onClose()
                  }}
                  aria-current={active ? 'location' : undefined}
                  className="group flex min-h-[max(48px,11svh)] items-center overflow-hidden py-1"
                >
                  <span data-menu-row className="flex w-full items-baseline gap-x-6">
                    <span
                      aria-hidden="true"
                      className="w-[2.5ch] shrink-0 font-mono text-nav text-index transition-colors duration-brand ease-brand group-hover:text-ink"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-[min(9svh,11vw)] font-light leading-[1] tracking-[-0.03em] text-ink transition-opacity duration-300 ease-brand group-hover/list:opacity-35 group-focus-within/list:opacity-35 group-hover:!opacity-100 group-focus-visible:!opacity-100">
                      {active ? <em className="italic">{s.label}</em> : s.label}
                    </span>
                    {active && <span aria-hidden="true" className="ml-auto h-2 w-2 shrink-0 self-center rounded-full bg-ink" />}
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
