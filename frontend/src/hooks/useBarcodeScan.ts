import { useEffect } from 'react'

export type ScannerMode = 'camera' | 'usb'

interface UseBarcodeScanOptions {
  mode: ScannerMode
  onScan: (barcode: string) => void
  enabled?: boolean
}

const INTER_KEY_THRESHOLD_MS = 80

export function useBarcodeScan({ mode, onScan, enabled = true }: UseBarcodeScanOptions) {
  useEffect(() => {
    if (mode !== 'usb' || !enabled) return

    let buffer = ''
    let lastKeyTime = 0

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key.length !== 1 && e.key !== 'Enter') return

      const tag = (e.target as HTMLElement)?.tagName
      const type = (e.target as HTMLInputElement)?.type
      const isTextInput =
        (tag === 'INPUT' && ['text', 'search', 'number', 'email', 'password', ''].includes(type ?? '')) ||
        tag === 'TEXTAREA'

      if (isTextInput) return

      const now = Date.now()

      if (e.key === 'Enter') {
        const code = buffer.trim()
        if (code.length >= 4) {
          onScan(code)
        }
        buffer = ''
        lastKeyTime = 0
        return
      }

      if (lastKeyTime > 0 && now - lastKeyTime > INTER_KEY_THRESHOLD_MS) {
        buffer = ''
      }

      buffer += e.key
      lastKeyTime = now
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode, enabled, onScan])
}
