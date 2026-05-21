import type { ValveFingering } from '../entities/Fingering'

/** Convierte código de estudio ("0", "12", "123") a válvulas [1,2,3]. */
export function parseValveCode(code: string): number[] {
  const trimmed = code.trim()
  if (trimmed === '0' || trimmed === '') return []
  return [...trimmed].map((d) => Number(d))
}

export function formatValveDisplay(valves: number[]): string {
  if (valves.length === 0) return 'Al aire'
  return valves.join(' + ')
}

export function entryFromCode(code: string, alternates?: string[]): ValveFingering {
  const valves = parseValveCode(code)
  return {
    valves,
    display: formatValveDisplay(valves),
    alternates: alternates?.map((c) => formatValveDisplay(parseValveCode(c))),
  }
}

/** Construye mapa MIDI → digitación desde tabla [midi, código, alternativas?]. */
export function buildMidiFingeringMap(
  rows: Array<[midi: number, code: string, alternates?: string[]]>,
): Record<number, ValveFingering> {
  const map: Record<number, ValveFingering> = {}
  for (const [midi, code, alts] of rows) {
    map[midi] = entryFromCode(code, alts)
  }
  return map
}
