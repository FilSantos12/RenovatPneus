import { useRef, useState, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useLocation } from 'react-router'
import { useProducts } from '@/hooks/useProducts'
import { LabelItem } from '../components/Labels/LabelItem'
import { BarcodeScanner } from '../components/BarcodeScanner/BarcodeScanner'
import type { Product } from '../types'
import { Printer, Trash2, ScanLine, Loader2 } from 'lucide-react'

interface LabelEntry {
  product: Product
  quantity: number
}

export function Etiquetas() {
  const printRef = useRef<HTMLDivElement>(null)
  const [entries, setEntries] = useState<LabelEntry[]>([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const [printMode, setPrintMode] = useState<'a4' | 'thermal'>('a4')
  const [showPrice, setShowPrice] = useState(true)
  const [showName, setShowName] = useState(true)

  const location = useLocation()
  const { data: productsData, isLoading } = useProducts()
  const products: Product[] = productsData?.data ?? []

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle:
      printMode === 'a4'
        ? `@page { size: A4; margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } }`
        : `@page { size: 80mm 40mm; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }`,
  })

  // Pré-carregar produto quando navegado via state (botão de etiqueta no Estoque)
  useEffect(() => {
    const productId = location.state?.productId
    if (!productId || !products.length) return
    const product = products.find((p) => p.id === productId)
    if (product) addProduct(product)
  }, [location.state, products])

  function addProduct(product: Product) {
    setEntries((prev) => {
      const existing = prev.find((e) => e.product.id === product.id)
      if (existing) {
        return prev.map((e) =>
          e.product.id === product.id ? { ...e, quantity: e.quantity + 1 } : e
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function handleScan(barcode: string) {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addProduct(product)
      setScannerOpen(false)
    }
  }

  function removeEntry(productId: number) {
    setEntries((prev) => prev.filter((e) => e.product.id !== productId))
  }

  function updateQuantity(productId: number, qty: number) {
    if (qty < 1) return
    setEntries((prev) =>
      prev.map((e) => (e.product.id === productId ? { ...e, quantity: qty } : e))
    )
  }

  const labelsToRender = entries.flatMap((e) =>
    Array.from({ length: e.quantity }, (_, i) => ({
      key: `${e.product.id}-${i}`,
      product: e.product,
    }))
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Impressão de Etiquetas
          </h1>
          <p className="text-[#2D2D2D]/60">
            Configure e imprima etiquetas para seus produtos
          </p>
        </div>
        <button
          onClick={() => handlePrint()}
          disabled={entries.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Printer className="w-5 h-5" />
          Imprimir{labelsToRender.length > 0 ? ` (${labelsToRender.length})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Painel esquerdo: configuração */}
        <div className="space-y-4">

          {/* Adicionar produtos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
              Adicionar Produtos
            </h2>

            <button
              onClick={() => setScannerOpen(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#F97316] text-[#F97316] rounded-xl py-3 hover:bg-[#F97316]/5 transition-colors font-medium"
            >
              <ScanLine className="w-5 h-5" />
              Escanear código de barras
            </button>

            {isLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
              </div>
            ) : (
              <select
                onChange={(e) => {
                  const product = products.find((p) => p.id === Number(e.target.value))
                  if (product) addProduct(product)
                  e.target.value = ''
                }}
                className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors text-sm text-[#2D2D2D]"
                defaultValue=""
              >
                <option value="" disabled>Ou selecionar da lista...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.barcode}</option>
                ))}
              </select>
            )}
          </div>

          {/* Configurações de impressão */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
              Configurações
            </h2>

            <div>
              <label className="text-sm text-[#2D2D2D]/60 block mb-2">Tipo de impressora</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPrintMode('a4')}
                  className={`flex-1 py-2.5 text-sm rounded-xl border-2 font-medium transition-colors ${
                    printMode === 'a4'
                      ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                      : 'border-gray-200 text-[#2D2D2D]/60 hover:border-gray-300'
                  }`}
                >
                  A4 (comum)
                </button>
                <button
                  onClick={() => setPrintMode('thermal')}
                  className={`flex-1 py-2.5 text-sm rounded-xl border-2 font-medium transition-colors ${
                    printMode === 'thermal'
                      ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                      : 'border-gray-200 text-[#2D2D2D]/60 hover:border-gray-300'
                  }`}
                >
                  Térmica
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-[#2D2D2D] cursor-pointer">
              <input
                type="checkbox"
                checked={showName}
                onChange={(e) => setShowName(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Mostrar nome do produto
            </label>
            <label className="flex items-center gap-3 text-sm text-[#2D2D2D] cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Mostrar preço de venda
            </label>
          </div>

          {/* Lista de produtos adicionados */}
          {entries.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
                Produtos selecionados
              </h2>
              {entries.map((entry) => (
                <div key={entry.product.id} className="flex items-center gap-3">
                  <span className="flex-1 truncate text-sm text-[#2D2D2D]">
                    {entry.product.name} — {entry.product.barcode}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={entry.quantity}
                    onChange={(e) => updateQuantity(entry.product.id, Number(e.target.value))}
                    className="w-16 h-9 border-2 border-gray-200 rounded-lg px-2 text-center text-sm focus:outline-none focus:border-[#F97316]"
                  />
                  <button
                    onClick={() => removeEntry(entry.product.id)}
                    className="p-1.5 text-[#EF4444]/60 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel direito: pré-visualização */}
        <div className="lg:col-span-2">
          <div className="bg-[#F5F5F5] rounded-2xl border border-gray-200 p-4 min-h-64">
            <p className="text-sm text-[#2D2D2D]/60 mb-3">
              Pré-visualização —{' '}
              <span className="font-medium text-[#2D2D2D]">
                {labelsToRender.length} etiqueta{labelsToRender.length !== 1 ? 's' : ''}
              </span>
            </p>

            {/* Área impressa */}
            <div
              ref={printRef}
              className={`flex flex-wrap gap-2 ${printMode === 'a4' ? 'p-2' : 'p-0'}`}
            >
              {labelsToRender.map(({ key, product }) => (
                <LabelItem
                  key={key}
                  product={product}
                  showPrice={showPrice}
                  showName={showName}
                />
              ))}
              {labelsToRender.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-16 text-[#2D2D2D]/40">
                  <Printer className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Adicione produtos para visualizar as etiquetas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  )
}
