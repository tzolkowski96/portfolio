/** First focusable element — appears on keyboard focus, jumps to <main>. */
export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:inline-flex focus:min-h-tap focus:items-center focus:bg-ink focus:px-4 focus:font-mono focus:text-nav focus:uppercase focus:text-cream2"
    >
      Skip to content
    </a>
  )
}
