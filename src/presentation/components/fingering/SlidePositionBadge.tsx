import { cn } from '@/shared/utils/cn'

interface SlidePositionBadgeProps {
  position: number
  maxPosition?: number
  size?: 'sm' | 'md'
}

export function SlidePositionBadge({
  position,
  maxPosition = 7,
  size = 'md',
}: SlidePositionBadgeProps) {
  const isSm = size === 'sm'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-music-gold bg-music-gold/10',
        isSm ? 'h-14 w-14' : 'h-20 w-20',
      )}
      role="img"
      aria-label={`Posición de vara ${position}`}
    >
      <span className="text-[9px] font-medium uppercase tracking-wider text-music-muted">
        Pos.
      </span>
      <span className={cn('font-bold text-music-gold', isSm ? 'text-2xl' : 'text-3xl')}>
        {position}
      </span>
      <span className="text-[8px] text-music-muted">de {maxPosition}</span>
    </div>
  )
}
