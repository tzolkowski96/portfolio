import type { WorkEntry } from './types'

export const workEntries: WorkEntry[] = [
  {
    period: '2026 – Present',
    org: 'IU School of Medicine',
    location: 'Indianapolis · Remote',
    role: 'Data Analyst, Career track · Medical & Molecular Genetics',
    bullets: [
      'Own the nightly pipeline that moves 6.4M+ records across 13 tables into the central archive 1,300+ institutions pull from. Validates as it runs, reports its own errors.',
      "Dropped visit-coordination from 25+ hours a week to 5 and pushed the on-time rate from 87% to 95%+, off a scheduling pipeline that sets target dates and flags whoever's late.",
      'Showed site and budget planners how far 12,000+ participants actually travel, through a Python mapping tool with 243 tests behind it.',
      'Replaced manual table-digging with Looker dashboards spanning genetics, screening drop-off, and a recruitment funnel from 5.4M+ landing hits to ~10,700 enrollments.',
    ],
  },
  {
    period: '2023 – 2026',
    org: 'IU School of Medicine',
    location: 'Indianapolis · Remote',
    role: 'Data Analyst, Core team',
    bullets: [
      "Kept 4,600+ participants' records in sync across our systems and a partner research organization over secure, HIPAA-compliant API transfers that cut manual handling by ~25%. Referrals fired automatically; mismatched site records got caught before they spread.",
      'Cut a core report from ~2 hours to ~10 minutes: rewrote the query, rebuilt the database views under it.',
      'Automated bilingual participant emails (English and Spanish) on study status. 42% of participants reminded about the smell-test kit then finished it.',
    ],
  },
  {
    period: '2022',
    org: 'Telkomsel',
    location: 'Jakarta, Indonesia · Remote',
    role: 'Business Data Analyst Intern',
    bullets: [
      "Built a Tableau heatmap mapping 43.88M high-value subscribers by city and tracking the segment's ~$340M monthly revenue at 9.99% MoM growth, to steer which accounts to keep or cut.",
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
