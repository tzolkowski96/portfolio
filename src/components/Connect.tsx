import { ContactForm } from './ContactForm'
import { ContactChannels } from './ContactChannels'
import { contact } from '../data/profile'

/** Connect: intro + contact form alongside the "how to reach me" channels. */
export function Connect() {
  return (
    <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline md:grid-cols-2">
      <div className="bg-panel p-6 lg:p-8">
        <p className="max-w-reading text-body text-ink-2">{contact.intro}</p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </div>
      <div className="bg-panel p-6 lg:p-8">
        <ContactChannels />
      </div>
    </div>
  )
}
