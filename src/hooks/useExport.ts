import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import { useHandwritingRender } from '@/hooks/useHandwritingRender'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

interface UseExportReturn {
  isExporting: boolean
  exportProgress: number
  exportPNG: () => Promise<void>
  exportPDF: () => Promise<void>
}

export function useExport(
  externalCanvasRef?: React.RefObject<HTMLCanvasElement>
): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const fileName = useWorkspaceStore((s) => s.fileName)
  const { pageSize, renderAllCanvases } = useHandwritingRender({
    externalCanvasRef,
  })

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }, [])

  const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))),
        type,
        1.0
      )
    })

  const baseName = () => {
    if (fileName) {
      return fileName.replace(/\.[^/.]+$/, '')
    }
    return '手写字'
  }

  const exportPNG = useCallback(async () => {
    setIsExporting(true)
    setExportProgress(5)
    try {
      const canvases = await renderAllCanvases()
      setExportProgress(25)
      if (canvases.length === 0) return
      for (let i = 0; i < canvases.length; i++) {
        const blob = await canvasToBlob(canvases[i], 'image/png')
        const name =
          canvases.length === 1
            ? '手写字_' + baseName() + '.png'
            : '手写字_' + baseName() + '_第' + (i + 1) + '页.png'
        downloadBlob(blob, name)
        setExportProgress(25 + Math.round(((i + 1) / canvases.length) * 70))
        if (i < canvases.length - 1) {
          await new Promise((r) => setTimeout(r, 350))
        }
      }
      setExportProgress(100)
    } catch (err) {
      console.error('导出PNG失败:', err)
    } finally {
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 400)
    }
  }, [renderAllCanvases, fileName, downloadBlob])

  const exportPDF = useCallback(async () => {
    setIsExporting(true)
    setExportProgress(5)
    try {
      const canvases = await renderAllCanvases()
      setExportProgress(25)
      if (canvases.length === 0) return
      const { width, height } = pageSize
      const isLandscape = width > height
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
        compress: true,
      })
      for (let i = 0; i < canvases.length; i++) {
        const dataUrl = canvases[i].toDataURL('image/jpeg', 0.92)
        if (i > 0) {
          pdf.addPage([width, height], isLandscape ? 'landscape' : 'portrait')
        }
        pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST')
        setExportProgress(30 + Math.round(((i + 1) / canvases.length) * 65))
      }
      pdf.save('手写字_' + baseName() + '.pdf')
      setExportProgress(100)
    } catch (err) {
      console.error('导出PDF失败:', err)
    } finally {
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 400)
    }
  }, [renderAllCanvases, pageSize, fileName])

  return {
    isExporting,
    exportProgress,
    exportPNG,
    exportPDF,
  }
}
