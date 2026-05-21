import type { InstrumentDefinition, InstrumentId } from '../entities/Fingering'
import type { TranspositionKeyId } from '../entities/TranspositionKey'

/**
 * Instrumentos por clave de transposición.
 * Clave Fa: suena una 5ª justa más grave que lo escrito (Do escrito → Fa real).
 */
export const INSTRUMENTS: readonly InstrumentDefinition[] = [
  {
    id: 'bb-trumpet',
    label: 'Trompeta en Sib',
    transpositionKeyId: 'Bb',
    mechanism: 'pistons-3',
    mechanismLabel: '3 pistones',
    hint: 'Viento metal',
  },
  {
    id: 'bb-euphonium',
    label: 'Bombardino / Eufonio en Sib',
    transpositionKeyId: 'Bb',
    mechanism: 'pistons-3',
    mechanismLabel: '3 pistones',
    hint: 'Viento metal',
  },
  {
    id: 'bb-clarinet',
    label: 'Clarinete en Sib',
    transpositionKeyId: 'Bb',
    mechanism: 'keys',
    mechanismLabel: 'Sistema de llaves',
    hint: 'Viento madera',
  },
  {
    id: 'd-trumpet',
    label: 'Trompeta en Re',
    transpositionKeyId: 'D',
    mechanism: 'pistons-3',
    mechanismLabel: '3 pistones',
    hint: 'Viento metal',
  },
  {
    id: 'f-horn-4',
    label: 'Corno en Fa (doble)',
    transpositionKeyId: 'F',
    mechanism: 'pistons-4',
    mechanismLabel: '4 válvulas rotativas',
    hint: 'Orquesta / banda sinfónica',
  },
  {
    id: 'f-horn-3',
    label: 'Corno en Fa (3 válvulas)',
    transpositionKeyId: 'F',
    mechanism: 'pistons-3',
    mechanismLabel: '3 válvulas rotativas',
    hint: 'Corno simple o pedagógico',
  },
  {
    id: 'f-mellophone',
    label: 'Melófono en Fa',
    transpositionKeyId: 'F',
    mechanism: 'pistons-3',
    mechanismLabel: '3 pistones',
    hint: 'Marching band / drum corps',
  },
  {
    id: 'f-alto-horn',
    label: 'Trompa alto en Fa',
    transpositionKeyId: 'F',
    mechanism: 'pistons-3',
    mechanismLabel: '3 pistones',
    hint: 'Banda de viento / metal',
  },
  {
    id: 'f-english-horn',
    label: 'Corno inglés en Fa',
    transpositionKeyId: 'F',
    mechanism: 'keys',
    mechanismLabel: 'Sistema de llaves (caña doble)',
    hint: 'Viento madera — oboe',
  },
  {
    id: 'eb-alto-sax',
    label: 'Saxofón alto en Mib',
    transpositionKeyId: 'Eb',
    mechanism: 'keys',
    mechanismLabel: 'Sistema de llaves',
    hint: 'Viento madera',
  },
  {
    id: 'eb-baritone-sax',
    label: 'Saxofón barítono en Mib',
    transpositionKeyId: 'Eb-baritone',
    mechanism: 'keys',
    mechanismLabel: 'Sistema de llaves',
    hint: 'Viento madera',
  },
  {
    id: 'a-clarinet',
    label: 'Clarinete en La',
    transpositionKeyId: 'A',
    mechanism: 'keys',
    mechanismLabel: 'Sistema de llaves',
    hint: 'Orquesta (música clásica)',
  },
  {
    id: 'g-alto-flute',
    label: 'Flauta alto en Sol',
    transpositionKeyId: 'G',
    mechanism: 'keys',
    mechanismLabel: 'Agujeros y llaves',
    hint: 'Viento madera',
  },
  {
    id: 'c-tenor-trombone',
    label: 'Trombón tenor (Do / concert)',
    transpositionKeyId: 'C',
    mechanism: 'slide-7',
    mechanismLabel: 'Posiciones de vara 1–7',
    hint: 'Lo escrito = lo que suena',
  },
  {
    id: 'c-bass-trombone',
    label: 'Trombón bajo (Do / concert)',
    transpositionKeyId: 'C',
    mechanism: 'slide-7',
    mechanismLabel: 'Posiciones 1–7 (+ 8 pedal grave)',
    hint: 'Registro grave con pos. 8',
  },
  {
    id: 'concert-generic',
    label: 'Otro en Do (sin digitación)',
    transpositionKeyId: 'C',
    mechanism: 'keys',
    mechanismLabel: 'Sin pistones ni vara',
    hint: 'Piano, flauta, violín…',
  },
] as const

export function getInstrumentsForKey(
  keyId: TranspositionKeyId,
): InstrumentDefinition[] {
  return INSTRUMENTS.filter((i) => i.transpositionKeyId === keyId)
}

export function getInstrument(id: InstrumentId): InstrumentDefinition {
  const found = INSTRUMENTS.find((i) => i.id === id)
  if (!found) throw new Error(`Instrumento desconocido: ${id}`)
  return found
}

export function getDefaultInstrumentForKey(
  keyId: TranspositionKeyId,
): InstrumentId | null {
  const list = getInstrumentsForKey(keyId)
  const withDigitacion = list.find(
    (i) =>
      i.mechanism === 'pistons-3' ||
      i.mechanism === 'pistons-4' ||
      i.mechanism === 'slide-7',
  )
  return withDigitacion?.id ?? list[0]?.id ?? null
}

export function instrumentSupportsValves(instrument: InstrumentDefinition): boolean {
  return instrument.mechanism === 'pistons-3' || instrument.mechanism === 'pistons-4'
}

export function instrumentSupportsSlide(instrument: InstrumentDefinition): boolean {
  return instrument.mechanism === 'slide-7'
}

export function instrumentHasDigitacion(instrument: InstrumentDefinition): boolean {
  return instrumentSupportsValves(instrument) || instrumentSupportsSlide(instrument)
}
