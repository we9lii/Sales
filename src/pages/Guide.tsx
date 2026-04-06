import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, UserPlus, FileText, ArrowLeftRight, CheckCircle2,
  ShieldCheck, BarChart3, ListTodo, Bell, LogIn, AlertTriangle,
  Phone, ExternalLink, Info
} from 'lucide-react';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

const steps = [
  {
    icon: LogIn,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'تسجيل الدخول',
    desc: 'ادخل اسم المستخدم وكلمة المرور للوصول إلى لوحة التحكم الخاصة بك.',
  },
  {
    icon: UserPlus,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'إضافة عميل جديد',
    desc: 'من صفحة "العملاء" اضغط على "إضافة عميل جديد" وأدخل بيانات العميل: الاسم، رقم الجوال، الموقع، ونوع الاحتياج.',
  },
  {
    icon: FileText,
    color: 'bg-blue-100 text-blue-600',
    title: 'إضافة تحديثات ومتابعات',
    desc: 'ادخل على ملف العميل واضغط "تحديث" لإضافة ملاحظة متابعة جديدة تُسجّل في سجل الرحلة.',
  },
  {
    icon: ArrowLeftRight,
    color: 'bg-amber-100 text-amber-600',
    title: 'تحويل العميل',
    desc: 'يمكنك تحويل العميل لموظف آخر من داخل ملف العميل بالضغط على "تحويل" واختيار الموظف.',
  },
  {
    icon: ListTodo,
    color: 'bg-violet-100 text-violet-600',
    title: 'إدارة المهام',
    desc: 'أنشئ مهام مرتبطة بالعملاء أو مهام عامة من صفحة "المهام". حدد الموعد والنوع والموظف المسؤول.',
  },
  {
    icon: CheckCircle2,
    color: 'bg-orange-100 text-orange-600',
    title: 'طلب إغلاق الملف',
    desc: 'عند الانتهاء من العميل، اطلب إغلاق الملف مع ذكر السبب. سيُرسل الطلب للمشرف للتقييم والاعتماد.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-rose-100 text-rose-600',
    title: 'التقييم والاعتماد (المشرف)',
    desc: 'يقوم المشرف بمراجعة طلبات الإغلاق وتقييم أداء الموظف ثم اعتماد أو رفض الإغلاق من صفحة "الاعتمادات".',
  },
  {
    icon: BarChart3,
    color: 'bg-cyan-100 text-cyan-600',
    title: 'متابعة الأداء',
    desc: 'تابع إحصائيات أدائك الشهرية ومعدل الإغلاق والرسوم البيانية من صفحة "الأداء".',
  },
  {
    icon: Bell,
    color: 'bg-pink-100 text-pink-600',
    title: 'الإشعارات',
    desc: 'ستصلك إشعارات فورية عند تحويل عميل إليك أو عند اعتماد/رفض طلب إغلاق من المشرف.',
  },
];

export function Guide() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rtl font-sans" dir="rtl">
      {/* Ambient */}
      <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <img src="/logo-512.png" alt="Logo" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">دليل استخدام النظام</h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            شرح مبسّط لجميع خطوات العمل داخل نظام إدارة المبيعات
          </p>
        </motion.div>

        {/* SSO Notice */}
        <motion.div
          {...fadeUp(0.15)}
          className="mb-10 bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-5 flex items-start gap-4"
        >
          <div className="p-2.5 bg-indigo-500/20 rounded-xl shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-300 mb-1.5">نظام دخول موحّد</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              بيانات تسجيل الدخول موحّدة مع نظام{' '}
              <a href="https://qcheck.qssun.solar/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 underline underline-offset-2">
                QCheck
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              . أي موظف لديه حساب في ذلك النظام يمكنه تسجيل الدخول هنا بنفس اسم المستخدم وكلمة المرور.
            </p>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.06)}
                className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-5 flex items-start gap-4 hover:bg-white/[0.08] transition-colors duration-200"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-slate-500 absolute -top-2 -right-2">
                    {i + 1}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="pt-0.5">
                  <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ownership Alert */}
        <motion.div
          {...fadeUp(0.8)}
          className="mt-10 bg-amber-500/10 border border-amber-400/20 rounded-2xl p-5 flex items-start gap-4"
        >
          <div className="p-2.5 bg-amber-500/20 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-300 mb-1.5">تنبيه مهم — ملكية العميل</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              إذا لم يتم تحديث ملف العميل خلال <span className="text-amber-300 font-bold">15 يوم</span>، تسقط ملكية الموظف للعميل ويظهر تنبيه للمشرف. احرص على المتابعة الدورية لعملائك.
            </p>
          </div>
        </motion.div>

        {/* Beta Notice */}
        <motion.div
          {...fadeUp(0.9)}
          className="mt-6 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 text-center"
        >
          <p className="text-sm text-slate-400 mb-3 leading-relaxed">
            هذا النظام <span className="text-white font-bold">تجريبي</span>. في حالة رصد أي مشكلة أو ملاحظة، يرجى التواصل مع المطور:
          </p>
          <a
            href="tel:0560080070"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/15 border border-emerald-400/20 rounded-xl text-emerald-400 font-bold text-sm hover:bg-emerald-500/25 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">0560080070</span>
          </a>
        </motion.div>

        {/* Back to login */}
        <motion.div {...fadeUp(1)} className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/25"
          >
            <ArrowRight className="w-4 h-4" />
            الذهاب لتسجيل الدخول
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p {...fadeUp(1.1)} className="text-center text-xs text-slate-600 mt-8 font-medium">
          نظام داخلي محمي &middot; جميع الحقوق محفوظة
        </motion.p>
      </div>
    </div>
  );
}
