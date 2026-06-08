import { useState, useCallback, useRef } from 'react'
import { useZxing } from 'react-zxing'
import { useBarcodeScan, type ScannerMode } from '@/hooks/useBarcodeScan'
import { Camera, Usb, X, RefreshCw } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

function getInitialMode(): ScannerMode {
  return typeof window !== 'undefined' && window.innerWidth < 1024 ? 'camera' : 'usb'
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScannerMode>(getInitialMode)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const lastScanRef = useRef('')

  const handleScan = useCallback((barcode: string) => {
    if (barcode === lastScanRef.current) return
    lastScanRef.current = barcode
    setScanSuccess(true)
    navigator.vibrate?.(200)
    setTimeout(() => setScanSuccess(false), 1000)
    onScan(barcode)
    setTimeout(() => { lastScanRef.current = '' }, 2000)
  }, [onScan])

  const { ref: cameraRef } = useZxing({
    onDecodeResult: (result) => handleScan(result.rawValue),
    paused: mode !== 'camera',
    constraints: {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    onError: (error) => {
      const e = error as { name?: string }
      if (e?.name === 'NotAllowedError') {
        setCameraError('Permissão de câmera negada. Acesse as configurações do browser e permita o acesso.')
      } else if (e?.name === 'NotFoundError') {
        setCameraError('Câmera não encontrada neste dispositivo.')
      } else {
        setCameraError('Câmera não disponível.')
      }
    },
  })

  const { inputRef } = useBarcodeScan({
    mode,
    onScan: handleScan,
    enabled: mode === 'usb',
  })

  function handleManualSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const code = manualCode.trim().toUpperCase()
    if (code) {
      handleScan(code)
      setManualCode('')
    }
  }

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

        {/* Seletor de modo — câmera só mobile, USB só desktop */}
        <div className="flex p-4 gap-2">
          {/* Botão Câmera: visível apenas em mobile */}
          <button
            onClick={() => { setMode('camera'); setCameraError(null) }}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors lg:hidden ${
              mode === 'camera'
                ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                : 'border-gray-200 text-[#2D2D2D]/60 hover:border-gray-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Câmera
          </button>
          {/* Botão USB: visível apenas em desktop */}
          <button
            onClick={() => setMode('usb')}
            className={`flex-1 items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors hidden lg:flex ${
              mode === 'usb'
                ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                : 'border-gray-200 text-[#2D2D2D]/60 hover:border-gray-300'
            }`}
          >
            <Usb className="w-4 h-4" />
            Leitor USB
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3">

          {/* Câmera — apenas mobile (lg:hidden como segurança adicional) */}
          {mode === 'camera' && (
            <div className="block lg:hidden">
              {cameraError ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-[#EF4444] text-sm px-2">{cameraError}</p>
                  <button
                    onClick={() => setCameraError(null)}
                    className="flex items-center gap-1 mx-auto text-[#F97316] text-sm hover:underline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <video
                      ref={cameraRef}
                      className="w-full rounded-xl aspect-square object-cover bg-[#111111]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-48 h-32 border-2 rounded-xl opacity-80 transition-colors duration-300 ${
                        scanSuccess ? 'border-[#22C55E]' : 'border-[#F97316]'
                      }`} />
                    </div>
                  </div>
                  <p className="text-center text-[#2D2D2D]/60 text-sm mt-2">
                    Centralize o código de barras na mira
                  </p>
                </div>
              )}
            </div>
          )}

          {/* USB — apenas desktop (hidden lg:block como segurança adicional) */}
          {mode === 'usb' && (
            <div className="hidden lg:block text-center py-6">
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
                Aponte o leitor para o código de barras ou digite abaixo
              </p>
            </div>
          )}

          {/* Campo manual — sempre visível como fallback universal */}
          <div>
            {mode === 'camera' && !cameraError && (
              <p className="text-xs text-[#2D2D2D]/40 text-center mb-2">
                Ou digite o código manualmente
              </p>
            )}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                placeholder="RNV-000000"
                className="flex-1 h-11 px-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors text-sm font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 h-11 bg-[#F97316] text-white rounded-xl text-sm font-medium hover:bg-[#F97316]/90 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
