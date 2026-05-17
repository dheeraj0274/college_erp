import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Plus, Download, Filter, Trash2, Pencil, X } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { studentAPI, departmentAPI } from '../../api/services';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', rollNo: '', department: '', semester: '', section: '', batch: '2024-2028',
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await studentAPI.getAll();
      setStudents(data.data.students);
    } catch (e) {
      setStudents(sampleStudents);
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

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, [fetchStudents, fetchDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStudent) {
        await studentAPI.update(editingStudent._id, form);
        toast.success('Student updated');
      } else {
        await studentAPI.create(form);
        toast.success('Student created');
      }
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.user?.name || '', email: student.user?.email || '', phone: student.user?.phone || '',
      rollNo: student.rollNo, department: student.department?._id || '', semester: String(student.semester),
      section: student.section || '', batch: student.batch || '2024-2028',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setSaving(true);
    try {
      await studentAPI.delete(deletingStudent._id);
      toast.success('Student deleted');
      setShowDeleteModal(false);
      setDeletingStudent(null);
      fetchStudents();
    } catch (e) {
      toast.error('Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', rollNo: '', department: '', semester: '', section: '', batch: '2024-2028' });
  };

  const openCreate = () => {
    setEditingStudent(null);
    resetForm();
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {(row.user?.name || 'N/A').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">{row.user?.name || 'N/A'}</p>
            <p className="text-xs text-surface-500">{row.user?.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Roll No', accessor: 'rollNo', cellClassName: 'font-mono text-xs' },
    { header: 'Department', accessor: 'department', cell: (row) => row.department?.name || '—' },
    { header: 'Semester', accessor: 'semester', cell: (row) => `${row.semester}${['st','nd','rd'][row.semester-1] || 'th'}` },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.user?.isActive !== false ? 'success' : 'danger'} dot>
          {row.user?.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeletingStudent(row); setShowDeleteModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Students</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage all enrolled students across departments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5" /> Filters</Button>
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> Add Student</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={students}
        searchable
        searchPlaceholder="Search students by name, roll no..."
        pageSize={10}
        loading={loading}
        emptyIcon={GraduationCap}
        emptyMessage="No students found"
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStudent ? 'Edit Student' : 'Add New Student'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            <Input label="Roll Number" value={form.rollNo} onChange={(e) => setForm({...form, rollNo: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department</label>
              <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Select semester</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>{s}{['st','nd','rd'][s-1] || 'th'} Semester</option>)}
              </select>
            </div>
            <Input label="Section" value={form.section} onChange={(e) => setForm({...form, section: e.target.value})} />
            <Input label="Batch" value={form.batch} onChange={(e) => setForm({...form, batch: e.target.value})} />
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingStudent ? 'Update Student' : 'Add Student'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Student" size="sm">
        <p className="text-sm text-surface-600 dark:text-surface-400">
          Are you sure you want to delete <strong>{deletingStudent?.user?.name}</strong>? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" loading={saving} onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

const sampleStudents = [
  { _id: '1', user: { name: 'Rahul Kumar', email: 'rahul@techverse.edu', isActive: true }, rollNo: 'CS-2024-001', department: { name: 'Computer Science' }, semester: 6 },
  { _id: '2', user: { name: 'Priya Singh', email: 'priya@techverse.edu', isActive: true }, rollNo: 'CS-2024-002', department: { name: 'Computer Science' }, semester: 6 },
];
