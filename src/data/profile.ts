import type { NavItem, ProfileRow, SocialLink } from './types'

export const identity = {
  name: 'Tobin Zolkowski',
  eyebrow: 'Analytics · Reporting & BI · Data Journalism',
  taglineLead:
    'I turn messy, multi-source data into reporting people actually read.',
  taglineEmphasis:
    "Tableau and Looker for the view, Python and SQL underneath, a test suite so it doesn't break.",
  status: 'Open to conversation · not seeking a role',
  location: 'Madison, WI',
  coords: '43.1°N',
}

export const profileRows: ProfileRow[] = [
  { key: 'Role', value: 'Data Analyst, Career track' },
  { key: 'Org', value: 'IU School of Medicine' },
  { key: 'Field', value: 'Medical & Molecular Genetics' },
  { key: 'Program', value: "Parkinson's · MJFF-funded" },
  { key: 'Location', value: 'Madison, WI · Remote' },
  { key: 'Comms', value: 'ASL native · VRS' },
  { key: 'Languages', value: 'EN · ASL · FR · ES · IT' },
]

export const navItems: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'projects', label: 'Projects' },
  { id: 'work', label: 'Work' },
  { id: 'writing', label: 'Writing' },
  { id: 'connect', label: 'Connect' },
]

export const socials: SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/tobin-zolkowski-844873200',
  },
  { label: 'GitHub', href: 'https://github.com/tzolkowski96' },
  { label: 'Medium', href: 'https://medium.com/@grateful_aqua_goat_147' },
]

export const contact = {
  formspree: 'https://formspree.io/f/xaqpnqno',
  intro:
    'Not looking for a new role right now, but always open to conversations about research infrastructure, data accessibility, or the place where data and disability meet.',
  howToReach: [
    "I'm Deaf and communicate via ASL. For first contact, the form here or a LinkedIn message work best.",
    'For video calls I use Video Relay Service. It’s invisible on your end — just call like normal and an interpreter bridges the rest.',
  ],
  vrs: 'VRS number available on request',
  mediumHandle: '@grateful_aqua_goat_147',
  medium: 'https://medium.com/@grateful_aqua_goat_147',
  substack: 'https://substack.com/@tobinzolkowski',
}
