import type { Capability } from './types'

export const capabilities: Capability[] = [
  {
    id: '01',
    title: 'ETL & Pipelines',
    detail:
      'A nightly pipeline moving 6.4M+ records across 13 tables into an archive 1,300+ institutions pull from. Validates as it runs, reports its own errors.',
  },
  {
    id: '02',
    title: 'Reporting & BI',
    detail:
      'Looker and Tableau dashboards the team reads straight off: genetics, screening drop-off, a recruitment funnel from 5.4M+ landing hits to ~10,700 enrollments.',
  },
  {
    id: '03',
    title: 'Data Automation',
    detail:
      'Scheduling that flags whoever’s running late, plus bilingual participant emails that fire on study status. On-time visits up from 87% to 95%+.',
  },
  {
    id: '04',
    title: 'Data Journalism',
    detail:
      'Digging into public datasets, finding the story in the numbers, and saying plainly what’s going on.',
  },
]
