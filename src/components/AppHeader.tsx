import { useRef, useState } from 'react'
import type { NavItem } from '../data/types'
import { identity } from '../data/profile'
import { Dot } from './primitives/Dot'
import { MenuOverlay } from './MenuOverlay'

interface AppHeaderProps {
  sections: NavItem[]
  activeId: string
}

/** Sticky header reduced to its essentials: T/Z wordmark, the availability line
 *  (md+ — the StatusStrip carries it below md), and one MENU button that opens
 *  the fullscreen overlay. The button IS the nav at every width. */
export function AppHeader({ sections, activeId }: AppHeaderProps) {
  const [open, setOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    setOpen(false)
    menuBtnRef.current?.focus()
  }

  return (
    <header id="top" className="sticky top-0 z-40 border-b border-rule-strong bg-cream">
      <div className="mx-auto grid h-14 max-w-container grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8 xl:px-12">
        <a
          href="#top"
          aria-label="Tobin Zolkowski — home"
          className="inline-flex min-h-tap items-center font-mono text-sm font-bold tracking-[0.18em] text-ink"
        >
          T
          <span aria-hidden="true" className="text-accent">
            /
          </span>
          Z
        </a>

        <span className="hidden items-center gap-2 justify-self-center font-mono text-mono-label uppercase text-label md:inline-flex">
          <Dot /> {identity.status}
        </span>

        <button
          ref={menuBtnRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-tap min-w-tap items-center justify-center justify-self-end border border-rule-strong px-4 font-mono text-nav uppercase text-ink transition-colors duration-brand ease-brand hover:border-ink hover:bg-ink hover:text-cream2"
        >
          Menu
        </button>
      </div>

      {open && <MenuOverlay sections={sections} activeId={activeId} onClose={close} />}
    </header>
  )
}
