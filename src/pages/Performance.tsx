import { motion } from 'motion/react';
import { Award, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'يناير', achievement: 60, target: 100 },
  { name: 'فبراير', achievement: 75, target: 100 },
  { name: 'مارس', achievement: 50, target: 100 },
  { name: 'أبريل', achievement: 90, target: 100 },
  { name: 'مايو', achievement: 70, target: 100 },
  { name: 'يونيو', achievement: 85, target: 100 },
  { name: 'يوليو', achievement: 95, target: 100 },
];

export function Performance() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">الأداء ونسبة التحقيق</h1>
          <p className="text-slate-500 mt-2 font-medium">متابعة أهدافك الشهرية والسنوية.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold">
          <Award className="w-5 h-5" />
          <span>النسبة الحالية: 85%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">الهدف الشهري</h3>
            <Target className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-4">150 عميل</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-slate-500 mt-2">متبقي 22 عميل للوصول للهدف</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">الصفقات الناجحة</h3>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-4">114 صفقة</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '76%' }}></div>
          </div>
          <p className="text-sm text-slate-500 mt-2">معدل الإغلاق 76%</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">النمو الشهري</h3>
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-4">+12%</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }}></div>
          </div>
          <p className="text-sm text-slate-500 mt-2">مقارنة بالشهر الماضي</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">تطور الأداء</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">نسبة تحقيق الهدف على مدار العام</p>
          </div>
        </div>
        <div className="h-[400px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAchieve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} domain={[0, 100]} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b', fontWeight: 500 }}
              />
              <Area type="monotone" dataKey="achievement" name="نسبة التحقيق" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAchieve)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
