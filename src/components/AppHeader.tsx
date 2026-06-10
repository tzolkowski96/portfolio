import { useEffect, useRef, useState } from 'react'
import type { NavItem } from '../data/types'

interface AppHeaderProps {
  sections: NavItem[]
  activeId: string
}

/** Sticky header: T/Z wordmark (home), desktop nav, accessible mobile disclosure. */
export function AppHeader({ sections, activeId }: AppHeaderProps) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  // When the menu opens: move focus to the first link (it's a disclosure, not a
  // modal, so no focus trap). Escape closes it and returns focus to the toggle.
  useEffect(() => {
    if (!open) return
    document.querySelector<HTMLAnchorElement>('#mobile-nav a')?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    function onPointerDown(e: PointerEvent) {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <header id="top" ref={headerRef} className="sticky top-0 z-40 border-b border-rule-strong bg-cream">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-12">
        <a
          href="#top"
          aria-label="Tobin Zolkowski — home"
          className="inline-flex min-h-tap items-center font-mono text-sm font-bold tracking-[0.18em] text-ink"
        >
          T
          <span aria-hidden="true" className="text-signal">
            /
          </span>
          Z
        </a>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {sections.map((s) => {
              const active = s.id === activeId
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`group inline-flex min-h-tap items-center px-3 font-mono text-nav uppercase transition-colors duration-brand ease-brand ${
                      active ? 'text-ink' : 'text-label hover:text-ink'
                    }`}
                  >
                    <span
                      className={`relative pb-1 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:transition-transform after:duration-brand after:ease-brand ${
                        active
                          ? 'after:scale-x-100 after:bg-signal'
                          : 'after:scale-x-0 after:bg-hairline group-hover:after:scale-x-100'
                      }`}
                    >
                      {s.label}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-tap min-w-tap items-center justify-center border border-rule-strong px-3 font-mono text-nav uppercase text-ink lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav id="mobile-nav" aria-label="Sections" hidden={!open} className="border-t border-hairline bg-cream lg:hidden">
        <ul className="mx-auto max-w-container px-4 sm:px-6">
          {sections.map((s, i) => {
            const active = s.id === activeId
            return (
              <li key={s.id} className="border-b border-hairline last:border-b-0">
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className="flex min-h-tap items-center justify-between font-mono text-nav uppercase text-ink"
                >
                  <span className={active ? 'border-b-2 border-signal' : ''}>{s.label}</span>
                  <span aria-hidden="true" className="text-index">
                    §{String(i + 1).padStart(2, '0')}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
