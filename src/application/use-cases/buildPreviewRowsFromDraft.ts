import type { ScoreDraft } from '@/domain/entities/ScoreDraft'
import type { ScoreExportRow } from './buildScoreExportRows'
import { getExportClef } from '@/infrastructure/export/vexflowNoteFormat'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { buildStaffNotesForExport, toTonalStaffNote } from '@/shared/utils/staffNotePitch'
import { scoreDraftNotePitches } from '@/shared/utils/scoreDraftSync'

/** Filas mínimas para vista previa del constructor (sin transportar). */
export function buildPreviewRowsFromDraft(
  draft: ScoreDraft,
  toKey: TranspositionKeyId,
  instrumentId: InstrumentId | null,
): ScoreExportRow[] {
  const pitches = scoreDraftNotePitches(draft)
  if (pitches.length === 0) return []

  const clef = getExportClef(toKey, instrumentId)
  const items = pitches.map((pitch) => ({ original: pitch, transposed: pitch }))
  const staffNotes = buildStaffNotesForExport(items, { clef })

  return pitches.map((pitch, index) => ({
    index: index + 1,
    original: pitch,
    transposed: pitch,
    concert: pitch,
    pistons: '—',
    fingeringMedio: '—',
    staffNote: toTonalStaffNote(staffNotes[index] ?? pitch),
  }))
}
