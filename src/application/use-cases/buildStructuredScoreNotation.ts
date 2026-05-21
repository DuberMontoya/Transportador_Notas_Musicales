import type { ScoreDraft, ScoreDraftEvent } from '@/domain/entities/ScoreDraft'
import type { ScoreExportRow } from './buildScoreExportRows'
import { sortDraftEvents } from '@/shared/utils/scoreDraftSync'

export interface StructuredScoreSlot {
  event: ScoreDraftEvent
  row?: ScoreExportRow
  staffNote?: string
}

export interface StructuredScoreMeasure {
  measureNumber: number
  slots: StructuredScoreSlot[]
}

export interface StructuredScoreNotation {
  timeSignature: ScoreDraft['timeSignature']
  measures: StructuredScoreMeasure[]
}

export function buildStructuredScoreNotation(
  draft: ScoreDraft,
  rows: ScoreExportRow[],
): StructuredScoreNotation {
  const sorted = sortDraftEvents(draft.events)
  let rowIndex = 0
  const byMeasure = new Map<number, StructuredScoreSlot[]>()

  for (const event of sorted) {
    const list = byMeasure.get(event.measure) ?? []
    if (event.kind === 'note') {
      const row = rows[rowIndex]
      rowIndex += 1
      list.push({
        event,
        row,
        staffNote: row?.staffNote,
      })
    } else {
      list.push({ event })
    }
    byMeasure.set(event.measure, list)
  }

  const measures = [...byMeasure.entries()]
    .sort(([a], [b]) => a - b)
    .map(([measureNumber, slots]) => ({ measureNumber, slots }))

  return {
    timeSignature: draft.timeSignature,
    measures,
  }
}

export function structuredNotationHasContent(
  notation: StructuredScoreNotation | undefined,
): boolean {
  return (notation?.measures.length ?? 0) > 0
}
