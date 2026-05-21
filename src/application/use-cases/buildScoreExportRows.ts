import { getInstrument, instrumentHasDigitacion } from '@/domain/constants/instruments'
import { getKeyDefinition } from '@/domain/constants/transpositionKeys'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TransposedNote, TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import {
  formatAllRegistersForExport,
  getAllRegisterFingerings,
  getFingeringForStaffNote,
} from '@/shared/utils/allRegisterFingerings'
import { formatNoteToSolfege } from '@/shared/utils/parseNotesInput'
import {
  buildStructuredScoreNotation,
  type StructuredScoreNotation,
} from '@/application/use-cases/buildStructuredScoreNotation'
import type { ScoreDraft } from '@/domain/entities/ScoreDraft'
import { getExportClef } from '@/infrastructure/export/vexflowNoteFormat'
import { buildStaffNotesForExport, toTonalStaffNote } from '@/shared/utils/staffNotePitch'
import { Note } from 'tonal'

export interface ScoreExportRow {
  index: number
  original: string
  transposed: string
  concert: string
  pistons: string
  /** Digitación en registro medio (texto bajo el pentagrama). */
  fingeringMedio: string
  staffNote: string
}

export interface ScoreExportPayload {
  title: string
  fromLabel: string
  toLabel: string
  instrumentLabel: string
  toKey: TranspositionKeyId
  instrumentId: InstrumentId | null
  rows: ScoreExportRow[]
  staffNotes: string[]
  /** Ritmo, compases, ligaduras (constructor de partitura). */
  structuredNotation?: StructuredScoreNotation
}

export function buildScoreExportPayload(options: {
  notes: TransposedNote[]
  fromKey: TranspositionKeyId
  toKey: TranspositionKeyId
  instrumentId: InstrumentId | null
  scoreTitle?: string
  /** Borrador con figuras y compases (normalmente ya transportado). */
  scoreDraft?: ScoreDraft | null
}): ScoreExportPayload | null {
  const valid = options.notes.filter((n) => n.valid)
  if (valid.length === 0) return null

  const fromLabel = getKeyDefinition(options.fromKey).label
  const toLabel = getKeyDefinition(options.toKey).label
  const instrumentLabel = options.instrumentId
    ? getInstrument(options.instrumentId).label
    : '—'

  const exportItems = valid.map((note) => ({
    original: note.original,
    transposed: note.transposed,
  }))
  const exportClef = getExportClef(options.toKey, options.instrumentId)
  const staffNotesResolved = buildStaffNotesForExport(exportItems, {
    clef: exportClef,
  })

  const rows: ScoreExportRow[] = valid.map((note, index) => {
    let pistons = '—'
    let fingeringMedio = '—'
    if (options.instrumentId) {
      const inst = getInstrument(options.instrumentId)
      if (instrumentHasDigitacion(inst)) {
        const staffNote = staffNotesResolved[index] ?? note.transposed
        const entries = getAllRegisterFingerings(note.transposed, options.instrumentId, {
          staffNote,
        })
        pistons = formatAllRegistersForExport(entries)
        const atStaff = getFingeringForStaffNote(
          note.transposed,
          staffNote,
          options.instrumentId,
        )
        fingeringMedio = atStaff.available
          ? atStaff.display
          : (atStaff.message ?? '—')
      } else {
        pistons = inst.mechanismLabel
        fingeringMedio = inst.mechanismLabel
      }
    }

    return {
      index: index + 1,
      original: formatNoteToSolfege(note.original),
      transposed: formatNoteToSolfege(note.transposed),
      concert: formatNoteToSolfege(note.concertPitch),
      pistons,
      fingeringMedio,
      staffNote: toTonalStaffNote(
        staffNotesResolved[index] ?? note.transposed,
      ),
    }
  })

  const staffNotes = rows
    .map((r) => r.staffNote)
    .filter((n) => Note.get(n).name)

  const structuredNotation =
    options.scoreDraft && options.scoreDraft.events.length > 0
      ? buildStructuredScoreNotation(options.scoreDraft, rows)
      : undefined

  return {
    title: options.scoreTitle ?? options.scoreDraft?.title ?? 'Partitura transportada',
    fromLabel,
    toLabel,
    instrumentLabel,
    toKey: options.toKey,
    instrumentId: options.instrumentId,
    rows,
    staffNotes,
    structuredNotation,
  }
}
