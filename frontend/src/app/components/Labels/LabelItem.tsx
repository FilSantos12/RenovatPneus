import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import type { Product } from '@/app/types'

interface LabelItemProps {
  product: Product
  showPrice?: boolean
  showName?: boolean
  format?: 'CODE128' | 'EAN13'
}

export function LabelItem({
  product,
  showPrice = true,
  showName = true,
  format = 'CODE128',
}: LabelItemProps) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!barcodeRef.current || !product.barcode) return
    try {
      JsBarcode(barcodeRef.current, product.barcode, {
        format,
        width: 2,
        height: 55,
        displayValue: true,
        fontSize: 12,
        margin: 4,
      })
    } catch {
      // código inválido para o formato — ignora silenciosamente
    }
  }, [product.barcode, format])

  return (
    <div
      className="label-item border border-gray-300 bg-white flex flex-col items-center justify-center p-1"
      style={{ width: '302px', height: '151px' }}
    >
      {showName && (
        <p className="text-center text-xs font-medium leading-tight mb-1 line-clamp-2 px-1 w-full">
          {product.name}
          {product.size ? ` ${product.size}` : ''}
        </p>
      )}

      {product.barcode ? (
        <svg ref={barcodeRef} className="w-full" />
      ) : (
        <div className="w-full h-10 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-400">
          Sem código de barras
        </div>
      )}

      {showPrice && (
        <p className="text-center text-sm font-bold mt-1">
          R$ {Number(product.price_sale).toFixed(2).replace('.', ',')}
        </p>
      )}
    </div>
  )
}
