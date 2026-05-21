import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label.replace(/\s/g, '-').toLowerCase()

  return (
    <label htmlFor={selectId} className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-music-muted">
        {label}
      </span>
      <select
        id={selectId}
        className={cn(
          'w-full min-w-0 rounded-xl border border-music-border bg-music-surface-elevated px-4 py-3 text-sm text-music-text transition-colors focus:border-music-violet focus:outline-none focus:ring-2 focus:ring-music-violet/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
