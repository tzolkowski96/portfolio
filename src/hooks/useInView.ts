import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Returns a ref and whether it has entered the viewport (latches true once seen).
 * Falls back to true when IntersectionObserver is unavailable, so content is
 * never stuck hidden.
 */
export function useInView<T extends HTMLElement = HTMLElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            obs.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, inView]
}
