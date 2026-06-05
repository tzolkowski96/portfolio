import { Fragment } from 'react'
import { profileRows } from '../data/profile'

/** Identity facts as a semantic <dl>. Hairlines come from the gap-px + bg trick. */
export function ProfileSchema() {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-px border border-hairline bg-hairline">
      {profileRows.map((row) => (
        <Fragment key={row.key}>
          <dt className="flex min-h-tap items-center bg-panel px-3 py-2 font-mono text-mono-label uppercase text-label">
            {row.key}
          </dt>
          <dd className="flex min-h-tap min-w-0 items-center bg-panel px-3 py-2 font-mono text-mono-data text-ink">
            {row.value}
          </dd>
        </Fragment>
      ))}
    </dl>
  )
}
