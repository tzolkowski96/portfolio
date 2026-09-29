import type { WorkEntry } from './types'

export const workEntries: WorkEntry[] = [
  {
    period: '2026 – Present',
    org: 'IU School of Medicine',
    location: 'Indianapolis · Remote',
    role: 'Data Analyst, Career track · Medical & Molecular Genetics',
    bullets: [
      'Own the nightly data pipeline end to end. It validates as it runs and reports its own errors.',
      "Built a scheduling pipeline that sets target dates and flags whoever's running late, cutting most of the weekly manual coordination.",
      'Built a Python mapping tool, backed by a full test suite, that shows planners how far people actually travel.',
      'Replaced manual table-digging with Looker dashboards the team reads straight off.',
    ],
  },
  {
    period: '2023 – 2026',
    org: 'IU School of Medicine',
    location: 'Indianapolis · Remote',
    role: 'Data Analyst, Core team',
    bullets: [
      'Kept records in sync across systems through automated API transfers, catching mismatches before they spread and cutting manual handling.',
      'Cut a core report from hours to minutes: rewrote the query, rebuilt the database views under it.',
      'Automated bilingual status-update emails in English and Spanish.',
    ],
  },
  {
    period: '2022',
    org: 'Telkomsel',
    location: 'Jakarta, Indonesia · Remote',
    role: 'Business Data Analyst Intern',
    bullets: [
      "Built a Tableau heatmap mapping high-value subscribers by city and tracking the segment's monthly revenue and growth, to steer which accounts to keep or cut.",
      'Wrote the calculated fields and Tableau Prep pipeline under them: several sources merged into one 1,812-row, 27-field dataset, refreshed on a schedule.',
    ],
  },
  {
    period: '2019 – 2021',
    org: 'UW-Madison',
    location: 'Madison, WI',
    role: 'IT Support → Data Manager',
    bullets: [
      'Started answering help-desk tickets. Ended up managing research datasets for a sociology department sitting on decades of survey data in formats nobody remembered how to read.',
      'Wrote migration scripts, documented everything, and learned that institutional data is always messier than you expect.',
    ],
  },
]
