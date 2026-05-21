import { Note } from 'tonal'
import { applyRegisterOctave } from '@/shared/utils/noteOctave'
import { getTromboneSlideFingering } from '../data/tromboneSlidePositions'
import { getFHornFingering } from '../data/fHornFingerings'
import { getThreeValveBbFingering } from '../data/threeValveBbFingerings'
import type { InstrumentId, FingeringResult } from '../entities/Fingering'
import {
  getInstrument,
  instrumentSupportsSlide,
  instrumentSupportsValves,
} from '../constants/instruments'

const PISTONS_3_TRUMPET_CHART: InstrumentId[] = [
  'bb-trumpet',
  'd-trumpet',
  'bb-euphonium',
  'f-mellophone',
  'f-alto-horn',
]

const PISTONS_F_HORN_CHART: InstrumentId[] = ['f-horn-3', 'f-horn-4']

export class FingeringService {
  getFingering(
    writtenNote: string,
    instrumentId: InstrumentId,
    registerOctave?: number,
  ): FingeringResult {
    const instrument = getInstrument(instrumentId)

    const parsedWritten = Note.get(writtenNote.trim())
    const noteForLookup =
      registerOctave !== undefined
        ? applyRegisterOctave(writtenNote, registerOctave as 3 | 4 | 5)
        : parsedWritten.oct !== undefined
          ? writtenNote.trim()
          : applyRegisterOctave(writtenNote, 4)

    const midi = Note.midi(noteForLookup)
    if (midi === null || midi === undefined) {
      return {
        available: false,
        message: 'No se pudo determinar la altura de la nota.',
      }
    }

    if (instrumentSupportsSlide(instrument)) {
      const bass = instrumentId === 'c-bass-trombone'
      const slide = getTromboneSlideFingering(midi, bass)
      if (!slide) {
        return {
          available: false,
          kind: 'slide',
          message: `Sin posición de vara para ${Note.pitchClass(writtenNote) ?? writtenNote} en este registro.`,
        }
      }
      return { available: true, kind: 'slide', slide, resolvedNote: noteForLookup }
    }

    if (!instrumentSupportsValves(instrument)) {
      return {
        available: false,
        message: `${instrument.label} no usa pistones ni posiciones de vara (${instrument.mechanismLabel}).`,
      }
    }

    const fingering = PISTONS_3_TRUMPET_CHART.includes(instrumentId)
      ? getThreeValveBbFingering(noteForLookup)
      : PISTONS_F_HORN_CHART.includes(instrumentId)
        ? getFHornFingering(noteForLookup)
        : null

    if (!fingering) {
      return {
        available: false,
        message: `Sin digitación registrada para ${Note.pitchClass(writtenNote) ?? writtenNote} en este registro.`,
      }
    }

    return { available: true, kind: 'valves', fingering, resolvedNote: noteForLookup }
  }
}

export const fingeringService = new FingeringService()
