import type { SkillBlock } from './types'

export const aboutProse: string[] = [
  "My title says data analyst. The work is mostly engineering. For three years I've run the infrastructure behind a Michael J. Fox Foundation–funded Parkinson's research program at IU School of Medicine. I pull clinical data out of a dozen systems that were never meant to talk to each other, normalize it, and hand it back research-ready. Looker dashboards the team reads straight off. REST APIs that move records between systems. Automation so the dull, breakable parts don't make the science wait.",
  "The path here wasn't a straight line. I studied International Studies at UW-Madison thinking I'd land in policy or diplomacy, and kept drifting to the data side of every project instead. Grad school in Information Science made it official. The international lens never left though, and it shapes how I work: data is translation. Take information out of one context, make it land in another.",
  'Same job in any sector: pull the mess together, automate the flow, make it readable. Outside work I write. Data journalism on Medium, where I crack open public datasets and explain what’s going on under the headline. Personal essays on Substack. And the occasional pro bono build for groups that need data help and can’t pay for it.',
]

export const skillBlocks: SkillBlock[] = [
  {
    title: 'Languages',
    items: [
      { label: 'ASL', note: 'native' },
      { label: 'English', note: 'bilingual' },
      { label: 'French', note: 'B2' },
      { label: 'Spanish', note: 'B1' },
      { label: 'Italian', note: 'A1' },
      { label: 'BSL · Auslan', note: 'learning' },
    ],
  },
  {
    title: 'Build & Query',
    items: [
      { label: 'Python', note: 'pandas, NumPy, scikit-learn' },
      { label: 'SQL', note: 'PostgreSQL, MySQL, MS SQL, T-SQL, PL/pgSQL' },
      { label: 'R', note: 'working' },
    ],
  },
  {
    title: 'ETL & Engineering',
    items: [
      { label: 'SSIS · SQL Server Agent · REST API' },
      { label: 'Data modeling · REDCap · LONI' },
      { label: 'AWS', note: 'S3, SES' },
      { label: 'Git · pytest' },
    ],
  },
  {
    title: 'BI & Viz',
    items: [
      { label: 'Tableau · Looker · SSRS' },
      { label: 'Excel', note: 'advanced' },
      { label: 'Matplotlib · Seaborn · Folium' },
    ],
  },
  {
    title: 'Education & Certs',
    items: [
      { label: 'MS Information Science', note: "UW-Madison '22, 3.79" },
      { label: 'BA International Studies', note: "UW-Madison '20, 3.45" },
      { label: 'Google Advanced Data Analytics', note: "'23" },
      { label: 'DataCamp', note: "Tableau '23, SQL '22" },
    ],
  },
]
