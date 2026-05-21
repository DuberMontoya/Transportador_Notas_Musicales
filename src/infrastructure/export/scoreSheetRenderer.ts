import {
  Accidental,
  Annotation,
  Barline,
  Factory,
  FontStyle,
  FontWeight,
  Renderer,
  VexFlow,
} from 'vexflow'
import type { StemmableNote } from 'vexflow'
import type { Tickable } from 'vexflow'
import type { ScoreExportRow } from '@/application/use-cases/buildScoreExportRows'
import {
  accidentalFromSolfege,
  getExportClef,
  tonalToVexFlowKeyNatural,
  type VexClef,
} from './vexflowNoteFormat'

export { getExportClef, type VexClef }

export const NOTES_PER_MEASURE = 4
export const MEASURES_PER_SYSTEM = 2
export const NOTES_PER_SYSTEM = NOTES_PER_MEASURE * MEASURES_PER_SYSTEM
export const SYSTEMS_PER_PAGE = 4

const STAVE_WIDTH = 700
const SYSTEM_HEIGHT = 158
const TOP_MARGIN = 44

let fontsReady: Promise<void> | null = null

export async function ensureVexFlowFonts(): Promise<void> {
  if (!fontsReady) {
    fontsReady = VexFlow.loadFonts().then(() => {
      VexFlow.setFonts('Bravura', 'Academico')
    })
  }
  await fontsReady
}

export interface ScoreSystemChunk {
  rows: ScoreExportRow[]
  staffNotes: string[]
  startIndex: number
  isLast: boolean
}

export function chunkScoreIntoSystems(
  rows: ScoreExportRow[],
  notesPerSystem = NOTES_PER_SYSTEM,
): ScoreSystemChunk[] {
  const chunks: ScoreSystemChunk[] = []
  for (let i = 0; i < rows.length; i += notesPerSystem) {
    const slice = rows.slice(i, i + notesPerSystem)
    chunks.push({
      rows: slice,
      staffNotes: slice.map((r) => r.staffNote),
      startIndex: slice[0]?.index ?? i + 1,
      isLast: i + notesPerSystem >= rows.length,
    })
  }
  return chunks
}

function chunkPages<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function formatFingeringAnnotation(value: string): string {
  const t = value.trim()
  if (!t || t === '—') return '—'
  if (t.toLowerCase().includes('sin digitación')) return '—'
  if (t.toLowerCase().includes('al aire')) return '0'
  return t.replace(/\s*\+\s*/g, '+').slice(0, 12)
}

function attachNoteLabels(note: StemmableNote, row: ScoreExportRow): void {
  /** Solfeo escrito en la clave destino (fa, mib, sib…). */
  note.addModifier(
    new Annotation(row.transposed)
      .setFont('Academico', 11, FontWeight.NORMAL, FontStyle.ITALIC)
      .setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
  )
  note.addModifier(
    new Annotation(formatFingeringAnnotation(row.fingeringMedio))
      .setFont('Academico', 10, FontWeight.NORMAL, FontStyle.NORMAL)
      .setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
  )
}

function createStaveNote(
  vf: Factory,
  tonalName: string,
  row: ScoreExportRow,
  clef: VexClef,
): Tickable {
  const key = tonalToVexFlowKeyNatural(tonalName)
  if (!key) {
    return vf.GhostNote({ duration: 'q' })
  }

  const note = vf.StaveNote({
    keys: [key],
    duration: 'q',
    clef,
    autoStem: true,
  })

  const accidental = accidentalFromSolfege(row.transposed)
  if (accidental) {
    note.addModifier(new Accidental(accidental), 0)
  }

  attachNoteLabels(note, row)
  return note
}

function buildMeasuredTickables(
  vf: Factory,
  staffNotes: string[],
  rows: ScoreExportRow[],
  clef: VexClef,
): Tickable[] {
  const tickables: Tickable[] = []
  const measureCount = Math.ceil(staffNotes.length / NOTES_PER_MEASURE)

  for (let m = 0; m < measureCount; m++) {
    if (m > 0) {
      tickables.push(vf.BarNote())
    }

    const start = m * NOTES_PER_MEASURE
    for (let i = 0; i < NOTES_PER_MEASURE; i++) {
      const idx = start + i
      const row = rows[idx]
      const tonal = staffNotes[idx]
      if (row && tonal) {
        tickables.push(createStaveNote(vf, tonal, row, clef))
      } else {
        tickables.push(vf.GhostNote({ duration: 'q' }))
      }
    }
  }

  return tickables
}

/** Número de compás (1-based) para la primera nota de un bloque en el pentagrama. */
export function measureNumberForNoteIndex(noteIndex: number): number {
  return Math.floor((noteIndex - 1) / NOTES_PER_MEASURE) + 1
}

export function renderScorePageToDataUrl(
  systems: ScoreSystemChunk[],
  clef: VexClef,
  canvas: HTMLCanvasElement,
): { dataUrl: string | null; error?: string } {
  if (systems.length === 0) {
    return { dataUrl: null, error: 'Sin sistemas para dibujar' }
  }

  const height = TOP_MARGIN + systems.length * SYSTEM_HEIGHT + 24

  try {
    canvas.width = STAVE_WIDTH
    canvas.height = height

    const vf = new Factory({
      renderer: {
        elementId: canvas.id,
        width: STAVE_WIDTH,
        height,
        backend: Renderer.Backends.CANVAS,
      },
    })

    let y = TOP_MARGIN

    for (const systemChunk of systems) {
      if (systemChunk.staffNotes.length === 0) {
        return { dataUrl: null, error: 'Sistema sin notas' }
      }

      const tickables = buildMeasuredTickables(
        vf,
        systemChunk.staffNotes,
        systemChunk.rows,
        clef,
      )

      const measureCount = Math.ceil(systemChunk.staffNotes.length / NOTES_PER_MEASURE)
      const voice = vf.Voice({ time: `${measureCount * 4}/4` })
      voice.setStrict(false)
      voice.addTickables(tickables)

      const vfSystem = vf.System({ width: STAVE_WIDTH - 48, y, x: 20 })
      const stave = vfSystem
        .addStave({ voices: [voice] })
        .addClef(clef)
        .addTimeSignature('4/4')

      stave.setMeasure(measureNumberForNoteIndex(systemChunk.startIndex))

      if (systemChunk.isLast) {
        stave.setEndBarType(Barline.type.DOUBLE)
      }

      y += SYSTEM_HEIGHT
    }

    vf.draw()

    const dataUrl = canvas.toDataURL('image/png')
    if (!dataUrl || dataUrl.length < 300) {
      return { dataUrl: null, error: 'Imagen del pentagrama vacia' }
    }

    return { dataUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { dataUrl: null, error: message }
  }
}

export function paginateScoreSystems(systems: ScoreSystemChunk[]): ScoreSystemChunk[][] {
  return chunkPages(systems, SYSTEMS_PER_PAGE)
}

export const SCORE_SHEET_WIDTH = STAVE_WIDTH
export const scoreSheetImageHeight = (systemCount: number): number =>
  TOP_MARGIN + systemCount * SYSTEM_HEIGHT + 24
