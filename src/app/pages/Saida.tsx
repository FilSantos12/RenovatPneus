import { useState } from 'react';
import { Search, Plus, Minus, Check, Camera, AlertCircle } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { Product } from '../types';
import { toast } from 'sonner';

export function Saida() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    if (quantity > selectedProduct.quantity) {
      toast.error('Quantidade indisponível em estoque');
      return;
    }

    toast.success(
      `Saída de ${quantity} ${selectedProduct.description} registrada com sucesso!`
    );

    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setClient('');
    setNotes('');
  };

  const insufficientStock = selectedProduct && quantity > selectedProduct.quantity;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
          Registrar Saída
        </h1>
        <p className="text-[#2D2D2D]/60">
          Remova produtos do estoque
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              1. Identificar Produto
            </h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Buscar por nome, código ou marca..."
                className="w-full h-14 pl-12 pr-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#EF4444] transition-colors"
              />
              
              {/* Search Results */}
              {showResults && searchTerm && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto">
                  {filteredProducts.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className="w-full p-4 text-left hover:bg-[#F5F5F5] transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-[#2D2D2D]">{product.description}</p>
                      <p className="text-sm text-[#2D2D2D]/60">
                        {product.size} - {product.brand} - Estoque: {product.quantity}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#111111] text-white rounded-xl font-medium hover:bg-[#111111]/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Escanear Código de Barras
            </button>

            {/* Selected Product Preview */}
            {selectedProduct && (
              <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444] rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
                      {selectedProduct.description}
                    </p>
                    <p className="text-[#2D2D2D]/60">
                      {selectedProduct.size} - {selectedProduct.brand}
                    </p>
                    <p className="text-sm text-[#2D2D2D]/60 mt-2">
                      Estoque disponível: <strong>{selectedProduct.quantity}</strong> unidades
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="text-[#2D2D2D]/60 hover:text-[#2D2D2D]"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exit Details */}
          {selectedProduct && (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
                  2. Dados da Saída
                </h2>

                <div className="space-y-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[#2D2D2D] font-medium mb-3">
                      Quantidade
                    </label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-14 h-14 bg-[#F5F5F5] rounded-xl flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-32 h-14 text-center text-3xl font-['Barlow_Condensed'] font-bold bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                        min="1"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-14 h-14 bg-[#F5F5F5] rounded-xl flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    
                    {insufficientStock && (
                      <div className="mt-3 p-3 bg-[#EF4444]/10 border border-[#EF4444] rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#EF4444] font-medium">Atenção: estoque insuficiente!</p>
                          <p className="text-[#EF4444]/80 text-sm">
                            Disponível: {selectedProduct.quantity} unidades
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Client */}
                  <div>
                    <label className="block text-[#2D2D2D] font-medium mb-2">
                      Destino / Cliente
                    </label>
                    <input
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Nome do cliente ou destino"
                      className="w-full h-14 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#EF4444] transition-colors"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-[#2D2D2D] font-medium mb-2">
                      Data de Saída
                    </label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full h-14 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#EF4444] transition-colors"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[#2D2D2D] font-medium mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Informações adicionais..."
                      className="w-full h-24 px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#EF4444] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
                  3. Confirmar Saída
                </h2>
                
                <div className="p-4 bg-[#F5F5F5] rounded-xl mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#2D2D2D]/60">Produto:</span>
                      <span className="font-medium text-[#2D2D2D]">{selectedProduct.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D2D2D]/60">Quantidade:</span>
                      <span className="font-['Barlow_Condensed'] font-bold text-[#EF4444] text-lg">
                        -{quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D2D2D]/60">Cliente:</span>
                      <span className="font-medium text-[#2D2D2D]">{client || '-'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#2D2D2D]/10">
                      <span className="text-[#2D2D2D]/60">Novo estoque:</span>
                      <span className="font-['Barlow_Condensed'] font-bold text-[#2D2D2D] text-lg">
                        {selectedProduct.quantity - quantity}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={insufficientStock}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#EF4444] text-white rounded-xl font-medium text-lg hover:bg-[#EF4444]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-6 h-6" />
                  Confirmar Saída
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
