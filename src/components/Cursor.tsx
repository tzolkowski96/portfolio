import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * A cursor halo that trails the pointer and, over anything interactive, swells
 * into a filled lens (difference-blended, so it inverts what's under it) with a
 * one-word label — "Open", "Read", "View" — taken from data-cursor, or "Open"
 * for links that leave the site. The native cursor stays visible: this is an
 * accent, never a replacement. Fine pointers with motion-OK only.
 */
export function Cursor() {
  const reduced = usePrefersReducedMotion()
  const [fine] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    const label = labelRef.current
    if (!ring || !label || !fine || reduced) return

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      ring.classList.add('is-visible')
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const onOver = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.('a, button, [data-cursor]')
      if (!t) {
        ring.classList.remove('is-active')
        return
      }
      const text = t.getAttribute('data-cursor') ?? (t.matches('a[target="_blank"]') ? 'Open' : '')
      label.textContent = text
      ring.classList.add('is-active')
    }
    const onLeaveDoc = () => ring.classList.remove('is-visible', 'is-active')
    const onDown = () => ring.classList.add('is-pressed')
    const onUp = () => ring.classList.remove('is-pressed')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.documentElement.addEventListener('mouseleave', onLeaveDoc)
    window.addEventListener('blur', onLeaveDoc)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeaveDoc)
      window.removeEventListener('blur', onLeaveDoc)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [fine, reduced])

  if (!fine || reduced) return null
  return (
    <div ref={ringRef} aria-hidden="true" className="cursor-ring">
      <span ref={labelRef} className="cursor-label" />
    </div>
  )
}
