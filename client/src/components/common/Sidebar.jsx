import { useState, Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  DollarSign,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  X,
} from 'lucide-react';
import clsx from 'clsx';

const getNavigation = (role) => {
  const allNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Students', href: '/students', icon: GraduationCap, roles: ['admin', 'superadmin', 'faculty', 'hod'] },
    { name: 'Faculty', href: '/faculty', icon: Users, roles: ['admin', 'superadmin', 'hod'] },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Subjects', href: '/subjects', icon: BookOpen, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Timetable', href: '/timetable', icon: CalendarDays, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Results', href: '/results', icon: ClipboardList, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Assignments', href: '/assignments', icon: FileText, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Fees', href: '/fees', icon: DollarSign, roles: ['admin', 'superadmin', 'student'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'superadmin', 'hod'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'superadmin', 'faculty', 'hod', 'student'] },
  ];
  return allNav.filter(item => item.roles.includes(role));
};

const getSections = (nav) => {
  const main = nav.filter(n => ['Dashboard'].includes(n.name));
  const academic = nav.filter(n => ['Students', 'Faculty', 'Attendance', 'Subjects', 'Timetable', 'Results', 'Assignments'].includes(n.name));
  const finance = nav.filter(n => ['Fees'].includes(n.name));
  const system = nav.filter(n => ['Notifications', 'Analytics', 'Settings'].includes(n.name));

  const sections = [];
  if (main.length) sections.push({ title: 'Main', items: main });
  if (academic.length) sections.push({ title: 'Academic', items: academic });
  if (finance.length) sections.push({ title: 'Finance', items: finance });
  if (system.length) sections.push({ title: 'System', items: system });
  return sections;
};

import { useAuth } from '../../context/AuthContext';

function SidebarContent({ collapsed, onCollapse }) {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || 'student';
  const nav = getNavigation(role);
  const sections = getSections(nav);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-14 px-4 border-b border-surface-200 dark:border-dark-700 shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-tight">
                TechVerse
              </span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400 leading-tight">
                University ERP
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
        )}
        {onCollapse && !collapsed && (
          <button
            onClick={onCollapse}
            className="p-1 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 dark:hover:text-surface-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={clsx(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-100',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-dark-800',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className={clsx('h-4 w-4 shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} />
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 px-4 py-3 border-t border-surface-200 dark:border-dark-700">
          <p className="text-[10px] text-surface-400 dark:text-surface-500 text-center">
            v1.0.0 • TechVerse ERP
          </p>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30',
          'bg-white dark:bg-dark-900 border-r border-surface-200 dark:border-dark-700',
          'transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile Sidebar */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog onClose={() => setMobileOpen(false)} className="relative z-40 lg:hidden">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 left-0 w-60 bg-white dark:bg-dark-900 border-r border-surface-200 dark:border-dark-700">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent collapsed={false} />
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
