import { contact, socials } from '../data/profile'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'

/** "How to reach me" — ASL/Deaf + VRS framing kept verbatim — plus channel links. */
export function ContactChannels() {
  return (
    <div className="flex h-full flex-col">
      <h3 className="font-mono text-mono-label uppercase text-signal">How to reach me</h3>

      <div className="mt-4 space-y-4 text-body-sm text-ink-2">
        {contact.howToReach.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <p className="mt-4 font-mono text-mono-data text-ink">{contact.vrs}</p>

      <ul className="mt-6 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-tap items-center justify-between gap-2 bg-panel px-4 font-mono text-nav uppercase text-ink transition-colors duration-brand ease-brand hover:bg-ink hover:text-cream2"
            >
              {s.label}
              <ExternalLinkIcon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
