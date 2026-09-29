import { projects } from '../data/projects'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'
import { emphasizeFigures } from '../lib/text'

const WIPE =
  'absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100 group-focus-within:scale-y-100'
const FLIP = 'transition-colors duration-300 group-hover:text-cream2 group-focus-within:text-cream2'
const FLIP_MUTED = 'transition-colors duration-300 group-hover:text-cream2/70 group-focus-within:text-cream2/70'

/**
 * The Lab: side projects as big rows. Hover (or keyboard focus inside a row)
 * inverts it — ink fill wiping up — and unfolds the description and links.
 * On touch screens the details are always open. Focus rings flip to dark
 * inside an inverted row (.row-invert) so they stay visible on the light fill.
 */
export function ProjectList() {
  return (
    <ul className="border-t border-hairline">
      {projects.map((p) => (
        <li key={p.id} className="border-b border-hairline">
          <div className="row-invert group relative isolate -mx-4 px-4 py-8 md:py-10">
            <span aria-hidden="true" className={WIPE} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,17rem)] md:items-baseline md:gap-10">
              <span aria-hidden="true" className={`font-mono text-nav text-index ${FLIP_MUTED}`}>
                {p.id}
              </span>
              <h3
                className={`font-serif text-[clamp(1.875rem,4vw,3.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-ink ${FLIP}`}
              >
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="View"
                  className="inline-flex min-h-tap items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2"
                >
                  {p.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </h3>
              <p className={`font-mono text-mono-label uppercase tracking-kicker text-label md:text-right ${FLIP_MUTED}`}>
                <span className="sr-only">Tech stack: </span>
                {p.stack.join(' · ')}
              </p>
            </div>
            {/* Details unfold on hover/focus; always open where there's no hover. */}
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr] md:pl-[6rem] [@media(hover:none)]:grid-rows-[1fr]">
              <div className="min-h-0 overflow-hidden">
                <p className={`max-w-[62ch] pt-4 text-body-sm text-ink-2 ${FLIP_MUTED}`}>{emphasizeFigures(p.description)}</p>
                <div className="mt-2 flex flex-wrap gap-x-6">
                  {p.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex min-h-tap items-center gap-1.5 font-mono text-nav uppercase text-ink ${FLIP}`}
                    >
                      <span className="u-draw">{l.label}</span>
                      <ExternalLinkIcon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
