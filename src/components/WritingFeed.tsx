import { useFeed } from '../hooks/useFeed'
import { contact } from '../data/profile'
import { Dot } from './primitives/Dot'
import { ExternalLinkIcon } from './primitives/ExternalLinkIcon'
import { Reveal } from './Reveal'

/** Live Medium feed (hydrated from feed.json, baked fallback). Each row is one
 *  large link; "live" is a dot + words; only the volatile timestamp is aria-live. */
export function WritingFeed() {
  const { posts, syncedAt, live } = useFeed()

  const featured = posts[0]

  return (
    <div>
      {featured && (
        <Reveal className="mb-10 max-w-reading">
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border-l-2 border-signal pl-5"
          >
            <p className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-medium italic leading-snug text-ink group-hover:text-signal">
              “{featured.dek || featured.title}”
            </p>
            <p className="mt-3 inline-flex items-center gap-1 font-mono text-mono-label uppercase text-label group-hover:text-signal">
              {featured.title}
              <ExternalLinkIcon />
            </p>
          </a>
        </Reveal>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-hairline bg-panel px-4 py-3 font-mono text-mono-label uppercase text-label">
        <span className="inline-flex items-center gap-2 text-ink">
          <Dot />
          {live ? 'Live feed · Medium' : 'Feed · Medium'}
        </span>
        <span>
          {contact.mediumHandle}
          {syncedAt && <span aria-live="polite"> · synced {syncedAt}</span>}
        </span>
      </div>

      <ul className="border border-hairline bg-hairline">
        {posts.slice(1).map((post, i) => (
          <li key={post.url} className={i > 0 ? 'border-t border-hairline' : ''}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-1 gap-1 bg-panel p-5 transition-colors hover:bg-cream sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-0 sm:p-0"
            >
              <span className="font-mono text-mono-label uppercase text-label sm:flex sm:min-h-tap sm:items-center sm:border-r sm:border-hairline sm:px-4 sm:py-5">
                {post.date}
              </span>
              <span className="min-w-0 sm:py-5 sm:pr-4">
                <span className="block font-display text-title font-bold text-ink group-hover:text-signal group-hover:underline group-focus-within:text-signal group-focus-within:underline">
                  {post.title}
                </span>
                {post.dek && <span className="mt-1 line-clamp-2 block text-body-sm text-ink-2">{post.dek}</span>}
                {post.tag && <span className="mt-2 block font-mono text-mono-label uppercase text-signal">{post.tag}</span>}
              </span>
              <span className="inline-flex items-center gap-3 font-mono text-mono-label uppercase text-label sm:min-h-tap sm:justify-end sm:border-l sm:border-hairline sm:px-4 sm:py-5">
                {post.read && <span>{post.read}</span>}
                <span className="inline-flex items-center gap-1 text-ink group-hover:text-signal group-focus-within:text-signal">
                  Open
                  <ExternalLinkIcon />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="flex flex-col border border-t-0 border-hairline sm:flex-row">
        <a
          href={contact.medium}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-tap flex-1 items-center justify-center border-b border-hairline bg-panel px-4 py-4 font-mono text-nav uppercase text-ink transition-colors hover:bg-ink hover:text-cream2 sm:border-b-0 sm:border-r"
        >
          All stories · Medium →
        </a>
        <a
          href={contact.substack}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-tap flex-1 items-center justify-center bg-panel px-4 py-4 font-mono text-nav uppercase text-ink transition-colors hover:bg-ink hover:text-cream2"
        >
          Personal essays · Substack →
        </a>
      </div>
    </div>
  )
}
