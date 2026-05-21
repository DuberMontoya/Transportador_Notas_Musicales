import type { ScoreDraft, ScoreDraftEvent } from '@/domain/entities/ScoreDraft'
/** Solo las notas (sin silencios), en orden de compás y creación. */
export function scoreDraftNotePitches(draft: ScoreDraft): string[] {
  return [...draft.events]
    .filter((e) => e.kind === 'note')
    .sort((a, b) => a.measure - b.measure || 0)
    .map((e) => e.pitch.trim())
    .filter(Boolean)
}

export function scoreDraftToRawInput(draft: ScoreDraft): string {
  return scoreDraftNotePitches(draft).join(' ')
}

export function maxMeasureInDraft(draft: ScoreDraft): number {
  if (draft.events.length === 0) return 1
  return Math.max(...draft.events.map((e) => e.measure), 1)
}

export function nextMeasureNumber(draft: ScoreDraft): number {
  return maxMeasureInDraft(draft) + 1
}

export function sortDraftEvents(events: ScoreDraftEvent[]): ScoreDraftEvent[] {
  return [...events].sort((a, b) => a.measure - b.measure)
}
