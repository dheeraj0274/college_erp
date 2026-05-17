import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import { dashboardAPI, feeAPI, departmentAPI, studentAPI } from '../../api/services';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [feeStats, setFeeStats] = useState(null);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, fRes, dRes] = await Promise.all([dashboardAPI.getStats(), feeAPI.getStats(), departmentAPI.getAll()]);
        setStats(sRes.data.data);
        setFeeStats(fRes.data.data);
        setDepts(dRes.data.data.departments);
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const deptData = depts.map((d, i) => ({
    name: d.code || d.name.slice(0, 4),
    students: Math.floor(Math.random() * 80) + 20,
    faculty: Math.floor(Math.random() * 10) + 5,
  }));

  const feeData = feeStats ? [
    { name: 'Paid', value: feeStats.paidCount, color: COLORS[2] },
    { name: 'Partial', value: feeStats.partialCount, color: COLORS[3] },
    { name: 'Unpaid', value: feeStats.unpaidCount, color: COLORS[4] },
  ] : [];

  const monthlyData = [
    { month: 'Jan', enrollment: 180, attendance: 88 },
    { month: 'Feb', enrollment: 195, attendance: 85 },
    { month: 'Mar', enrollment: 210, attendance: 82 },
    { month: 'Apr', enrollment: 225, attendance: 79 },
    { month: 'May', enrollment: 240, attendance: 84 },
  ];

  const attendanceWeekly = [
    { day: 'Mon', present: 85, absent: 15 },
    { day: 'Tue', present: 78, absent: 22 },
    { day: 'Wed', present: 92, absent: 8 },
    { day: 'Thu', present: 88, absent: 12 },
    { day: 'Fri', present: 75, absent: 25 },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Analytics</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Card key={i}><div className="h-64 bg-surface-100 dark:bg-dark-800 rounded animate-pulse" /></Card>)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Analytics</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Institutional performance metrics and insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Department-wise Distribution</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200, #e4e4e7)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
                <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Students" />
                <Bar dataKey="faculty" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Faculty" />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fee Collection Status</CardTitle></CardHeader>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {feeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Enrollment & Attendance Trends</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200, #e4e4e7)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
                <Line type="monotone" dataKey="enrollment" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} name="Enrollment" />
                <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Attendance %" />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Weekly Attendance Breakdown</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceWeekly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200, #e4e4e7)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
                <Bar dataKey="present" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Present" />
                <Bar dataKey="absent" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Absent" />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
