import { useEffect, useMemo, useState } from 'react'

/** "Madison, WI · 3:42 PM CT" — the local time where he is, a small human
 *  detail in the footer. Refreshes every 15s; the <time> carries the value. */
export function LocalTime() {
  const fmt = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' }),
    [],
  )
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span>
      Madison, WI · <time dateTime={now.toISOString()}>{fmt.format(now)}</time> CT
    </span>
  )
}
