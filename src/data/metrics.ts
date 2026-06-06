import type { Metric } from './types'

export const kpis: Metric[] = [
  { value: '6.4', unit: 'M+', caption: 'Records moved nightly, across 13 tables' },
  { value: '1,300', unit: '+', caption: 'Institutions pull from the central archive' },
  { value: '10', unit: 'min', caption: 'Core report runtime, down from 2 hours' },
  { value: '243', caption: 'Tests behind the travel-mapping tool' },
]

export const onTimeChart = {
  finding: 'Visits started landing on time',
  caption: 'On-time clinic-visit rate, before and after a scheduling pipeline',
  delta: '+8 pts',
  before: { label: 'Before', value: 87, display: '87%' },
  after: { label: 'After', value: 95, display: '95%+' },
}

export const runtime = {
  label: 'Core report runtime',
  caption: 'After a query + database-view rewrite',
  before: { minutes: 120, display: '2 h' },
  after: { minutes: 10, display: '10 min' },
  delta: '−92%',
}

export const now =
  "Running the data behind a Michael J. Fox Foundation Parkinson's program at IU School of Medicine. Publishing data journalism on Medium and essays on Substack."
