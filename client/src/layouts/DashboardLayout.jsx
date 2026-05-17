import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import clsx from 'clsx';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed(!collapsed);
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-950">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={clsx(
          'transition-all duration-200 ease-in-out',
          collapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        <Navbar collapsed={collapsed} onMenuClick={handleMenuClick} />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
