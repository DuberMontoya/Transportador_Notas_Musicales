import type { TranspositionKeyId } from './TranspositionKey'

export type InstrumentId =
  | 'bb-trumpet'
  | 'd-trumpet'
  | 'bb-euphonium'
  | 'bb-clarinet'
  | 'f-horn-3'
  | 'f-horn-4'
  | 'f-mellophone'
  | 'f-alto-horn'
  | 'f-english-horn'
  | 'eb-alto-sax'
  | 'eb-baritone-sax'
  | 'a-clarinet'
  | 'g-alto-flute'
  | 'c-tenor-trombone'
  | 'c-bass-trombone'
  | 'concert-generic'

export type FingeringMechanism = 'pistons-3' | 'pistons-4' | 'slide-7' | 'keys'

export interface InstrumentDefinition {
  id: InstrumentId
  label: string
  transpositionKeyId: TranspositionKeyId
  mechanism: FingeringMechanism
  mechanismLabel: string
  hint?: string
}

export interface ValveFingering {
  valves: number[]
  display: string
  alternates?: string[]
}

export interface SlidePositionFingering {
  position: number
  display: string
  alternates?: string[]
}

export interface FingeringResult {
  available: boolean
  kind?: 'valves' | 'slide'
  fingering?: ValveFingering
  slide?: SlidePositionFingering
  resolvedNote?: string
  message?: string
}
