import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  const areaId = id ?? label.replace(/\s/g, '-').toLowerCase()

  return (
    <label htmlFor={areaId} className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-music-muted">
        {label}
      </span>
      <textarea
        id={areaId}
        className={cn(
          'min-h-[120px] w-full resize-y rounded-xl border border-music-border bg-music-surface-elevated px-4 py-3 font-mono text-sm text-music-text placeholder:text-music-muted/60 transition-colors focus:border-music-violet focus:outline-none focus:ring-2 focus:ring-music-violet/30',
          className,
        )}
        {...props}
      />
      {hint && <span className="text-xs text-music-muted">{hint}</span>}
    </label>
  )
}
