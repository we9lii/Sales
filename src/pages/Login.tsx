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
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center relative rtl font-sans" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />

      {/* Animated orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/15 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] mx-4 relative z-10"
      >
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform duration-300">
            <img src="/logo-512.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">نظام إدارة المبيعات</h1>
          <p className="text-sm text-slate-400 font-medium">سجّل دخولك للوصول إلى لوحة التحكم</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-8 shadow-2xl shadow-black/20"
        >
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">اسم المستخدم</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <User className="h-[18px] w-[18px] text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pr-11 pl-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 font-medium placeholder:text-slate-600 transition-all duration-200"
                  placeholder="أدخل اسم المستخدم..."
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Lock className="h-[18px] w-[18px] text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pr-11 pl-12 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 font-medium tracking-widest placeholder:text-slate-600 transition-all duration-200 placeholder:tracking-normal"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex justify-center items-center gap-2.5 py-3.5 px-4 mt-3 rounded-xl text-sm font-bold text-white transition-all duration-300 relative overflow-hidden",
                isLoading
                  ? "bg-indigo-500/50 cursor-wait"
                  : "bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]"
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
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-slate-600 mt-8 font-medium"
        >
          نظام داخلي محمي &middot; جميع الحقوق محفوظة
        </motion.p>
      </motion.div>
    </div>
  );
}
