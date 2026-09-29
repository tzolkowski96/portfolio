import type { Capability } from './types'

export const capabilities: Capability[] = [
  {
    id: '01',
    title: 'ETL & Pipelines',
    detail:
      'Scheduled pipelines that validate as they run and report their own errors. SSIS, SQL Server Agent, Python, and REST APIs.',
  },
  {
    id: '02',
    title: 'Reporting & BI',
    detail:
      'Looker and Tableau dashboards people read straight off, built on data models that hold up when the questions change.',
  },
  {
    id: '03',
    title: 'Data Automation',
    detail:
      'Scheduling that flags what’s running late and bilingual notifications that fire on status changes, so there’s far less manual chasing.',
  },
  {
    id: '04',
    title: 'Data Journalism',
    detail:
      'Digging into public datasets, finding the story in the numbers, and saying plainly what’s going on.',
  },
]
