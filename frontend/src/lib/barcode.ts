import JsBarcode from 'jsbarcode'

export interface BarcodeOptions {
  format?: 'CODE128' | 'EAN13' | 'EAN8' | 'CODE39'
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
}

export function generateBarcodeSVG(value: string, options: BarcodeOptions = {}): string {
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')

  JsBarcode(svg, value, {
    format: options.format ?? 'CODE128',
    width: options.width ?? 2,
    height: options.height ?? 50,
    displayValue: options.displayValue ?? true,
    fontSize: options.fontSize ?? 12,
    margin: 4,
    background: '#ffffff',
    lineColor: '#000000',
  })

  return svg.outerHTML
}
