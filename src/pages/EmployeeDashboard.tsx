import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Calendar, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Target, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AddCustomerModal } from '../components/customers/AddCustomerModal';

const data = [
  { name: 'يناير', closedDeals: 12, leads: 30 },
  { name: 'فبراير', closedDeals: 15, leads: 35 },
  { name: 'مارس', closedDeals: 10, leads: 25 },
  { name: 'أبريل', closedDeals: 18, leads: 40 },
  { name: 'مايو', closedDeals: 14, leads: 32 },
  { name: 'يونيو', closedDeals: 20, leads: 45 },
  { name: 'يوليو', closedDeals: 25, leads: 50 },
];

const stats = [
  { title: 'عملائي الحاليين', value: '145', change: '+5%', icon: Target, trend: 'up', color: 'text-emerald-600', path: '/customers' },
  { title: 'صفقاتي المغلقة', value: '114', change: '+12%', icon: CheckCircle2, trend: 'up', color: 'text-indigo-600', path: '/customers?status=closed' },
  { title: 'نسبة تحقيق الهدف', value: '85%', change: '+8%', icon: Award, trend: 'up', color: 'text-amber-500', path: '/performance' },
  { title: 'مهام متأخرة', value: '3', change: 'تحتاج متابعة', icon: Clock, trend: 'down', color: 'text-rose-500', path: '/tasks' },
];

const reminders = [
  { id: 1, client: 'شركة الأفق للتجارة', action: 'مكالمة متابعة', time: 'اليوم، 10:30 صباحاً', type: 'call' },
  { id: 2, client: 'مؤسسة النور', action: 'إرسال عرض سعر', time: 'اليوم، 02:00 مساءً', type: 'email' },
  { id: 3, client: 'مجموعة السعد', action: 'اجتماع توقيع العقد', time: 'غداً، 11:00 صباحاً', type: 'meeting' },
];

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-l from-emerald-600 to-emerald-400 bg-clip-text text-transparent tracking-tight">مرحباً سارة 👋</h1>
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
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color ? stat.color.replace('text-', 'bg-').replace('500', '50').replace('600', '50') : 'bg-emerald-50/80'} shadow-inner`}>
                  <Icon className={`w-6 h-6 ${stat.color || 'text-emerald-600'}`} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">أدائي الشخصي</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">مقارنة بين عملائي المحتملين والصفقات التي أغلقتها</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
                <span className="text-slate-600">صفقاتي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                <span className="text-slate-600">عملائي</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">تذكيراتي</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">عرض الكل</button>
          </div>
          
          <div className="flex-1 space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{reminder.client}</h4>
                    <p className="text-sm text-slate-500 mt-1">{reminder.action}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{reminder.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            إضافة تذكير جديد
          </button>
        </motion.div>
      </div>
    </div>
  );
}
