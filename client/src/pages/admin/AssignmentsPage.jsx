import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { assignmentAPI, subjectAPI, departmentAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isFacultyOrAdmin = ['faculty', 'hod', 'admin', 'superadmin'].includes(user?.role);

  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', department: '', semester: '3', dueDate: '', totalMarks: '100' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (isStudent && user?.department) {
        params.department = user.department._id || user.department;
        params.semester = 3; // Demo hardcode semester
      }
      
      const [aRes, sRes, dRes] = await Promise.all([
        assignmentAPI.getAll(params),
        !isStudent ? subjectAPI.getAll() : { data: { data: { subjects: [] } } },
        !isStudent ? departmentAPI.getAll() : { data: { data: { departments: [] } } }
      ]);
      setAssignments(aRes.data.data.assignments);
      setSubjects(sRes.data.data.subjects);
      setDepartments(dRes.data.data.departments);
    } catch (e) { setAssignments([]); }
    finally { setLoading(false); }
  }, [isStudent, user?.department]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assignmentAPI.create({ ...form, semester: Number(form.semester), totalMarks: Number(form.totalMarks) });
      toast.success('Assignment created');
      setShowModal(false);
      setForm({ title: '', description: '', subject: '', department: '', semester: '3', dueDate: '', totalMarks: '100' });
      fetchData();
    } catch (e) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const getStatus = (a) => {
    const now = new Date();
    const due = new Date(a.dueDate);
    if (due < now) return { label: 'Overdue', variant: 'danger', icon: AlertTriangle };
    const daysLeft = Math.ceil((due - now) / 86400000);
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, variant: 'warning', icon: Clock };
    return { label: `${daysLeft}d left`, variant: 'success', icon: CheckCircle };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Assignments</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Create and track student assignments.</p>
        </div>
        {isFacultyOrAdmin && (
          <Button size="sm" onClick={() => setShowModal(true)}><Plus className="h-3.5 w-3.5" /> New Assignment</Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Card key={i}><div className="h-32 bg-surface-100 dark:bg-dark-800 rounded animate-pulse" /></Card>)}</div>
      ) : assignments.length === 0 ? (
        <Card className="text-center py-16"><ClipboardList className="h-12 w-12 text-surface-300 mx-auto mb-3" /><p className="text-sm text-surface-500">No assignments found</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignments.map((a) => {
            const status = getStatus(a);
            const submitted = a.submissions?.length || 0;
            const graded = a.submissions?.filter(s => s.status === 'graded').length || 0;
            return (
              <Card key={a._id} hover>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{a.title}</h3>
                      <Badge variant={status.variant} size="sm">{status.label}</Badge>
                    </div>
                    <p className="text-xs text-surface-500 line-clamp-2 mb-3">{a.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500">
                      <span className="font-mono">{a.subject?.code}</span>
                      <span>{a.subject?.name}</span>
                      <span>Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-100 dark:border-dark-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-surface-600 dark:text-surface-400"><strong className="text-surface-900 dark:text-surface-100">{submitted}</strong> submitted</span>
                    <span className="text-surface-600 dark:text-surface-400"><strong className="text-success-600 dark:text-success-400">{graded}</strong> graded</span>
                  </div>
                  <div className="w-24 h-1.5 bg-surface-100 dark:bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${submitted > 0 ? (graded / submitted) * 100 : 0}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Assignment" size="lg">
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">Select</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department</label>
                <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} required />
              <Input label="Total Marks" type="number" value={form.totalMarks} onChange={(e) => setForm({...form, totalMarks: e.target.value})} />
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Assignment</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
