import { useEffect, useState } from 'react'

/**
 * Returns the id of the section currently in view, for active-nav highlighting.
 * `ids` must be a stable reference (define it as a module constant).
 *
 * Tracks every intersecting section and picks the most-in-view one, rather than
 * letting whichever entry happens to be last in a batch win — which would flip
 * the highlight to the wrong section when two sections co-intersect.
 */
export function useScrollSpy(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const visible = new Map<string, IntersectionObserverEntry>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry)
          else visible.delete(entry.target.id)
        })
        const best = [...visible.values()].sort(
          (a, b) =>
            b.intersectionRatio - a.intersectionRatio ||
            a.boundingClientRect.top - b.boundingClientRect.top,
        )[0]
        if (best) setActiveId((prev) => (prev === best.target.id ? prev : best.target.id))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
