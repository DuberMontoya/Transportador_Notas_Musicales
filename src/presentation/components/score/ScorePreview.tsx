import { useEffect, useId, useState } from 'react'
import { buildStructuredScoreNotation } from '@/application/use-cases/buildStructuredScoreNotation'
import { buildPreviewRowsFromDraft } from '@/application/use-cases/buildPreviewRowsFromDraft'
import type { ScoreDraft } from '@/domain/entities/ScoreDraft'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { getExportClef } from '@/infrastructure/export/vexflowNoteFormat'
import {
  chunkStructuredIntoSystems,
  renderStructuredScorePageToDataUrl,
} from '@/infrastructure/export/structuredScoreRenderer'
import { ensureVexFlowFonts } from '@/infrastructure/export/scoreSheetRenderer'

interface ScorePreviewProps {
  draft: ScoreDraft
  toKey: TranspositionKeyId
  instrumentId: InstrumentId | null
}

export function ScorePreview({ draft, toKey, instrumentId }: ScorePreviewProps) {
  const canvasId = useId().replace(/:/g, '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (draft.events.length === 0) {
      setError(null)
      return
    }

    let cancelled = false

    void (async () => {
      await ensureVexFlowFonts()
      if (cancelled) return

      const rows = buildPreviewRowsFromDraft(draft, toKey, instrumentId)
      const notation = buildStructuredScoreNotation(draft, rows)
      const systems = chunkStructuredIntoSystems(notation)
      const clef = getExportClef(toKey, instrumentId)

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (!canvas) return

      const { dataUrl, error: renderError } = renderStructuredScorePageToDataUrl(
        systems,
        notation,
        clef,
        canvas,
      )

      if (cancelled) return
      setError(renderError ?? null)
      if (dataUrl) {
        canvas.style.width = '100%'
        canvas.style.height = 'auto'
      }
    })()

    return () => {
      cancelled = true
    }
  }, [draft, toKey, instrumentId, canvasId])

  if (draft.events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-music-border/80 px-4 py-8 text-center text-xs text-music-muted">
        Añade notas o silencios para ver la vista previa del pentagrama.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-music-border/80 bg-white/95 p-2">
      <canvas id={canvasId} className="mx-auto max-w-full" />
      {error && <p className="mt-2 text-xs text-music-rose">{error}</p>}
    </div>
  )
}
