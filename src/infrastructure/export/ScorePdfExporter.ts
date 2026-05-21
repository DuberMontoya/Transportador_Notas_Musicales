import { jsPDF } from 'jspdf'
import type { ScoreExportPayload } from '@/application/use-cases/buildScoreExportRows'
import { describeExportNotation, getExportClef } from './vexflowNoteFormat'
import {
  chunkScoreIntoSystems,
  ensureVexFlowFonts,
  paginateScoreSystems,
  renderScorePageToDataUrl,
  SCORE_SHEET_WIDTH,
  scoreSheetImageHeight,
} from './scoreSheetRenderer'

function prepareExportHost(): HTMLElement {
  const exportHostId = 'vexflow-pdf-export-host'
  let host = document.getElementById(exportHostId)
  if (!host) {
    host = document.createElement('div')
    host.id = exportHostId
    document.body.appendChild(host)
  }
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'visibility:hidden',
    'pointer-events:none',
    'overflow:hidden',
    'z-index:-1',
  ].join(';')
  return host
}

export async function exportScoreToPdf(payload: ScoreExportPayload): Promise<void> {
  await ensureVexFlowFonts()

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const marginX = 10
  const contentWidth = pageWidth - marginX * 2
  const clef = getExportClef(payload.toKey, payload.instrumentId)
  const notationCaption = describeExportNotation(
    payload.toKey,
    payload.instrumentId,
    clef,
  )

  const systems = chunkScoreIntoSystems(payload.rows)
  const pages = paginateScoreSystems(systems)
  const host = prepareExportHost()

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageSystems = pages[pageIndex]
    const canvasId = `${host.id}-page-${pageIndex}`
    const canvasHeight = scoreSheetImageHeight(pageSystems.length)

    const canvas = document.createElement('canvas')
    canvas.id = canvasId
    const pageHeight = scoreSheetImageHeight(pageSystems.length)
    canvas.width = SCORE_SHEET_WIDTH
    canvas.height = pageHeight
    canvas.style.width = `${SCORE_SHEET_WIDTH}px`
    canvas.style.height = `${pageHeight}px`
    host.appendChild(canvas)

    const { dataUrl, error } = renderScorePageToDataUrl(pageSystems, clef, canvas)
    host.removeChild(canvas)

    if (pageIndex > 0) {
      pdf.addPage()
    }

    let y = 14

    if (pageIndex === 0) {
      pdf.setFontSize(15)
      pdf.setTextColor(20, 18, 30)
      pdf.text(payload.title, pageWidth / 2, y, { align: 'center' })
      y += 7

      pdf.setFontSize(9)
      pdf.setTextColor(70, 65, 90)
      pdf.text(
        `${payload.fromLabel} -> ${payload.toLabel}  |  ${payload.instrumentLabel}`,
        pageWidth / 2,
        y,
        { align: 'center' },
      )
      y += 5
      pdf.setFontSize(8)
      pdf.text(notationCaption, pageWidth / 2, y, { align: 'center' })
      y += 8
    }

    if (dataUrl) {
      const imgH = (canvasHeight / SCORE_SHEET_WIDTH) * contentWidth
      if (y + imgH > 285) {
        pdf.addPage()
        y = 14
      }
      pdf.addImage(dataUrl, 'PNG', marginX, y, contentWidth, imgH)
      y += imgH + 4
    } else {
      pdf.setFontSize(9)
      pdf.setTextColor(170, 50, 70)
      const msg = error
        ? `Error al dibujar la pagina ${pageIndex + 1}: ${error}`
        : `No se pudo dibujar la pagina ${pageIndex + 1}`
      pdf.text(msg, marginX, y)
      y += 8
    }
  }

  if (payload.rows.length === 0) {
    pdf.setFontSize(10)
    pdf.text('No hay notas validas para exportar.', marginX, 40)
  }

  const safeName = payload.title.replace(/[^\w\s-áéíóúñ]/gi, '').trim() || 'partitura'
  pdf.save(`${safeName}-transportada.pdf`)
}
