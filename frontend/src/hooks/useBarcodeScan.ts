import { useEffect, useRef } from 'react'

export type ScannerMode = 'camera' | 'usb'

interface UseBarcodeScanOptions {
  mode: ScannerMode
  onScan: (barcode: string) => void
  enabled?: boolean
}

export function useBarcodeScan({ mode, onScan, enabled = true }: UseBarcodeScanOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (mode !== 'usb' || !enabled) return

    const input = inputRef.current
    if (!input) return

    input.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        const code = bufferRef.current.trim()
        if (code.length > 0) {
          onScan(code)
          bufferRef.current = ''
        }
        return
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          bufferRef.current = ''
        }, 100)
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
