import { projects } from '../data/projects'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'
import { emphasizeFigures } from '../lib/text'

/** Six project cards: title link, description, stack chips, Source/Demo actions. */
export function ProjectList() {
  return (
    <div>
      <ul data-projects-track className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {projects.map((p) => (
        <li
          key={p.id}
          className="group flex flex-col border border-hairline bg-panel p-6 transition-colors duration-brand ease-brand hover:border-rule-strong focus-within:border-rule-strong"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-mono-label text-index">{p.id}</span>
            <h3 className="font-display text-title font-bold text-ink">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-tap items-center py-1 transition-colors duration-brand ease-brand hover:text-signal focus-visible:text-signal"
              >
                <span className="min-w-0">
                  <span className="u-draw">{p.title}</span>
                </span>
              </a>
            </h3>
          </div>

          <p className="mt-2 text-body-sm text-ink-2">{emphasizeFigures(p.description)}</p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
            {p.stack.map((s) => (
              <li key={s} className="border border-hairline px-2 py-1 font-mono text-mono-label uppercase text-label">
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-hairline pt-2">
            {p.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-tap items-center gap-1 font-mono text-nav uppercase text-signal"
              >
                <span className="u-draw">{l.label}</span>
                <ExternalLinkIcon />
              </a>
            ))}
          </div>
        </li>
      ))}
      </ul>
    </div>
  )
}
