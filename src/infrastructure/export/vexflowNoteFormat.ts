import { getInstrument } from '@/domain/constants/instruments'
import { getKeyDefinition } from '@/domain/constants/transpositionKeys'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import type { InstrumentId } from '@/domain/entities/Fingering'
import {
  chromaticStepToken,
  parseSolfegeToken,
} from '@/shared/utils/parseNotesInput'
import { Note } from 'tonal'

/** Claves VexFlow soportadas en el PDF. */
export type VexClef = 'treble' | 'bass' | 'alto' | 'tenor'

export const NOTES_PER_MEASURE = 4

/**
 * Convierte una nota Tonal (C#4, Ebb4, Fb4…) al fragmento EasyScore: c#4/q.
 * Devuelve null si la nota no es válida.
 */
export type VexAccidentalType = '#' | '##' | 'b' | 'bb'

/** Alteración según solfeo escrito (fa#, mib, sib…). */
export function accidentalFromSolfege(token: string): VexAccidentalType | null {
  const parsed = parseSolfegeToken(chromaticStepToken(token))
  if (!parsed) return null
  if (parsed.accidental === '#') return '#'
  if (parsed.accidental === 'b') return 'b'
  return null
}

/** Posición en el pentagrama sin alteración en la clave (se dibuja aparte). */
export function tonalToVexFlowKeyNatural(noteName: string): string | null {
  const parsed = Note.get(noteName)
  if (!parsed.name || parsed.oct === undefined) return null
  const letter = (parsed.letter ?? parsed.name[0]).toLowerCase()
  return `${letter}/${parsed.oct}`
}

/** Clave VexFlow con alteración en el nombre (uso interno). */
export function tonalToVexFlowKey(noteName: string): string | null {
  const parsed = Note.get(noteName)
  if (!parsed.name || parsed.oct === undefined) return null

  const letter = (parsed.letter ?? parsed.name[0]).toLowerCase()
  let accid = ''
  if (parsed.alt === 2) accid = '##'
  else if (parsed.alt === -2) accid = 'bb'
  else if (parsed.alt === 1) accid = '#'
  else if (parsed.alt === -1) accid = 'b'

  return `${letter}${accid}/${parsed.oct}`
}

export function tonalNoteToEasyScore(noteName: string, duration = 'q'): string | null {
  const parsed = Note.get(noteName)
  if (!parsed.name || parsed.oct === undefined) return null

  const letter = (parsed.letter ?? parsed.name[0]).toLowerCase()
  let accid = ''
  if (parsed.alt === 2) accid = '##'
  else if (parsed.alt === -2) accid = 'bb'
  else if (parsed.alt === 1) accid = '#'
  else if (parsed.alt === -1) accid = 'b'

  return `${letter}${accid}${parsed.oct}/${duration}`
}

export function tonalNotesToEasyScoreLine(notes: string[], duration = 'q'): string {
  return notes
    .map((n) => tonalNoteToEasyScore(n, duration))
    .filter((p): p is string => p !== null)
    .join(', ')
}

/**
 * Línea EasyScore con compás completo (silencios de relleno si faltan notas).
 */
export function tonalNotesToFullMeasureLine(
  notes: string[],
  slots = NOTES_PER_MEASURE,
): string {
  const pieces: string[] = []
  for (const n of notes) {
    const p = tonalNoteToEasyScore(n)
    if (p) pieces.push(p)
  }
  while (pieces.length < slots) {
    pieces.push('b4/r')
  }
  return pieces.join(', ')
}

/** Clave de transposición efectiva (prioriza el instrumento seleccionado). */
export function resolveExportTranspositionKey(
  toKey: TranspositionKeyId,
  instrumentId: InstrumentId | null,
): TranspositionKeyId {
  if (instrumentId) {
    return getInstrument(instrumentId).transpositionKeyId
  }
  return toKey
}

const STAFF_CLEF_SYMBOL_LABELS: Record<VexClef, string> = {
  treble: 'símbolo de clave de sol en el pentagrama',
  bass: 'símbolo de clave de fa en el pentagrama',
  alto: 'símbolo de clave de do (3ª línea)',
  tenor: 'símbolo de clave de do (4ª línea)',
}

/**
 * Texto para el PDF: separa clave de transposición del instrumento (Fa, Sib…)
 * del símbolo dibujado en el pentagrama (sol, fa…).
 */
export function describeExportNotation(
  toKey: TranspositionKeyId,
  instrumentId: InstrumentId | null,
  clef: VexClef,
): string {
  const effectiveKey = resolveExportTranspositionKey(toKey, instrumentId)
  const keyLabel = getKeyDefinition(effectiveKey).label
  const staffSymbol = STAFF_CLEF_SYMBOL_LABELS[clef]
  return `Notas escritas en ${keyLabel} (${staffSymbol})`
}

/**
 * Símbolo de clave en el pentagrama según la clave de transposición escrita.
 * Evita confundir solfeo (sol, fa…) con las líneas de la clave de sol cuando
 * el instrumento está en Fa, Mib, etc.
 */
const STAFF_CLEF_BY_TRANSPOSITION_KEY: Record<TranspositionKeyId, VexClef> = {
  Bb: 'treble',
  F: 'bass',
  Eb: 'alto',
  'Eb-baritone': 'bass',
  C: 'bass',
  A: 'treble',
  G: 'treble',
  D: 'treble',
}

export function getExportClef(
  toKey: TranspositionKeyId,
  instrumentId: InstrumentId | null,
): VexClef {
  const key = resolveExportTranspositionKey(toKey, instrumentId)

  if (instrumentId === 'c-bass-trombone' || instrumentId === 'c-tenor-trombone') {
    return 'bass'
  }

  return STAFF_CLEF_BY_TRANSPOSITION_KEY[key] ?? 'treble'
}
