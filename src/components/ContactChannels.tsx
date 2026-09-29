import { contact, socials } from '../data/profile'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'

/** "How to reach me" — ASL/Deaf + VRS framing kept verbatim — plus channel links. */
export function ContactChannels() {
  return (
    <div>
      <h3 className="font-mono text-mono-label uppercase tracking-kicker text-label">How to reach me</h3>

      <div className="mt-5 space-y-4 text-body-sm text-ink-2">
        {contact.howToReach.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <p className="mt-5 font-mono text-mono-data text-ink">{contact.vrs}</p>

      <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-tap items-center justify-between gap-2 py-3 font-mono text-nav uppercase text-ink"
            >
              <span className="u-draw">{s.label}</span>
              <ExternalLinkIcon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
