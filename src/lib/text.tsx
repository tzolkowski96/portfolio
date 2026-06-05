import { Fragment, type ReactNode } from 'react'

// Matches numeric figures like 6.4M+, 1,300+, 87%, ~25%, $340M, 32k+, 9.99%.
const FIGURE = /([~$]?\d[\d,.]*[%+Mkx]*\+?)/g

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
