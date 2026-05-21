import type { NoteDuration, ScoreDraftEvent, TimeSignature } from '@/domain/entities/ScoreDraft'

const DURATION_BEATS: Record<NoteDuration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
}

export const DURATION_LABELS: Record<NoteDuration, string> = {
  whole: 'Redonda',
  half: 'Blanca',
  quarter: 'Negra',
  eighth: 'Corchea',
  sixteenth: 'Semicorchea',
}

export function eventBeats(event: Pick<ScoreDraftEvent, 'duration' | 'dotted'>): number {
  const base = DURATION_BEATS[event.duration]
  return event.dotted ? base * 1.5 : base
}

export function beatsPerMeasure(timeSignature: TimeSignature): number {
  switch (timeSignature) {
    case '3/4':
      return 3
    case '2/4':
      return 2
    case '6/8':
      return 3
    default:
      return 4
  }
}

export function measureBeatTotal(
  events: ScoreDraftEvent[],
  measure: number,
): number {
  return events
    .filter((e) => e.measure === measure)
    .reduce((sum, e) => sum + eventBeats(e), 0)
}

export function measureCapacity(timeSignature: TimeSignature): number {
  return beatsPerMeasure(timeSignature)
}

export function isMeasureFull(
  events: ScoreDraftEvent[],
  measure: number,
  timeSignature: TimeSignature,
): boolean {
  const total = measureBeatTotal(events, measure)
  return total >= measureCapacity(timeSignature) - 0.001
}

/** Duración VexFlow (w, h, q, 8, 16 + d puntillo + r silencio). */
export function toVexDuration(
  duration: NoteDuration,
  dotted: boolean,
  isRest: boolean,
): string {
  const map: Record<NoteDuration, string> = {
    whole: 'w',
    half: 'h',
    quarter: 'q',
    eighth: '8',
    sixteenth: '16',
  }
  const base = map[duration]
  const dot = dotted ? 'd' : ''
  const rest = isRest ? 'r' : ''
  return `${base}${dot}${rest}`
}

export function timeSignatureToVex(timeSignature: TimeSignature): string {
  return timeSignature
}

export function voiceTimeForMeasures(
  measureCount: number,
  timeSignature: TimeSignature,
): string {
  const beats = beatsPerMeasure(timeSignature) * measureCount
  const [, denom] = timeSignature.split('/').map(Number)
  return `${beats}/${denom}`
}
