import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { subjectAPI, departmentAPI, facultyAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function SubjectsPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdminOrHOD = ['admin', 'superadmin', 'hod'].includes(user?.role);

  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', department: '', semester: '', credits: '', type: 'theory', faculty: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, deptRes, facRes] = await Promise.all([subjectAPI.getAll(), departmentAPI.getAll(), facultyAPI.getAll()]);
      setSubjects(subRes.data.data.subjects);
      setDepartments(deptRes.data.data.departments);
      setFacultyList(facRes.data.data.faculty);
    } catch (e) { setSubjects([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, semester: Number(form.semester), credits: Number(form.credits) };
      if (editing) { await subjectAPI.update(editing._id, payload); toast.success('Subject updated'); }
      else { await subjectAPI.create(payload); toast.success('Subject created'); }
      setShowModal(false); setEditing(null); fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try { await subjectAPI.delete(deleting._id); toast.success('Subject deleted'); setShowDeleteModal(false); fetchAll(); }
    catch (e) { toast.error('Delete failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { header: 'Code', accessor: 'code', cellClassName: 'font-mono text-xs font-semibold' },
    { header: 'Subject Name', accessor: 'name', cell: (row) => <span className="font-medium text-surface-900 dark:text-surface-100">{row.name}</span> },
    { header: 'Department', accessor: 'department', cell: (row) => row.department?.name || '—' },
    { header: 'Semester', accessor: 'semester', cell: (row) => `${row.semester}${['st','nd','rd'][row.semester-1] || 'th'}` },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Type', accessor: 'type', cell: (row) => <Badge variant={row.type === 'lab' ? 'primary' : row.type === 'elective' ? 'warning' : 'default'}>{row.type}</Badge> },
    { header: 'Faculty', accessor: 'faculty', cell: (row) => row.faculty?.name || '—' },
  ];

  if (isAdminOrHOD) {
    columns.push({
      header: '', accessor: 'actions', sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setEditing(row); setForm({ name: row.name, code: row.code, department: row.department?._id || '', semester: String(row.semester), credits: String(row.credits), type: row.type, faculty: row.faculty?._id || '' }); setShowModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleting(row); setShowDeleteModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Subjects</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage courses, electives and lab subjects.</p>
        </div>
        {isAdminOrHOD && (
          <Button size="sm" onClick={() => { setEditing(null); setForm({ name: '', code: '', department: '', semester: '', credits: '', type: 'theory', faculty: '' }); setShowModal(true); }}><Plus className="h-3.5 w-3.5" /> Add Subject</Button>
        )}
      </div>

      <Table columns={columns} data={subjects} searchable searchPlaceholder="Search by name or code..." pageSize={10} loading={loading} emptyIcon={BookOpen} emptyMessage="No subjects found" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Subject' : 'Add New Subject'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Subject Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label="Subject Code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} required placeholder="CS-301" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department</label>
              <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <Input label="Semester" type="number" min="1" max="8" value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})} required />
            <Input label="Credits" type="number" min="1" max="6" value={form.credits} onChange={(e) => setForm({...form, credits: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Type</label>
              <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="theory">Theory</option>
                <option value="lab">Lab</option>
                <option value="elective">Elective</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Assigned Faculty</label>
              <select value={form.faculty} onChange={(e) => setForm({...form, faculty: e.target.value})} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Select faculty</option>
                {facultyList.map((f) => <option key={f._id} value={f._id}>{f.name} ({f.department?.code || ''})</option>)}
              </select>
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add Subject'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Subject" size="sm">
        <p className="text-sm text-surface-600 dark:text-surface-400">Delete <strong>{deleting?.name}</strong> ({deleting?.code})?</p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" loading={saving} onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
