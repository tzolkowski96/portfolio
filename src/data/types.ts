// Shared content types. Content lives in src/data/* and is consumed by
// presentational components in src/components/* — structure, style, and data
// stay separated.

export interface NavItem {
  id: string
  label: string
}

export interface SocialLink {
  label: string
  href: string
}

export interface ProfileRow {
  key: string
  value: string
}

export interface Metric {
  value: string
  unit?: string
  caption: string
}

export interface Capability {
  id: string
  title: string
  detail: string
}

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  id: string
  title: string
  href: string
  description: string
  stack: string[]
  links: ProjectLink[]
}

export interface WorkEntry {
  period: string
  org: string
  location: string
  role: string
  bullets: string[]
}

export interface SkillItem {
  label: string
  note?: string
}

export interface SkillBlock {
  title: string
  items: SkillItem[]
}

export interface Post {
  date: string
  title: string
  dek?: string
  tag?: string
  read?: string
  url: string
}
