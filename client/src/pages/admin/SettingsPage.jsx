import { useState } from 'react';
import { Settings as SettingsIcon, Palette, Shield, Bell } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [general, setGeneral] = useState({
    institutionName: 'TechVerse University',
    email: user?.email || 'admin@techverse.edu',
    phone: '+91 98765 43210',
    website: 'www.techverse.edu',
    address: '123 Tech Park, Bangalore, Karnataka 560001',
  });

  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (security.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password updated successfully');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const themes = [
    { value: 'light', label: 'Light', desc: 'Clean, bright interface' },
    { value: 'dark', label: 'Dark', desc: 'Easy on the eyes' },
    { value: 'system', label: 'System', desc: 'Match OS preference' },
  ];

  const tabs = [
    { label: 'General', icon: SettingsIcon, content: (
      <Card>
        <form onSubmit={handleSaveGeneral}>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">Institution Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Institution Name" value={general.institutionName} onChange={(e) => setGeneral({...general, institutionName: e.target.value})} />
            <Input label="Email" value={general.email} onChange={(e) => setGeneral({...general, email: e.target.value})} />
            <Input label="Phone" value={general.phone} onChange={(e) => setGeneral({...general, phone: e.target.value})} />
            <Input label="Website" value={general.website} onChange={(e) => setGeneral({...general, website: e.target.value})} />
            <div className="sm:col-span-2">
              <Input label="Address" value={general.address} onChange={(e) => setGeneral({...general, address: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end mt-6"><Button type="submit">Save Changes</Button></div>
        </form>
      </Card>
    )},
    { label: 'Appearance', icon: Palette, content: (
      <Card>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button key={t.value} onClick={() => { setTheme(t.value); toast.success(`Theme set to ${t.label}`); }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${theme === t.value ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20' : 'border-surface-200 dark:border-dark-700 hover:border-surface-300 dark:hover:border-dark-600'}`}>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{t.label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </Card>
    )},
    { label: 'Security', icon: Shield, content: (
      <Card>
        <form onSubmit={handleChangePassword}>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">Change Password</h3>
          <div className="space-y-4 max-w-sm">
            <Input label="Current Password" type="password" value={security.currentPassword} onChange={(e) => setSecurity({...security, currentPassword: e.target.value})} required />
            <Input label="New Password" type="password" value={security.newPassword} onChange={(e) => setSecurity({...security, newPassword: e.target.value})} required />
            <Input label="Confirm New Password" type="password" value={security.confirmPassword} onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})} required />
          </div>
          <div className="flex justify-end mt-6"><Button type="submit">Update Password</Button></div>
        </form>
      </Card>
    )},
    { label: 'Notifications', icon: Bell, content: (
      <Card>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {['Email notifications', 'Push notifications', 'Fee payment alerts', 'Attendance alerts', 'Assignment reminders'].map((label) => (
            <label key={label} className="flex items-center justify-between py-2">
              <span className="text-sm text-surface-700 dark:text-surface-300">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
            </label>
          ))}
        </div>
        <div className="flex justify-end mt-6"><Button onClick={() => toast.success('Preferences saved')}>Save Preferences</Button></div>
      </Card>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your ERP configuration and preferences.</p>
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
