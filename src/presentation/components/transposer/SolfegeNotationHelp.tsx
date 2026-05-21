import { SOLFEGE_NOTATION_HELP } from '@/shared/utils/parseNotesInput'

export function SolfegeNotationHelp() {
  return (
    <div className="rounded-xl border border-music-border/80 bg-music-bg/50 px-4 py-4 sm:px-5">
      <p className="mb-3 text-sm font-medium text-music-text">Cómo escribir las notas</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-music-surface/60 px-3 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-music-violet">
            Naturales
          </p>
          <p className="font-mono text-sm text-music-text">{SOLFEGE_NOTATION_HELP.naturales}</p>
        </div>
        <div className="rounded-lg bg-music-surface/60 px-3 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-music-gold">
            Sostenido (#)
          </p>
          <p className="font-mono text-sm text-music-text">{SOLFEGE_NOTATION_HELP.sostenido}</p>
        </div>
        <div className="rounded-lg bg-music-surface/60 px-3 py-2 sm:col-span-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-music-rose">
            Bemol (b)
          </p>
          <p className="font-mono text-sm text-music-text">{SOLFEGE_NOTATION_HELP.bemol}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-music-muted">
        Ejemplo:{' '}
        <code className="font-mono text-music-gold">{SOLFEGE_NOTATION_HELP.ejemplo}</code>
        {' · '}
        Los <strong className="text-music-text">pistones</strong> se muestran en grave, medio y
        agudo; no hace falta poner números en las notas.
      </p>
    </div>
  )
}
