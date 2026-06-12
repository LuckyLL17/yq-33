import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

interface UseExportReturn {
  isExporting: boolean
  exportProgress: number
  exportPNG: () => Promise<void>
  exportPDF: () => Promise<void>
}

export function useExport(canvasRef: React.RefObject<HTMLCanvasElement>): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const state = useWorkspaceStore()

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const exportPNG = useCallback(async () => {
    if (!canvasRef.current) return

    setIsExporting(true)
    setExportProgress(20)

    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setExportProgress(50)

      const canvas = canvasRef.current
      const dataUrl = canvas.toDataURL('image/png', 1.0)

      setExportProgress(80)

      const base64 = dataUrl.split(',')[1]
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })

      const filename = state.fileName
        ? `手写字_${state.fileName.replace(/\.[^/.]+$/, '')}_第${state.currentPage}页.png`
        : `手写字_第${state.currentPage}页.png`

      downloadBlob(blob, filename)
      setExportProgress(100)
    } catch (err) {
      console.error('导出PNG失败:', err)
    } finally {
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 300)
    }
  }, [canvasRef, state.fileName, state.currentPage, downloadBlob])

  const exportPDF = useCallback(async () => {
    if (!canvasRef.current) return

    setIsExporting(true)
    setExportProgress(10)

    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setExportProgress(30)

      const canvas = canvasRef.current
      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      setExportProgress(60)

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      setExportProgress(80)

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)

      const filename = state.fileName
        ? `手写字_${state.fileName.replace(/\.[^/.]+$/, '')}.pdf`
        : '手写字.pdf'

      pdf.save(filename)
      setExportProgress(100)
    } catch (err) {
      console.error('导出PDF失败:', err)
    } finally {
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 300)
    }
  }, [canvasRef, state.fileName])

  return {
    isExporting,
    exportProgress,
    exportPNG,
    exportPDF,
  }
}
