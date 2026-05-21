import { Settings2 } from 'lucide-react'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { InstrumentSelector } from './InstrumentSelector'

interface FingeringOptionsPanelProps {
  transpositionKeyId: TranspositionKeyId
  instrumentId: InstrumentId | null
  onInstrumentChange: (id: InstrumentId) => void
}

export function FingeringOptionsPanel({
  transpositionKeyId,
  instrumentId,
  onInstrumentChange,
}: FingeringOptionsPanelProps) {
  return (
    <div className="rounded-xl border border-music-border/80 bg-music-bg/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-music-violet">
        <Settings2 className="h-4 w-4" />
        <h3 className="text-sm font-semibold text-music-text">Digitación (pistones)</h3>
      </div>
      <p className="mb-4 text-xs text-music-muted">
        Escribe solo el nombre (<code className="font-mono text-music-text">do re mi</code>). Verás
        <strong className="text-music-text"> pistones</strong> o{' '}
        <strong className="text-music-text">posiciones de vara (1–7)</strong> en grave, medio y agudo.
      </p>
      <InstrumentSelector
        transpositionKeyId={transpositionKeyId}
        value={instrumentId}
        onChange={onInstrumentChange}
      />
    </div>
  )
}
