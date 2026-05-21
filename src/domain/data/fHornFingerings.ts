import { Note } from 'tonal'
import { buildMidiFingeringMap } from './fingeringCodes'
import type { ValveFingering } from '../entities/Fingering'
import { THREE_VALVE_BB_BY_NOTE_NAME } from './threeValveBbFingerings'

/** Corno en Fa — por MIDI (respaldo). */
export const F_HORN_WRITTEN_FINGERINGS: Readonly<
  Record<number, ValveFingering>
> = buildMidiFingeringMap([
  [53, '123'],
  [54, '13'],
  [55, '23'],
  [56, '12'],
  [57, '1'],
  [58, '2'],
  [59, '0'],
  [60, '2'],
  [61, '1'],
  [62, '12'],
  [63, '123'],
  [64, '13'],
  [65, '23'],
  [66, '12'],
  [67, '1'],
  [68, '2'],
  [69, '0'],
  [70, '23'],
  [71, '12'],
  [72, '1'],
  [73, '2'],
  [74, '0'],
  [75, '123'],
  [76, '13'],
  [77, '23'],
  [78, '12'],
  [79, '1'],
  [80, '2'],
  [81, '0'],
  [82, '23'],
  [83, '12'],
  [84, '1'],
])

function buildFHornNoteNameMap(): Record<string, ValveFingering> {
  const map: Record<string, ValveFingering> = {}

  for (const name of Object.keys(THREE_VALVE_BB_BY_NOTE_NAME)) {
    const midi = Note.midi(name)
    if (midi !== null && F_HORN_WRITTEN_FINGERINGS[midi]) {
      map[name] = F_HORN_WRITTEN_FINGERINGS[midi]
    }
  }

  for (const [midi, entry] of Object.entries(F_HORN_WRITTEN_FINGERINGS)) {
    const fromMidi = Note.fromMidi(Number(midi))
    if (fromMidi && Note.get(fromMidi).name) {
      map[Note.get(fromMidi).name] = entry
    }
  }

  return map
}

export const F_HORN_BY_NOTE_NAME = buildFHornNoteNameMap()

export function getFHornFingering(noteWithOctave: string): ValveFingering | null {
  const parsed = Note.get(noteWithOctave)
  if (!parsed.name) return null

  if (F_HORN_BY_NOTE_NAME[parsed.name]) {
    return F_HORN_BY_NOTE_NAME[parsed.name]
  }

  const midi = Note.midi(noteWithOctave)
  if (midi !== null && F_HORN_WRITTEN_FINGERINGS[midi]) {
    return F_HORN_WRITTEN_FINGERINGS[midi]
  }

  return null
}
