/** Identificador de clave de transposición (instrumento transpositor). */
export type TranspositionKeyId =
  | 'C'
  | 'Bb'
  | 'Eb'
  | 'Eb-baritone'
  | 'F'
  | 'A'
  | 'G'
  | 'D'

export interface TranspositionKeyDefinition {
  id: TranspositionKeyId
  /** Nombre mostrado en la UI (español). */
  label: string
  /** Descripción breve del instrumento o convención. */
  description: string
  /**
   * Semitonos que se restan de la nota escrita para obtener el sonido real (concert).
   * Ej.: en Sib, Do escrito (−2) → Si♭ real.
   */
  writtenToConcertSemitones: number
}

export interface TransposedNote {
  original: string
  transposed: string
  concertPitch: string
  valid: boolean
  error?: string
}
