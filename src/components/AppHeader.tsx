import { useRef, useState } from 'react'
import type { NavItem } from '../data/types'
import { MenuOverlay } from './MenuOverlay'
import { useMagnetic } from '../hooks/useMagnetic'

interface AppHeaderProps {
  sections: NavItem[]
  activeId: string
}

/** A quiet translucent header: the T/Z mark and a magnetic Menu button that
 *  opens the fullscreen overlay. The button is the nav at every width. */
export function AppHeader({ sections, activeId }: AppHeaderProps) {
  const [open, setOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement | null>(null)
  const magnetRef = useMagnetic<HTMLButtonElement>(0.35)

  const close = () => {
    setOpen(false)
    menuBtnRef.current?.focus()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <a
          href="#top"
          aria-label="Tobin Zolkowski — home"
          data-cursor="Top"
          className="-ml-2 inline-flex min-h-tap min-w-tap items-center justify-center px-2 font-mono text-sm font-medium tracking-[0.18em] text-ink"
        >
          T
          <span aria-hidden="true" className="text-label">
            /
          </span>
          Z
        </a>

        <button
          ref={(el) => {
            menuBtnRef.current = el
            ;(magnetRef as { current: HTMLButtonElement | null }).current = el
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
          // transparent border: invisible normally, a real boundary under forced colors
          className="group -mr-3 inline-flex min-h-tap min-w-tap items-center justify-center border border-transparent px-3 font-mono text-nav uppercase text-ink"
        >
          <span className="u-draw">Menu</span>
        </button>
      </div>

      {open && <MenuOverlay sections={sections} activeId={activeId} onClose={close} />}
    </header>
  )
}
