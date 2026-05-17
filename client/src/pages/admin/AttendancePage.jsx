import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarCheck, Users, TrendingUp, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { attendanceAPI, subjectAPI, studentAPI } from '../../api/services';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isFacultyOrAdmin = ['faculty', 'hod', 'admin', 'superadmin'].includes(user?.role);
  
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const [recRes, statsRes] = await Promise.all([attendanceAPI.getAll({ limit: 50, user: user.id }), attendanceAPI.getStats()]);
        setRecords(recRes.data.data.attendance);
      } else {
        const [recRes, statsRes] = await Promise.all([attendanceAPI.getAll({ limit: 50 }), attendanceAPI.getStats()]);
        setRecords(recRes.data.data.attendance);
        setStats(statsRes.data.data.today);
      }
    } catch (e) { setRecords([]); }
    finally { setLoading(false); }
  }, [isStudent, user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openMarkModal = async () => {
    setShowMarkModal(true);
    try {
      const [subRes, stuRes] = await Promise.all([subjectAPI.getAll(), studentAPI.getAll()]);
      // If faculty, ideally filter subjects they teach. For demo, we show all.
      setSubjects(subRes.data.data.subjects);
      setStudents(stuRes.data.data.students);
      const initialData = {};
      stuRes.data.data.students.forEach(s => initialData[s._id] = 'present');
      setAttendanceData(initialData);
    } catch (e) {}
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return toast.error('Select a subject');
    setSaving(true);
    try {
      const recordsToSubmit = Object.entries(attendanceData).map(([studentId, status]) => ({
        student: studentId,
        subject: selectedSubject,
        date: new Date(),
        status
      }));
      await attendanceAPI.mark({ records: recordsToSubmit });
      toast.success('Attendance marked successfully');
      setShowMarkModal(false);
      fetchData();
    } catch (e) {
      toast.error('Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const statCards = stats && !isStudent ? [
    { title: 'Present Today', value: stats.present, icon: Users, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10' },
    { title: 'Absent Today', value: stats.absent, icon: AlertCircle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10' },
    { title: 'Total Marked', value: stats.total, icon: CalendarCheck, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50' },
    { title: 'Attendance %', value: `${stats.percentage}%`, icon: TrendingUp, color: Number(stats.percentage) >= 75 ? 'text-success-500' : 'text-warning-500', bg: Number(stats.percentage) >= 75 ? 'bg-success-50 dark:bg-success-500/10' : 'bg-warning-50 dark:bg-warning-500/10' },
  ] : [];

  const columns = !isStudent ? [
    { header: 'Student', accessor: 'student', cell: (row) => <span className="font-mono text-xs">{row.student?.rollNo || '—'}</span> },
    { header: 'Subject', accessor: 'subject', cell: (row) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.subject?.name || '—'}</p>
        <p className="text-xs text-surface-500">{row.subject?.code}</p>
      </div>
    )},
    { header: 'Date', accessor: 'date', cell: (row) => new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { header: 'Status', accessor: 'status', cell: (row) => {
      const v = { present: 'success', absent: 'danger', late: 'warning' };
      return <Badge variant={v[row.status]} dot>{row.status}</Badge>;
    }},
    { header: 'Marked By', accessor: 'markedBy', cell: (row) => row.markedBy?.name || '—' },
  ] : [];

  const groupedAttendance = useMemo(() => {
    if (!isStudent) return null;
    return records.reduce((acc, curr) => {
      const d = new Date(curr.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
      if (!acc[d]) acc[d] = [];
      acc[d].push(curr);
      return acc;
    }, {});
  }, [records, isStudent]);

  const dates = isStudent ? Object.keys(groupedAttendance || {}) : [];
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (isStudent && dates.length > 0 && (!selectedDate || !dates.includes(selectedDate))) {
      setSelectedDate(dates[0]);
    }
  }, [dates, isStudent, selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Attendance</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{isStudent ? 'Your day-wise attendance records.' : 'Track daily attendance across departments.'}</p>
        </div>
        {isFacultyOrAdmin && (
          <button onClick={openMarkModal} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900">
            Mark Attendance
          </button>
        )}
      </div>
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.title}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{s.title}</p>
                  <p className="text-lg font-semibold font-mono text-surface-900 dark:text-surface-100">{s.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {isStudent ? (
        <div className="space-y-4">
          {dates.length === 0 && !loading ? (
            <Card className="text-center py-12">
              <CalendarCheck className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
              <p className="mt-4 text-surface-500 dark:text-surface-400">No attendance records found.</p>
            </Card>
          ) : (
            <>
              {dates.length > 0 && (
                <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                  {dates.map((date) => {
                    const dayRecords = groupedAttendance[date];
                    const isToday = new Date(dayRecords[0].date).toDateString() === new Date().toDateString();
                    const label = isToday ? 'Today' : date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedDate === date
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-surface-100 dark:bg-dark-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-dark-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedDate && groupedAttendance[selectedDate] && (
                <Card className="overflow-hidden p-0 border-surface-200 dark:border-dark-700 animate-fade-in">
                  <div className="bg-surface-50 dark:bg-dark-800/80 px-4 py-3 border-b border-surface-200 dark:border-dark-700 flex justify-between items-center">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-primary-500" /> {selectedDate}
                    </h3>
                    <Badge variant="primary">{groupedAttendance[selectedDate].length} Classes</Badge>
                  </div>
                  <div className="divide-y divide-surface-100 dark:divide-dark-800/50 px-4">
                    {groupedAttendance[selectedDate].map(record => (
                      <div key={record._id} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{record.subject?.name}</p>
                          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{record.subject?.code}</p>
                        </div>
                        <Badge variant={record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'} dot>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        <Table columns={columns} data={records} searchable searchPlaceholder="Search by roll no or subject..." pageSize={15} loading={loading} emptyIcon={CalendarCheck} emptyMessage="No attendance records" />
      )}

      <Modal isOpen={showMarkModal} onClose={() => setShowMarkModal(false)} title="Mark Today's Attendance" size="lg">
        <form onSubmit={handleMarkAttendance}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Select Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required className="block w-full rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            {selectedSubject && (
              <div className="max-h-80 overflow-y-auto border border-surface-200 dark:border-dark-700 rounded-lg">
                <table className="min-w-full divide-y divide-surface-200 dark:divide-dark-700">
                  <thead className="bg-surface-50 dark:bg-dark-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-surface-500">Student Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-surface-500">Roll No</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-surface-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-900 divide-y divide-surface-200 dark:divide-dark-700">
                    {students.map(student => (
                      <tr key={student._id}>
                        <td className="px-4 py-2 text-sm text-surface-900 dark:text-surface-100">{student.user?.name}</td>
                        <td className="px-4 py-2 text-sm font-mono text-surface-500">{student.rollNo}</td>
                        <td className="px-4 py-2 text-right">
                          <select 
                            value={attendanceData[student._id]} 
                            onChange={(e) => setAttendanceData({...attendanceData, [student._id]: e.target.value})}
                            className={`text-sm rounded border-none font-medium focus:ring-0 ${attendanceData[student._id] === 'present' ? 'text-success-600 bg-success-50' : 'text-danger-600 bg-danger-50'}`}
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowMarkModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={!selectedSubject}>Save Attendance</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
