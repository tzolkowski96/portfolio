import { SkipLink } from './components/SkipLink'
import { ScrollProgress } from './components/ScrollProgress'
import { AppHeader } from './components/AppHeader'
import { Record } from './components/Record'
import { Marquee } from './components/Marquee'
import { Section } from './components/Section'
import { About } from './components/About'
import { ExpertiseList } from './components/ExpertiseList'
import { ProjectList } from './components/ProjectList'
import { WorkLog } from './components/WorkLog'
import { WritingFeed } from './components/WritingFeed'
import { Connect } from './components/Connect'
import { SiteFooter } from './components/SiteFooter'
import { Cursor } from './components/Cursor'
import { navItems } from './data/profile'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useScrollExperience } from './scroll/useScrollExperience'

// Stable id list for the scroll-spy observer.
const SECTION_IDS = navItems.map((n) => n.id)

export default function App() {
  const activeId = useScrollSpy(SECTION_IDS)
  useScrollExperience()

  return (
    <>
      {/* Document-start anchor: "#top" targets land at y=0 (the sticky header
          itself can't be a scroll target — it's always at the top edge). */}
      <div id="top" />
      <SkipLink />
      <ScrollProgress />
      <AppHeader sections={navItems} activeId={activeId} />

      <main id="content">
        <Record />
        <Marquee />

        <Section id="about" num="01" name="About" meta="The path, compressed">
          <About />
        </Section>

        <Section id="writing" num="02" name="Writing" meta="I write to figure out what I think">
          <WritingFeed />
        </Section>

        <Section id="expertise" num="03" name="Expertise" meta="What runs all day">
          <ExpertiseList />
        </Section>

        <Section id="work" num="04" name="Work" meta="Log · reverse chronological">
          <WorkLog />
        </Section>

        <Section id="projects" num="05" name="Lab" meta="Side projects · github.com/tzolkowski96">
          <ProjectList />
        </Section>

        <Section id="connect" num="06" name="Connect" meta="How to reach me, and what for">
          <Connect />
        </Section>
      </main>

      <SiteFooter />

      <div aria-hidden="true" className="grain" />
      <Cursor />
    </>
  )
}
