import { useState } from 'react'
import { FileDown, FileMusic } from 'lucide-react'
import { exportScoreToPdf } from '@/infrastructure/export/ScorePdfExporter'
import { buildScoreExportPayload } from '@/application/use-cases/buildScoreExportRows'
import type { TransposeNotesResult } from '@/application/use-cases/transposeNotes'
import type { ScoreDraft } from '@/domain/entities/ScoreDraft'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { Button } from '../ui/Button'

interface ScoreIOPanelProps {
  hasTransposed: boolean
  validCount: number
  result: TransposeNotesResult
  fromKey: TranspositionKeyId
  toKey: TranspositionKeyId
  targetInstrument: InstrumentId | null
  scoreTitle?: string
  exportScoreDraft?: ScoreDraft
  useStructuredScore?: boolean
}

export function ScoreIOPanel({
  hasTransposed,
  validCount,
  result,
  fromKey,
  toKey,
  targetInstrument,
  scoreTitle,
  exportScoreDraft,
  useStructuredScore = false,
}: ScoreIOPanelProps) {
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleExportPdf = async () => {
    const payload = buildScoreExportPayload({
      notes: result.notes,
      fromKey,
      toKey,
      instrumentId: targetInstrument,
      scoreTitle,
      scoreDraft: useStructuredScore ? exportScoreDraft : null,
    })

    if (!payload) return

    setExportStatus(null)
    setExporting(true)
    try {
      await exportScoreToPdf(payload)
    } catch (err) {
      setExportStatus(
        err instanceof Error ? err.message : 'No se pudo generar el PDF.',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="rounded-xl border border-music-border/80 bg-music-bg/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-music-gold">
        <FileMusic className="h-4 w-4" />
        <h3 className="text-sm font-semibold text-music-text">Exportar partitura (PDF)</h3>
      </div>

      <Button
        className="w-full sm:w-auto"
        disabled={!hasTransposed || validCount === 0 || exporting}
        onClick={() => void handleExportPdf()}
      >
        <FileDown className="h-4 w-4" />
        {exporting ? 'Generando PDF…' : 'Descargar PDF (pentagrama)'}
      </Button>
      <p className="mt-2 text-xs text-music-muted">
        Partitura tipo estudio: pentagramas con clave, notas, nombre en solfeo y digitación
        debajo de cada nota.
      </p>

      {exportStatus && (
        <p className="mt-3 text-xs text-music-rose">{exportStatus}</p>
      )}
    </div>
  )
}
