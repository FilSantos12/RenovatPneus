import { Lock } from 'lucide-react';
import { Link } from 'react-router';

export function AcessoNegado() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F5]">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-[#EF4444]" />
          </div>
          
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
            Acesso Negado
          </h1>
          
          <p className="text-[#2D2D2D]/60 mb-8">
            Você não tem permissão para acessar esta página. Entre em contato com um administrador se acredita que isso é um erro.
          </p>
          
          <Link
            to="/dashboard"
            className="inline-block px-8 py-4 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
