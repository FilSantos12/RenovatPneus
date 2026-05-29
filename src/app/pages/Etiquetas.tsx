import { useState } from 'react';
import { Printer, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function Etiquetas() {
  const [productName, setProductName] = useState('Pneu Aro 15');
  const [size, setSize] = useState('195/55 R15');
  const [brand, setBrand] = useState('Pirelli');
  const [code, setCode] = useState('7891234567892');
  const [price, setPrice] = useState('450.00');
  const [showLogo, setShowLogo] = useState(true);
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [copies, setCopies] = useState(1);
  const [showPreview, setShowPreview] = useState(true);

  const handlePrint = () => {
    toast.success(`${copies} etiqueta(s) enviada(s) para impressão!`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
          Gerar Etiquetas
        </h1>
        <p className="text-[#2D2D2D]/60">
          Configure e imprima etiquetas para seus produtos
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              Informações da Etiqueta
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">
                  Medida do Pneu
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Ex: 175/70 R13"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">
                  Preço (opcional)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                <span className="text-[#2D2D2D] font-medium">Incluir logo da empresa</span>
                <button
                  type="button"
                  onClick={() => setShowLogo(!showLogo)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    showLogo ? 'bg-[#F97316]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      showLogo ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              Opções de Impressão
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#2D2D2D] font-medium mb-3">
                  Tamanho da Etiqueta
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'Pequena', size: '5x3cm' },
                    { value: 'medium', label: 'Média', size: '10x5cm' },
                    { value: 'large', label: 'Grande', size: '10x8cm' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLabelSize(option.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        labelSize === option.value
                          ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-[#2D2D2D]/60">{option.size}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">
                  Número de Cópias
                </label>
                <input
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Mobile Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden w-full flex items-center justify-center gap-2 py-3 bg-[#111111] text-white rounded-xl font-medium hover:bg-[#111111]/90 transition-colors"
          >
            {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {showPreview ? 'Ocultar' : 'Ver'} Prévia
          </button>
        </div>

        {/* Preview */}
        {(showPreview || window.innerWidth >= 1024) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              Prévia da Etiqueta
            </h2>

            <div className="flex items-center justify-center p-8 bg-[#F5F5F5] rounded-xl">
              <div
                className={`bg-white border-2 border-dashed border-[#2D2D2D]/20 rounded-lg p-4 ${
                  labelSize === 'small'
                    ? 'w-48'
                    : labelSize === 'medium'
                    ? 'w-64'
                    : 'w-80'
                }`}
              >
                {showLogo && (
                  <div className="text-center mb-3">
                    <div className="inline-block px-3 py-1 bg-[#111111] rounded text-white text-xs font-['Barlow_Condensed'] font-bold">
                      RENOVAT PNEUS
                    </div>
                  </div>
                )}
                <div className="text-center space-y-2">
                  <p className="font-['Barlow_Condensed'] font-bold text-lg">{productName}</p>
                  <p className="text-[#2D2D2D]/60 text-sm">{size}</p>
                  <p className="text-[#2D2D2D] font-medium">{brand}</p>
                  
                  {/* Barcode Placeholder */}
                  <div className="my-3 bg-white border border-[#2D2D2D]/20">
                    <div className="h-12 flex items-center justify-center space-x-0.5 px-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${
                            i % 2 === 0 ? 'w-1' : 'w-0.5'
                          } h-full bg-[#111111]`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center pb-1">{code}</p>
                  </div>

                  {price && (
                    <p className="text-xl font-['Barlow_Condensed'] font-bold text-[#F97316]">
                      R$ {price}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-xl text-sm text-[#2D2D2D]/80">
              💡 Certifique-se de que a impressora está conectada antes de imprimir
            </div>
          </div>
        )}
      </div>

      {/* Print Button - Fixed on Mobile */}
      <div className="lg:relative fixed bottom-0 left-0 right-0 p-4 bg-white lg:bg-transparent border-t lg:border-0 border-gray-100">
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#F97316] text-white rounded-xl font-medium text-lg hover:bg-[#F97316]/90 transition-colors"
        >
          <Printer className="w-6 h-6" />
          Imprimir Etiqueta
        </button>
      </div>
    </div>
  );
}
