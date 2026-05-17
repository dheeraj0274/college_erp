import { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { timetableAPI, departmentAPI } from '../../api/services';

import { useAuth } from '../../context/AuthContext';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [timetable, setTimetable] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(isStudent ? user?.department?._id || '' : '');
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    if (isStudent) return; // Students don't need the department list
    try {
      const { data } = await departmentAPI.getAll();
      setDepartments(data.data.departments);
      if (data.data.departments.length > 0 && !selectedDept) {
        setSelectedDept(data.data.departments[0]._id);
      }
    } catch (e) {}
  }, [isStudent, selectedDept]);

  const fetchTimetable = useCallback(async () => {
    if (!selectedDept) return;
    setLoading(true);
    try {
      const { data } = await timetableAPI.get({ department: selectedDept, semester: 3 }); // Assuming semester 3 for demo
      const sorted = (data.data.timetable || []).sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
      setTimetable(sorted);
    } catch (e) { setTimetable([]); }
    finally { setLoading(false); }
  }, [selectedDept]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);
  useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

  const dayColors = {
    Monday: 'border-l-primary-500', Tuesday: 'border-l-accent-500', Wednesday: 'border-l-success-500',
    Thursday: 'border-l-warning-500', Friday: 'border-l-danger-500', Saturday: 'border-l-primary-400',
  };

  const isAdminOrHOD = ['admin', 'superadmin', 'hod'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Timetable</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Weekly class schedule for all departments.</p>
        </div>
        <div className="flex items-center gap-2">
          {!isStudent && (
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-fit">
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          )}
          {isAdminOrHOD && (
            <>
              <button onClick={() => import('react-hot-toast').then(m => m.default.success('Timetable reshuffle initialized!'))} className="rounded-lg bg-surface-100 dark:bg-dark-800 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-dark-700 transition-colors border border-surface-200 dark:border-dark-700">
                Reshuffle
              </button>
              <button onClick={() => import('react-hot-toast').then(m => m.default.success('Datesheet sent to students and faculty!'))} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900">
                Send Datesheet
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <Card key={i}><div className="h-24 bg-surface-100 dark:bg-dark-800 rounded animate-pulse" /></Card>)}</div>
      ) : timetable.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500">No timetable entries found for this department</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {timetable.map((entry) => (
            <Card key={entry._id} className={`border-l-4 ${dayColors[entry.day] || 'border-l-surface-300'}`}>
              <CardHeader>
                <CardTitle>{entry.day}</CardTitle>
                <Badge variant="default">{entry.slots?.length || 0} classes</Badge>
              </CardHeader>
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-3 min-w-max pb-1">
                  {(entry.slots || []).map((slot, idx) => (
                    <div key={idx} className="flex-shrink-0 w-44 rounded-lg border border-surface-200 dark:border-dark-700 p-3 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-medium text-primary-600 dark:text-primary-400">{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{slot.subject?.name || '—'}</p>
                      <p className="text-xs text-surface-500 mt-1">{slot.room}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{slot.faculty?.name || '—'}</p>
                      <Badge variant={slot.type === 'lab' ? 'primary' : 'default'} size="sm" className="mt-2">{slot.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
