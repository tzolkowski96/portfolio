import { profileRows } from '../data/profile'

/** Identity facts as a horizontal spec-sheet strip — a semantic <dl> in a
 *  hairline grid. (Last cell spans the remainder so the lattice stays full.) */
export function ProfileSchema() {
  return (
    <dl className="grid grid-cols-2 gap-px border border-hairline bg-hairline md:grid-cols-4 xl:grid-cols-7">
      {profileRows.map((row) => (
        <div key={row.key} className="min-w-0 bg-panel p-4 last:col-span-2 xl:last:col-span-1">
          <dt className="font-mono text-mono-label uppercase text-label">{row.key}</dt>
          <dd className="mt-2 font-mono text-mono-data text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
