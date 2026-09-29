/** Tiny ↗ glyph + visually-hidden "opens in a new tab" for target=_blank links. */
export function ExternalLinkIcon() {
  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className="inline-block shrink-0"
      >
        <path
          d="M4.5 2.5h5v5M9.5 2.5 3 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  )
}
