/**
 * Escala cromática completa según tablas de estudio (melófono / 3 pistones).
 * Imagen 1: subida grave con # · Imagen 2: medio-agudo y bajada · Imagen 3: cola grave.
 */

/** Imagen 1: fa#₃ → la₄ (16 notas, sostenidos). */
export const CHROMATIC_IMAGE_1_ASCENDING = [
  'fa#',
  'sol',
  'sol#',
  'la',
  'la#',
  'si',
  'do',
  'do#',
  're',
  're#',
  'mi',
  'fa',
  'fa#',
  'sol',
  'sol#',
  'la',
] as const

/**
 * Imagen 2: la#₄ → sol₅ y bajada hasta la₄ (32 notas).
 * Incluye solb, mib, reb, sib, lab, solb…
 */
export const CHROMATIC_IMAGE_2 = [
  'la#',
  'si',
  'do',
  'do#',
  're',
  're#',
  'mi',
  'fa',
  'fa#',
  'sol',
  'solb',
  'fa',
  'mi',
  'mib',
  're',
  'reb',
  'do',
  'si',
  'sib',
  'la',
  'lab',
  'sol',
  'solb',
  'fa',
  'mi',
  'mib',
  're',
  'reb',
  'do',
  'si',
  'sib',
  'la',
] as const

/** Imagen 3: cola grave lab₃, sol₃, solb₃ (faltaba al final). */
export const CHROMATIC_IMAGE_3_TAIL = ['lab', 'sol', 'solb'] as const

export const CHROMATIC_ASCENDING_SHARPS = [
  ...CHROMATIC_IMAGE_1_ASCENDING,
  ...CHROMATIC_IMAGE_2.slice(0, 10),
] as const

export const CHROMATIC_DESCENDING_FLATS = [
  ...CHROMATIC_IMAGE_2.slice(10),
  ...CHROMATIC_IMAGE_3_TAIL,
] as const

export const CHROMATIC_SCALE_SOLFEGE = [
  ...CHROMATIC_IMAGE_1_ASCENDING,
  ...CHROMATIC_IMAGE_2,
  ...CHROMATIC_IMAGE_3_TAIL,
] as const

/**
 * Octavas en el pentagrama según las hojas de estudio:
 * img1 fa#₃→la₄ · img2 la#₄→sol₅ y bajada · img3 lab₃→solb₃.
 */
export const CHROMATIC_SCALE_STAFF_OCTAVES: readonly number[] = [
  3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  4, 4, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 4, 4, 4,
  4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3,
  3, 3, 3,
] as const

export function chromaticScaleAsText(): string {
  return CHROMATIC_SCALE_SOLFEGE.join(' ')
}

export const CHROMATIC_SCALE_SUMMARY = {
  totalNotes: CHROMATIC_SCALE_SOLFEGE.length,
  ascending: CHROMATIC_ASCENDING_SHARPS.length,
  descending: CHROMATIC_DESCENDING_FLATS.length,
} as const
