import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Sidebar />
      <MobileHeader />
      <main className="pt-16 lg:pt-0 lg:ml-20 xl:ml-64 pb-safe flex-1">
        <Outlet />
      </main>
      <footer className="lg:ml-20 xl:ml-64 py-3 px-6 border-t border-gray-100 text-center text-xs text-[#2D2D2D]/40">
        Desenvolvido por{' '}
        <a
          href="https://filsantos12.github.io/MyPortifolio/index.html#"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#F97316] transition-colors"
        >
          Filipe Santos
        </a>
        {' '}· v1.0.0
      </footer>
    </div>
  );
}