import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Scan,
  Package,
  ArrowUpFromLine,
  Tag,
  History,
  Users,
  LogOut,
  DollarSign,
  Wrench,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Auto-collapse on tablet/notebook size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  roles: ['adm', 'operador'] },
    { path: '/financas',  icon: DollarSign,      label: 'Finanças',   roles: ['adm'] },
    { path: '/estoque',   icon: Package,          label: 'Entrada/Estoque', roles: ['adm', 'operador'] },
    { path: '/saida',     icon: ArrowUpFromLine,  label: 'Venda',      roles: ['adm', 'operador'] },
    { path: '/servicos',  icon: Wrench,           label: 'Serviços',   roles: ['adm', 'operador'] },
    { path: '/etiquetas', icon: Tag,              label: 'Etiquetas',  roles: ['adm', 'operador'] },
    { path: '/scanner',   icon: Scan,             label: 'Escanear',   roles: ['adm', 'operador'] },
    { path: '/historico',  icon: History,    label: 'Histórico',   roles: ['adm', 'operador'] },
    { path: '/relatorios', icon: BarChart2,  label: 'Relatórios',  roles: ['adm'] },
    { path: '/usuarios',   icon: Users,      label: 'Usuários',    roles: ['adm'] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside
        className={`hidden lg:flex fixed top-0 left-0 flex-col h-screen bg-[#111111] text-white transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          {isCollapsed ? (
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center">
                <span className="text-white font-['Barlow_Condensed'] text-xl font-bold">R</span>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-['Barlow_Condensed'] font-bold tracking-wide">
              RENOVAT PNEUS
            </h1>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          {isCollapsed ? (
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name.charAt(0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    user?.role === 'adm'
                      ? 'bg-[#111111] border border-white text-white'
                      : 'bg-[#F97316] text-white'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#F97316] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white w-full transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
          {!isCollapsed && (
            <div className="px-3 pt-3 border-t border-white/10 mt-2">
              <p className="text-[10px] text-white/30 leading-relaxed text-center">
                v1.0.2 · Desenvolvido por{' '}
                <a
                  href="https://filsantos12.github.io/MyPortifolio/index.html#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F97316] transition-colors"
                >
                  Filipe Santos
                </a>
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
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