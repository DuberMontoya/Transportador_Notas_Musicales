const SOLFEGE_NAMES = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'] as const
type SolfegeName = (typeof SOLFEGE_NAMES)[number]

const SOLFEGE_TO_ENGLISH: Record<SolfegeName, string> = {
  do: 'C',
  re: 'D',
  mi: 'E',
  fa: 'F',
  sol: 'G',
  la: 'A',
  si: 'B',
}

const ENGLISH_TO_SOLFEGE: Record<string, SolfegeName> = {
  C: 'do',
  D: 're',
  E: 'mi',
  F: 'fa',
  G: 'sol',
  A: 'la',
  B: 'si',
}

export interface ParsedSolfegeToken {
  name: SolfegeName
  accidental: '#' | 'b' | ''
  octave: string
}

/**
 * Parsea la entrada del usuario separando por comas, espacios, saltos de línea o punto y coma.
 */
export function parseNotesInput(input: string): string[] {
  return input
    .split(/[\s,;\n]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
}

/**
 * Descompone una nota en solfege: do, dob, do#, do4, mib, sib, etc.
 */
export function parseSolfegeToken(token: string): ParsedSolfegeToken | null {
  const match = token.trim().toLowerCase().match(/^(do|re|mi|fa|sol|la|si)(.*)$/i)
  if (!match) return null

  const name = match[1].toLowerCase() as SolfegeName
  let rest = match[2]

  let octave = ''
  const octaveMatch = rest.match(/(\d+)$/)
  if (octaveMatch) {
    octave = octaveMatch[1]
    rest = rest.slice(0, -octave.length)
  }

  let accidental: '#' | 'b' | '' = ''
  if (rest === '#' || rest === '♯') accidental = '#'
  else if (rest === 'b' || rest === '♭') accidental = 'b'
  else if (rest !== '') return null

  return { name, accidental, octave }
}

/**
 * Convierte solfege español al formato que entiende Tonal (C, Db, F#4…).
 */
export function solfegeToTonal(token: ParsedSolfegeToken): string {
  const base = SOLFEGE_TO_ENGLISH[token.name]
  return `${base}${token.accidental}${token.octave}`
}

/**
 * Convierte una nota de Tonal a solfege español (do, dob, fa#, fa4…).
 */
export function formatNoteToSolfege(note: string): string {
  const trimmed = note.trim()
  if (!trimmed) return ''

  const parsed = parseSolfegeToken(trimmed)
  if (parsed) return solfegeTokenToString(parsed)

  const english = trimmed.match(/^([A-Ga-g])([#b♯♭]?)(\d*)$/)
  if (!english) return trimmed

  const letter = english[1].toUpperCase()
  const solfege = ENGLISH_TO_SOLFEGE[letter]
  if (!solfege) return trimmed

  let acc = english[2].replace('♯', '#').replace('♭', 'b')
  if (acc === '♯') acc = '#'

  return solfegeTokenToString({
    name: solfege,
    accidental: acc === '#' || acc === 'b' ? acc : '',
    octave: english[3] ?? '',
  })
}

export function solfegeTokenToString(token: ParsedSolfegeToken): string {
  return `${token.name}${token.accidental}${token.octave}`
}

/** fa#4 / F# → fa# (sin octava) para comparar con la tabla de estudio. */
export function chromaticStepToken(token: string): string {
  const solfege = parseSolfegeToken(token)
  if (solfege) {
    return solfegeTokenToString({ ...solfege, octave: '' })
  }
  return formatNoteToSolfege(token).replace(/\d+$/, '')
}

/**
 * Normaliza una nota: prioriza solfege (do, dob, do#) y acepta inglés (C4, Bb3) como alternativa.
 */
export function normalizeNoteToken(token: string): string {
  const solfege = parseSolfegeToken(token)
  if (solfege) return solfegeToTonal(solfege)

  return token.trim()
}

export function normalizeNotesInput(input: string): string[] {
  return parseNotesInput(input).map(normalizeNoteToken)
}

/** Texto de ayuda para la UI sobre cómo escribir notas. */
export const SOLFEGE_NOTATION_HELP = {
  naturales: 'do  re  mi  fa  sol  la  si',
  sostenido: 'do#  re#  fa#  (sostenido = # al final del nombre)',
  bemol: 'dob  reb  mib  sib  (bemol = b al final; ej. sib = si bemol)',
  ejemplo: 'do re mib fa sol# la sib do',
} as const
