import { AlertCircle, CheckCircle2, Music2 } from 'lucide-react'
import type { TransposedNote } from '@/domain/entities/TranspositionKey'
import type { InstrumentId } from '@/domain/entities/Fingering'
import { formatNoteToSolfege } from '@/shared/utils/parseNotesInput'
import { cn } from '@/shared/utils/cn'
import { NoteFingeringDisplay } from '../fingering/NoteFingeringDisplay'

interface TranspositionResultsProps {
  notes: TransposedNote[]
  hasTransposed: boolean
  fromLabel: string
  toLabel: string
  targetInstrumentId: InstrumentId | null
}

export function TranspositionResults({
  notes,
  hasTransposed,
  fromLabel,
  toLabel,
  targetInstrumentId,
}: TranspositionResultsProps) {
  if (!hasTransposed) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-music-border bg-music-surface/50 py-16 text-center">
        <Music2 className="h-10 w-10 text-music-violet-dim" strokeWidth={1.5} />
        <p className="max-w-sm text-sm text-music-muted">
          Introduce tus notas, elige la clave de origen y destino, y pulsa{' '}
          <strong className="text-music-gold">Transportar</strong> para ver el resultado.
        </p>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-music-border bg-music-surface p-6 text-center text-sm text-music-muted">
        No se detectaron notas en la entrada. Usa por ejemplo{' '}
        <code className="font-mono text-music-gold">do re mi fa</code> o{' '}
        <code className="font-mono text-music-gold">do reb do# mib</code>.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-music-border bg-music-surface">
      <div className="border-b border-music-border bg-music-surface-elevated px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-music-muted">
          Resultado · {fromLabel} → {toLabel}
        </p>
      </div>
      <ul className="divide-y divide-music-border">
        {notes.map((note, index) => (
          <li key={`${note.original}-${index}`} className="px-4 py-4 sm:px-5">
            <div className="flex w-full min-w-0 flex-col gap-4">
              {/* Fila superior: notas + sonido real */}
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,10rem)]">
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase text-music-muted">
                    Escrita ({fromLabel})
                  </span>
                  <p className="font-mono text-xl font-medium text-music-text">
                    {formatNoteToSolfege(note.original)}
                  </p>
                </div>

                <span
                  className="hidden items-center justify-center text-music-violet sm:flex"
                  aria-hidden
                >
                  →
                </span>

                <div className="min-w-0">
                  <span className="block text-[10px] uppercase text-music-muted">
                    Transportada ({toLabel})
                  </span>
                  <p
                    className={cn(
                      'font-mono text-xl font-semibold',
                      note.valid ? 'text-music-gold' : 'text-music-rose',
                    )}
                  >
                    {note.valid ? formatNoteToSolfege(note.transposed) : '—'}
                  </p>
                </div>

                <div className="min-w-0 border-t border-music-border/60 pt-3 sm:col-span-3 sm:border-t-0 sm:pt-0 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-4">
                  {note.valid ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-music-violet" />
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase text-music-muted">
                          Sonido real
                        </span>
                        <p className="font-mono text-sm text-music-muted">
                          {formatNoteToSolfege(note.concertPitch)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg border border-music-rose/25 bg-music-rose/5 px-3 py-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-music-rose" />
                      <p className="min-w-0 text-xs leading-relaxed text-music-rose">
                        {note.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fila inferior: digitación a ancho completo (nunca solapa columnas) */}
              {note.valid && targetInstrumentId && (
                <div className="w-full min-w-0 border-t border-music-border/60 pt-4">
                  <NoteFingeringDisplay
                    writtenNote={note.transposed}
                    instrumentId={targetInstrumentId}
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
