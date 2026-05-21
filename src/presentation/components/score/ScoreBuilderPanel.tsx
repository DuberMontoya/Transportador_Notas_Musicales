import { useMemo, useState } from 'react'
import { Music, Plus, Trash2 } from 'lucide-react'
import {
  createEmptyScoreEvent,
  DEFAULT_SCORE_DRAFT,
  type NoteDuration,
  type ScoreDraft,
  type ScoreDraftEvent,
  type ScoreEventKind,
  type TimeSignature,
} from '@/domain/entities/ScoreDraft'
import type { InstrumentId } from '@/domain/entities/Fingering'
import type { TranspositionKeyId } from '@/domain/entities/TranspositionKey'
import {
  DURATION_LABELS,
  eventBeats,
  measureBeatTotal,
  measureCapacity,
} from '@/shared/utils/scoreRhythm'
import { maxMeasureInDraft, nextMeasureNumber } from '@/shared/utils/scoreDraftSync'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { ScorePreview } from './ScorePreview'

interface ScoreBuilderPanelProps {
  draft: ScoreDraft
  onDraftChange: (draft: ScoreDraft) => void
  toKey: TranspositionKeyId
  instrumentId: InstrumentId | null
}

const DURATIONS: NoteDuration[] = [
  'whole',
  'half',
  'quarter',
  'eighth',
  'sixteenth',
]

export function ScoreBuilderPanel({
  draft,
  onDraftChange,
  toKey,
  instrumentId,
}: ScoreBuilderPanelProps) {
  const [measure, setMeasure] = useState(1)
  const [kind, setKind] = useState<ScoreEventKind>('note')
  const [pitch, setPitch] = useState('do')
  const [duration, setDuration] = useState<NoteDuration>('quarter')
  const [dotted, setDotted] = useState(false)
  const [tiedToPrevious, setTiedToPrevious] = useState(false)
  const [slurToPrevious, setSlurToPrevious] = useState(false)

  const measureStatus = useMemo(() => {
    const used = measureBeatTotal(draft.events, measure)
    const cap = measureCapacity(draft.timeSignature)
    return { used, cap, full: used >= cap - 0.001 }
  }, [draft.events, draft.timeSignature, measure])

  const updateDraft = (patch: Partial<ScoreDraft>) => {
    onDraftChange({ ...draft, ...patch })
  }

  const addEvent = () => {
    const beats = eventBeats({ duration, dotted })
    const used = measureBeatTotal(draft.events, measure)
    if (used + beats > measureCapacity(draft.timeSignature) + 0.001) {
      return
    }

    const event: ScoreDraftEvent = {
      ...createEmptyScoreEvent(measure),
      kind,
      pitch: kind === 'note' ? pitch.trim() || 'do' : '',
      duration,
      dotted,
      tiedToPrevious: kind === 'note' ? tiedToPrevious : false,
      slurToPrevious: kind === 'note' ? slurToPrevious : false,
    }

    onDraftChange({
      ...draft,
      events: [...draft.events, event],
    })
    setTiedToPrevious(false)
    setSlurToPrevious(false)
  }

  const removeEvent = (id: string) => {
    onDraftChange({
      ...draft,
      events: draft.events.filter((e) => e.id !== id),
    })
  }

  const loadDemo = () => {
    onDraftChange({
      title: 'Ejemplo constructor',
      timeSignature: '4/4',
      events: [
        {
          ...createEmptyScoreEvent(1),
          pitch: 'do',
          duration: 'quarter',
        },
        {
          ...createEmptyScoreEvent(1),
          pitch: 're',
          duration: 'quarter',
        },
        {
          ...createEmptyScoreEvent(1),
          pitch: 'mi',
          duration: 'quarter',
        },
        {
          ...createEmptyScoreEvent(1),
          pitch: 'fa',
          duration: 'quarter',
        },
        {
          ...createEmptyScoreEvent(2),
          pitch: 'sol',
          duration: 'half',
        },
        {
          ...createEmptyScoreEvent(2),
          pitch: 'la',
          duration: 'half',
          tiedToPrevious: false,
        },
      ],
    })
    setMeasure(1)
  }

  const clearScore = () => {
    onDraftChange({ ...DEFAULT_SCORE_DRAFT, title: draft.title })
  }

  const sortedEvents = [...draft.events].sort(
    (a, b) => a.measure - b.measure || 0,
  )

  return (
    <div className="space-y-5 rounded-xl border border-music-violet/30 bg-music-bg/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-music-gold">
          <Music className="h-4 w-4" />
          <h3 className="text-sm font-semibold text-music-text">Constructor de partitura</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={loadDemo}>
            Ejemplo
          </Button>
          <Button variant="secondary" type="button" onClick={clearScore}>
            Vaciar
          </Button>
        </div>
      </div>

      <p className="text-xs text-music-muted">
        Arma compás a compás: elige figura (redonda, negra, corchea…), silencios, ligaduras de
        valor y de expresión. Luego pulsa <strong className="text-music-text">Transportar notas</strong>.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-music-muted">
            Título de la partitura
          </span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            className="rounded-xl border border-music-border bg-music-surface-elevated px-4 py-3 text-sm text-music-text focus:border-music-violet focus:outline-none focus:ring-2 focus:ring-music-violet/30"
          />
        </label>
        <Select
          label="Compás"
          value={draft.timeSignature}
          onChange={(e) =>
            updateDraft({ timeSignature: e.target.value as TimeSignature })
          }
        >
          <option value="4/4">4/4</option>
          <option value="3/4">3/4</option>
          <option value="2/4">2/4</option>
          <option value="6/8">6/8</option>
        </Select>
      </div>

      <div className="rounded-lg border border-music-border/70 bg-music-surface/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-music-violet">
          Añadir al compás {measure}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Compás nº"
            value={String(measure)}
            onChange={(e) => setMeasure(Number(e.target.value))}
          >
            {Array.from({ length: Math.max(4, maxMeasureInDraft(draft) + 1) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
            <option value={nextMeasureNumber(draft)}>+ Nuevo compás</option>
          </Select>
          <Select
            label="Tipo"
            value={kind}
            onChange={(e) => setKind(e.target.value as ScoreEventKind)}
          >
            <option value="note">Nota</option>
            <option value="rest">Silencio</option>
          </Select>
          {kind === 'note' && (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-music-muted">
                Nota (solfeo)
              </span>
              <input
                type="text"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="do, reb, fa#…"
                className="rounded-xl border border-music-border bg-music-surface-elevated px-4 py-3 text-sm text-music-text focus:border-music-violet focus:outline-none focus:ring-2 focus:ring-music-violet/30"
              />
            </label>
          )}
          <Select
            label="Figura"
            value={duration}
            onChange={(e) => setDuration(e.target.value as NoteDuration)}
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {DURATION_LABELS[d]}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-music-text">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dotted}
              onChange={(e) => setDotted(e.target.checked)}
              className="accent-music-violet"
            />
            Puntillo
          </label>
          {kind === 'note' && (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tiedToPrevious}
                  onChange={(e) => setTiedToPrevious(e.target.checked)}
                  className="accent-music-violet"
                />
                Ligadura de valor
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slurToPrevious}
                  onChange={(e) => setSlurToPrevious(e.target.checked)}
                  className="accent-music-violet"
                />
                Ligadura de expresión
              </label>
            </>
          )}
        </div>

        <p className="mt-2 text-xs text-music-muted">
          Compás {measure}: {measureStatus.used} / {measureStatus.cap} tiempos
          {measureStatus.full ? ' · completo' : ''}
        </p>

        <Button
          type="button"
          className="mt-3"
          disabled={measureStatus.full}
          onClick={addEvent}
        >
          <Plus className="h-4 w-4" />
          Añadir al pentagrama
        </Button>
      </div>

      {sortedEvents.length > 0 && (
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-music-border/60 bg-music-bg/40 p-2 text-sm">
          {sortedEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-music-surface/60"
            >
              <span className="font-mono text-music-text">
                <span className="text-music-muted">C{event.measure}</span>{' '}
                {event.kind === 'rest'
                  ? `silencio ${DURATION_LABELS[event.duration]}${event.dotted ? '·' : ''}`
                  : `${event.pitch} ${DURATION_LABELS[event.duration]}${event.dotted ? '·' : ''}`}
                {event.tiedToPrevious ? ' ∪' : ''}
                {event.slurToPrevious ? ' ⌒' : ''}
              </span>
              <button
                type="button"
                onClick={() => removeEvent(event.id)}
                className="shrink-0 rounded p-1 text-music-muted hover:bg-music-rose/10 hover:text-music-rose"
                aria-label="Quitar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-music-muted">
          Vista previa
        </p>
        <ScorePreview draft={draft} toKey={toKey} instrumentId={instrumentId} />
      </div>
    </div>
  )
}
