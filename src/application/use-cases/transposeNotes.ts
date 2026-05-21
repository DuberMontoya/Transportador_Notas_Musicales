import { noteTranspositionService } from '@/domain/services/NoteTranspositionService'
import type {
  TransposedNote,
  TranspositionKeyId,
} from '@/domain/entities/TranspositionKey'
import { normalizeNoteToken, parseNotesInput } from '@/shared/utils/parseNotesInput'

export interface TransposeNotesInput {
  rawInput: string
  fromKey: TranspositionKeyId
  toKey: TranspositionKeyId
}

export interface TransposeNotesResult {
  notes: TransposedNote[]
  parsedCount: number
}

export function transposeNotes(input: TransposeNotesInput): TransposeNotesResult {
  const rawTokens = parseNotesInput(input.rawInput)
  const notes = rawTokens.map((rawToken) => {
    const tonal = normalizeNoteToken(rawToken)
    const result = noteTranspositionService.transposeNote(
      tonal,
      input.fromKey,
      input.toKey,
    )
    return {
      ...result,
      /** Conserva solfege del usuario (fa#, solb…) para PDF y escala cromática. */
      original: rawToken,
    }
  })
  return { notes, parsedCount: rawTokens.length }
}
