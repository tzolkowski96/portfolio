import type { Project } from './types'

export const projects: Project[] = [
  {
    id: '01',
    title: 'Traffic Accident Analytics Engine',
    href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/us_accidents_analysis',
    description:
      '7.7M US accident records across 49 states. Random Forest hitting 78% on severity prediction, chi-square and ANOVA validation, a pipeline built to scale, and an interactive Folium map.',
    stack: ['Python', 'Scikit-Learn', 'Folium'],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/us_accidents_analysis',
      },
    ],
  },
  {
    id: '02',
    title: 'Employee Churn Prediction',
    href: 'https://tzolkowski96.github.io/Salifort-Motors-Project/',
    description:
      'ML models hitting 98% accuracy to surface the real drivers of turnover: overtime, project load, satisfaction. Google Advanced Data Analytics capstone.',
    stack: ['Python', 'Scikit-Learn', 'XGBoost'],
    links: [
      { label: 'Demo', href: 'https://tzolkowski96.github.io/Salifort-Motors-Project/' },
      {
        label: 'Source',
        href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/Employee-Churn-Prediction',
      },
    ],
  },
  {
    id: '03',
    title: 'Crypto Market Insights',
    href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/crypto_market_insights',
    description:
      'A full pipeline that scrapes CoinMarketCap with Selenium, runs technical-analysis metrics, and generates its own Excel reports on a schedule.',
    stack: ['Python', 'Selenium', 'Pandas'],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/crypto_market_insights',
      },
    ],
  },
  {
    id: '04',
    title: 'US Household Income Analysis',
    href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/us-household-income-analysis',
    description:
      '32k+ records across 50 states in MySQL. Window functions and stored procedures, a weighted data-quality framework scoring 9.62/10, a 30% income gap between regions. Query time down from 68.5s to 21.9s.',
    stack: ['MySQL', 'CTEs', 'Window Funcs'],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/us-household-income-analysis',
      },
    ],
  },
  {
    id: '05',
    title: 'Global Population Insights',
    href: 'https://tzolkowski96.github.io/global-population-insights/',
    description:
      'Interactive visualization platform on Plotly.js. Population trends across countries and decades, with comparative tools and projections.',
    stack: ['JavaScript', 'Plotly.js', 'HTML'],
    links: [
      { label: 'Demo', href: 'https://tzolkowski96.github.io/global-population-insights/' },
      { label: 'Source', href: 'https://github.com/tzolkowski96/global-population-insights' },
    ],
  },
  {
    id: '06',
    title: 'UFood Customer Analysis',
    href: 'https://tzolkowski96.github.io/analyst-builder-food-marketing-project/',
    description:
      'K-means customer segmentation and A/B testing on marketing campaigns for a food-delivery app, mapped back to customer lifetime value.',
    stack: ['Python', 'K-Means', 'SciPy'],
    links: [
      {
        label: 'Demo',
        href: 'https://tzolkowski96.github.io/analyst-builder-food-marketing-project/',
      },
      {
        label: 'Source',
        href: 'https://github.com/tzolkowski96/tzolkowski96/tree/main/ufood_analysis',
      },
    ],
  },
]
