import { TRANSPOSITION_KEYS } from '@/domain/constants/transpositionKeys'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { Select } from '../ui/Select'

interface KeySelectorProps {
  label: string
  value: TranspositionKeyId
  onChange: (id: TranspositionKeyId) => void
}

export function KeySelector({ label, value, onChange }: KeySelectorProps) {
  const current = TRANSPOSITION_KEYS.find((k) => k.id === value)

  return (
    <div className="min-w-0">
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as TranspositionKeyId)}
      >
        {TRANSPOSITION_KEYS.map((key) => (
          <option key={key.id} value={key.id}>
            {key.label}
          </option>
        ))}
      </Select>
      {current && (
        <p className="mt-2 text-xs leading-relaxed text-music-muted">
          {current.description}
          {value === 'F' && (
            <span className="mt-1 block text-music-violet/90">
              Instrumentos en Fa: corno, melófono, trompa alto, corno inglés…
            </span>
          )}
          {value === 'C' && (
            <span className="mt-1 block text-music-violet/90">
              Trombón en Do: posiciones de vara 1 a 7 (8 en bajo pedal).
            </span>
          )}
        </p>
      )}
    </div>
  )
}
