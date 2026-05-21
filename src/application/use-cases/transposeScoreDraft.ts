import { noteTranspositionService } from '@/domain/services/NoteTranspositionService'
import type { ScoreDraft, ScoreDraftEvent } from '@/domain/entities/ScoreDraft'
import type { TransposedNote, TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { formatNoteToSolfege, normalizeNoteToken } from '@/shared/utils/parseNotesInput'
import { scoreDraftNotePitches } from '@/shared/utils/scoreDraftSync'
import type { TransposeNotesResult } from './transposeNotes'

export interface TransposeScoreDraftInput {
  draft: ScoreDraft
  fromKey: TranspositionKeyId
  toKey: TranspositionKeyId
}

export interface TransposeScoreDraftResult extends TransposeNotesResult {
  transposedDraft: ScoreDraft
}

export function transposeScoreDraft(
  input: TransposeScoreDraftInput,
): TransposeScoreDraftResult {
  const pitches = scoreDraftNotePitches(input.draft)
  const notes: TransposedNote[] = []
  let noteIndex = 0

  const transposedEvents: ScoreDraftEvent[] = input.draft.events.map((event) => {
    if (event.kind === 'rest') {
      return { ...event, id: event.id }
    }

    const rawToken = pitches[noteIndex] ?? event.pitch
    noteIndex += 1
    const tonal = normalizeNoteToken(rawToken)
    const result = noteTranspositionService.transposeNote(
      tonal,
      input.fromKey,
      input.toKey,
    )

    notes.push({
      ...result,
      original: rawToken,
    })

    const transposedPitch = result.valid
      ? formatNoteToSolfege(result.transposed)
      : event.pitch

    return {
      ...event,
      pitch: transposedPitch,
    }
  })

  return {
    notes,
    parsedCount: pitches.length,
    transposedDraft: {
      ...input.draft,
      events: transposedEvents,
    },
  }
}
