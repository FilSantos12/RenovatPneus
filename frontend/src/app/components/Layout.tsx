import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <MobileHeader />
      <main className="pt-16 lg:pt-0 lg:ml-20 xl:ml-64 pb-safe">
        <Outlet />
      </main>
    </div>
  );
}