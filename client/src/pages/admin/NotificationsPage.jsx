import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { notificationAPI } from '../../api/services';
import toast from 'react-hot-toast';

const typeConfig = {
  info: { icon: Info, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50', variant: 'primary' },
  warning: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-500/10', variant: 'warning' },
  success: { icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10', variant: 'success' },
  danger: { icon: XCircle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10', variant: 'danger' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all' });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.data.notifications);
    } catch (e) { setNotifications([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notificationAPI.create(form);
      toast.success('Notification sent');
      setShowModal(false);
      setForm({ title: '', message: '', type: 'info', target: 'all' });
      fetchNotifications();
    } catch (e) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Notifications</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Send and manage institutional notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => notificationAPI.markAllRead().then(() => toast.success('Done'))}><CheckCheck className="h-3.5 w-3.5" /> Mark all read</Button>
          <Button size="sm" onClick={() => setShowModal(true)}><Plus className="h-3.5 w-3.5" /> New</Button>
        </div>
      </div>
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <Card key={i}><div className="h-16 bg-surface-100 dark:bg-dark-800 rounded animate-pulse" /></Card>) : notifications.length === 0 ? (
          <Card className="text-center py-12"><Bell className="h-10 w-10 text-surface-300 mx-auto mb-3" /><p className="text-sm text-surface-500">No notifications</p></Card>
        ) : notifications.map((n) => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          const Icon = cfg.icon;
          return (
            <Card key={n._id} hover>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded-lg ${cfg.bg} shrink-0`}><Icon className={`h-4 w-4 ${cfg.color}`} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{n.title}</p>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{n.message}</p>
                    </div>
                    <Badge variant={cfg.variant} size="sm">{n.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                    <span>{timeAgo(n.createdAt)}</span><span>•</span><span className="capitalize">{n.target}</span>
                    {n.createdBy?.name && <><span>•</span><span>{n.createdBy.name}</span></>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Notification" size="md">
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required rows={3} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Type</label>
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="danger">Danger</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Target</label>
                <select value={form.target} onChange={(e) => setForm({...form, target: e.target.value})} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="all">All</option><option value="students">Students</option><option value="faculty">Faculty</option>
                </select>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Send</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
