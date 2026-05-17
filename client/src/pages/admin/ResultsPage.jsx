import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { resultAPI } from '../../api/services';

import { useAuth } from '../../context/AuthContext';

export default function ResultsPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState('');

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (examFilter) params.examType = examFilter;
      if (isStudent) params.user = user.id; // Backend needs to handle this query param
      const { data } = await resultAPI.getAll(params);
      setResults(data.data.results);
    } catch (e) { setResults([]); }
    finally { setLoading(false); }
  }, [examFilter, isStudent, user.id]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const gradeColor = (g) => {
    if (!g) return 'default';
    if (g.startsWith('A')) return 'success';
    if (g.startsWith('B')) return 'primary';
    if (g.startsWith('C')) return 'warning';
    return 'danger';
  };

  const columns = [
    {
      header: 'Student', accessor: 'student',
      cell: (row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{row.student?.user?.name || '—'}</p>
          <p className="text-xs text-surface-500">{row.student?.department?.code || ''}</p>
        </div>
      ),
    },
    { header: 'Subject', accessor: 'subject', cell: (row) => (
      <div>
        <p className="text-sm text-surface-900 dark:text-surface-100">{row.subject?.name || '—'}</p>
        <p className="text-xs text-surface-500 font-mono">{row.subject?.code}</p>
      </div>
    )},
    { header: 'Exam', accessor: 'examType', cell: (row) => <Badge variant="default">{row.examType}</Badge> },
    { header: 'Marks', accessor: 'obtainedMarks', cell: (row) => (
      <span className="font-mono text-sm">
        <span className="text-surface-900 dark:text-surface-100 font-semibold">{row.obtainedMarks}</span>
        <span className="text-surface-400">/{row.totalMarks}</span>
      </span>
    )},
    { header: '%', accessor: 'pct', cell: (row) => {
      const pct = ((row.obtainedMarks / row.totalMarks) * 100).toFixed(1);
      return <span className={`font-mono text-xs font-medium ${Number(pct) >= 60 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>{pct}%</span>;
    }},
    { header: 'Grade', accessor: 'grade', cell: (row) => <Badge variant={gradeColor(row.grade)}>{row.grade}</Badge> },
    { header: 'Published', accessor: 'publishedAt', cell: (row) => new Date(row.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Results</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">View and manage examination results.</p>
        </div>
        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-fit">
          <option value="">All Exams</option>
          <option value="mid-sem">Mid Semester</option>
          <option value="end-sem">End Semester</option>
          <option value="internal">Internal</option>
          <option value="assignment">Assignment</option>
        </select>
      </div>
      <Table columns={columns} data={results} searchable searchPlaceholder="Search by student or subject..." pageSize={15} loading={loading} emptyIcon={FileText} emptyMessage="No results found" />
    </div>
  );
}
