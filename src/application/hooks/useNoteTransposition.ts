import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SOURCE_KEY,
  DEFAULT_TARGET_KEY,
} from '@/domain/constants/transpositionKeys'
import {
  getDefaultInstrumentForKey,
  getInstrumentsForKey,
} from '@/domain/constants/instruments'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { chromaticScaleAsText } from '@/shared/constants/chromaticScale'
import {
  transposeNotes,
  type TransposeNotesResult,
} from '../use-cases/transposeNotes'

const EMPTY_RESULT: TransposeNotesResult = { notes: [], parsedCount: 0 }

export function useNoteTransposition() {
  const [rawInput, setRawInput] = useState('do re mi fa sol la si do')
  const [fromKey, setFromKey] = useState<TranspositionKeyId>(DEFAULT_SOURCE_KEY)
  const [toKey, setToKey] = useState<TranspositionKeyId>(DEFAULT_TARGET_KEY)
  const [targetInstrument, setTargetInstrument] = useState<InstrumentId | null>(
    () => getDefaultInstrumentForKey(DEFAULT_TARGET_KEY),
  )
  const [result, setResult] = useState<TransposeNotesResult>(EMPTY_RESULT)
  const [hasTransposed, setHasTransposed] = useState(false)
  const [scoreTitle, setScoreTitle] = useState<string | undefined>()

  useEffect(() => {
    const defaultInst = getDefaultInstrumentForKey(toKey)
    setTargetInstrument((current) => {
      if (current) {
        const available = getInstrumentsForKey(toKey)
        if (available.some((i) => i.id === current)) return current
      }
      return defaultInst
    })
  }, [toKey])

  const transpose = useCallback(() => {
    const next = transposeNotes({ rawInput, fromKey, toKey })
    setResult(next)
    setHasTransposed(true)
  }, [rawInput, fromKey, toKey])

  const loadChromaticScale = useCallback(() => {
    setRawInput(chromaticScaleAsText())
    setScoreTitle('Escala cromática')
  }, [])

  const swapKeys = useCallback(() => {
    setFromKey(toKey)
    setToKey(fromKey)
  }, [fromKey, toKey])

  const validCount = useMemo(
    () => result.notes.filter((n) => n.valid).length,
    [result.notes],
  )

  return {
    rawInput,
    setRawInput,
    fromKey,
    setFromKey,
    toKey,
    setToKey,
    targetInstrument,
    setTargetInstrument,
    result,
    hasTransposed,
    validCount,
    transpose,
    swapKeys,
    loadChromaticScale,
    scoreTitle,
  }
}
