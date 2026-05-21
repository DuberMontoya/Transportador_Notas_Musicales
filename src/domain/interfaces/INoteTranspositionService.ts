import type {
  TransposedNote,
  TranspositionKeyId,
} from '../entities/TranspositionKey'

export interface INoteTranspositionService {
  transposeNote(
    note: string,
    fromKey: TranspositionKeyId,
    toKey: TranspositionKeyId,
  ): TransposedNote

  transposeMany(
    notes: string[],
    fromKey: TranspositionKeyId,
    toKey: TranspositionKeyId,
  ): TransposedNote[]
}
