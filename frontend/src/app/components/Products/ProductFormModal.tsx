import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { X, Check, Loader2, Minus, Plus, RefreshCw, Printer } from 'lucide-react'
import { useCreateProduct, useUpdateProduct, useNextBarcode } from '@/hooks/useProducts'
import { extractValidationErrors, getFirstError } from '@/lib/errors'
import type { Product } from '@/app/types'

interface ProductFormModalProps {
  product?: Product
  onClose: () => void
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const isEditing = !!product
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    size: product?.size ?? '',
    price_cost: product?.price_cost != null ? product.price_cost.toString() : '',
    price_sale: product?.price_sale != null ? product.price_sale.toString() : '',
    quantity: product?.quantity ?? 0,
    min_stock: product?.min_stock ?? 2,
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null)

  const { data: nextBarcode, isLoading: loadingBarcode, refetch: refetchBarcode } = useNextBarcode(!isEditing)
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct()
  const isPending = isCreating || isUpdating

  // preview do barcode exibido (somente-leitura)
  const barcodePreview = isEditing
    ? (product?.barcode ?? '')
    : (nextBarcode ?? (loadingBarcode ? 'Gerando...' : ''))

  useEffect(() => {
    // recarrega preview ao abrir para cadastro
  }, [nextBarcode])

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: [] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const payload = {
      name: form.name,
      brand: form.brand,
      size: form.size,
      price_cost: form.price_cost ? parseFloat(form.price_cost) : undefined,
      price_sale: parseFloat(form.price_sale),
      quantity: form.quantity,
      min_stock: form.min_stock,
    }

    try {
      if (isEditing) {
        await updateProduct({ id: product.id, ...payload })
        onClose()
      } else {
        const result = await createProduct(payload)
        setCreatedProduct(result)
      }
    } catch (error) {
      setErrors(extractValidationErrors(error))
    }
  }

  const inputClass =
    'w-full h-[52px] px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors'

  // Tela de sucesso pós-criação
  if (createdProduct) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-1">
            Produto cadastrado!
          </h2>
          <p className="text-[#2D2D2D]/60 text-sm mb-4">Código gerado pelo sistema:</p>
          <div className="bg-[#F5F5F5] rounded-xl px-4 py-3 mb-6">
            <span className="font-mono font-bold text-lg text-[#2D2D2D] tracking-widest">
              {createdProduct.barcode}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/etiquetas', { state: { productId: createdProduct.id } })}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir etiqueta
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-[#2D2D2D] rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {isEditing ? 'Editar Produto' : 'Entrada'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-[#2D2D2D] font-medium mb-2">Nome do produto *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              autoFocus
              placeholder="Ex: Pneu Aro 14"
              className={inputClass}
              required
            />
            {getFirstError(errors, 'name') && (
              <p className="text-[#EF4444] text-sm mt-1">{getFirstError(errors, 'name')}</p>
            )}
          </div>

          {/* Código de barras — somente-leitura */}
          <div>
            <label className="block text-[#2D2D2D] font-medium mb-2">Código de barras</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodePreview}
                readOnly
                tabIndex={-1}
                className="flex-1 h-[52px] px-4 bg-gray-100 border-2 border-transparent rounded-xl cursor-not-allowed text-[#2D2D2D]/60 font-mono"
              />
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => refetchBarcode()}
                  disabled={loadingBarcode}
                  title="Recarregar preview do código"
                  className="px-4 h-[52px] bg-[#F5F5F5] text-[#2D2D2D]/60 rounded-xl hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingBarcode ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            {!isEditing && (
              <p className="text-xs text-[#2D2D2D]/40 mt-1">
                Gerado automaticamente pelo sistema ao salvar.
              </p>
            )}
          </div>

          {/* Marca e Medida */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">Marca</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="Ex: Pirelli"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">Medida</label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => updateField('size', e.target.value)}
                placeholder="Ex: 175/70 R14"
                className={inputClass}
              />
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">Preço de custo (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price_cost}
                onChange={(e) => updateField('price_cost', e.target.value)}
                placeholder="0,00"
                className={inputClass}
                required
              />
              {getFirstError(errors, 'price_cost') && (
                <p className="text-[#EF4444] text-sm mt-1">{getFirstError(errors, 'price_cost')}</p>
              )}
            </div>
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">Preço de venda (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price_sale}
                onChange={(e) => updateField('price_sale', e.target.value)}
                placeholder="0,00"
                className={inputClass}
                required
              />
              {getFirstError(errors, 'price_sale') && (
                <p className="text-[#EF4444] text-sm mt-1">{getFirstError(errors, 'price_sale')}</p>
              )}
            </div>
          </div>

          {/* Quantidade e Estoque Mínimo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">
                {isEditing ? 'Quantidade' : 'Quantidade inicial *'}
              </label>
              <div className="flex items-center h-[52px] bg-[#F5F5F5] border-2 border-transparent rounded-xl overflow-hidden focus-within:border-[#F97316] transition-colors">
                <button
                  type="button"
                  onClick={() => updateField('quantity', Math.max(0, form.quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) =>
                    updateField('quantity', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="flex-1 h-full text-center bg-transparent focus:outline-none font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]"
                />
                <button
                  type="button"
                  onClick={() => updateField('quantity', form.quantity + 1)}
                  className="w-12 h-full flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">Estoque mínimo *</label>
              <div className="flex items-center h-[52px] bg-[#F5F5F5] border-2 border-transparent rounded-xl overflow-hidden focus-within:border-[#F97316] transition-colors">
                <button
                  type="button"
                  onClick={() => updateField('min_stock', Math.max(0, form.min_stock - 1))}
                  className="w-12 h-full flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={form.min_stock}
                  onChange={(e) =>
                    updateField('min_stock', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="flex-1 h-full text-center bg-transparent focus:outline-none font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]"
                />
                <button
                  type="button"
                  onClick={() => updateField('min_stock', form.min_stock + 1)}
                  className="w-12 h-full flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-[#2D2D2D] font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F97316] text-white font-medium hover:bg-[#F97316]/90 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
