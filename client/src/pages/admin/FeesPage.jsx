import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { feeAPI } from '../../api/services';

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

import { useAuth } from '../../context/AuthContext';

export default function FeesPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [feesRes, statsRes] = await Promise.all([
        feeAPI.getAll(isStudent ? { user: user.id } : {}), 
        feeAPI.getStats()
      ]);
      setFees(feesRes.data.data.fees);
      if (!isStudent) setStats(statsRes.data.data);
    } catch (e) {
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [isStudent, user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = stats ? [
    { title: 'Total Collected', value: formatMoney(stats.totalCollected), icon: TrendingUp, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10' },
    { title: 'Total Pending', value: formatMoney(stats.totalPending), icon: TrendingDown, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10' },
    { title: 'Paid', value: stats.paidCount, icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10' },
    { title: 'Unpaid', value: stats.unpaidCount, icon: AlertCircle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10' },
  ] : [];

  const columns = [
    {
      header: 'Student', accessor: 'student',
      cell: (row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{row.student?.user?.name || '—'}</p>
          <p className="text-xs text-surface-500">{row.student?.rollNo || ''}</p>
        </div>
      ),
    },
    { header: 'Department', accessor: 'dept', cell: (row) => row.student?.department?.name || '—' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Total', accessor: 'totalAmount', cell: (row) => <span className="font-mono text-xs">{formatMoney(row.totalAmount)}</span> },
    { header: 'Paid', accessor: 'paidAmount', cell: (row) => <span className="font-mono text-xs text-success-600 dark:text-success-400">{formatMoney(row.paidAmount)}</span> },
    { header: 'Balance', accessor: 'balance', cell: (row) => <span className="font-mono text-xs text-danger-600 dark:text-danger-400">{formatMoney(row.totalAmount - row.paidAmount)}</span> },
    {
      header: 'Status', accessor: 'status',
      cell: (row) => {
        const v = { paid: 'success', partial: 'warning', unpaid: 'danger', overdue: 'danger' };
        return <Badge variant={v[row.status] || 'default'} dot>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Fees</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Track fee payments and outstanding dues.</p>
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

      <Table columns={columns} data={fees} searchable searchPlaceholder="Search by student name..." pageSize={10} loading={loading} emptyIcon={DollarSign} emptyMessage="No fee records found" />
    </div>
  );
}
