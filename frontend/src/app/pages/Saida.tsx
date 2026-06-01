import { useState } from 'react';
import { Search, Plus, Minus, Check, Camera, AlertCircle, X, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useCreateSale } from '@/hooks/useSales';
import { BarcodeScanner } from '../components/BarcodeScanner/BarcodeScanner';
import type { Product, Service } from '../types';
import { extractValidationErrors } from '@/lib/errors';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartService {
  service: Service;
  quantity: number;
}

export function Saida() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [showResults, setShowResults] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartServices, setCartServices] = useState<CartService[]>([]);

  const { data: productsData } = useProducts();
  const { data: servicesData } = useServices();
  const createSale = useCreateSale();

  const products: Product[] = productsData?.data ?? [];
  const services: Service[] = servicesData?.data ?? [];

  function handleScan(barcode: string) {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      setSelectedProduct(product);
      setScannerOpen(false);
      toast.success('Produto encontrado!');
    } else {
      toast.error(`Produto não encontrado para o código: ${barcode}`);
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode ?? '').includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    if (quantity > selectedProduct.quantity) {
      toast.error('Quantidade indisponível em estoque');
      return;
    }

    const existingIndex = cartItems.findIndex((item) => item.product.id === selectedProduct.id);

    if (existingIndex >= 0) {
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += quantity;
      setCartItems(updatedCart);
      toast.success('Quantidade atualizada no carrinho');
    } else {
      setCartItems([...cartItems, { product: selectedProduct, quantity }]);
      toast.success('Produto adicionado ao carrinho');
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
    toast.success('Produto removido do carrinho');
  };

  const handleAddService = (service: Service) => {
    const existingIndex = cartServices.findIndex((item) => item.service.id === service.id);

    if (existingIndex >= 0) {
      const updatedServices = [...cartServices];
      updatedServices[existingIndex].quantity += 1;
      setCartServices(updatedServices);
      toast.success('Quantidade de serviço atualizada');
    } else {
      setCartServices([...cartServices, { service, quantity: 1 }]);
      toast.success('Serviço adicionado');
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setCartServices(cartServices.filter((item) => item.service.id !== serviceId));
    toast.success('Serviço removido');
  };

  const handleUpdateServiceQuantity = (serviceId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveService(serviceId);
      return;
    }
    setCartServices(
      cartServices.map((item) =>
        item.service.id === serviceId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    const productsTotal = cartItems.reduce(
      (sum, item) => sum + item.product.price_sale * item.quantity,
      0
    );
    const servicesTotal = cartServices.reduce(
      (sum, item) => sum + item.service.price * item.quantity,
      0
    );
    return productsTotal + servicesTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0 && cartServices.length === 0) {
      toast.error('Adicione pelo menos um produto ou serviço');
      return;
    }

    try {
      await createSale.mutateAsync({
        customer_name: client || undefined,
        payment_method: paymentMethod,
        notes: notes || undefined,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price_sale,
        })),
        services: cartServices.map((item) => ({
          service_id: item.service.id,
          quantity: item.quantity,
          unit_price: item.service.price,
        })),
      });

      setCartItems([]);
      setCartServices([]);
      setSelectedProduct(null);
      setQuantity(1);
      setClient('');
      setNotes('');
      setPaymentMethod('pix');
    } catch (error) {
      extractValidationErrors(error);
    }
  };

  const insufficientStock = selectedProduct && quantity > selectedProduct.quantity;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
          Registrar Saída
        </h1>
        <p className="text-[#2D2D2D]/60">Remova produtos do estoque</p>
      </div>

      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              1. Adicionar Produtos
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

              {showResults && searchTerm && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto">
                  {filteredProducts.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className="w-full p-4 text-left hover:bg-[#F5F5F5] transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-[#2D2D2D]">{product.name}</p>
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
              onClick={() => setScannerOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#111111] text-white rounded-xl font-medium hover:bg-[#111111]/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Escanear Código de Barras
            </button>

            {selectedProduct && (
              <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444] rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
                        {selectedProduct.name}
                      </p>
                      <p className="text-[#2D2D2D]/60">
                        {selectedProduct.size} - {selectedProduct.brand}
                      </p>
                      <p className="text-sm text-[#2D2D2D]/60 mt-2">
                        Estoque: <strong>{selectedProduct.quantity}</strong> | Preço: <strong>R$ {selectedProduct.price_sale.toFixed(2)}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="text-[#2D2D2D]/60 hover:text-[#2D2D2D]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 h-10 text-center font-['Barlow_Condensed'] font-bold text-xl bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!!insufficientStock}
                      className="px-6 py-2 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#EF4444]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>

                  {insufficientStock && (
                    <div className="flex items-start gap-2 p-3 bg-white/50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#EF4444] font-medium text-sm">Estoque insuficiente!</p>
                        <p className="text-[#EF4444]/80 text-sm">
                          Disponível: {selectedProduct.quantity} unidades
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-medium text-[#2D2D2D] mb-3">Produtos no Carrinho:</h3>
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[#2D2D2D]">{item.product.name}</p>
                      <p className="text-sm text-[#2D2D2D]/60">
                        {item.quantity} x R$ {item.product.price_sale.toFixed(2)} = R$ {(item.product.price_sale * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="ml-3 p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
              2. Adicionar Serviços (opcional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {services.filter((s) => s.active).map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleAddService(service)}
                  className="p-4 bg-[#F5F5F5] hover:bg-[#22C55E]/10 hover:border-[#22C55E] border-2 border-transparent rounded-xl text-left transition-all"
                >
                  <p className="font-medium text-[#2D2D2D] mb-1">{service.name}</p>
                  <p className="text-sm text-[#2D2D2D]/60 mb-2">{service.description}</p>
                  <p className="font-['Barlow_Condensed'] font-bold text-[#22C55E]">
                    R$ {service.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>

            {cartServices.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-[#2D2D2D] mb-3">Serviços Adicionados:</h3>
                {cartServices.map((item) => (
                  <div
                    key={item.service.id}
                    className="flex items-center justify-between p-3 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[#2D2D2D]">{item.service.name}</p>
                      <p className="text-sm text-[#2D2D2D]/60">
                        {item.quantity} x R$ {item.service.price.toFixed(2)} = R$ {(item.service.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateServiceQuantity(item.service.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateServiceQuantity(item.service.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-[#22C55E] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(item.service.id)}
                        className="ml-2 p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exit Details */}
          {(cartItems.length > 0 || cartServices.length > 0) && (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
                  3. Dados da Saída
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#2D2D2D] font-medium mb-2">
                      Destino / Cliente
                    </label>
                    <input
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Nome do cliente ou destino (opcional)"
                      className="w-full h-14 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#EF4444] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[#2D2D2D] font-medium mb-2">
                      Forma de Pagamento *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-14 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#EF4444] transition-colors"
                      required
                    >
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="fiado">Fiado</option>
                    </select>
                  </div>

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

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
                  4. Confirmar Saída
                </h2>

                <div className="p-4 bg-[#F5F5F5] rounded-xl mb-6 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#2D2D2D]/60">Cliente:</span>
                      <span className="font-medium text-[#2D2D2D]">{client || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D2D2D]/60">Total de Produtos:</span>
                      <span className="font-medium text-[#2D2D2D]">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D2D2D]/60">Total de Serviços:</span>
                      <span className="font-medium text-[#2D2D2D]">
                        {cartServices.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#2D2D2D]/10">
                      <span className="text-[#2D2D2D]/60">Valor Total:</span>
                      <span className="font-['Barlow_Condensed'] font-bold text-[#22C55E] text-2xl">
                        R$ {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createSale.isPending || (cartItems.length === 0 && cartServices.length === 0)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#EF4444] text-white rounded-xl font-medium text-lg hover:bg-[#EF4444]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createSale.isPending ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" />
                      Confirmar Saída
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
