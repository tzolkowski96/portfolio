import type { ReactNode } from 'react'

interface ButtonProps {
  as?: 'a' | 'button'
  href?: string
  variant?: 'primary' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  external?: boolean
  className?: string
  children: ReactNode
  onClick?: () => void
}

const BASE =
  'inline-flex min-h-tap items-center justify-center gap-2 px-4 font-mono text-nav uppercase btn-press'

const VARIANTS = {
  // filled↔outlined inversions: border stays so the footprint never shifts
  primary: 'border border-ink bg-ink text-cream2 hover:bg-transparent hover:text-ink',
  ghost: 'border border-rule-strong text-ink hover:border-ink hover:bg-ink hover:text-cream2',
} as const

/** Shared 48px-min action. Renders as <a> or <button>; distinct hover + focus. */
export function Button({
  as = 'button',
  href,
  variant = 'primary',
  type = 'button',
  disabled = false,
  external = false,
  className = '',
  children,
  onClick,
}: ButtonProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
