/** Pulsing status dot (brand red, graphic-only). Decorative — paired with words. */
export function Dot({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 shrink-0 rounded-full bg-signal-graphic motion-safe:animate-signal-pulse ${className}`}
    />
  )
}
