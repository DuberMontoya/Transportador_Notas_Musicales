import type { InstrumentId } from '@/domain/entities/Fingering'
import { getInstrument, instrumentHasDigitacion } from '@/domain/constants/instruments'
import { fingeringService } from '@/domain/services/FingeringService'
import { formatNoteToSolfege } from './parseNotesInput'
import {
  REGISTER_LABELS,
  REGISTER_OCTAVES,
  type RegisterOctave,
} from './noteOctave'
import {
  registerOctaveForStaffNote,
  resolveFingeringNote,
  type ResolveFingeringNoteInput,
} from './resolveFingeringNote'

export interface RegisterFingeringEntry {
  register: RegisterOctave
  label: string
  noteWithOctave: string
  noteSolfege: string
  kind: 'valves' | 'slide' | 'none'
  display: string
  valves: number[]
  slidePosition?: number
  alternates?: string[]
  available: boolean
  message?: string
}

export interface FingeringLookupContext {
  staffNote?: string
}

function lookupEntry(
  _register: RegisterOctave,
  noteWithOctave: string,
  instrumentId: InstrumentId,
): Omit<RegisterFingeringEntry, 'register' | 'label' | 'noteWithOctave' | 'noteSolfege'> {
  const instrument = getInstrument(instrumentId)

  if (!instrumentHasDigitacion(instrument)) {
    return {
      kind: 'none',
      display: '—',
      valves: [],
      available: false,
      message: instrument.mechanismLabel,
    }
  }

  const result = fingeringService.getFingering(noteWithOctave, instrumentId)

  if (result.kind === 'slide' && result.slide) {
    return {
      kind: 'slide',
      display: result.slide.display,
      valves: [],
      slidePosition: result.slide.position,
      alternates: result.slide.alternates,
      available: result.available,
      message: result.message,
    }
  }

  return {
    kind: 'valves',
    display: result.fingering?.display ?? '—',
    valves: result.fingering?.valves ?? [],
    alternates: result.fingering?.alternates,
    available: result.available,
    message: result.message,
  }
}

export function getAllRegisterFingerings(
  writtenNote: string,
  instrumentId: InstrumentId,
  context?: FingeringLookupContext,
): RegisterFingeringEntry[] {
  const base: ResolveFingeringNoteInput = {
    writtenNote,
    staffNote: context?.staffNote,
  }

  return REGISTER_OCTAVES.map((register) => {
    const noteWithOctave = resolveFingeringNote({ ...base, registerOctave: register })
    const label = REGISTER_LABELS[register]
    const body = lookupEntry(register, noteWithOctave, instrumentId)

    return {
      register,
      label,
      noteWithOctave,
      noteSolfege: formatNoteToSolfege(noteWithOctave),
      ...body,
    }
  })
}

/** Digitación alineada con la altura dibujada en el pentagrama. */
export function getFingeringForStaffNote(
  writtenNote: string,
  staffNote: string,
  instrumentId: InstrumentId,
): RegisterFingeringEntry {
  const register = registerOctaveForStaffNote(staffNote)
  const noteWithOctave = resolveFingeringNote({
    writtenNote,
    staffNote,
  })
  const body = lookupEntry(register, noteWithOctave, instrumentId)

  return {
    register,
    label: REGISTER_LABELS[register],
    noteWithOctave,
    noteSolfege: formatNoteToSolfege(noteWithOctave),
    ...body,
  }
}

export function formatAllRegistersForExport(entries: RegisterFingeringEntry[]): string {
  return entries
    .map((e) => `${e.label} (${e.noteSolfege}): ${e.available ? e.display : e.message ?? '—'}`)
    .join(' · ')
}
