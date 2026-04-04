import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowLeft, ShieldCheck, Layers, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        toast.success('تم تسجيل الدخول بنجاح! 🚀');
        navigate('/');
      } else {
        toast.error('أوراق الاعتماد غير صحيحة، يرجى المحاولة مرة أخرى.');
      }
    } catch {
      toast.error('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative p-4 rtl font-sans transition-colors duration-300" dir="rtl">
      {/* Absolute Fullscreen Glass Background (Matches existing App theme) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-emerald-50/50 dark:from-indigo-950/20 dark:via-slate-900/80 dark:to-emerald-950/20 opacity-80 pointer-events-none transition-all duration-300" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] pointer-events-none transition-all" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] pointer-events-none transition-all" />

      {/* Main Container Container (Wide Card) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-5xl h-[600px] max-h-[90vh] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-indigo-900/10 dark:shadow-black/50 border border-white/60 dark:border-white/10 flex relative z-10 overflow-hidden transition-all duration-300"
      >
        
        {/* Right Side: Branding (Hidden on small mobile) */}
        <div className="hidden md:flex flex-col w-1/2 relative bg-slate-900 dark:bg-slate-950 p-12 justify-between overflow-hidden transition-colors duration-300">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] mix-blend-overlay" style={{backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')"}} />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-600/40 dark:from-indigo-600/20 to-transparent blur-3xl pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-tr from-emerald-600/30 dark:from-emerald-600/15 to-transparent blur-3xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

          {/* Content Area */}
          <div className="relative z-10 mt-8">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-snug mb-6 drop-shadow-lg">
              نظام إدارة العملاء<br />والعمولات
            </h1>
            <p className="text-indigo-200/80 dark:text-indigo-200/60 text-sm font-medium leading-relaxed max-w-sm">
              بوابة متكاملة لمتابعة سير العمل، إدارة تذاكر المبيعات، ومزامنة العمولات بشكل آلي وسلس.
            </p>
          </div>

          {/* Empty Space for visual weight balancing */}
          <div className="relative z-10" />
        </div>

        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 h-full bg-white/40 dark:bg-slate-900/40 transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            
            <div className="text-center md:text-right mb-8">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 transition-colors">تسجيل الدخول</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">مرحباً بعودتك! الرجاء إدخال بياناتك للمتابعة.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">اسم المستخدم</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pr-11 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all shadow-sm"
                    placeholder="أدخل اسم المستخدم..."
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">كلمة المرور</label>
                  <a href="#" className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">هل نسيت؟</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pr-11 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 font-medium tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all shadow-sm placeholder:tracking-normal"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center items-center gap-2 py-3.5 px-4 mt-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg overflow-hidden relative",
                  isLoading ? "bg-indigo-400 dark:bg-indigo-500 cursor-wait" : "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-indigo-500/25 active:scale-[0.98]"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                     دخول النظام <ArrowLeft className="w-4 h-4 mt-0.5" />
                  </span>
                )}
              </button>
            </form>

            {/* Quick Access Helper */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 transition-colors">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center md:text-right">التجربة السريعة للأنظمة:</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {setEmail('we9li'); setPassword('123');}}
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  حساب المشرف
                </button>
                <button 
                  onClick={() => {setEmail('we9l'); setPassword('123');}}
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  حساب الموظف
                </button>
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
