import { Fragment, type ReactNode } from 'react'

// Matches numeric figures like 6.4M+, 1,300+, 87%, ~25%, $340M, 32k+, 9.99%.
const FIGURE = /([~$]?\d[\d,.]*[%+Mkx]*\+?)/g

/**
 * Wraps one phrase of a string in an italic serif <em> — the inline accent that
 * rhymes with the footer sign-off. Returns the string unchanged if the phrase
 * is absent, so copy edits degrade gracefully.
 */
export function serifAccent(text: string, phrase: string): ReactNode {
  const idx = text.indexOf(phrase)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <em className="font-serif text-[1.06em] font-medium italic text-ink">{phrase}</em>
      {text.slice(idx + phrase.length)}
    </>
  )
}

/**
 * Renders a string with its numeric figures wrapped in <strong> (tabular-nums).
 * Hierarchy is carried by weight, not color — so it survives "no color-alone".
 */
export function emphasizeFigures(text: string): ReactNode[] {
  return text.split(FIGURE).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold tabular-nums text-ink">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
