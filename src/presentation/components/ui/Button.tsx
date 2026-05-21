import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary:
    'bg-music-gold text-music-bg hover:bg-music-gold-dim shadow-lg shadow-music-gold/20',
  secondary:
    'bg-music-surface-elevated border border-music-border text-music-text hover:border-music-violet',
  ghost: 'text-music-muted hover:text-music-text hover:bg-music-surface-elevated',
}

export function Button({
  className,
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-music-gold disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
