import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, Target, AlertCircle, ArrowUpRight, ArrowDownRight, Download, Phone, MapPin, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockTickets } from '../data/mockData';
import { Modal } from '../components/Modal';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';

const data = [
  { name: 'يناير', closedDeals: 45, leads: 120 },
  { name: 'فبراير', closedDeals: 52, leads: 135 },
  { name: 'مارس', closedDeals: 38, leads: 98 },
  { name: 'أبريل', closedDeals: 65, leads: 140 },
  { name: 'مايو', closedDeals: 48, leads: 110 },
  { name: 'يونيو', closedDeals: 55, leads: 125 },
  { name: 'يوليو', closedDeals: 70, leads: 150 },
];

type ModalType = 'total_customers' | 'closed_deals' | 'closing_rate' | 'ownership_alerts' | null;

export function AdminDashboard() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Calculate real stats from mockTickets
  const totalCustomers = mockTickets.length;
  const closedDeals = mockTickets.filter(t => t.status === 'مغلق').length;
  const closingRate = totalCustomers > 0 ? ((closedDeals / totalCustomers) * 100).toFixed(1) : '0';
  
  const today = new Date();
  const ownershipAlerts = mockTickets.filter(t => {
    if (t.status === 'مغلق') return false;
    const daysSinceUpdate = differenceInDays(today, new Date(t.updatedAt));
    return daysSinceUpdate > 15;
  });

  const stats = [
    { id: 'total_customers', title: 'إجمالي العملاء', value: totalCustomers.toString(), change: '+12%', icon: Users, trend: 'up' },
    { id: 'closed_deals', title: 'الصفقات المغلقة', value: closedDeals.toString(), change: '+8%', icon: TrendingUp, trend: 'up' },
    { id: 'closing_rate', title: 'معدل الإغلاق', value: `${closingRate}%`, change: '+2.1%', icon: Target, trend: 'up' },
    { id: 'ownership_alerts', title: 'تنبيهات الملكية', value: ownershipAlerts.length.toString(), change: 'عملاء تجاوزوا 15 يوم', icon: AlertCircle, trend: 'neutral', color: 'text-amber-500' },
  ];

  const renderTicketList = (tickets: typeof mockTickets) => (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <div className="text-center py-8 text-slate-500">لا يوجد بيانات لعرضها</div>
      ) : (
        tickets.map(ticket => (
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
              <Link 
                to={`/customers/${ticket.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
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
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-l from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">نظرة عامة</h1>
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
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color ? stat.color.replace('text-', 'bg-').replace('500', '50') : 'bg-indigo-50/80'} shadow-inner`}>
                  <Icon className={`w-6 h-6 ${stat.color || 'text-indigo-600'}`} />
                </div>
              </div>
              <div className="relative z-10 mt-5 flex items-center gap-2 text-sm">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : stat.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                  {stat.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {stat.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span className="font-bold">{stat.change}</span>
                </div>
                {stat.trend !== 'neutral' && <span className="text-slate-400 font-medium">مقارنة بالشهر السابق</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">تحليل الصفقات والعملاء المحتملين</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">مقارنة بين عدد العملاء المحتملين والصفقات المغلقة خلال العام</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
              <span className="text-slate-600">الصفقات المغلقة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
              <span className="text-slate-600">العملاء المحتملين</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
        {renderTicketList(mockTickets)}
      </Modal>

      <Modal isOpen={activeModal === 'closed_deals'} onClose={() => setActiveModal(null)} title="الصفقات المغلقة">
        {renderTicketList(mockTickets.filter(t => t.status === 'مغلق'))}
      </Modal>

      <Modal isOpen={activeModal === 'closing_rate'} onClose={() => setActiveModal(null)} title="تفاصيل معدل الإغلاق">
        <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-indigo-800">إجمالي العملاء: <span className="font-bold">{totalCustomers}</span></p>
            <p className="text-sm font-medium text-emerald-700 mt-1">الصفقات المغلقة: <span className="font-bold">{closedDeals}</span></p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {closingRate}%
          </div>
        </div>
        <h3 className="font-bold text-slate-800 mb-4">الصفقات المغلقة مؤخراً</h3>
        {renderTicketList(mockTickets.filter(t => t.status === 'مغلق'))}
      </Modal>

      <Modal isOpen={activeModal === 'ownership_alerts'} onClose={() => setActiveModal(null)} title="تنبيهات الملكية (تجاوزت 15 يوم)">
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>هؤلاء العملاء لم يتم تحديث حالتهم منذ أكثر من 15 يوماً. قد يتم سحب ملكيتهم قريباً إذا لم يتم اتخاذ إجراء.</p>
        </div>
        {renderTicketList(ownershipAlerts)}
      </Modal>
    </div>
  );
}
