/** Figuras rítmicas soportadas en el constructor. */
export type NoteDuration =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | 'sixteenth'

export type TimeSignature = '4/4' | '3/4' | '2/4' | '6/8'

export type ScoreEventKind = 'note' | 'rest'

export interface ScoreDraftEvent {
  id: string
  measure: number
  kind: ScoreEventKind
  /** Solfeo: do, reb, fa#, mib… (solo notas). */
  pitch: string
  duration: NoteDuration
  dotted: boolean
  /** Ligadura de valor con el evento anterior del mismo compás o anterior compás. */
  tiedToPrevious: boolean
  /** Ligadura de expresión (curva) con la nota anterior. */
  slurToPrevious: boolean
}

export interface ScoreDraft {
  title: string
  timeSignature: TimeSignature
  events: ScoreDraftEvent[]
}

export const DEFAULT_SCORE_DRAFT: ScoreDraft = {
  title: 'Mi partitura',
  timeSignature: '4/4',
  events: [],
}

let scoreEventSeq = 0

export function createScoreEventId(): string {
  scoreEventSeq += 1
  return `evt-${scoreEventSeq}-${Date.now()}`
}

export function createEmptyScoreEvent(measure = 1): ScoreDraftEvent {
  return {
    id: createScoreEventId(),
    measure,
    kind: 'note',
    pitch: 'do',
    duration: 'quarter',
    dotted: false,
    tiedToPrevious: false,
    slurToPrevious: false,
  }
}
