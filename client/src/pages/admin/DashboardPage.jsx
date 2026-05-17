import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, BookOpen, DollarSign,
  TrendingUp, TrendingDown, CalendarCheck, ClipboardList,
  ArrowUpRight, Clock, UserCheck, AlertCircle, Bell,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { dashboardAPI } from '../../api/services';

const colorMap = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-950/50', icon: 'text-primary-600 dark:text-primary-400' },
  accent: { bg: 'bg-accent-500/10', icon: 'text-accent-600 dark:text-accent-400' },
  success: { bg: 'bg-success-50 dark:bg-success-500/10', icon: 'text-success-600 dark:text-success-500' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-500/10', icon: 'text-warning-600 dark:text-warning-500' },
  danger: { bg: 'bg-danger-50 dark:bg-danger-500/10', icon: 'text-danger-600 dark:text-danger-500' },
};

import { useAuth } from '../../context/AuthContext';

function formatCurrency(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty' || user?.role === 'hod';
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardAPI.getStats();
        setStats(data.data);
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Dashboard</h1><p className="text-sm text-surface-500 mt-1">Loading...</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Card key={i}><div className="h-24 bg-surface-100 dark:bg-dark-800 rounded animate-pulse" /></Card>)}
      </div>
    </div>
  );

  const s = stats || {};
  const fee = s.feeCollection || { collected: 0, pending: 0 };
  const att = s.todayAttendance || { present: 0, total: 0, percentage: 0 };

  const adminStatCards = [
    { title: 'Total Students', value: (s.totalStudents || 0).toLocaleString(), change: '+12.5%', trend: 'up', icon: GraduationCap, color: 'primary' },
    { title: 'Faculty Members', value: String(s.totalFaculty || 0), change: '+3.2%', trend: 'up', icon: Users, color: 'accent' },
    { title: 'Active Subjects', value: String(s.totalSubjects || 0), change: `${s.totalDepartments || 0} depts`, trend: 'up', icon: BookOpen, color: 'success' },
    { title: 'Fee Collection', value: formatCurrency(fee.collected), change: formatCurrency(fee.pending) + ' pending', trend: fee.pending > 0 ? 'down' : 'up', icon: DollarSign, color: 'warning' },
  ];

  const studentStatCards = [
    { title: 'My Attendance', value: s.attendance || '0%', change: 'Current standing', trend: 'up', icon: UserCheck, color: 'success' },
    { title: 'Assignments Due', value: String(s.assignmentsDue || 0), change: 'Total pending', trend: 'down', icon: ClipboardList, color: 'warning' },
    { title: 'Latest Result', value: s.latestResult || 'N/A', change: 'Most recent exam', trend: 'up', icon: BookOpen, color: 'primary' },
    { title: 'Fee Status', value: s.feeStatus || 'N/A', change: 'Current semester', trend: s.feeStatus === 'paid' ? 'up' : 'down', icon: DollarSign, color: s.feeStatus === 'paid' ? 'success' : 'danger' },
  ];

  const facultyStatCards = [
    { title: 'My Subjects', value: '3', change: 'This semester', trend: 'up', icon: BookOpen, color: 'primary' },
    { title: 'Assignments to Grade', value: '12', change: 'Pending', trend: 'down', icon: ClipboardList, color: 'warning' },
    { title: 'Classes Today', value: '2', change: 'Next at 11:15', trend: 'up', icon: CalendarCheck, color: 'success' },
    { title: 'Average Attendance', value: '82%', change: 'Across my subjects', trend: 'up', icon: Users, color: 'accent' },
  ];

  const statCards = isStudent ? studentStatCards : isFaculty ? facultyStatCards : adminStatCards;

  const quickStats = [
    { label: "Today's Attendance", value: `${att.percentage}%`, icon: UserCheck, status: Number(att.percentage) >= 75 ? 'success' : 'warning' },
    { label: 'Pending Assignments', value: String(s.pendingAssignments || 0), icon: ClipboardList, status: 'warning' },
    { label: 'Fee Defaulters', value: String(s.feeDefaulters || 0), icon: AlertCircle, status: 'danger' },
  ];

  const notifications = s.recentNotifications || [];
  const typeIcons = { info: Bell, warning: AlertCircle, success: CalendarCheck, danger: AlertCircle };
  const typeColors = { info: 'text-primary-500', warning: 'text-warning-500', success: 'text-success-500', danger: 'text-danger-500' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Welcome back! Here&apos;s an overview of your institution.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} hover>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">{stat.title}</p>
                <p className="text-2xl font-semibold font-mono text-surface-900 dark:text-surface-100">{stat.value}</p>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-success-500" /> : <TrendingDown className="h-3.5 w-3.5 text-danger-500" />}
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'}`}>{stat.change}</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg ${colorMap[stat.color].bg}`}><stat.icon className={`h-5 w-5 ${colorMap[stat.color].icon}`} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <a href="/notifications" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 transition-colors">View all <ArrowUpRight className="h-3 w-3" /></a>
          </CardHeader>
          <div className="space-y-0">
            {notifications.length === 0 ? (
              <p className="text-sm text-surface-500 py-8 text-center">No recent notifications</p>
            ) : notifications.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <div key={n._id} className={`flex items-start gap-3 py-3 ${i !== notifications.length - 1 ? 'border-b border-surface-100 dark:border-dark-700/50' : ''}`}>
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-surface-100 dark:bg-dark-800 flex items-center justify-center shrink-0">
                    <Icon className={`h-4 w-4 ${typeColors[n.type] || 'text-surface-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-800 dark:text-surface-200">{n.title}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{n.createdBy?.name || 'System'} • {timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          {!isStudent && (
            <>
              <Card>
                <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
                <div className="space-y-3">
                  {quickStats.map((qs) => (
                    <div key={qs.label} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-surface-100 dark:bg-dark-800 flex items-center justify-center"><qs.icon className="h-4 w-4 text-surface-500 dark:text-surface-400" /></div>
                        <span className="text-sm text-surface-700 dark:text-surface-300">{qs.label}</span>
                      </div>
                      <Badge variant={qs.status} dot>{qs.value}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5"><span className="text-surface-500">Total Departments</span><span className="font-mono font-medium text-surface-900 dark:text-surface-100">{s.totalDepartments || 0}</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-surface-500">Total Assignments</span><span className="font-mono font-medium text-surface-900 dark:text-surface-100">{s.totalAssignments || 0}</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-surface-500">Attendance Today</span><span className="font-mono font-medium text-surface-900 dark:text-surface-100">{att.present}/{att.total}</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-surface-500">Server Status</span><Badge variant="success" size="sm" dot>Online</Badge></div>
                </div>
              </Card>
            </>
          )}

          {isStudent && s.recentAttendance && (
            <Card className="border-primary-200 dark:border-primary-900 shadow-sm ring-1 ring-primary-500/10">
              <CardHeader>
                <CardTitle className="text-primary-800 dark:text-primary-200 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" /> Recent Attendance Tracker
                </CardTitle>
              </CardHeader>
              <div className="space-y-3 mt-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  {s.recentAttendance.map((record) => (
                    <div 
                      key={record._id} 
                      className="group relative"
                      title={`${new Date(record.date).toLocaleDateString()} - ${record.subject?.name || 'Unknown'}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm transition-transform hover:scale-110 ${
                        record.status === 'present' ? 'bg-success-500' : 
                        record.status === 'absent' ? 'bg-danger-500' : 'bg-warning-500'
                      }`}>
                        {record.status === 'present' ? 'P' : record.status === 'absent' ? 'A' : 'L'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-surface-50 dark:bg-dark-800 rounded-lg p-3 text-sm flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Total present out of last {s.recentAttendance.length} classes:</span>
                  <span className="font-bold text-surface-900 dark:text-surface-100">
                    {s.recentAttendance.filter(r => r.status === 'present').length}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
