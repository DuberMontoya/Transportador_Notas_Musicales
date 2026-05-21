import {
  Accidental,
  Annotation,
  Barline,
  Factory,
  FontStyle,
  FontWeight,
  Renderer,
} from 'vexflow'
import type { StemmableNote } from 'vexflow'
import type { Tickable } from 'vexflow'
import type { StructuredScoreMeasure, StructuredScoreNotation } from '@/application/use-cases/buildStructuredScoreNotation'
import type { ScoreExportRow } from '@/application/use-cases/buildScoreExportRows'
import {
  accidentalFromSolfege,
  tonalToVexFlowKeyNatural,
  type VexClef,
} from './vexflowNoteFormat'
import { toVexDuration, timeSignatureToVex, voiceTimeForMeasures } from '@/shared/utils/scoreRhythm'
import {
  STAVE_WIDTH,
  SYSTEM_HEIGHT,
  TOP_MARGIN,
} from './scoreSheetRenderer'

export const MEASURES_PER_SYSTEM_STRUCTURED = 2

export interface StructuredSystemChunk {
  measures: StructuredScoreMeasure[]
  startMeasureNumber: number
  isLast: boolean
}

export function chunkStructuredIntoSystems(
  notation: StructuredScoreNotation,
  measuresPerSystem = MEASURES_PER_SYSTEM_STRUCTURED,
): StructuredSystemChunk[] {
  const { measures } = notation
  const chunks: StructuredSystemChunk[] = []
  for (let i = 0; i < measures.length; i += measuresPerSystem) {
    const slice = measures.slice(i, i + measuresPerSystem)
    chunks.push({
      measures: slice,
      startMeasureNumber: slice[0]?.measureNumber ?? i + 1,
      isLast: i + measuresPerSystem >= measures.length,
    })
  }
  return chunks
}

function formatFingeringAnnotation(value: string): string {
  const t = value.trim()
  if (!t || t === '—') return '—'
  if (t.toLowerCase().includes('sin digitación')) return '—'
  if (t.toLowerCase().includes('al aire')) return '0'
  return t.replace(/\s*\+\s*/g, '+').slice(0, 12)
}

function attachNoteLabels(note: StemmableNote, row: ScoreExportRow): void {
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

function createTickable(
  vf: Factory,
  slot: StructuredScoreMeasure['slots'][0],
  clef: VexClef,
): { tickable: Tickable; stemmable: StemmableNote | null } {
  const { event } = slot
  const duration = toVexDuration(event.duration, event.dotted, event.kind === 'rest')

  if (event.kind === 'rest') {
    const rest = vf.StaveNote({
      keys: ['b/4'],
      duration,
      clef,
      autoStem: true,
    })
    return { tickable: rest, stemmable: null }
  }

  const tonal = slot.staffNote ?? 'C4'
  const key = tonalToVexFlowKeyNatural(tonal)
  if (!key) {
    return { tickable: vf.GhostNote({ duration }), stemmable: null }
  }

  const note = vf.StaveNote({
    keys: [key],
    duration,
    clef,
    autoStem: true,
  })

  if (slot.row) {
    const acc = accidentalFromSolfege(slot.row.transposed)
    if (acc) note.addModifier(new Accidental(acc), 0)
    attachNoteLabels(note, slot.row)
  }

  return { tickable: note, stemmable: note }
}

function buildStructuredTickables(
  vf: Factory,
  measures: StructuredScoreMeasure[],
  clef: VexClef,
): {
  tickables: Tickable[]
  ties: Array<{ from: StemmableNote; to: StemmableNote }>
  slurs: Array<{ from: StemmableNote; to: StemmableNote }>
} {
  const tickables: Tickable[] = []
  const ties: Array<{ from: StemmableNote; to: StemmableNote }> = []
  const slurs: Array<{ from: StemmableNote; to: StemmableNote }> = []
  let prevStemmable: StemmableNote | null = null

  measures.forEach((measure, mIdx) => {
    if (mIdx > 0) tickables.push(vf.BarNote())

    for (const slot of measure.slots) {
      const { tickable, stemmable } = createTickable(vf, slot, clef)
      tickables.push(tickable)

      if (stemmable) {
        if (slot.event.tiedToPrevious && prevStemmable) {
          ties.push({ from: prevStemmable, to: stemmable })
        }
        if (slot.event.slurToPrevious && prevStemmable) {
          slurs.push({ from: prevStemmable, to: stemmable })
        }
        prevStemmable = stemmable
      }
    }
  })

  return { tickables, ties, slurs }
}

export function renderStructuredScorePageToDataUrl(
  systems: StructuredSystemChunk[],
  notation: StructuredScoreNotation,
  clef: VexClef,
  canvas: HTMLCanvasElement,
): { dataUrl: string | null; error?: string } {
  if (systems.length === 0) {
    return { dataUrl: null, error: 'Sin compases para dibujar' }
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
    const ts = timeSignatureToVex(notation.timeSignature)

    for (const chunk of systems) {
      const { tickables, ties, slurs } = buildStructuredTickables(
        vf,
        chunk.measures,
        clef,
      )

      if (tickables.length === 0) {
        return { dataUrl: null, error: 'Compás sin figuras' }
      }

      const voiceTime = voiceTimeForMeasures(
        chunk.measures.length,
        notation.timeSignature,
      )
      const voice = vf.Voice({ time: voiceTime })
      voice.setStrict(false)
      voice.addTickables(tickables)

      const vfSystem = vf.System({ width: STAVE_WIDTH - 48, y, x: 20 })
      const stave = vfSystem
        .addStave({ voices: [voice] })
        .addClef(clef)
        .addTimeSignature(ts)

      stave.setMeasure(chunk.startMeasureNumber)

      if (chunk.isLast) {
        stave.setEndBarType(Barline.type.DOUBLE)
      }

      for (const tie of ties) {
        vf.StaveTie({
          from: tie.from,
          to: tie.to,
          firstIndexes: [0],
          lastIndexes: [0],
        })
      }

      for (const slur of slurs) {
        vf.Curve({
          from: slur.from,
          to: slur.to,
          options: { cps: [{ x: 0, y: 12 }, { x: 0, y: 12 }] },
        })
      }

      y += SYSTEM_HEIGHT
    }

    vf.draw()

    const dataUrl = canvas.toDataURL('image/png')
    if (!dataUrl || dataUrl.length < 300) {
      return { dataUrl: null, error: 'Imagen del pentagrama vacía' }
    }

    return { dataUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { dataUrl: null, error: message }
  }
}

export function paginateStructuredSystems(
  systems: StructuredSystemChunk[],
  perPage = 4,
): StructuredSystemChunk[][] {
  const out: StructuredSystemChunk[][] = []
  for (let i = 0; i < systems.length; i += perPage) {
    out.push(systems.slice(i, i + perPage))
  }
  return out
}
