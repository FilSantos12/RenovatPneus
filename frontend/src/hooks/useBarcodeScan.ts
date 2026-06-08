import { useEffect, useRef } from 'react'

export type ScannerMode = 'camera' | 'usb'

interface UseBarcodeScanOptions {
  mode: ScannerMode
  onScan: (barcode: string) => void
  enabled?: boolean
}

const SCANNER_SPEED_THRESHOLD_MS = 50

export function useBarcodeScan({ mode, onScan, enabled = true }: UseBarcodeScanOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastKeyTimeRef = useRef(0)

  useEffect(() => {
    if (mode !== 'usb' || !enabled) return

    const input = inputRef.current
    if (!input) return

    input.focus()

    function handleKeyDown(e: KeyboardEvent) {
      const now = Date.now()
      const timeSinceLast = now - lastKeyTimeRef.current
      lastKeyTimeRef.current = now

      if (e.key === 'Enter') {
        const code = bufferRef.current.trim()
        if (code.length > 0) {
          onScan(code)
          bufferRef.current = ''
        }
        return
      }

      if (e.key.length === 1) {
        // Acumula apenas se a tecla chegou rápido (leitor USB) ou buffer já iniciado
        const isScannerInput = timeSinceLast < SCANNER_SPEED_THRESHOLD_MS || bufferRef.current.length > 0
        if (isScannerInput) {
          bufferRef.current += e.key
          clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            bufferRef.current = ''
          }, 100)
        }
      }
    }

    input.addEventListener('keydown', handleKeyDown)
    return () => {
      input.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timerRef.current)
    }
  }, [mode, enabled, onScan])

  return { inputRef }
}
