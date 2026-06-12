import { identity } from '../data/profile'
import { Dot } from './primitives/Dot'

/** Top "record" strip. Availability is a dot + the WORDS, never color alone. */
export function StatusStrip() {
  return (
    <div className="border-b border-hairline bg-sunk">
      <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 font-mono text-mono-label uppercase text-label sm:px-6 lg:px-8 xl:px-12">
        <span>Record · {identity.name}</span>
        <span className="inline-flex items-center gap-2 text-ink md:hidden">
          <Dot />
          {identity.status}
        </span>
        <span>
          {identity.location} · {identity.coords}
        </span>
      </div>
    </div>
  )
}
