import {
  getInstrument,
  instrumentHasDigitacion,
  instrumentSupportsSlide,
} from '@/domain/constants/instruments'
import type { InstrumentId } from '@/domain/entities/Fingering'
import { getAllRegisterFingerings } from '@/shared/utils/allRegisterFingerings'
import { PistonValves } from './PistonValves'
import { SlidePositionBadge } from './SlidePositionBadge'

interface NoteFingeringDisplayProps {
  /** Nota transportada en la clave destino. */
  writtenNote: string
  instrumentId: InstrumentId | null
}

export function NoteFingeringDisplay({
  writtenNote,
  instrumentId,
}: NoteFingeringDisplayProps) {
  if (!instrumentId) return null

  const instrument = getInstrument(instrumentId)

  if (!instrumentHasDigitacion(instrument)) {
    return (
      <p className="text-xs text-music-muted">
        {instrument.label}: {instrument.mechanismLabel.toLowerCase()}.
      </p>
    )
  }

  const entries = getAllRegisterFingerings(writtenNote, instrumentId)
  const valveCount = instrument.mechanism === 'pistons-4' ? 4 : 3
  const isSlide = instrumentSupportsSlide(instrument)
  const sectionLabel = isSlide ? 'Posiciones de vara' : 'Pistones / válvulas'

  return (
    <div>
      <span className="mb-2 block text-[10px] uppercase text-music-muted">{sectionLabel}</span>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <div
            key={entry.register}
            className="flex min-h-[7.5rem] min-w-0 flex-col rounded-lg border border-music-border/70 bg-music-bg/50 px-3 py-2.5"
          >
            <p className="mb-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-music-violet">
              {entry.label}
            </p>
            <p className="mb-2 shrink-0 font-mono text-xs text-music-muted">{entry.noteSolfege}</p>
            <div className="mt-auto min-w-0">
              {entry.available ? (
                <div className="flex flex-col gap-2">
                  {entry.kind === 'slide' && entry.slidePosition !== undefined ? (
                    <SlidePositionBadge position={entry.slidePosition} size="sm" />
                  ) : (
                    <PistonValves pressed={entry.valves} count={valveCount} size="sm" />
                  )}
                  <p className="font-mono text-sm font-medium text-music-gold">{entry.display}</p>
                  {entry.alternates && entry.alternates.length > 0 && (
                    <p className="text-[10px] leading-snug text-music-muted">
                      Alt.: {entry.alternates.join(' · ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-music-rose/90">{entry.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
