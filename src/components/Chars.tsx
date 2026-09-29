import { Fragment } from 'react'

/**
 * Display text split into characters for letter-by-letter reveals. Each word is
 * its own overflow mask (so letters rise out of their word's baseline even when
 * a title wraps), padded to keep italic overhangs and descenders unclipped.
 * aria-hidden: the caller renders the real text once for assistive tech
 * (sr-only), so screen readers never hear it spelled out.
 */
export function Chars({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span aria-hidden="true" className={className}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="-mb-[0.14em] -mr-[0.1em] -mt-[0.06em] inline-block overflow-hidden whitespace-nowrap pb-[0.14em] pr-[0.1em] pt-[0.06em] align-top">
            {[...word].map((ch, ci) => (
              <span key={ci} className="split-char inline-block will-change-transform">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}
