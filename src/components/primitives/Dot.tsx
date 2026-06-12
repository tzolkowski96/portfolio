/** The live dot — one of the accent law's three legal red uses. Decorative,
 *  always paired with words; pulse is opacity-only and motion-safe gated. */
export function Dot({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 ${className}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-accent motion-safe:animate-live-pulse" />
    </span>
  )
}
