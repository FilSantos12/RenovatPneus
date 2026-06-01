import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Scan,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Tag,
  History,
  Users,
  LogOut,
  X,
  DollarSign,
  Wrench
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  roles: ['adm', 'operador'] },
    { path: '/financas',  icon: DollarSign,      label: 'Finanças',   roles: ['adm'] },
    { path: '/estoque',   icon: Package,          label: 'Estoque',    roles: ['adm', 'operador'] },
    { path: '/entrada',   icon: ArrowDownToLine,  label: 'Entrada',    roles: ['adm', 'operador'] },
    { path: '/saida',     icon: ArrowUpFromLine,  label: 'Venda',      roles: ['adm', 'operador'] },
    { path: '/servicos',  icon: Wrench,           label: 'Serviços',   roles: ['adm', 'operador'] },
    { path: '/etiquetas', icon: Tag,              label: 'Etiquetas',  roles: ['adm', 'operador'] },
    { path: '/scanner',   icon: Scan,             label: 'Escanear',   roles: ['adm', 'operador'] },
    { path: '/historico', icon: History,          label: 'Histórico',  roles: ['adm', 'operador'] },
    { path: '/usuarios',  icon: Users,            label: 'Usuários',   roles: ['adm'] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#111111] text-white z-50 lg:hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-2xl font-['Barlow_Condensed'] font-bold tracking-wide">
            RENOVAT PNEUS
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                  user?.role === 'adm'
                    ? 'bg-[#111111] border border-white text-white'
                    : 'bg-[#F97316] text-white'
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#F97316] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
