import { cn } from '@/shared/utils/cn'

interface PistonValvesProps {
  /** Válvulas pulsadas, p. ej. [1, 3] */
  pressed: number[]
  /** Cantidad de válvulas del instrumento (3 o 4). */
  count?: 3 | 4
  size?: 'sm' | 'md'
}

export function PistonValves({ pressed, count = 3, size = 'md' }: PistonValvesProps) {
  const valves = Array.from({ length: count }, (_, i) => i + 1)
  const isSm = size === 'sm'

  return (
    <div className="flex items-end gap-2" role="img" aria-label={`Pistones: ${pressed.length ? pressed.join(', ') : 'ninguno'}`}>
      {valves.map((num) => {
        const isPressed = pressed.includes(num)
        return (
          <div key={num} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-music-muted">{num}</span>
            <div
              className={cn(
                'relative flex flex-col items-center justify-end rounded-lg border-2 transition-colors',
                isSm ? 'h-12 w-8' : 'h-16 w-10',
                isPressed
                  ? 'border-music-gold bg-music-gold/15'
                  : 'border-music-border bg-music-bg',
              )}
            >
              <div
                className={cn(
                  'mb-1.5 rounded-sm',
                  isSm ? 'h-6 w-5' : 'h-9 w-6',
                  isPressed ? 'bg-music-gold shadow-inner shadow-music-gold/40' : 'bg-music-surface-elevated',
                )}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
