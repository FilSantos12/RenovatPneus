import { useState } from 'react';
import { Search, Plus, Edit, Trash2, X, Check, DollarSign, Loader2 } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import type { Service } from '../types';
import { extractValidationErrors, getFirstError } from '@/lib/errors';

export function Servicos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    price_cost: '',
    active: true,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const { data, isLoading, isError } = useServices();
  const services: Service[] = data?.data ?? [];
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description ?? '',
        price: service.price.toString(),
        price_cost: service.price_cost != null ? service.price_cost.toString() : '',
        active: service.active,
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', price_cost: '', active: true });
    }
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', price_cost: '', active: true });
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      price_cost: formData.price_cost ? parseFloat(formData.price_cost) : undefined,
      active: formData.active,
    };

    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService.id, ...payload });
      } else {
        await createService.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (error) {
      setValidationErrors(extractValidationErrors(error));
    }
  };

  const handleDelete = async (service: Service) => {
    if (confirm(`Deseja realmente excluir o serviço "${service.name}"?`)) {
      await deleteService.mutateAsync(service.id);
    }
  };

  const isPending = createService.isPending || updateService.isPending;

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
        Erro ao carregar serviços. Tente novamente.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Serviços
          </h1>
          <p className="text-[#2D2D2D]/60">Gerencie os serviços oferecidos</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-3 bg-[#22C55E] text-white rounded-xl font-medium hover:bg-[#22C55E]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar serviço..."
            className="w-full h-14 pl-12 pr-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-[#2D2D2D]/40">Nenhum serviço encontrado</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                service.active ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Barlow_Condensed'] font-bold text-xl text-[#2D2D2D] mb-1">
                    {service.name}
                  </h3>
                  <p className="text-[#2D2D2D]/60 text-sm line-clamp-2">
                    {service.description}
                  </p>
                </div>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    service.active
                      ? 'bg-[#22C55E]/10 text-[#22C55E]'
                      : 'bg-gray-200 text-[#2D2D2D]/60'
                  }`}
                >
                  {service.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-[#2D2D2D]">
                  <div className="w-8 h-8 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#2D2D2D]/60">Preço</p>
                    <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#22C55E]">
                      R$ {service.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                {service.price_cost != null && (
                  <div className="flex items-center gap-2 text-[#2D2D2D]">
                    <div className="w-8 h-8 bg-[#6366f1]/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4" style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#2D2D2D]/60">Custo de execução</p>
                      <p className="font-['Barlow_Condensed'] font-bold text-lg" style={{ color: '#6366f1' }}>
                        R$ {service.price_cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F97316]/10 text-[#F97316] rounded-lg font-medium hover:bg-[#F97316]/20 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  disabled={deleteService.isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] rounded-lg font-medium hover:bg-[#EF4444]/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Nome do Serviço *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Montagem de Pneu"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                  required
                />
                {getFirstError(validationErrors, 'name') && (
                  <p className="text-[#EF4444] text-sm mt-1">{getFirstError(validationErrors, 'name')}</p>
                )}
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o serviço..."
                  className="w-full h-24 px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                  required
                />
                {getFirstError(validationErrors, 'price') && (
                  <p className="text-[#EF4444] text-sm mt-1">{getFirstError(validationErrors, 'price')}</p>
                )}
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Custo de execução (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_cost}
                  onChange={(e) => setFormData({ ...formData, price_cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                />
                {getFirstError(validationErrors, 'price_cost') && (
                  <p className="text-[#EF4444] text-sm mt-1">{getFirstError(validationErrors, 'price_cost')}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-[#2D2D2D]/20 text-[#22C55E] focus:ring-[#22C55E]"
                />
                <label htmlFor="active" className="text-[#2D2D2D] font-medium cursor-pointer">
                  Serviço ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-[#2D2D2D] font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#22C55E] text-white font-medium hover:bg-[#22C55E]/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {editingService ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
