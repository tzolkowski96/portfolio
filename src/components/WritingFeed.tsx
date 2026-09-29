import { useFeed } from '../hooks/useFeed'
import { contact } from '../data/profile'
import { Dot } from './primitives/Dot'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'
import { Reveal } from './Reveal'

// Inverted-row hover: an ink fill wipes up from the baseline and every text
// flips to dark (cream2) — AA on the light fill. Keyboard focus mirrors hover.
const WIPE =
  'absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100'
const FLIP = 'transition-colors duration-300 group-hover:text-cream2 group-focus-visible:text-cream2'
const FLIP_MUTED = 'transition-colors duration-300 group-hover:text-cream2/70 group-focus-visible:text-cream2/70'

/** Live Medium feed (hydrated from feed.json, baked fallback). The newest piece
 *  leads as a large serif pull quote; the rest follow as big rows that invert
 *  on hover. Only the volatile sync timestamp is aria-live. */
export function WritingFeed() {
  const { posts, syncedAt, live } = useFeed()

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div>
      {featured && (
        <Reveal>
          <a href={featured.url} target="_blank" rel="noopener noreferrer" data-cursor="Read" className="group block">
            <span className="block font-mono text-mono-label uppercase tracking-kicker text-label">
              Latest essay · {featured.date}
              {featured.tag ? ` · ${featured.tag}` : ''}
            </span>
            <span className="mt-8 block max-w-[22ch] text-balance font-serif text-[clamp(2.25rem,4.6vw,4.5rem)] font-light italic leading-[1.06] tracking-[-0.03em] text-ink">
              “{featured.dek || featured.title}”
            </span>
            {/* When there's no dek the quote IS the title — show meta instead of
                repeating the same line twice. */}
            <span className="mt-8 block max-w-[60ch] text-body text-ink-2">
              {featured.dek ? featured.title : `Latest${featured.tag ? ` · ${featured.tag}` : ''} · ${featured.date}`}
            </span>
            <span className="mt-6 inline-flex min-h-tap items-center gap-2 font-mono text-nav uppercase text-ink">
              <span className="u-draw">Read the essay</span>
              <ExternalLinkIcon />
            </span>
          </a>
        </Reveal>
      )}

      <div className="mt-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-mono-label uppercase tracking-kicker text-label">
        <span className="inline-flex items-center gap-2 text-ink-2">
          <Dot />
          {live ? 'Live feed · Medium' : 'Feed · Medium'}
        </span>
        <span>
          {contact.mediumHandle}
          {syncedAt && <span aria-live="polite"> · synced {syncedAt}</span>}
        </span>
      </div>

      <ul className="mt-5 border-t border-hairline">
        {rest.map((post) => (
          <li key={post.url} className="border-b border-hairline">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Read"
              className="group relative isolate -mx-4 grid grid-cols-1 gap-x-8 gap-y-2 px-4 py-8 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] md:py-9"
            >
              <span aria-hidden="true" className={WIPE} />
              <span className={`whitespace-nowrap font-mono text-mono-label uppercase tracking-kicker text-label sm:pt-2 ${FLIP_MUTED}`}>
                {post.date}
              </span>
              <span className="min-w-0">
                <span
                  className={`block font-serif text-[clamp(1.5rem,2.4vw,2.125rem)] font-light leading-[1.15] tracking-[-0.015em] text-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 ${FLIP}`}
                >
                  {post.title}
                </span>
                {post.dek && (
                  <span className={`mt-3 line-clamp-2 block max-w-[64ch] text-pretty text-body-sm text-ink-2 ${FLIP_MUTED}`}>
                    {post.dek}
                  </span>
                )}
                {post.tag && (
                  <span className={`mt-3 block font-mono text-mono-label uppercase tracking-kicker text-label ${FLIP_MUTED}`}>
                    {post.tag}
                  </span>
                )}
              </span>
              {/* max-sm:sr-only (not hidden) keeps the "opens in a new tab" notice on phones */}
              <span className={`inline-flex items-start pt-2 text-ink-2 max-sm:sr-only ${FLIP}`}>
                <ExternalLinkIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2">
        <a
          href={contact.medium}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-tap items-center gap-2 font-mono text-nav uppercase text-ink"
        >
          <span className="u-draw">All stories on Medium</span>
          <ExternalLinkIcon />
        </a>
        <a
          href={contact.substack}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-tap items-center gap-2 font-mono text-nav uppercase text-ink"
        >
          <span className="u-draw">Personal essays on Substack</span>
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  )
}
