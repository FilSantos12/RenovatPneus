import { useState } from 'react';
import { ScanLine, Plus, Minus, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCreateMovement } from '@/hooks/useMovements';
import { BarcodeScanner } from '../components/BarcodeScanner/BarcodeScanner';
import type { Product } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type MovementType = 'entrada' | 'saida'

export function Scanner() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showMovementType, setShowMovementType] = useState(false);
  const [movementType, setMovementType] = useState<MovementType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: productsData } = useProducts();
  const products: Product[] = productsData?.data ?? [];
  const createMovement = useCreateMovement();

  const handleProductScanned = (code: string) => {
    const product = products.find((p) => p.barcode === code);
    if (product) {
      setScannedProduct(product);
      setShowMovementType(true);
      setScannerOpen(false);
      toast.success('Produto encontrado!');
    } else {
      toast.error(`Produto não encontrado: ${code}`);
    }
  };

  const handleMovementTypeSelect = (type: MovementType) => {
    setMovementType(type);
    setShowMovementType(false);
  };

  const handleConfirm = async () => {
    if (!scannedProduct || !movementType) return;

    await createMovement.mutateAsync({
      product_id: scannedProduct.id,
      type: movementType,
      quantity,
      notes: notes || undefined,
    });

    handleReset();
  };

  const handleReset = () => {
    setScannedProduct(null);
    setMovementType(null);
    setQuantity(1);
    setNotes('');
    setShowMovementType(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
          Leitor de Código de Barras
        </h1>
        <p className="text-[#2D2D2D]/60">
          Escaneie o código de barras do produto para registrar uma movimentação
        </p>
      </div>

      {!scannedProduct && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-32 h-32 bg-[#F97316]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine className="w-16 h-16 text-[#F97316]" />
            </div>
            <h2 className="text-2xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              Pronto para escanear
            </h2>
            <p className="text-[#2D2D2D]/60 mb-8">
              Use a câmera (mobile) ou o leitor USB (desktop) para identificar o pneu
            </p>
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#F97316] text-white rounded-xl font-medium text-lg hover:bg-[#F97316]/90 transition-colors mx-auto"
            >
              <ScanLine className="w-6 h-6" />
              Escanear Código
            </button>
          </div>
        </div>
      )}

      {showMovementType && scannedProduct && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-2xl mx-auto"
        >
          <div className="mb-6">
            <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
              Produto Identificado
            </h3>
            <div className="p-4 bg-[#F5F5F5] rounded-xl">
              <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
                {scannedProduct.name}
              </p>
              <p className="text-[#2D2D2D]/60">{scannedProduct.size} - {scannedProduct.brand}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-[#2D2D2D]/60">Estoque atual:</span>
                <span className="text-xl font-['Barlow_Condensed'] font-bold text-[#F97316]">
                  {scannedProduct.quantity}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleMovementTypeSelect('entrada')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-all group"
            >
              <div className="w-16 h-16 bg-[#22C55E]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-lg">Registrar ENTRADA</span>
            </button>

            <button
              onClick={() => handleMovementTypeSelect('saida')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all group"
            >
              <div className="w-16 h-16 bg-[#EF4444]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <Minus className="w-8 h-8" />
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-lg">Registrar SAÍDA</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="w-full mt-4 py-3 text-[#2D2D2D]/60 hover:bg-[#F5F5F5] rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </motion.div>
      )}

      {movementType && scannedProduct && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-2xl mx-auto"
        >
          <div className="mb-6">
            <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
              Confirmar {movementType === 'entrada' ? 'Entrada' : 'Saída'}
            </h3>
            <p className="text-[#2D2D2D]/60">{scannedProduct.name}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-3">Quantidade</label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 bg-[#F5F5F5] rounded-xl flex items-center justify-center hover:bg-[#F97316] hover:text-white transition-colors"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 h-14 text-center text-3xl font-['Barlow_Condensed'] font-bold bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 bg-[#F5F5F5] rounded-xl flex items-center justify-center hover:bg-[#F97316] hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {movementType === 'saida' && quantity > scannedProduct.quantity && (
                <div className="mt-3 p-3 bg-[#EF4444]/10 border border-[#EF4444] rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#EF4444] font-medium">Atenção: estoque insuficiente!</p>
                    <p className="text-[#EF4444]/80 text-sm">
                      Disponível: {scannedProduct.quantity} unidades
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione informações adicionais..."
                className="w-full h-24 px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-4 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={createMovement.isPending || (movementType === 'saida' && quantity > scannedProduct.quantity)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-colors ${
                  movementType === 'entrada'
                    ? 'bg-[#22C55E] text-white hover:bg-[#22C55E]/90'
                    : 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createMovement.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Confirmar {movementType === 'entrada' ? 'Entrada' : 'Saída'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleProductScanned}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
