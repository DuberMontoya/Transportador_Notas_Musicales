import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SOURCE_KEY,
  DEFAULT_TARGET_KEY,
} from '@/domain/constants/transpositionKeys'
import {
  getDefaultInstrumentForKey,
  getInstrumentsForKey,
} from '@/domain/constants/instruments'
import { DEFAULT_SCORE_DRAFT, type ScoreDraft } from '@/domain/entities/ScoreDraft'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import { chromaticScaleAsText } from '@/shared/constants/chromaticScale'
import { scoreDraftToRawInput } from '@/shared/utils/scoreDraftSync'
import {
  transposeNotes,
  type TransposeNotesResult,
} from '../use-cases/transposeNotes'
import { transposeScoreDraft } from '../use-cases/transposeScoreDraft'

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
  const [scoreDraft, setScoreDraft] = useState<ScoreDraft>(DEFAULT_SCORE_DRAFT)
  const [transposedScoreDraft, setTransposedScoreDraft] = useState<ScoreDraft | null>(
    null,
  )

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
    if (scoreDraft.events.length > 0) {
      const next = transposeScoreDraft({ draft: scoreDraft, fromKey, toKey })
      setResult({ notes: next.notes, parsedCount: next.parsedCount })
      setTransposedScoreDraft(next.transposedDraft)
      setRawInput(scoreDraftToRawInput(scoreDraft))
      setScoreTitle(scoreDraft.title)
    } else {
      const next = transposeNotes({ rawInput, fromKey, toKey })
      setResult(next)
      setTransposedScoreDraft(null)
    }
    setHasTransposed(true)
  }, [rawInput, fromKey, toKey, scoreDraft])

  const loadChromaticScale = useCallback(() => {
    setRawInput(chromaticScaleAsText())
    setScoreTitle('Escala cromática')
    setScoreDraft(DEFAULT_SCORE_DRAFT)
    setTransposedScoreDraft(null)
  }, [])

  const swapKeys = useCallback(() => {
    setFromKey(toKey)
    setToKey(fromKey)
  }, [fromKey, toKey])

  const handleScoreDraftChange = useCallback((draft: ScoreDraft) => {
    setScoreDraft(draft)
    setRawInput(scoreDraftToRawInput(draft))
    setScoreTitle(draft.title)
    setHasTransposed(false)
    setTransposedScoreDraft(null)
  }, [])

  const validCount = useMemo(
    () => result.notes.filter((n) => n.valid).length,
    [result.notes],
  )

  const exportScoreDraft = transposedScoreDraft ?? scoreDraft
  const useStructuredScore = exportScoreDraft.events.length > 0

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
    scoreDraft,
    setScoreDraft: handleScoreDraftChange,
    exportScoreDraft,
    useStructuredScore,
  }
}
