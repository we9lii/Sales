import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<'user' | 'pass' | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح!');
        navigate('/');
      } else {
        toast.error('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
      }
    } catch {
      toast.error('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-hidden flex rtl font-sans" dir="rtl">

      {/* Right Side — Branding Panel */}
      <div className="hidden lg:flex w-[55%] relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col items-center justify-center overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-400/10 blur-[100px]" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <img src="/logo-512.png" alt="Logo" className="w-28 h-28 mb-8 mx-auto" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4 tracking-tight"
          >
            نظام إدارة المبيعات
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-base text-indigo-200/60 font-medium max-w-sm leading-relaxed"
          >
            منصة متكاملة لإدارة العملاء والتذاكر والمهام ومتابعة الأداء في مكان واحد.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {['إدارة التذاكر', 'متابعة الأداء', 'تقييم الموظفين', 'إشعارات فورية'].map((feature, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-indigo-200/70 backdrop-blur-sm">
                {feature}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 text-xs text-slate-600 font-medium"
        >
          نظام داخلي محمي &middot; جميع الحقوق محفوظة
        </motion.p>
      </div>

      {/* Left Side — Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center relative bg-slate-50 px-6 sm:px-12">
        {/* Mobile-only background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 lg:hidden" />
        <div className="absolute inset-0 lg:hidden opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <img src="/logo-512.png" alt="Logo" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-white tracking-tight">نظام إدارة المبيعات</h1>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 lg:text-slate-800 text-white mb-1.5">تسجيل الدخول</h2>
            <p className="text-sm text-slate-400 lg:text-slate-500 font-medium">مرحباً بعودتك! أدخل بياناتك للمتابعة.</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-500 lg:text-slate-500 text-slate-400 mb-2 uppercase tracking-wider">اسم المستخدم</label>
              <div className={cn(
                "relative rounded-2xl transition-all duration-300",
                focused === 'user' ? "ring-2 ring-indigo-500/30" : ""
              )}>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <User className={cn("h-[18px] w-[18px] transition-colors duration-200", focused === 'user' ? "text-indigo-500" : "text-slate-400")} />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onFocus={() => setFocused('user')}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white lg:bg-white bg-white/[0.07] border border-slate-200 lg:border-slate-200 border-white/[0.1] rounded-2xl pr-12 pl-4 py-4 text-slate-900 lg:text-slate-900 text-white text-sm focus:outline-none focus:border-indigo-500 font-medium placeholder:text-slate-400 lg:placeholder:text-slate-400 placeholder:text-slate-600 transition-all duration-200 shadow-sm lg:shadow-sm shadow-none"
                  placeholder="أدخل اسم المستخدم..."
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 lg:text-slate-500 text-slate-400 mb-2 uppercase tracking-wider">كلمة المرور</label>
              <div className={cn(
                "relative rounded-2xl transition-all duration-300",
                focused === 'pass' ? "ring-2 ring-indigo-500/30" : ""
              )}>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Lock className={cn("h-[18px] w-[18px] transition-colors duration-200", focused === 'pass' ? "text-indigo-500" : "text-slate-400")} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white lg:bg-white bg-white/[0.07] border border-slate-200 lg:border-slate-200 border-white/[0.1] rounded-2xl pr-12 pl-14 py-4 text-slate-900 lg:text-slate-900 text-white text-sm focus:outline-none focus:border-indigo-500 font-medium tracking-widest placeholder:text-slate-400 lg:placeholder:text-slate-400 placeholder:text-slate-600 transition-all duration-200 placeholder:tracking-normal shadow-sm lg:shadow-sm shadow-none"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 lg:hover:text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center items-center gap-2.5 py-4 px-4 rounded-2xl text-sm font-bold text-white transition-all duration-300 relative overflow-hidden",
                  isLoading
                    ? "bg-indigo-400 cursor-wait"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:translate-y-[-1px] active:translate-y-0 active:shadow-indigo-600/20"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    دخول النظام
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Mobile footer */}
          <p className="lg:hidden text-center text-xs text-slate-600 mt-10 font-medium">
            نظام داخلي محمي &middot; جميع الحقوق محفوظة
          </p>
        </motion.div>
      </div>
    </div>
  );
}
