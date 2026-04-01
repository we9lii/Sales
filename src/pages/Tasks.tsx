import { motion } from 'motion/react';
import { Clock, CheckCircle2, Calendar } from 'lucide-react';

const tasks = [
  { id: 1, title: 'مكالمة متابعة مع شركة الأفق للتجارة', dueDate: '2023-10-25', status: 'overdue', type: 'call' },
  { id: 2, title: 'إرسال عرض سعر لمؤسسة النور', dueDate: '2023-10-26', status: 'overdue', type: 'email' },
  { id: 3, title: 'تحديث بيانات مجموعة السعد', dueDate: '2023-10-27', status: 'overdue', type: 'update' },
  { id: 4, title: 'اجتماع توقيع العقد', dueDate: '2023-10-28', status: 'pending', type: 'meeting' },
];

export function Tasks() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">المهام والمتابعات</h1>
          <p className="text-slate-500 mt-2 font-medium">إدارة جميع مهامك اليومية والمتأخرة.</p>
        </div>
        <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          إضافة مهمة جديدة
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">قائمة المهام</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {tasks.map((task, index) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <button className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-transparent hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div>
                  <h4 className="font-semibold text-slate-800">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={task.status === 'overdue' ? 'text-rose-500 font-medium' : 'text-slate-500'}>
                      {task.dueDate} {task.status === 'overdue' && '(متأخرة)'}
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {task.type === 'call' ? 'مكالمة' : task.type === 'email' ? 'بريد إلكتروني' : task.type === 'meeting' ? 'اجتماع' : 'تحديث'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
