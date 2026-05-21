import { ArrowLeftRight, ListMusic, Music4, Sparkles } from 'lucide-react'
import { getKeyDefinition } from '@/domain/constants/transpositionKeys'
import { useNoteTransposition } from '@/application/hooks/useNoteTransposition'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { KeySelector } from './KeySelector'
import { ScoreBuilderPanel } from '../score/ScoreBuilderPanel'
import { ScoreIOPanel } from '../score/ScoreIOPanel'
import { FingeringOptionsPanel } from './FingeringOptionsPanel'
import { SolfegeNotationHelp } from './SolfegeNotationHelp'
import { TranspositionResults } from './TranspositionResults'

export function TransposerPanel() {
  const {
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
    setScoreDraft,
    exportScoreDraft,
    useStructuredScore,
  } = useNoteTransposition()

  const fromDef = getKeyDefinition(fromKey)
  const toDef = getKeyDefinition(toKey)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-music-border bg-music-surface px-4 py-1.5 text-xs font-medium text-music-violet">
          <Sparkles className="h-3.5 w-3.5" />
          Teoría musical · Tonal.js
        </div>
        <h1 className="bg-gradient-to-r from-music-gold via-music-text to-music-violet bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Transportador de notas
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-music-muted">
          Convierte notas escritas entre claves de instrumentos (Sib, Fa, Mib, Do…)
          conservando el mismo sonido real. Ejemplo: Do en Sib → Fa en Fa.
        </p>
      </header>

      <section className="rounded-2xl border border-music-border bg-music-surface p-5 shadow-xl shadow-black/20 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-2 text-music-gold">
          <Music4 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Configuración</h2>
        </div>

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-5">
          <KeySelector label="Clave de origen" value={fromKey} onChange={setFromKey} />
          <Button
            variant="secondary"
            className="mx-auto h-11 w-11 shrink-0 rounded-full p-0 sm:mx-0"
            onClick={swapKeys}
            title="Intercambiar claves"
            aria-label="Intercambiar claves de origen y destino"
          >
            <ArrowLeftRight className="h-4 w-4 text-music-violet" />
          </Button>
          <KeySelector label="Clave de destino" value={toKey} onChange={setToKey} />
        </div>

        <div className="mt-6">
          <FingeringOptionsPanel
            transpositionKeyId={toKey}
            instrumentId={targetInstrument}
            onInstrumentChange={setTargetInstrument}
          />
        </div>

        <div className="mt-8 space-y-5">
          <ScoreBuilderPanel
            draft={scoreDraft}
            onDraftChange={setScoreDraft}
            toKey={toKey}
            instrumentId={targetInstrument}
          />
          <SolfegeNotationHelp />
          <Textarea
            label="Notas a transportar"
            hint="Escribe en español: do, reb, do#, mib, sib… Separa con espacios, comas o saltos de línea."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="do re mib fa sol# la sib do"
          />
        </div>

        <div className="mt-6">
          <ScoreIOPanel
            hasTransposed={hasTransposed}
            validCount={validCount}
            result={result}
            fromKey={fromKey}
            toKey={toKey}
            targetInstrument={targetInstrument}
            scoreTitle={scoreTitle}
            exportScoreDraft={exportScoreDraft}
            useStructuredScore={useStructuredScore}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={loadChromaticScale}
            title="Sube fa#→fa con #, baja fa→fa con bemoles"
          >
            <ListMusic className="h-4 w-4" />
            Escala cromática
          </Button>
          <Button onClick={transpose}>Transportar notas</Button>
          {hasTransposed && result.parsedCount > 0 && (
            <span className="text-sm text-music-muted">
              {validCount} de {result.parsedCount} notas transportadas correctamente
            </span>
          )}
          {rawInput.includes('fa#') && rawInput.includes('solb') && (
            <span className="text-xs text-music-violet">
              Escala cromática completa (51 notas)
            </span>
          )}
        </div>
      </section>

      <section>
        <TranspositionResults
          notes={result.notes}
          hasTransposed={hasTransposed}
          fromLabel={fromDef.label}
          toLabel={toDef.label}
          targetInstrumentId={targetInstrument}
        />
      </section>

      <aside className="rounded-xl border border-music-border/60 bg-music-surface/40 px-5 py-4 text-sm text-music-muted">
        <strong className="text-music-text">¿Cómo funciona?</strong> Cada clave indica cuánto
        difiere la partitura del sonido real. El transporte calcula la misma altura de sonido
        (concert) y la reescribe en la clave de destino. La librería{' '}
        <a
          href="https://github.com/tonaljs/tonal"
          className="text-music-violet hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Tonal.js
        </a>{' '}
        gestiona intervalos y enarmónicos.
      </aside>
    </div>
  )
}
