import { useEffect, useState } from 'react'

/** True once the display serif (Fraunces light, roman + italic) has loaded —
 *  capped at 1.5s so a slow font never holds the intro hostage. The fonts
 *  stylesheet is render-blocking, so the faces exist before this runs and the
 *  wait is for the real font, not an empty FontFaceSet. */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const f = document.fonts
    const loaded = f ? Promise.all([f.load('300 1em Fraunces'), f.load('italic 300 1em Fraunces')]) : Promise.resolve()
    const done = () => {
      if (alive) setReady(true)
    }
    Promise.race([loaded, new Promise((r) => setTimeout(r, 1500))]).then(done, done)
    return () => {
      alive = false
    }
  }, [])
  return ready
}
