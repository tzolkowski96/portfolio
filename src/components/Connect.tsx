import { ContactForm } from './ContactForm'
import { ContactChannels } from './ContactChannels'
import { contact } from '../data/profile'
import { Reveal } from './Reveal'

/** Connect: the intro as a large serif statement, then the form beside the
 *  "how to reach me" notes and channel links. */
export function Connect() {
  return (
    <div>
      <Reveal>
        <p className="max-w-[24ch] text-balance font-serif text-[clamp(2.125rem,3.8vw,3.5rem)] font-light leading-[1.08] tracking-[-0.025em] text-ink">
          {contact.intro}
        </p>
      </Reveal>
      <Reveal delay={120}>
        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <ContactForm />
          <ContactChannels />
        </div>
      </Reveal>
    </div>
  )
}
