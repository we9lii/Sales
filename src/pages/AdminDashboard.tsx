import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, Target, AlertCircle, ArrowUpRight, ArrowDownRight, Download, Phone, MapPin, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Modal } from '../components/Modal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardData {
  total: number;
  closed: number;
  open: number;
  newCount: number;
  inProgress: number;
  closingRate: number;
  ownershipAlerts: number;
  tasks: { total: number; pending: number; overdue: number; completed: number };
  chartData: { name: string; closedDeals: number; leads: number }[];
}

type ModalType = 'total_customers' | 'closed_deals' | 'closing_rate' | 'ownership_alerts' | null;

export function AdminDashboard() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const { tickets } = useData();
  const { token } = useAuth();

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
  const ownershipAlertCount = dashData?.ownershipAlerts ?? 0;
  const chartData = dashData?.chartData ?? [];

  const stats = [
    { id: 'total_customers', title: 'إجمالي العملاء', value: total.toString(), change: '—', icon: Users, trend: 'neutral' },
    { id: 'closed_deals', title: 'الصفقات المغلقة', value: closed.toString(), change: '—', icon: TrendingUp, trend: 'neutral' },
    { id: 'closing_rate', title: 'معدل الإغلاق', value: `${closingRate}%`, change: '—', icon: Target, trend: 'neutral' },
    { id: 'ownership_alerts', title: 'تنبيهات الملكية', value: ownershipAlertCount.toString(), change: 'عملاء تجاوزوا 15 يوم', icon: AlertCircle, trend: 'neutral', color: 'text-amber-500' },
  ];

  const closedTickets = tickets.filter(t => t.status === 'مغلق');
  const alertTickets = tickets.filter(t => {
    if (t.status === 'مغلق') return false;
    const days = Math.floor((Date.now() - new Date(t.updatedAt).getTime()) / 86400000);
    return days > 15;
  });

  const renderTicketList = (list: typeof tickets) => (
    <div className="space-y-4">
      {list.length === 0 ? (
        <div className="text-center py-8 text-slate-500">لا يوجد بيانات لعرضها</div>
      ) : (
        list.map(ticket => (
          <div key={ticket.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900">{ticket.clientName}</h4>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /><span dir="ltr">{ticket.mobileNumber}</span></span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ticket.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />آخر تحديث: <span dir="ltr">{format(new Date(ticket.updatedAt), 'yyyy/MM/dd')}</span></span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                <span className="font-medium">الموظف المسؤول:</span> {ticket.currentOwnerName}
              </div>
            </div>
            <div className="flex flex-col items-end justify-between gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                ticket.status === 'مغلق' ? 'bg-slate-200 text-slate-700 border-slate-300' :
                ticket.status === 'جديد' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                ticket.status === 'جاري المتابعة' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                {ticket.status}
              </span>
              <Link to={`/customers/${ticket.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                عرض التفاصيل &larr;
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-l from-indigo-900 via-indigo-700 to-indigo-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm">نظرة عامة</h1>
          <p className="text-slate-500 mt-2 font-medium">ملخص أداء الصفقات والعملاء للفترة الحالية.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveModal(stat.id as ModalType)}
              className="glass-card p-6 rounded-2xl relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color ? 'bg-amber-50' : 'bg-indigo-50/80'} shadow-inner`}>
                  <Icon className={`w-6 h-6 ${stat.color ?? 'text-indigo-600'}`} />
                </div>
              </div>
              <div className="relative z-10 mt-5 flex items-center gap-2 text-sm">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : stat.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                  {stat.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {stat.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span className="font-bold">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-8 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">تحليل الصفقات والعملاء المحتملين</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">مقارنة بين عدد العملاء المحتملين والصفقات المغلقة خلال العام</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-slate-600">الصفقات المغلقة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600">العملاء المحتملين</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="closedDeals" name="الصفقات المغلقة" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="leads" name="العملاء المحتملين" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'total_customers'} onClose={() => setActiveModal(null)} title="إجمالي العملاء">
        {renderTicketList(tickets)}
      </Modal>

      <Modal isOpen={activeModal === 'closed_deals'} onClose={() => setActiveModal(null)} title="الصفقات المغلقة">
        {renderTicketList(closedTickets)}
      </Modal>

      <Modal isOpen={activeModal === 'closing_rate'} onClose={() => setActiveModal(null)} title="تفاصيل معدل الإغلاق">
        <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-indigo-800">إجمالي العملاء: <span className="font-bold">{total}</span></p>
            <p className="text-sm font-medium text-emerald-700 mt-1">الصفقات المغلقة: <span className="font-bold">{closed}</span></p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">{closingRate}%</div>
        </div>
        <h3 className="font-bold text-slate-800 mb-4">الصفقات المغلقة مؤخراً</h3>
        {renderTicketList(closedTickets)}
      </Modal>

      <Modal isOpen={activeModal === 'ownership_alerts'} onClose={() => setActiveModal(null)} title="تنبيهات الملكية (تجاوزت 15 يوم)">
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>هؤلاء العملاء لم يتم تحديث حالتهم منذ أكثر من 15 يوماً. قد يتم سحب ملكيتهم قريباً إذا لم يتم اتخاذ إجراء.</p>
        </div>
        {renderTicketList(alertTickets)}
      </Modal>
    </div>
  );
}
