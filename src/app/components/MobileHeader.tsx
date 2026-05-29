import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { MobileDrawer } from './MobileDrawer';

export function MobileHeader() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] text-white flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-['Barlow_Condensed'] font-bold tracking-wide">
          RENOVAT PNEUS
        </h1>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center"
        >
          <span className="text-white text-sm font-bold">
            {user?.name.charAt(0)}
          </span>
        </button>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F97316]/10 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-8 h-8 text-[#F97316]" />
              </div>
              <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
                Deseja realmente sair?
              </h3>
              <p className="text-[#2D2D2D]/60 mb-6">
                Você será redirecionado para a tela de login.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-[#2D2D2D] font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F97316] text-white font-medium hover:bg-[#F97316]/90 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
