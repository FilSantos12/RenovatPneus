import { useState } from 'react';
import { Search, Eye, Edit, Printer, Plus, AlertTriangle, Check, Loader2, Trash2, X, Barcode, Tag, Ruler, DollarSign, Package } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import type { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ProductFormModal } from '../components/Products/ProductFormModal';

export function Estoque() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showFormModal, setShowFormModal] = useState(false);
  const [produtoVisualizando, setProdutoVisualizando] = useState<Product | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<Product | null>(null);
  const [produtoExcluindo, setProdutoExcluindo] = useState<Product | null>(null);

  const { data, isLoading, isError } = useProducts();
  const products: Product[] = data?.data ?? [];
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode ?? '').includes(searchTerm) ||
      product.size.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = !filterBrand || product.brand === filterBrand;

    let matchesStatus = true;
    if (filterStatus === 'OK') {
      matchesStatus = product.quantity >= product.min_stock;
    } else if (filterStatus === 'BAIXO') {
      matchesStatus = product.quantity > 0 && product.low_stock;
    } else if (filterStatus === 'ZERADO') {
      matchesStatus = product.quantity === 0;
    }

    return matchesSearch && matchesBrand && matchesStatus;
  });

  function handleConfirmDelete() {
    if (!produtoExcluindo) return;
    deleteProduct(produtoExcluindo.id, {
      onSuccess: () => setProdutoExcluindo(null),
      onError: () => setProdutoExcluindo(null),
    });
  }

  const getStatusBadge = (product: Product) => {
    if (product.quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EF4444] text-white text-sm font-medium rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          ZERADO
        </span>
      );
    }
    if (product.low_stock) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FBBF24] text-[#2D2D2D] text-sm font-medium rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          BAIXO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#22C55E] text-white text-sm font-medium rounded-lg">
        <Check className="w-4 h-4" />
        OK
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-[#EF4444]">
        Erro ao carregar produtos. Tente novamente.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Estoque
          </h1>
          <p className="text-[#2D2D2D]/60">{filteredProducts.length} produtos encontrados</p>
        </div>
        {user?.role === 'adm' && (
          <button
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Cadastrar Novo Pneu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full h-12 pl-12 pr-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>

          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
          >
            <option value="">Todas as marcas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
          >
            <option value="">Todos os status</option>
            <option value="OK">OK</option>
            <option value="BAIXO">Estoque Baixo</option>
            <option value="ZERADO">Zerado</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#111111] text-white">
                <th className="px-6 py-4 text-left font-medium">Código</th>
                <th className="px-6 py-4 text-left font-medium">Nome</th>
                <th className="px-6 py-4 text-left font-medium">Medida</th>
                <th className="px-6 py-4 text-left font-medium">Marca</th>
                <th className="px-6 py-4 text-center font-medium">Qtd.</th>
                <th className="px-6 py-4 text-center font-medium">Mín.</th>
                <th className="px-6 py-4 text-center font-medium">Status</th>
                <th className="px-6 py-4 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                  } hover:bg-[#F5F5F5] transition-colors`}
                >
                  <td className="px-6 py-4 text-[#2D2D2D]/60">{product.barcode ?? '-'}</td>
                  <td className="px-6 py-4 font-medium text-[#2D2D2D]">{product.name}</td>
                  <td className="px-6 py-4 text-[#2D2D2D]">{product.size}</td>
                  <td className="px-6 py-4 text-[#2D2D2D]">{product.brand}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-[#2D2D2D]/60">{product.min_stock}</td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(product)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setProdutoVisualizando(product)}
                        className="p-2 text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-lg transition-colors"
                        title="Visualizar produto"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {user?.role === 'adm' && (
                        <>
                          <button
                            onClick={() => setProdutoEditando(product)}
                            className="p-2 text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-lg transition-colors"
                            title="Editar produto"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setProdutoExcluindo(product)}
                            className="p-2 text-[#2D2D2D]/60 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate('/etiquetas', { state: { productId: product.id } })}
                        className="p-2 text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-lg transition-colors"
                        title="Imprimir etiqueta"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D] mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-[#2D2D2D]/60">{product.size}</p>
                <p className="text-sm text-[#2D2D2D] font-medium mt-1">{product.brand}</p>
              </div>
              {getStatusBadge(product)}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-[#F5F5F5] rounded-xl">
              <div>
                <p className="text-xs text-[#2D2D2D]/60 mb-1">Quantidade</p>
                <p className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
                  {product.quantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#2D2D2D]/60 mb-1">Mínimo</p>
                <p className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]/60">
                  {product.min_stock}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#2D2D2D]/60 mb-1">Código</p>
                <p className="text-sm text-[#2D2D2D]/60 truncate">{product.barcode ?? '-'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setProdutoVisualizando(product)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              {user?.role === 'adm' && (
                <>
                  <button
                    onClick={() => setProdutoEditando(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setProdutoExcluindo(product)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/etiquetas', { state: { productId: product.id } })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors"
              >
                <Printer className="w-4 h-4" />
                Etiqueta
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-[#2D2D2D]/40" />
          </div>
          <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-[#2D2D2D]/60">Tente ajustar os filtros de busca</p>
        </div>
      )}

      {/* Modal de Visualização */}
      {produtoVisualizando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#111111] px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-['Barlow_Condensed'] font-bold text-white leading-tight">
                  {produtoVisualizando.name}
                </h2>
                <p className="text-white/60 text-sm mt-1">{produtoVisualizando.brand} — {produtoVisualizando.size}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {getStatusBadge(produtoVisualizando)}
                <button
                  onClick={() => setProdutoVisualizando(null)}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Código de barras */}
              <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Barcode className="w-5 h-5 text-[#2D2D2D]/60" />
                </div>
                <div>
                  <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Código de barras</p>
                  <p className="font-medium text-[#2D2D2D] font-mono">{produtoVisualizando.barcode ?? '—'}</p>
                </div>
              </div>

              {/* Marca e Medida */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Tag className="w-5 h-5 text-[#2D2D2D]/60" />
                  </div>
                  <div>
                    <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Marca</p>
                    <p className="font-medium text-[#2D2D2D]">{produtoVisualizando.brand || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Ruler className="w-5 h-5 text-[#2D2D2D]/60" />
                  </div>
                  <div>
                    <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Medida</p>
                    <p className="font-medium text-[#2D2D2D]">{produtoVisualizando.size || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-[#2D2D2D]/60" />
                  </div>
                  <div>
                    <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Preço de custo</p>
                    <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
                      {produtoVisualizando.price_cost != null
                        ? `R$ ${produtoVisualizando.price_cost.toFixed(2)}`
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#22C55E]/10 rounded-xl">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#22C55E]/70 mb-0.5">Preço de venda</p>
                    <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#22C55E]">
                      R$ {produtoVisualizando.price_sale.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estoque */}
              <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Package className="w-5 h-5 text-[#2D2D2D]/60" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#2D2D2D]/50 mb-1">Estoque</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-['Barlow_Condensed'] font-bold text-2xl text-[#2D2D2D]">
                        {produtoVisualizando.quantity}
                      </span>
                      <span className="text-[#2D2D2D]/50 text-sm ml-1">em estoque</span>
                    </div>
                    <div className="h-6 w-px bg-[#2D2D2D]/10" />
                    <div>
                      <span className="font-['Barlow_Condensed'] font-bold text-2xl text-[#2D2D2D]/40">
                        {produtoVisualizando.min_stock}
                      </span>
                      <span className="text-[#2D2D2D]/40 text-sm ml-1">mínimo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setProdutoVisualizando(null)}
                className="w-full px-4 py-3 rounded-xl bg-gray-200 text-[#2D2D2D] font-medium hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {(showFormModal || produtoEditando) && (
        <ProductFormModal
          product={produtoEditando ?? undefined}
          onClose={() => {
            setShowFormModal(false);
            setProdutoEditando(null);
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {produtoExcluindo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
                Excluir produto
              </h2>
              <p className="text-[#2D2D2D]/60">
                Tem certeza que deseja excluir{' '}
                <strong className="text-[#2D2D2D]">"{produtoExcluindo.name}"</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setProdutoExcluindo(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-[#2D2D2D] font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EF4444] text-white font-medium hover:bg-[#EF4444]/90 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
