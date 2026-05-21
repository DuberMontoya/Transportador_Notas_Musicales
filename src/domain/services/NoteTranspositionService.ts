import { Interval, Note } from 'tonal'
import { getKeyDefinition } from '../constants/transpositionKeys'
import type {
  TransposedNote,
  TranspositionKeyId,
} from '../entities/TranspositionKey'
import type { INoteTranspositionService } from '../interfaces/INoteTranspositionService'

/**
 * Servicio de dominio: transporta notas entre claves de instrumentos
 * manteniendo el mismo sonido real (concert pitch).
 *
 * Usa Tonal.js para parseo y transposición intervalar.
 */
export class NoteTranspositionService implements INoteTranspositionService {
  transposeNote(
    note: string,
    fromKey: TranspositionKeyId,
    toKey: TranspositionKeyId,
  ): TransposedNote {
    const trimmed = note.trim()
    if (!trimmed) {
      return {
        original: note,
        transposed: '',
        concertPitch: '',
        valid: false,
        error: 'Nota vacía',
      }
    }

    if (!Note.get(trimmed).name) {
      return {
        original: trimmed,
        transposed: '',
        concertPitch: '',
        valid: false,
        error: `"${trimmed}" no es una nota válida`,
      }
    }

    const fromDef = getKeyDefinition(fromKey)
    const toDef = getKeyDefinition(toKey)

    const semitoneDelta =
      toDef.writtenToConcertSemitones - fromDef.writtenToConcertSemitones

    const intervalName = Interval.fromSemitones(semitoneDelta)
    if (!intervalName) {
      return {
        original: trimmed,
        transposed: '',
        concertPitch: '',
        valid: false,
        error: 'No se pudo calcular el intervalo de transporte',
      }
    }

    const concertPitch = Note.transpose(
      trimmed,
      Interval.fromSemitones(-fromDef.writtenToConcertSemitones) ?? '',
    )
    const transposed = Note.transpose(trimmed, intervalName)

    if (!transposed || transposed === '') {
      return {
        original: trimmed,
        transposed: '',
        concertPitch: concertPitch || '',
        valid: false,
        error: 'Error al transportar la nota',
      }
    }

    return {
      original: trimmed,
      transposed,
      concertPitch: concertPitch || '',
      valid: true,
    }
  }

  transposeMany(
    notes: string[],
    fromKey: TranspositionKeyId,
    toKey: TranspositionKeyId,
  ): TransposedNote[] {
    return notes.map((n) => this.transposeNote(n, fromKey, toKey))
  }
}

export const noteTranspositionService = new NoteTranspositionService()
