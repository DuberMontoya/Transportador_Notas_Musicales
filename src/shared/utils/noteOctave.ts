import { Note } from 'tonal'
import { parseSolfegeToken, solfegeToTonal } from './parseNotesInput'

/** Octavas para mostrar digitación en grave, medio y agudo. */
export const REGISTER_OCTAVES = [3, 4, 5] as const
export type RegisterOctave = (typeof REGISTER_OCTAVES)[number]

export const REGISTER_LABELS: Record<RegisterOctave, string> = {
  3: 'Grave',
  4: 'Medio',
  5: 'Agudo',
}

/**
 * Añade octava a una nota sin número (do → do4 / C → C4).
 * Si la nota ya trae octava escrita, se respeta.
 */
export function applyRegisterOctave(note: string, octave: RegisterOctave): string {
  const trimmed = note.trim()
  if (!trimmed) return trimmed

  const solfege = parseSolfegeToken(trimmed)
  if (solfege) {
    if (solfege.octave) return solfegeToTonal(solfege)
    return solfegeToTonal({ ...solfege, octave: String(octave) })
  }

  const parsed = Note.get(trimmed)
  if (parsed.name && parsed.oct !== undefined) return trimmed

  const pitchClass = Note.pitchClass(trimmed)
  if (pitchClass) return `${pitchClass}${octave}`

  return trimmed
}
