import { useState, type FormEvent } from 'react'
import { contact } from '../data/profile'

type Status = 'idle' | 'sending' | 'ok' | 'error'

const FIELD_LABEL = 'mb-2 block font-mono text-mono-label uppercase text-label'
const FIELD_INPUT =
  'w-full border border-rule-strong bg-panel px-4 py-3 text-base text-ink placeholder:text-label'

/** Formspree AJAX form: honeypot, real-time validity (submit disabled until valid),
 *  disabled-while-sending, and a role=status region for success/error (color + words + icon). */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)

  function handleInput(e: FormEvent<HTMLFormElement>) {
    setCanSubmit(e.currentTarget.checkValidity())
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setStatus('sending')
    setMessage('')
    try {
      const res = await fetch(contact.formspree, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        form.reset()
        setCanSubmit(false)
        setStatus('ok')
        setMessage('Your message is on its way.')
      } else {
        const data: { errors?: { message: string }[] } | null = await res.json().catch(() => null)
        setStatus('error')
        setMessage(
          data?.errors?.map((x) => x.message).join(', ') ||
            'Something went wrong. Try again, or reach me on LinkedIn.',
        )
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Try again, or reach me on LinkedIn.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInput={handleInput}
      action={contact.formspree}
      method="POST"
      noValidate
      className="flex flex-col gap-6"
    >
      <p
        id="cf-status"
        role="status"
        aria-live="polite"
        className={`font-mono text-mono-data ${
          status === 'ok' ? 'text-ink' : status === 'error' ? 'text-error' : 'sr-only'
        }`}
      >
        {status === 'ok' && '✓ '}
        {status === 'error' && '⚠ '}
        {message}
      </p>

      <div>
        <label htmlFor="cf-name" className={FIELD_LABEL}>
          Name
        </label>
        <input id="cf-name" name="name" type="text" autoComplete="name" className={FIELD_INPUT} />
      </div>

      <div>
        <label htmlFor="cf-email" className={FIELD_LABEL}>
          Email <span className="text-label">(required)</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-describedby="cf-status"
          aria-invalid={status === 'error'}
          className={FIELD_INPUT}
        />
      </div>

      <div>
        <label htmlFor="cf-msg" className={FIELD_LABEL}>
          Message <span className="text-label">(required)</span>
        </label>
        <textarea
          id="cf-msg"
          name="message"
          required
          rows={5}
          aria-describedby="cf-status"
          aria-invalid={status === 'error'}
          className={`${FIELD_INPUT} resize-y`}
        />
      </div>

      <input type="hidden" name="_subject" value="New message from your portfolio" />
      {/* Honeypot: bots fill it, humans never see it. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <button
        type="submit"
        disabled={!canSubmit || status === 'sending'}
        className="btn-press inline-flex min-h-tap items-center justify-center border border-ink bg-ink px-6 font-mono text-nav uppercase text-cream2 hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ink disabled:hover:bg-ink disabled:hover:text-cream2"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
