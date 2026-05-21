import type { TranspositionKeyDefinition } from '../entities/TranspositionKey'

/**
 * Definiciones de claves de transposición según convención de instrumentos.
 * writtenToConcertSemitones: nota escrita − offset = sonido real (concert).
 */
export const TRANSPOSITION_KEYS: readonly TranspositionKeyDefinition[] = [
  {
    id: 'C',
    label: 'Do (concert)',
    description:
      'Sin transposición: lo escrito es lo que suena (trombón, piano, flauta, violín…).',
    writtenToConcertSemitones: 0,
  },
  {
    id: 'Bb',
    label: 'Sib',
    description: 'Trompeta/clarinete/saxo soprano en Sib. Do escrito → Si♭ real.',
    writtenToConcertSemitones: 2,
  },
  {
    id: 'Eb',
    label: 'Mib (alto)',
    description: 'Saxo alto/clarinete alto en Mib. Do escrito → Mib real.',
    writtenToConcertSemitones: 9,
  },
  {
    id: 'Eb-baritone',
    label: 'Mib (barítono)',
    description: 'Saxo barítono en Mib. Una octava más grave que el alto en Mib.',
    writtenToConcertSemitones: 21,
  },
  {
    id: 'F',
    label: 'Fa',
    description:
      'Corno, melófono, trompa alto, corno inglés… Do escrito → Fa real (5ª más grave).',
    writtenToConcertSemitones: 7,
  },
  {
    id: 'A',
    label: 'La',
    description: 'Clarinete en La. Do escrito → La real.',
    writtenToConcertSemitones: 3,
  },
  {
    id: 'G',
    label: 'Sol',
    description: 'Flauta alto en Sol. Do escrito → Sol real.',
    writtenToConcertSemitones: 5,
  },
  {
    id: 'D',
    label: 'Re',
    description: 'Trompeta en Re. Do escrito → Re real (suena un tono más agudo).',
    writtenToConcertSemitones: -2,
  },
] as const

export const DEFAULT_SOURCE_KEY = 'Bb' as const
export const DEFAULT_TARGET_KEY = 'F' as const

export function getKeyDefinition(
  id: TranspositionKeyDefinition['id'],
): TranspositionKeyDefinition {
  const found = TRANSPOSITION_KEYS.find((k) => k.id === id)
  if (!found) {
    throw new Error(`Clave de transposición desconocida: ${id}`)
  }
  return found
}
