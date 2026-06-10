import { useFeed } from '../hooks/useFeed'
import { contact } from '../data/profile'
import { Dot } from './primitives/Dot'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'

/** Live Medium feed (hydrated from feed.json, baked fallback) as one bordered
 *  lattice — the same structural discipline as the Work log: feedbar, a feature
 *  row (rail | serif quote | meta), the remaining rows, then the channel links.
 *  Each row is one large link; "live" is a dot + words; only the volatile
 *  timestamp is aria-live. */
export function WritingFeed() {
  const { posts, syncedAt, live } = useFeed()

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div className="border border-hairline">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-panel px-4 py-3 font-mono text-mono-label uppercase text-label">
        <span className="inline-flex items-center gap-2 text-ink">
          <Dot />
          {live ? 'Live feed · Medium' : 'Feed · Medium'}
        </span>
        <span>
          {contact.mediumHandle}
          {syncedAt && <span aria-live="polite"> · synced {syncedAt}</span>}
        </span>
      </div>

      {featured && (
        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid grid-cols-1 gap-3 border-b border-hairline bg-panel p-5 transition-colors duration-brand ease-brand hover:bg-cream sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-0 sm:p-0"
        >
          <span className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-mono-label uppercase sm:flex-col sm:justify-center sm:gap-2 sm:border-r sm:border-hairline sm:px-4 sm:py-7">
            <span className="font-semibold text-signal">Featured</span>
            <span className="text-label">{featured.date}</span>
            {featured.tag && <span className="text-label">{featured.tag}</span>}
          </span>
          <span className="min-w-0 sm:px-6 sm:py-7">
            <span className="block max-w-[46ch] text-balance font-serif text-[clamp(1.375rem,2.4vw,2rem)] font-medium italic leading-snug text-ink transition-colors duration-brand ease-brand group-hover:text-signal">
              “{featured.dek || featured.title}”
            </span>
            {/* When there's no dek the quote IS the title — show meta instead of
                repeating the same line twice. */}
            <span className="mt-3 block max-w-[64ch] font-mono text-mono-label uppercase leading-relaxed text-label">
              {featured.dek
                ? featured.title
                : `Latest${featured.tag ? ` · ${featured.tag}` : ''} · ${featured.date}`}
            </span>
          </span>
          <span className="inline-flex items-center gap-3 font-mono text-mono-label uppercase text-label sm:min-h-tap sm:justify-end sm:border-l sm:border-hairline sm:px-4 sm:py-5">
            <span className="inline-flex items-center gap-1 text-ink transition-colors duration-brand ease-brand group-hover:text-signal group-focus-within:text-signal">
              <span className="u-draw">Open</span>
              <ExternalLinkIcon />
            </span>
          </span>
        </a>
      )}

      <ul>
        {rest.map((post) => (
          <li key={post.url} className="border-b border-hairline">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-1 gap-1 bg-panel p-5 transition-colors duration-brand ease-brand hover:bg-cream sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-0 sm:p-0"
            >
              <span className="font-mono text-mono-label uppercase text-label sm:flex sm:min-h-tap sm:items-center sm:border-r sm:border-hairline sm:px-4 sm:py-5">
                {post.date}
              </span>
              <span className="min-w-0 sm:py-5 sm:pl-6 sm:pr-4">
                <span className="block font-display text-title font-bold text-ink transition-colors duration-brand ease-brand group-hover:text-signal group-focus-within:text-signal">
                  <span className="u-draw">{post.title}</span>
                </span>
                {post.dek && <span className="mt-1 line-clamp-2 block text-pretty text-body-sm text-ink-2">{post.dek}</span>}
                {post.tag && <span className="mt-2 block font-mono text-mono-label uppercase text-signal">{post.tag}</span>}
              </span>
              <span className="inline-flex items-center gap-3 font-mono text-mono-label uppercase text-label sm:min-h-tap sm:justify-end sm:border-l sm:border-hairline sm:px-4 sm:py-5">
                {post.read && <span>{post.read}</span>}
                <span className="inline-flex items-center gap-1 text-ink transition-colors duration-brand ease-brand group-hover:text-signal group-focus-within:text-signal">
                  <span className="u-draw">Open</span>
                  <ExternalLinkIcon />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row">
        <a
          href={contact.medium}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-tap flex-1 items-center justify-center border-b border-hairline bg-panel px-4 py-4 font-mono text-nav uppercase text-ink transition-colors duration-brand ease-brand hover:bg-ink hover:text-cream2 sm:border-b-0 sm:border-r"
        >
          All stories · Medium →
        </a>
        <a
          href={contact.substack}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-tap flex-1 items-center justify-center bg-panel px-4 py-4 font-mono text-nav uppercase text-ink transition-colors duration-brand ease-brand hover:bg-ink hover:text-cream2"
        >
          Personal essays · Substack →
        </a>
      </div>
    </div>
  )
}
