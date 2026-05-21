import type { SlidePositionFingering } from '../entities/Fingering'

interface SlideEntry {
  position: number
  alternates?: number[]
}

function slideEntry(position: number, alternates?: number[]): SlideEntry {
  return { position, alternates }
}

function toFingering(entry: SlideEntry): SlidePositionFingering {
  const alt = entry.alternates?.map((p) => `Pos. ${p}`)
  return {
    position: entry.position,
    display: `Posición ${entry.position}`,
    alternates: alt,
  }
}

/**
 * Trombón tenor en Do (concert): posiciones de vara 1–7 por MIDI.
 * Basado en tablas cromáticas estándar de posiciones (registro medio-grave).
 */
const TROMBONE_SLIDE_BASE: Record<number, SlideEntry> = {
  47: slideEntry(7),
  48: slideEntry(7),
  49: slideEntry(6),
  50: slideEntry(5),
  51: slideEntry(4),
  52: slideEntry(3),
  53: slideEntry(6, [2]),
  54: slideEntry(5),
  55: slideEntry(4),
  56: slideEntry(3),
  57: slideEntry(2),
  58: slideEntry(1),
  59: slideEntry(7),
  60: slideEntry(7, [2]),
  61: slideEntry(6),
  62: slideEntry(5),
  63: slideEntry(4),
  64: slideEntry(3),
  65: slideEntry(2),
  66: slideEntry(1),
  67: slideEntry(4),
  68: slideEntry(3),
  69: slideEntry(2),
  70: slideEntry(1),
  71: slideEntry(7),
  72: slideEntry(2, [7]),
  73: slideEntry(1),
  74: slideEntry(4),
  75: slideEntry(3),
  76: slideEntry(2),
  77: slideEntry(1),
}

function extendSlideLower(base: Record<number, SlideEntry>): Record<number, SlideEntry> {
  const extended = { ...base }
  for (const midiStr of Object.keys(base)) {
    const midi = Number(midiStr)
    const lower = midi - 12
    if (lower >= 40 && extended[lower] === undefined) {
      extended[lower] = base[midi]
    }
  }
  return extended
}

const TROMBONE_SLIDE_EXTENDED = extendSlideLower(TROMBONE_SLIDE_BASE)

/** Posición 8: pedal grave (trombón bajo / notas muy graves). */
const BASS_PEDAL_OVERRIDES: Record<number, SlideEntry> = {
  40: slideEntry(7, [8]),
  41: slideEntry(7, [8]),
  42: slideEntry(6, [8]),
  43: slideEntry(6, [8]),
  44: slideEntry(5, [8]),
  45: slideEntry(5, [8]),
  46: slideEntry(7, [8]),
}

export function getTromboneSlideFingering(
  midi: number,
  bassTrombone = false,
): SlidePositionFingering | null {
  const chart = bassTrombone
    ? { ...TROMBONE_SLIDE_EXTENDED, ...BASS_PEDAL_OVERRIDES }
    : TROMBONE_SLIDE_EXTENDED

  const entry = chart[midi]
  if (!entry) return null
  return toFingering(entry)
}
