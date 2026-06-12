/** The plurality pair: red (data) and blue (interaction) circles overlapping —
 *  the lens between them screens to collision pink. `isolate` scopes the blend
 *  to the pair so the blue reads plain blue against any panel. Decorative —
 *  always paired with words. Breathes out of phase; static under reduced motion. */
export function Dot({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`isolate inline-flex shrink-0 ${className}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-signal-graphic motion-safe:animate-signal-pulse" />
      <span className="-ml-[3px] inline-block h-2 w-2 rounded-full bg-pulse-graphic mix-blend-screen motion-safe:animate-signal-pulse [animation-delay:150ms]" />
    </span>
  )
}
