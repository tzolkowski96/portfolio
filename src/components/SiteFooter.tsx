/** Inverted footer. Cream text on ink = 16.29:1. */
export function SiteFooter() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-2 px-4 py-6 font-mono text-mono-label uppercase text-cream2 sm:px-6 lg:px-8 xl:px-12">
        <span>© 2026 Tobin Zolkowski</span>
        <span>Madison, WI · static site · no trackers</span>
        <span>Build 2026.06</span>
      </div>
    </footer>
  )
}
