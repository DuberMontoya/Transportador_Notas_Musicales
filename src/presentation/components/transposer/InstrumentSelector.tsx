import { getInstrumentsForKey, instrumentHasDigitacion } from '@/domain/constants/instruments'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { Select } from '../ui/Select'

interface InstrumentSelectorProps {
  transpositionKeyId: TranspositionKeyId
  value: InstrumentId | null
  onChange: (id: InstrumentId) => void
}

export function InstrumentSelector({
  transpositionKeyId,
  value,
  onChange,
}: InstrumentSelectorProps) {
  const instruments = getInstrumentsForKey(transpositionKeyId)

  if (instruments.length === 0) {
    return (
      <p className="text-sm text-music-muted">
        La clave de destino no tiene instrumentos con pistones configurados.
      </p>
    )
  }

  const current = instruments.find((i) => i.id === value)
  const hasDigitacion = current && instrumentHasDigitacion(current)

  return (
    <div className="min-w-0">
      <Select
        label="Instrumento (destino)"
        value={value ?? instruments[0].id}
        onChange={(e) => onChange(e.target.value as InstrumentId)}
      >
        {instruments.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.label}
            {instrumentHasDigitacion(inst) ? ` · ${inst.mechanismLabel}` : ''}
            {inst.hint ? ` (${inst.hint})` : ''}
          </option>
        ))}
      </Select>
      {current && !hasDigitacion && (
        <p className="mt-2 text-xs text-music-muted">
          {current.label}: digitación por {current.mechanismLabel.toLowerCase()}, sin pistones.
        </p>
      )}
    </div>
  )
}
