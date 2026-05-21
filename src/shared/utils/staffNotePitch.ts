import {
  CHROMATIC_SCALE_SOLFEGE,
  CHROMATIC_SCALE_STAFF_OCTAVES,
} from '@/shared/constants/chromaticScale'
import type { VexClef } from '@/infrastructure/export/vexflowNoteFormat'
import { applyRegisterOctave, type RegisterOctave } from './noteOctave'
import {
  chromaticStepToken,
  formatNoteToSolfege,
  parseSolfegeToken,
  solfegeToTonal,
  type ParsedSolfegeToken,
} from './parseNotesInput'
import { Note } from 'tonal'

const TREBLE_STAFF_OCTAVES = [3, 4, 5] as const
const LOW_STAFF_OCTAVES = [2, 3, 4] as const

function isHighStaffClef(clef: VexClef): boolean {
  return clef === 'treble'
}

function registerOctavesForClef(clef: VexClef): readonly number[] {
  return isHighStaffClef(clef) ? TREBLE_STAFF_OCTAVES : LOW_STAFF_OCTAVES
}

function staffOctaveForChromatic(index: number, clef: VexClef): number {
  const oct = CHROMATIC_SCALE_STAFF_OCTAVES[index] ?? 4
  if (isHighStaffClef(clef)) return oct
  return Math.max(2, oct - 1)
}

export { chromaticStepToken } from './parseNotesInput'

function pitchClassOf(note: string): string | null {
  const direct = Note.pitchClass(note) ?? Note.get(note).pc
  if (direct) return direct

  const solfege = parseSolfegeToken(note)
  if (solfege) {
    return Note.pitchClass(solfegeToTonal(solfege)) ?? Note.get(solfegeToTonal(solfege)).pc ?? null
  }

  const step = chromaticStepToken(note)
  const parsed = parseSolfegeToken(step)
  if (parsed) {
    return Note.pitchClass(solfegeToTonal(parsed)) ?? Note.get(solfegeToTonal(parsed)).pc ?? null
  }

  return null
}

/** Nota Tonal con solfeo español (sib, fa#, mib…) y octava en el pentagrama. */
export function staffNoteFromSolfege(step: string, octave: number): string | null {
  const parsed = parseSolfegeToken(chromaticStepToken(step))
  if (!parsed || octave < 2 || octave > 6) return null
  return solfegeToTonal({ ...parsed, octave: String(octave) })
}

/** Escribe la nota transportada con la octava indicada (altura en el pentagrama). */
export function applyStaffOctave(transposed: string, octave: number): string {
  const spelled = staffNoteFromSolfege(formatNoteToSolfege(transposed), octave)
  if (spelled) return spelled

  const pc = pitchClassOf(transposed)
  if (pc && octave >= 2 && octave <= 6) {
    return `${pc}${octave}`
  }
  if (octave >= 3 && octave <= 5) {
    return applyRegisterOctave(transposed, octave as RegisterOctave)
  }
  return transposed
}

/** ¿Es la escala cromática completa en orden (51 notas)? */
export function isChromaticScaleInOrder(tokens: string[]): boolean {
  if (tokens.length !== CHROMATIC_SCALE_SOLFEGE.length) return false
  return tokens.every(
    (token, index) => chromaticStepToken(token) === CHROMATIC_SCALE_SOLFEGE[index],
  )
}

function midiCandidatesForPitchClass(pitchClass: string, clef: VexClef): number[] {
  return registerOctavesForClef(clef)
    .map((o) => Note.midi(`${pitchClass}${o}`))
    .filter((m): m is number => m !== null && m !== undefined)
}

/** Elige la octava del pitch class más cercana al contorno de la tabla de estudio. */
export function pickMidiNearContour(
  pitchClass: string,
  targetMidi: number,
  clef: VexClef = 'treble',
): number {
  const candidates = midiCandidatesForPitchClass(pitchClass, clef)
  if (candidates.length === 0) return targetMidi
  return candidates.reduce((best, c) =>
    Math.abs(c - targetMidi) < Math.abs(best - targetMidi) ? c : best,
  )
}

/**
 * Sigue el contorno de la hoja (sube/baja) sin saltar octavas al azar.
 * Evita que las notas queden en orden temporal pero desordenadas en altura.
 */
export function pickMidiAlongContour(
  pitchClass: string,
  prevMidi: number,
  targetMidi: number,
  prevTargetMidi: number,
  index: number,
  clef: VexClef = 'treble',
): number {
  const candidates = midiCandidatesForPitchClass(pitchClass, clef)
  if (candidates.length === 0) return targetMidi
  if (index === 0) return pickMidiNearContour(pitchClass, targetMidi, clef)

  const contourDelta = targetMidi - prevTargetMidi
  const above = candidates.filter((m) => m > prevMidi).sort((a, b) => a - b)
  const below = candidates.filter((m) => m < prevMidi).sort((a, b) => b - a)

  if (contourDelta > 0 && above.length > 0) return above[0]!
  if (contourDelta < 0 && below.length > 0) return below[0]!
  if (contourDelta === 0) {
    const same = candidates.find((m) => m === prevMidi)
    if (same !== undefined) return same
    return pickMidiNearContour(pitchClass, targetMidi, clef)
  }

  return pickMidiMelodic(pitchClass, prevMidi, index, clef)
}

function spellingHintForExport(item: { transposed: string }): ParsedSolfegeToken | null {
  return parseSolfegeToken(chromaticStepToken(item.transposed))
}

/** Nombre Tonal válido para VexFlow (F4, Bb4…), nunca solfeo suelto (fa4). */
export function toTonalStaffNote(note: string): string {
  const trimmed = note.trim()
  if (!trimmed) return 'C4'

  const parsed = Note.get(trimmed)
  if (parsed.name) return parsed.name

  const solfege = parseSolfegeToken(trimmed)
  if (solfege) {
    const oct = solfege.octave || String(Note.octave(trimmed) ?? 4)
    return solfegeToTonal({ ...solfege, octave: oct })
  }

  const pc = Note.pitchClass(trimmed)
  const oct = Note.octave(trimmed) ?? 4
  if (pc) return `${pc}${oct}`

  return 'C4'
}

function staffNoteFromMidi(midi: number, spelling: ParsedSolfegeToken | null): string {
  const fromMidi = Note.fromMidi(midi)
  if (!fromMidi) return 'C4'

  if (spelling) {
    const octave = Note.octave(fromMidi) ?? 4
    const spelled = solfegeToTonal({ ...spelling, octave: String(octave) })
    if (Note.midi(spelled) === midi) return spelled
  }

  return fromMidi
}

/**
 * Coloca la nota siguiendo la melodía: sube por encima de la anterior,
 * baja por debajo si la melodía desciende (do→re→…→si→do agudo).
 */
export function pickMidiMelodic(
  pitchClass: string,
  prevMidi: number,
  index: number,
  clef: VexClef = 'treble',
): number {
  const candidates = midiCandidatesForPitchClass(pitchClass, clef)
  if (candidates.length === 0) return prevMidi

  if (index === 0) {
    if (isHighStaffClef(clef)) {
      const prefer4 = candidates.find((m) => m >= 60 && m <= 72)
      return prefer4 ?? candidates[1] ?? candidates[0]!
    }
    const prefer3 = candidates.find((m) => m >= 48 && m <= 60)
    return prefer3 ?? candidates[0]! ?? candidates[1]!
  }

  const byDistance = [...candidates].sort(
    (a, b) => Math.abs(a - prevMidi) - Math.abs(b - prevMidi),
  )
  const closest = byDistance[0]!
  if (Math.abs(closest - prevMidi) <= 6) {
    return closest
  }

  const above = candidates.filter((m) => m > prevMidi)
  const below = candidates.filter((m) => m < prevMidi)

  const prevChroma = Note.chroma(Note.fromMidi(prevMidi) ?? '') ?? 0
  const nextChroma = Note.chroma(`${pitchClass}4`) ?? 0
  const intervalUp = (nextChroma - prevChroma + 12) % 12

  const isStepUp = intervalUp > 0 && intervalUp <= 7
  const isStepDown = intervalUp > 5

  if (isStepUp && above.length > 0) {
    return above.sort((a, b) => a - b)[0]
  }

  if (isStepDown && below.length > 0) {
    return below.sort((a, b) => b - a)[0]
  }

  if (above.length > 0 && below.length === 0) {
    return above[0]
  }

  return closest
}

/**
 * Altura en el pentagrama (solo nota suelta; preferir buildStaffNotesForExport).
 */
export function resolveStaffNoteForExport(
  original: string,
  transposed: string,
  sequenceIndex: number,
  options?: { forceChromaticContour?: boolean },
): string {
  const forceChromatic = options?.forceChromaticContour ?? false

  const useChromaticOctave =
    forceChromatic ||
    (sequenceIndex >= 0 &&
      sequenceIndex < CHROMATIC_SCALE_STAFF_OCTAVES.length &&
      chromaticStepToken(original) === CHROMATIC_SCALE_SOLFEGE[sequenceIndex])

  if (useChromaticOctave) {
    const oct = CHROMATIC_SCALE_STAFF_OCTAVES[sequenceIndex]
    const fromOriginal = staffNoteFromSolfege(original, oct)
    if (fromOriginal) return fromOriginal
    return applyStaffOctave(transposed, oct)
  }

  const parsed = parseSolfegeToken(original)
  if (parsed?.octave) {
    const oct = Number(parsed.octave)
    if (oct >= 2 && oct <= 6) {
      return applyStaffOctave(transposed, oct)
    }
  }

  return applyStaffOctave(transposed, 4)
}

/** Asigna octavas siguiendo el contorno melódico (o tabla cromática si aplica). */
export function buildContourStaffNotes(
  items: { original: string; transposed: string }[],
  clef: VexClef = 'treble',
): string[] {
  if (items.length === 0) return []

  if (isChromaticScaleInOrder(items.map((i) => i.original))) {
    return items.map((item, index) => {
      const oct = staffOctaveForChromatic(index, clef)
      return (
        staffNoteFromSolfege(item.transposed, oct) ??
        applyStaffOctave(item.transposed, oct)
      )
    })
  }

  const startNote = isHighStaffClef(clef) ? 'C4' : 'C3'
  let prevMidi = Note.midi(startNote) ?? (isHighStaffClef(clef) ? 60 : 48)
  const midis: number[] = []

  items.forEach((item, index) => {
    const pc = pitchClassOf(item.transposed)
    if (!pc) {
      const fallbackOct = isHighStaffClef(clef) ? 4 : 3
      prevMidi = Note.midi(applyStaffOctave(item.transposed, fallbackOct)) ?? prevMidi
      midis.push(prevMidi)
      return
    }
    prevMidi = pickMidiMelodic(pc, prevMidi, index, clef)
    midis.push(prevMidi)
  })

  return midis.map((midi, index) =>
    staffNoteFromMidi(midi, spellingHintForExport(items[index]!)),
  )
}

/** Genera todas las alturas del pentagrama para exportar PDF. */
export function buildStaffNotesForExport(
  items: { original: string; transposed: string }[],
  options?: { clef?: VexClef },
): string[] {
  return buildContourStaffNotes(items, options?.clef ?? 'treble')
}
