import { SkipLink } from './components/SkipLink'
import { ScrollProgress } from './components/ScrollProgress'
import { AppHeader } from './components/AppHeader'
import { StatusStrip } from './components/StatusStrip'
import { Record } from './components/Record'
import { TechBand } from './components/TechBand'
import { Section } from './components/Section'
import { About } from './components/About'
import { ExpertiseList } from './components/ExpertiseList'
import { ProjectList } from './components/ProjectList'
import { WorkLog } from './components/WorkLog'
import { WritingFeed } from './components/WritingFeed'
import { Connect } from './components/Connect'
import { SiteFooter } from './components/SiteFooter'
import { useState } from 'react'
import { Loader, shouldShowLoader } from './components/Loader'
import { navItems } from './data/profile'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useScrollExperience } from './scroll/useScrollExperience'
import { UiReadyContext } from './lib/uiReady'

// Stable id list for the scroll-spy observer.
const SECTION_IDS = navItems.map((n) => n.id)

export default function App() {
  const activeId = useScrollSpy(SECTION_IDS)
  const [loading, setLoading] = useState(shouldShowLoader)
  useScrollExperience()

  return (
    <UiReadyContext.Provider value={!loading}>
      {loading && <Loader onDone={() => setLoading(false)} />}
      {/* While the loader covers the page, the app behind it is inert — out of the
          tab order and the accessibility tree. (React 18 lacks the inert prop.) */}
      <div
        ref={(el) => {
          if (el) el.inert = loading
        }}
      >
      <SkipLink />
      <ScrollProgress />
      <AppHeader sections={navItems} activeId={activeId} />
      <StatusStrip />

      <main id="content">
        <Record />

        <TechBand />

        <Section id="about" num="01" name="About" meta="The path, compressed">
          <About />
        </Section>

        <Section id="expertise" num="02" name="Expertise" meta="What runs all day">
          <ExpertiseList />
        </Section>

        <Section id="projects" num="03" name="Projects" meta="Open source · github.com/tzolkowski96">
          <ProjectList />
        </Section>

        <Section id="work" num="04" name="Work" meta="Log · reverse chronological">
          <WorkLog />
        </Section>

        <Section id="writing" num="05" name="Writing" meta="I write to figure out what I think">
          <WritingFeed />
        </Section>

        <Section id="connect" num="06" name="Connect" meta="How to reach me, and what for">
          <Connect />
        </Section>
      </main>

      <SiteFooter />
      </div>
    </UiReadyContext.Provider>
  )
}
