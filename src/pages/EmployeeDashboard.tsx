import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Calendar, CheckCircle2, Clock, Target, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AddCustomerModal } from '../components/customers/AddCustomerModal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface DashboardData {
  total: number;
  closed: number;
  closingRate: number;
  tasks: { total: number; pending: number; overdue: number; completed: number };
  chartData: { name: string; closedDeals: number; leads: number }[];
}

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { tasks } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dashData, setDashData] = useState<DashboardData | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDashData(await res.json());
    } catch (err) {
      console.error('fetchDashboard:', err);
    }
  }, [token]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const total = dashData?.total ?? 0;
  const closed = dashData?.closed ?? 0;
  const closingRate = dashData?.closingRate ?? 0;
  const overdueCount = dashData?.tasks?.overdue ?? 0;
  const chartData = dashData?.chartData ?? [];

  // Pending tasks reminder (nearest due tasks not completed)
  const pendingReminders = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const stats = [
    { title: 'عملائي الحاليين', value: total.toString(), change: '—', icon: Target, color: 'text-emerald-600', path: '/customers' },
    { title: 'صفقاتي المغلقة', value: closed.toString(), change: '—', icon: CheckCircle2, color: 'text-indigo-600', path: '/customers' },
    { title: 'معدل الإغلاق', value: `${closingRate}%`, change: '—', icon: Award, color: 'text-amber-500', path: '/performance' },
    { title: 'مهام متأخرة', value: overdueCount.toString(), change: overdueCount === 0 ? 'لا يوجد مهام' : `${overdueCount} مهام`, icon: Clock, color: 'text-slate-500', path: '/tasks' },
  ];

  return (
    <div className="p-8 space-y-8">
      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <div className="flex justify-between items-end glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-400 bg-clip-text text-transparent tracking-tight drop-shadow-sm">مرحباً {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 mt-2 font-medium">إليك ملخص أدائك والمهام المطلوبة منك اليوم.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة عميل جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              onClick={() => navigate(stat.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 shadow-inner">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="relative z-10 mt-5 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                  <span className="font-bold">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">أدائي الشخصي</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">مقارنة بين عملائي المحتملين والصفقات التي أغلقتها</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-slate-600">صفقاتي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">عملائي</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMySales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMyLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="closedDeals" name="صفقاتي" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMySales)" />
                <Area type="monotone" dataKey="leads" name="عملائي" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMyLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 rounded-3xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">تذكيراتي</h3>
            <button onClick={() => navigate('/tasks')} className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">عرض الكل</button>
          </div>

          <div className="flex-1 space-y-4">
            {pendingReminders.length > 0 ? pendingReminders.map((task) => (
              <div key={task.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate('/tasks')}>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{task.title}</h4>
                    {task.clientName && <p className="text-sm text-slate-500 mt-1">{task.clientName}</p>}
                    <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span dir="ltr">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                <p>لا يوجد لديك تذكيرات حالياً.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/tasks')}
            className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            إدارة المهام
          </button>
        </motion.div>
      </div>
    </div>
  );
}
