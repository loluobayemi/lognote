import React from 'react';
import { motion } from 'motion/react';
import { Card, Badge } from '../components/UI';
import { User, LogEntry } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface SystemAnalyticsProps {
  logs: LogEntry[];
  students: User[];
  supervisors: User[];
}

export const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({ logs, students, supervisors }) => {
  // Submission trends (last 7 days or by month)
  const logsByDate = logs.reduce((acc: any, log) => {
    const date = log.date.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(logsByDate)
    .map(([date, count]) => ({ date, count: count as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10); // Last 10 days with submissions

  // Approval rates
  const statusCounts = logs.reduce((acc: any, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Approved', value: statusCounts['Approved'] || 0, color: '#10b981' },
    { name: 'Pending', value: statusCounts['Pending'] || 0, color: '#f59e0b' },
    { name: 'Rejected', value: statusCounts['Rejected'] || 0, color: '#ef4444' },
    { name: 'Draft', value: statusCounts['Draft'] || 0, color: '#64748b' },
  ];

  // Category distribution
  const categoryCounts = logs.reduce((acc: any, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  const stats = {
    totalUsers: students.length + supervisors.length + 1, // +1 for admin
    totalLogs: logs.length,
    avgLogsPerStudent: students.length > 0 ? (logs.length / students.length).toFixed(1) : 0,
    approvalRate: logs.length > 0 ? Math.round(((statusCounts['Approved'] || 0) / logs.length) * 100) : 0
  };

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">System Analytics</h2>
        <p className="text-slate-500 font-body">Deep dive into institutional engagement and performance metrics.</p>
      </header>

      {/* High-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Logs', value: stats.totalLogs, icon: 'description', color: 'text-blue-600' },
          { label: 'Total Users', value: stats.totalUsers, icon: 'groups', color: 'text-indigo-600' },
          { label: 'Logs/Student', value: stats.avgLogsPerStudent, icon: 'analytics', color: 'text-emerald-600' },
          { label: 'Approval Rate', value: `${stats.approvalRate}%`, icon: 'verified', color: 'text-amber-600' },
        ].map((stat, i) => (
          <Card key={i} variant="flat" className="p-6 border border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-surface-container-high flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-950">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Trend */}
        <Card className="p-8">
          <h3 className="font-headline text-xl font-bold text-indigo-950 mb-8">Submission Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Approval Distribution */}
        <Card className="p-8">
          <h3 className="font-headline text-xl font-bold text-indigo-950 mb-8">Approval Distribution</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <XAxis hide />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 ml-4">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs font-bold text-slate-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-8 lg:col-span-2">
          <h3 className="font-headline text-xl font-bold text-indigo-950 mb-8">Activity by Category</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
