import { Note } from 'tonal'
import {
  chromaticStepToken,
  formatNoteToSolfege,
  parseSolfegeToken,
  solfegeToTonal,
} from './parseNotesInput'
import {
  applyRegisterOctave,
  REGISTER_OCTAVES,
  type RegisterOctave,
} from './noteOctave'

export interface ResolveFingeringNoteInput {
  /** Nota escrita transportada (Tonal o solfeo). */
  writtenNote: string
  /** Altura real en el pentagrama (prioritaria para octava). */
  staffNote?: string
  /** Registro fijo grave/medio/agudo (UI). */
  registerOctave?: RegisterOctave
}

function clampRegisterOctave(oct: number): RegisterOctave {
  if (oct <= 3) return 3
  if (oct >= 5) return 5
  return 4
}

function octaveFromNote(note: string): number | undefined {
  const parsed = Note.get(note.trim())
  if (parsed.oct !== undefined) return parsed.oct
  const solfege = parseSolfegeToken(note)
  if (solfege?.octave) return Number(solfege.octave)
  return undefined
}

/**
 * Nota con octava para tablas de pistones/vara.
 * Usa la nota transportada (fa, mib, sib…) y la octava del registro o del pentagrama.
 */
export function resolveFingeringNote(input: ResolveFingeringNoteInput): string {
  const register =
    input.registerOctave ??
    (input.staffNote ? clampRegisterOctave(octaveFromNote(input.staffNote) ?? 4) : undefined) ??
    4

  const written = input.writtenNote.trim()
  const parsed =
    parseSolfegeToken(chromaticStepToken(written)) ??
    parseSolfegeToken(formatNoteToSolfege(written))

  if (parsed) {
    return solfegeToTonal({ ...parsed, octave: String(register) })
  }

  if (input.staffNote?.trim()) {
    const staff = Note.get(input.staffNote.trim())
    if (staff.name) return staff.name
  }

  return applyRegisterOctave(written, register)
}

/** Octava de registro (3|4|5) alineada con la nota del pentagrama. */
export function registerOctaveForStaffNote(staffNote: string): RegisterOctave {
  return clampRegisterOctave(octaveFromNote(staffNote) ?? 4)
}

export function isRegisterOctave(oct: number): oct is RegisterOctave {
  return (REGISTER_OCTAVES as readonly number[]).includes(oct)
}
