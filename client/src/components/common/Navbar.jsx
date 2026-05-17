import { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Menu,
  ChevronRight,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Dropdown from '../ui/Dropdown';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ collapsed, onMenuClick }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const themeOptions = [
    { label: 'Light', icon: Sun, value: 'light' },
    { label: 'Dark', icon: Moon, value: 'dark' },
    { label: 'System', icon: Monitor, value: 'system' },
  ];

  const profileItems = [
    {
      label: 'My Profile',
      icon: User,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => toast('Help & Support module coming soon!', { icon: '🛠️' }),
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: LogOut,
      onClick: logout,
      danger: true,
    },
  ];

  const currentUser = user || {
    name: 'Admin User',
    email: 'admin@techverse.edu',
    role: 'Admin',
    avatar: null,
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-20 h-14 flex items-center justify-between gap-4 px-4 lg:px-6',
        'bg-white/80 dark:bg-dark-950/80 backdrop-blur-md',
        'border-b border-surface-200 dark:border-dark-700'
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-dark-800 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Collapse toggle for desktop */}
      <button
        onClick={onMenuClick}
        className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 dark:hover:text-surface-300 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRight className={clsx('h-4 w-4 transition-transform duration-200', !collapsed && 'rotate-180')} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search anything..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={clsx(
              'w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border',
              'bg-surface-50 dark:bg-dark-800',
              'text-surface-900 dark:text-surface-100',
              'placeholder:text-surface-400 dark:placeholder:text-surface-500',
              'focus:outline-none transition-all duration-150',
              searchFocused
                ? 'border-primary-300 ring-2 ring-primary-500/20 dark:border-primary-700 dark:ring-primary-400/10'
                : 'border-surface-200 dark:border-dark-700'
            )}
          />
          <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-surface-400 bg-surface-100 dark:bg-dark-700 dark:text-surface-500 rounded border border-surface-200 dark:border-dark-600">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-dark-800 transition-colors">
              {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          }
          items={themeOptions.map((opt) => ({
            label: opt.label,
            icon: opt.icon,
            onClick: () => setTheme(opt.value),
          }))}
        />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-dark-800 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-dark-950" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-surface-200 dark:bg-dark-700 mx-1" />

        {/* Profile */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-800 transition-colors">
              <div className="h-7 w-7 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-surface-900 dark:text-surface-100 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-surface-500 dark:text-surface-400 leading-tight">
                  {currentUser.role}
                </p>
              </div>
            </button>
          }
          items={profileItems}
        />
      </div>
    </header>
  );
}
