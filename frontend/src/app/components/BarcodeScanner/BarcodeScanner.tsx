import { useState, useCallback, useRef } from 'react'
import { useZxing } from 'react-zxing'
import { useBarcodeScan, type ScannerMode } from '@/hooks/useBarcodeScan'
import { Camera, Usb, X } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScannerMode>('usb')
  const lastScanRef = useRef('')

  const handleScan = useCallback((barcode: string) => {
    if (barcode === lastScanRef.current) return
    lastScanRef.current = barcode
    onScan(barcode)
    setTimeout(() => { lastScanRef.current = '' }, 2000)
  }, [onScan])

  const { ref: cameraRef } = useZxing({
    onDecodeResult: (result) => handleScan(result.rawValue),
    paused: mode !== 'camera',
  })

  const { inputRef } = useBarcodeScan({
    mode,
    onScan: handleScan,
    enabled: mode === 'usb',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
            Scanner de Código de Barras
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-[#2D2D2D]/60" />
          </button>
        </div>

        {/* Seletor de modo */}
        <div className="flex p-4 gap-2">
          <button
            onClick={() => setMode('usb')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
              mode === 'usb'
                ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                : 'border-gray-200 text-[#2D2D2D]/60 hover:border-gray-300'
            }`}
          >
            <Usb className="w-4 h-4" />
            Leitor USB
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
              mode === 'camera'
                ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                : 'border-gray-200 text-[#2D2D2D]/60 hover:border-gray-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Câmera
          </button>
        </div>

        {/* Área do scanner */}
        <div className="px-4 pb-4">

          {/* Modo USB */}
          {mode === 'usb' && (
            <div className="text-center py-8">
              <input
                ref={inputRef}
                className="opacity-0 absolute w-0 h-0"
                autoFocus
                readOnly
                tabIndex={-1}
              />
              <div className="w-16 h-16 bg-[#F97316]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Usb className="w-8 h-8 text-[#F97316]" />
              </div>
              <p className="text-[#2D2D2D] font-medium">Aguardando leitura...</p>
              <p className="text-[#2D2D2D]/60 text-sm mt-1">
                Aponte o leitor para o código de barras
              </p>
            </div>
          )}

          {/* Modo câmera */}
          {mode === 'camera' && (
            <div className="relative">
              <video
                ref={cameraRef}
                className="w-full rounded-xl aspect-square object-cover bg-[#111111]"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-[#F97316] rounded-xl opacity-80" />
              </div>
              <p className="text-center text-[#2D2D2D]/60 text-sm mt-2">
                Centralize o código de barras na mira
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
