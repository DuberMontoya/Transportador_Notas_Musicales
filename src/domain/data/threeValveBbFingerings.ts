import { Note } from 'tonal'
import { buildMidiFingeringMap, entryFromCode } from './fingeringCodes'
import type { ValveFingering } from '../entities/Fingering'

/**
 * Tabla cromática 3 pistones (Sib / melófono / bombardino).
 * Códigos: 0 = al aire, 12 = válvulas 1+2, 123 = 1+2+3, etc.
 * Fuente: tablas de estudio del usuario (imágenes escala cromática).
 */
const NOTE_CODE_ROWS: Array<[noteName: string, code: string]> = [
  ['C3', '0'],
  ['F#3', '123'],
  ['G3', '13'],
  ['G#3', '23'],
  ['A3', '12'],
  ['A#3', '1'],
  ['B3', '2'],
  ['C4', '0'],
  ['C#4', '12'],
  ['D4', '13'],
  ['D#4', '23'],
  ['E4', '12'],
  ['F4', '1'],
  ['F#4', '2'],
  ['G4', '0'],
  ['G#4', '23'],
  ['A4', '12'],
  ['A#4', '1'],
  ['B4', '2'],
  ['C5', '0'],
  ['C#5', '12'],
  ['D5', '1'],
  ['D#5', '2'],
  ['E5', '0'],
  ['F5', '1'],
  ['F#5', '2'],
  ['G5', '0'],
  ['G#5', '23'],
  ['A5', '12'],
  ['A#5', '1'],
  ['B5', '2'],
  ['C6', '0'],
  ['Gb5', '2'],
  ['Gb4', '2'],
  ['Gb3', '123'],
  ['Ab4', '23'],
  ['Ab3', '23'],
  ['Bb4', '1'],
  ['Bb3', '1'],
  ['Db5', '12'],
  ['Db4', '123'],
  ['Db3', '123'],
  ['Eb5', '2'],
  ['Eb4', '23'],
  ['Eb3', '23'],
]

function buildNoteNameMap(): Record<string, ValveFingering> {
  const map: Record<string, ValveFingering> = {}
  for (const [name, code] of NOTE_CODE_ROWS) {
    const parsed = Note.get(name)
    if (parsed.name) map[parsed.name] = entryFromCode(code)
  }
  return map
}

export const THREE_VALVE_BB_BY_NOTE_NAME = buildNoteNameMap()

/** Respaldo por MIDI si el nombre no está en la tabla (última coincidencia por midi). */
export const THREE_VALVE_BB_BY_MIDI = buildMidiFingeringMap(
  NOTE_CODE_ROWS.map(([name, code]) => {
    const midi = Note.midi(name)
    if (midi === null) throw new Error(`Nota inválida en tabla: ${name}`)
    return [midi, code] as [number, string]
  }),
)

export function getThreeValveBbFingering(noteWithOctave: string): ValveFingering | null {
  const parsed = Note.get(noteWithOctave)
  if (!parsed.name) return null

  if (THREE_VALVE_BB_BY_NOTE_NAME[parsed.name]) {
    return THREE_VALVE_BB_BY_NOTE_NAME[parsed.name]
  }

  const midi = Note.midi(noteWithOctave)
  if (midi !== null && THREE_VALVE_BB_BY_MIDI[midi]) {
    return THREE_VALVE_BB_BY_MIDI[midi]
  }

  return null
}

/** Compatibilidad: mapa por MIDI (puede confundir enharmónicos; preferir getThreeValveBbFingering). */
export const THREE_VALVE_BB_WRITTEN_FINGERINGS = THREE_VALVE_BB_BY_MIDI
