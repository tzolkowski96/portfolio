import { capabilities } from '../data/expertise'

/** Four capabilities as <dl> cards that linearize on mobile (never a table). */
export function ExpertiseList() {
  return (
    <dl className="grid grid-cols-1 gap-px border border-hairline bg-hairline md:grid-cols-2">
      {capabilities.map((cap) => (
        <div key={cap.id} className="flex flex-col bg-panel p-6">
          <span className="font-mono text-mono-label text-index">{cap.id}</span>
          <dt className="mt-2 font-display text-title font-bold text-ink">{cap.title}</dt>
          <dd className="mt-2 text-body-sm text-ink-2">{cap.detail}</dd>
        </div>
      ))}
    </dl>
  )
}
