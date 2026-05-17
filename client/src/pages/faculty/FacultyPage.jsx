import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Download, Filter, Pencil, Trash2 } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { facultyAPI, departmentAPI } from '../../api/services';
import toast from 'react-hot-toast';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', role: 'faculty' });

  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await facultyAPI.getAll();
      setFaculty(data.data.faculty);
    } catch (e) {
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data } = await departmentAPI.getAll();
      setDepartments(data.data.departments);
    } catch (e) {}
  }, []);

  useEffect(() => { fetchFaculty(); fetchDepartments(); }, [fetchFaculty, fetchDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await facultyAPI.update(editing._id, form);
        toast.success('Faculty updated');
      } else {
        await facultyAPI.create(form);
        toast.success('Faculty created');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', email: '', phone: '', department: '', role: 'faculty' });
      fetchFaculty();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setEditing(f);
    setForm({ name: f.name, email: f.email, phone: f.phone || '', department: f.department?._id || '', role: f.role });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await facultyAPI.delete(deleting._id);
      toast.success('Faculty deleted');
      setShowDeleteModal(false);
      setDeleting(null);
      fetchFaculty();
    } catch (e) { toast.error('Delete failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      header: 'Faculty',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-accent-600 dark:text-accent-400">
              {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">{row.name}</p>
            <p className="text-xs text-surface-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Department', accessor: 'department', cell: (row) => row.department?.name || '—' },
    { header: 'Role', accessor: 'role', cell: (row) => <Badge variant={row.role === 'hod' ? 'primary' : 'default'}>{row.role === 'hod' ? 'HOD' : 'Faculty'}</Badge> },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => <Badge variant={row.isActive ? 'success' : 'warning'} dot>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      header: '', accessor: 'actions', sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleting(row); setShowDeleteModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Faculty</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage faculty members and their allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5" /> Filters</Button>
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', department: '', role: 'faculty' }); setShowModal(true); }}><Plus className="h-3.5 w-3.5" /> Add Faculty</Button>
        </div>
      </div>

      <Table columns={columns} data={faculty} searchable searchPlaceholder="Search faculty by name, department..." pageSize={10} loading={loading} emptyIcon={Users} emptyMessage="No faculty found" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Faculty' : 'Add New Faculty'} size="md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department</label>
              <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Role</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="faculty">Faculty</option>
                <option value="hod">HOD</option>
              </select>
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add Faculty'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Faculty" size="sm">
        <p className="text-sm text-surface-600 dark:text-surface-400">Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" loading={saving} onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
